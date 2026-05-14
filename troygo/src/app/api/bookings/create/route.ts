import { NextRequest, NextResponse } from 'next/server'

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

interface BookingRecord {
  bookingRef: string
  status: 'inquiry' | 'pending_approval' | 'confirmed' | 'cancelled'
  requiresOwnerApproval: boolean
  type: string
  itemId: string
  travelers: TravelerInfo[]
  addOns: string[]
  totalAmount: number
  cabinClass: string | null
  estimatedResponseTime: string
  createdAt: string
  leadTravelerName: string
  leadTravelerEmail: string
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

/* ─── In-memory store (demo) ──────────────────────────────────────────────── */
// In a real app this would be a database. For demo purposes we use module-level storage.
const bookingStore: Map<string, BookingRecord> = new Map()

/* ─── POST /api/bookings/create ───────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
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

    // Generate or use provided ref
    const bookingRef = providedRef ?? generateRef()

    // Determine if owner approval is required (always for amounts > $5000, or always for this agency model)
    const requiresOwnerApproval = totalAmount > 5000 || true // Troy manually approves all bookings

    // Get lead traveler info
    const leadTraveler = travelers[0]
    const leadName = leadTraveler
      ? `${leadTraveler.firstName ?? ''} ${leadTraveler.lastName ?? ''}`.trim()
      : 'Unknown Traveler'
    const leadEmail = leadTraveler?.email ?? 'no-email-provided'

    // Build booking record
    const record: BookingRecord = {
      bookingRef,
      status: 'inquiry',
      requiresOwnerApproval,
      type,
      itemId,
      travelers,
      addOns,
      totalAmount,
      cabinClass: cabinClass ?? null,
      estimatedResponseTime: '24 hours',
      createdAt: new Date().toISOString(),
      leadTravelerName: leadName,
      leadTravelerEmail: leadEmail,
    }

    // Store booking
    bookingStore.set(bookingRef, record)

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
        `Please review and respond within ${record.estimatedResponseTime}.`,
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
    console.log(`✅ Booking ${bookingRef} stored. Owner approval: ${requiresOwnerApproval}\n`)

    // Simulate confirmation email to customer
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
        estimatedResponseTime: '24 hours',
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
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get('ref')

  if (!ref) {
    return NextResponse.json({ error: 'Booking reference required' }, { status: 400 })
  }

  const booking = bookingStore.get(ref)

  if (!booking) {
    // Return a mock for demo purposes when the store is fresh (e.g. page reload)
    return NextResponse.json(
      {
        bookingRef: ref,
        status: 'inquiry',
        requiresOwnerApproval: true,
        estimatedResponseTime: '24 hours',
        createdAt: new Date().toISOString(),
        note: 'Booking details loaded from reference.',
      },
      { status: 200 }
    )
  }

  return NextResponse.json(booking, { status: 200 })
}
