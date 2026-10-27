import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSchema, getSetting } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { searchFlights } from '@/lib/duffel/search'
import { verifyTurnstile } from '@/lib/turnstile'
import { cleanBooking, priceBooking, newBookingRef, type CleanRoute } from '@/lib/booking-guard'

// At most this many new booking requests per hour for the whole site. A real
// day has far fewer; bots do not.
const MAX_BOOKINGS_PER_HOUR = 20

async function rateLimited(): Promise<boolean> {
  const rows = await sql`SELECT COUNT(*)::int AS n FROM bookings WHERE created_at > now() - interval '1 hour'`
  return Number(rows[0]?.n ?? 0) >= MAX_BOOKINGS_PER_HOUR
}

async function searchForPrice(route: CleanRoute) {
  const r = await searchFlights(route)
  if ('error' in r) return { error: r.error }
  return { flights: r.flights }
}

/* ─── POST /api/bookings/create ───────────────────────────────────────────
 * A booking REQUEST. Nothing is charged here; the owner approves it, confirms
 * the price in writing and only then is a payment link made.
 *  - the reference is made by the server and an existing booking is never
 *    overwritten;
 *  - every field is validated; the price is never taken from the browser
 *    (flights are re-priced with a fresh Duffel search, everything else is
 *    "to be quoted" with a total of 0, which never produces a payment link);
 *  - needs a passed captcha (when Turnstile is configured) and is rate limited.
 */
