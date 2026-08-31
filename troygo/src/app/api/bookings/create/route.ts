import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSchema, getSetting } from '@/lib/db'
import { sendEmail } from '@/lib/email'

/* ─── Types ───────────────────────────────────────────────────────────────── */
interface TravelerInfo {
  firstName: string
  lastName: string
  dob?: string
  passport?: string
  nationality?: string
  email?: string
  phone?: string
}

interface BookingPayload {
  bookingRef?: string
  type?: string
  itemId?: string
  travelers?: TravelerInfo[]
  addOns?: string[]
  totalAmount?: number
  cabinClass?: string
}

/* ─── Reference generator ─────────────────────────────────────────────────── */
function generateRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'TRG-'
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

/* ─── POST /api/bookings/create ───────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    await ensureSchema()

    const body: BookingPayload = await req.json()

    const {
      bookingRef: providedRef,
      type = 'unknown',
      itemId = '',
      travelers = [],
      addOns = [],
      totalAmount = 0,
      cabinClass = null,
    } = body

    const bookingRef = providedRef ?? generateRef()

    // Troy manually approves all bookings — always requires owner approval
    const requiresOwnerApproval = true

    const leadTraveler = travelers[0]
    const leadName = leadTraveler
      ? `${leadTraveler.firstName ?? ''} ${leadTraveler.lastName ?? ''}`.trim()
      : 'Unknown Traveler'
    const leadEmail = leadTraveler?.email ?? 'no-email-provided'
    const estimatedResponseTime = '24 hours'
    const createdAt = new Date().toISOString()

    await sql`
      INSERT INTO bookings (
        booking_ref, status, requires_owner_approval, type, item_id,
        travelers, add_ons, total_amount, cabin_class,
        estimated_response_time, lead_traveler_name, lead_traveler_email, created_at
      ) VALUES (
        ${bookingRef}, 'inquiry', ${requiresOwnerApproval}, ${type}, ${itemId},
        ${JSON.stringify(travelers)}, ${JSON.stringify(addOns)}, ${totalAmount}, ${cabinClass},
        ${estimatedResponseTime}, ${leadName}, ${leadEmail}, ${createdAt}
      )
      ON CONFLICT (booking_ref) DO UPDATE SET
        type = EXCLUDED.type,
        item_id = EXCLUDED.item_id,
        travelers = EXCLUDED.travelers,
        add_ons = EXCLUDED.add_ons,
        total_amount = EXCLUDED.total_amount,
        cabin_class = EXCLUDED.cabin_class
    `

    // Real notification email to Troy - actually sent via Gmail OAuth2, not
    // logged and pretended. See src/lib/email.ts for the real send() call.
    const notificationEmail = await getSetting('notification_email')
    const notificationBody = [
      `New booking inquiry received!`,
      ``,
      `Reference: ${bookingRef}`,
      `Status: INQUIRY — Owner approval required`,
      ``,
      `Customer: ${leadName}`,
      `Email: ${leadEmail}`,
      `Phone: ${leadTraveler?.phone ?? 'Not provided'}`,
      ``,
      `Booking type: ${type.toUpperCase()}`,
      `Item ID: ${itemId}`,
      `Cabin class: ${cabinClass ?? 'N/A'}`,
      `Travelers: ${travelers.length}`,
      `Add-ons: ${addOns.length > 0 ? addOns.join(', ') : 'None'}`,
      ``,
      `Total amount: $${totalAmount.toLocaleString()}`,
      `Requires approval: ${requiresOwnerApproval ? 'YES' : 'NO'}`,
      ``,
      `Please review and respond within ${estimatedResponseTime}.`,
      ``,
      `— TRoyGO™ Booking System`,
    ].join('\n')

    const ownerNotification = await sendEmail({
      to: notificationEmail,
      subject: `New Booking Inquiry: ${bookingRef}`,
      text: notificationBody,
    })
    if (!ownerNotification.sent) {
      console.error(`[TRoyGO™] Owner notification email FAILED for ${bookingRef}:`, ownerNotification.error)
    }

    let confirmationSent = false
    if (leadEmail && leadEmail !== 'no-email-provided') {
      const confirmation = await sendEmail({
        to: leadEmail,
        subject: `Your TRoyGO™ Booking Request — ${bookingRef}`,
        text: [
          `Thank you ${leadName}! Your booking inquiry ${bookingRef} has been received.`,
          `Our travel expert will contact you within ${estimatedResponseTime}.`,
        ].join('\n'),
      })
      confirmationSent = confirmation.sent
      if (!confirmation.sent) {
        console.error(`[TRoyGO™] Customer confirmation email FAILED for ${bookingRef}:`, confirmation.error)
      }
    }

    return NextResponse.json(
      {
        success: true,
        bookingRef,
        status: 'inquiry',
        requiresApproval: requiresOwnerApproval,
        estimatedResponseTime,
        ownerNotificationSent: ownerNotification.sent,
        confirmationEmailSent: confirmationSent,
        message: ownerNotification.sent
          ? `Booking inquiry ${bookingRef} created successfully. Owner notification sent.`
          : `Booking inquiry ${bookingRef} created successfully. Owner notification email failed to send — please follow up manually.`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[TRoyGO™] Booking creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create booking. Please try again.',
      },
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
