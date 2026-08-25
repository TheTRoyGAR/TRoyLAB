import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/db'

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

    // Simulate sending notification email to Troy
    // In production this would use SendGrid, Resend, Nodemailer, etc.
    const notificationPayload = {
      to: 'troytravelagency@gmail.com',
      subject: `New Booking Inquiry: ${bookingRef}`,
      body: [
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
      ].join('\n'),
    }

    // Log the simulated email (in production: await emailService.send(notificationPayload))
    console.log('\n📧 [TRoyGO™] Simulated email notification:')
    console.log('─'.repeat(60))
    console.log(`To: ${notificationPayload.to}`)
    console.log(`Subject: ${notificationPayload.subject}`)
    console.log(notificationPayload.body)
    console.log('─'.repeat(60))
    console.log(`✅ Booking ${bookingRef} stored in Postgres. Owner approval: ${requiresOwnerApproval}\n`)

    if (leadEmail && leadEmail !== 'no-email-provided') {
      console.log(`📧 [TRoyGO™] Confirmation email sent to: ${leadEmail}`)
      console.log(`   Subject: Your TRoyGO™ Booking Request — ${bookingRef}`)
      console.log(`   Message: Thank you ${leadName}! Your booking inquiry ${bookingRef} has been received.`)
      console.log(`            Our travel expert will contact you within 24 hours.\n`)
    }

    return NextResponse.json(
      {
        success: true,
        bookingRef,
        status: 'inquiry',
        requiresApproval: requiresOwnerApproval,
        estimatedResponseTime,
        message: `Booking inquiry ${bookingRef} created successfully. Owner notification sent.`,
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