export async function POST(req: NextRequest) {
  try {
    await ensureSchema()

    let raw: unknown
    try {
      raw = await req.json()
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const token = raw && typeof raw === 'object' ? (raw as { turnstile?: unknown }).turnstile : undefined
    if (!(await verifyTurnstile(token, ip))) {
      return NextResponse.json(
        { success: false, error: 'Please complete the security check and try again.' },
        { status: 403 }
      )
    }
    if (await rateLimited()) {
      return NextResponse.json(
        { success: false, error: 'We are receiving a lot of requests right now. Please try again shortly or email agency@troytravelagency.com.' },
        { status: 429 }
      )
    }

    const cleaned = cleanBooking(raw)
    if (!cleaned.ok) {
      return NextResponse.json({ success: false, error: cleaned.error }, { status: 400 })
    }
    const b = cleaned.booking

    const price = await priceBooking(b, { searchFlights: searchForPrice })

    // Troy manually approves all bookings — always requires owner approval
    const requiresOwnerApproval = true
    const leadTraveler = b.travelers[0]
    const leadName = `${leadTraveler.firstName} ${leadTraveler.lastName}`.trim()
    const leadEmail = leadTraveler.email as string
    const estimatedResponseTime = '24 hours'
    const createdAt = new Date().toISOString()
    const ownerNote =
      `Price check: ${price.note}` +
      (b.clientEstimate !== null ? ` Customer saw an estimate of ${b.clientEstimate}.` : '')

    // The server makes the reference. A collision just means "try another";
    // an existing booking is never touched.
    let bookingRef = ''
    for (let attempt = 0; attempt < 5 && !bookingRef; attempt++) {
      const candidate = newBookingRef()
      const inserted = await sql`
        INSERT INTO bookings (
          booking_ref, status, requires_owner_approval, type, item_id,
          travelers, add_ons, total_amount, cabin_class, route_snapshot, owner_notes,
          estimated_response_time, lead_traveler_name, lead_traveler_email, created_at
        ) VALUES (
          ${candidate}, 'inquiry', ${requiresOwnerApproval}, ${b.type}, ${b.itemId},
          ${JSON.stringify(b.travelers)}, ${JSON.stringify(b.addOns)}, ${price.total}, ${b.cabinClass},
          ${b.routeSnapshot ? JSON.stringify(b.routeSnapshot) : null}, ${ownerNote},
          ${estimatedResponseTime}, ${leadName}, ${leadEmail}, ${createdAt}
        )
        ON CONFLICT (booking_ref) DO NOTHING
        RETURNING booking_ref
      `
      if (inserted.length > 0) bookingRef = candidate
    }
    if (!bookingRef) {
      return NextResponse.json({ success: false, error: 'Failed to create booking. Please try again.' }, { status: 500 })
    }

    // Real notification email to Troy - actually sent via Gmail OAuth2, not
    // logged and pretended. See src/lib/email.ts for the real send() call.
    const notificationEmail = await getSetting('notification_email')
    const notificationBody = [
      `New booking request received!`,
      ``,
      `Reference: ${bookingRef}`,
      `Status: INQUIRY — Owner approval required`,
      ``,
      `Customer: ${leadName}`,
      `Email: ${leadEmail}`,
      `Phone: ${leadTraveler.phone ?? 'Not provided'}`,
      ``,
      `Booking type: ${b.type.toUpperCase()}`,
      `Item ID: ${b.itemId}`,
      `Cabin class: ${b.cabinClass ?? 'N/A'}`,
      `Travelers: ${b.travelers.length}`,
      `Extras to quote: ${b.addOns.length > 0 ? b.addOns.join(', ') : 'None'}`,
      ``,
      price.verified
        ? `Verified total: $${price.total.toLocaleString()}`
        : `Total: NOT SET (to be quoted). ${price.note}`,
      `Requires approval: ${requiresOwnerApproval ? 'YES' : 'NO'}`,
      ``,
      `Please review and respond within ${estimatedResponseTime}.`,
      ``,
      `— TRoyGO™ Booking System`,
    ].join('\n')

    const ownerNotification = await sendEmail({
      to: notificationEmail,
      subject: `New Booking Request: ${bookingRef}`,
      text: notificationBody,
    })
    if (!ownerNotification.sent) {
      console.error(`[TRoyGO™] Owner notification email FAILED for ${bookingRef}:`, ownerNotification.error)
    }

    const confirmation = await sendEmail({
      to: leadEmail,
      subject: `Your TRoyGO™ Booking Request — ${bookingRef}`,
      text: [
        `Thank you ${leadTraveler.firstName}! Your booking request ${bookingRef} has been received.`,
        `Our travel expert will contact you within ${estimatedResponseTime}. Nothing has been charged: we confirm the price and availability with you in writing first.`,
        `If you did not make this request, you can ignore this email.`,
      ].join('\n\n'),
    })
    if (!confirmation.sent) {
      console.error(`[TRoyGO™] Customer confirmation email FAILED for ${bookingRef}:`, confirmation.error)
    }

    return NextResponse.json(
      {
        success: true,
        bookingRef,
        status: 'inquiry',
        requiresApproval: requiresOwnerApproval,
        estimatedResponseTime,
        ownerNotificationSent: ownerNotification.sent,
        confirmationEmailSent: confirmation.sent,
        message: ownerNotification.sent
          ? `Booking request ${bookingRef} created successfully. Owner notification sent.`
          : `Booking request ${bookingRef} created successfully. Owner notification email failed to send — please follow up manually.`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[TRoyGO™] Booking creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create booking. Please try again.' },
      { status: 500 }
    )
  }
}

/* ─── GET /api/bookings/create?ref=TRG-XXXXXX ─────────────────────────────── */
export async function GET(req: NextRequest) {
  try {
    await ensureSchema()

    const { searchParams } = new URL(req.url)
    const ref = searchParams.get('ref')

    if (!ref) {
      return NextResponse.json({ error: 'Booking reference required' }, { status: 400 })
    }

    const rows = await sql`SELECT * FROM bookings WHERE booking_ref = ${ref}`

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const b = rows[0]
    return NextResponse.json(
      {
        bookingRef: b.booking_ref,
        status: b.status,
        requiresOwnerApproval: b.requires_owner_approval,
        type: b.type,
        itemId: b.item_id,
        travelers: b.travelers,
        addOns: b.add_ons,
        totalAmount: Number(b.total_amount),
        cabinClass: b.cabin_class,
        estimatedResponseTime: b.estimated_response_time,
        leadTravelerName: b.lead_traveler_name,
        leadTravelerEmail: b.lead_traveler_email,
        ownerNotes: b.owner_notes,
        approvedAt: b.approved_at,
        createdAt: b.created_at,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[TRoyGO™] Booking lookup error:', error)
    return NextResponse.json({ error: 'Failed to look up booking.' }, { status: 500 })
  }
}

/* ─── DELETE /api/bookings/create?ref=TRG-XXXXXX ──────────────────────────── */
export async function DELETE(req: NextRequest) {
  try {
    await ensureSchema()
    const ref = req.nextUrl.searchParams.get('ref')
    if (!ref) {
      return NextResponse.json({ success: false, error: 'ref query param required.' }, { status: 400 })
    }
    await sql`DELETE FROM bookings WHERE booking_ref = ${ref}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[TRoyGO™] Booking delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete booking.' }, { status: 500 })
  }
}
