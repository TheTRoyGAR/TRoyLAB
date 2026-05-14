import { NextRequest, NextResponse } from 'next/server'

// In-memory store for demo purposes
const bookingStatuses: Record<string, { status: string; ownerNotes?: string; approvedAt?: string }> = {}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      bookingId: string
      ownerApproved: boolean
      ownerNotes?: string
    }

    const { bookingId, ownerApproved, ownerNotes } = body

    if (!bookingId || typeof ownerApproved !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'bookingId and ownerApproved are required' },
        { status: 400 }
      )
    }

    if (ownerApproved) {
      bookingStatuses[bookingId] = {
        status: 'confirmed',
        ownerNotes,
        approvedAt: new Date().toISOString(),
      }

      // Simulate trigger: confirmation email to customer
      console.log(`[TRoyGO™ CRM] ✅ OWNER APPROVED booking ${bookingId}`)
      console.log(`[TRoyGO™ EMAIL] Sending booking confirmation email to customer...`)
      console.log(`[TRoyGO™ EMAIL] Sending payment deposit link...`)
      console.log(`[TRoyGO™ EMAIL] Sending notification to assigned agent...`)

      return NextResponse.json({
        success: true,
        message: `Booking ${bookingId} has been confirmed. Confirmation email and payment link have been dispatched.`,
        booking: {
          id: bookingId,
          status: 'confirmed',
          approvedAt: bookingStatuses[bookingId].approvedAt,
          ownerNotes: ownerNotes ?? null,
          nextSteps: [
            'Confirmation email sent to customer',
            'Deposit payment link dispatched',
            'Agent notified to prepare itinerary',
            'Pre-trip workflow triggered',
          ],
        },
      })
    } else {
      bookingStatuses[bookingId] = {
        status: 'declined',
        ownerNotes,
        approvedAt: new Date().toISOString(),
      }

      // Simulate trigger: decline notification
      console.log(`[TRoyGO™ CRM] ❌ OWNER DECLINED booking ${bookingId}`)
      console.log(`[TRoyGO™ EMAIL] Sending decline/alternative options email to customer...`)

      return NextResponse.json({
        success: true,
        message: `Booking ${bookingId} has been declined. Customer notification sent.`,
        booking: {
          id: bookingId,
          status: 'declined',
          declinedAt: bookingStatuses[bookingId].approvedAt,
          ownerNotes: ownerNotes ?? null,
        },
      })
    }
  } catch (error) {
    console.error('[TRoyGO™ API] Booking confirm error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get('bookingId')

  if (!bookingId) {
    return NextResponse.json({ success: false, message: 'bookingId required' }, { status: 400 })
  }

  const status = bookingStatuses[bookingId] ?? { status: 'pending_owner_review' }
  return NextResponse.json({ success: true, booking: { id: bookingId, ...status } })
}
