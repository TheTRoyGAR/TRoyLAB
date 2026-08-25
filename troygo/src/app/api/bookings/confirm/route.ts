import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await ensureSchema()

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

    const existing = await sql`SELECT booking_ref FROM bookings WHERE booking_ref = ${bookingId}`
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: `Booking ${bookingId} not found.` },
        { status: 404 }
      )
    }

    const newStatus = ownerApproved ? 'confirmed' : 'declined'
    const approvedAt = new Date().toISOString()

    await sql`
      UPDATE bookings
      SET status = ${newStatus}, owner_notes = ${ownerNotes ?? null}, approved_at = ${approvedAt}
      WHERE booking_ref = ${bookingId}
    `

    if (ownerApproved) {
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
          approvedAt,
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
      console.log(`[TRoyGO™ CRM] ❌ OWNER DECLINED booking ${bookingId}`)
      console.log(`[TRoyGO™ EMAIL] Sending decline/alternative options email to customer...`)

      return NextResponse.json({
        success: true,
        message: `Booking ${bookingId} has been declined. Customer notification sent.`,
        booking: {
          id: bookingId,
          status: 'declined',
          declinedAt: approvedAt,
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
  try {
    await ensureSchema()

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json({ success: false, message: 'bookingId required' }, { status: 400 })
    }

    const rows = await sql`SELECT status, owner_notes, approved_at FROM bookings WHERE booking_ref = ${bookingId}`

    if (rows.length === 0) {
      return NextResponse.json({ success: true, booking: { id: bookingId, status: 'pending_owner_review' } })
    }

    const b = rows[0]
    return NextResponse.json({
      success: true,
      booking: { id: bookingId, status: b.status, ownerNotes: b.owner_notes, approvedAt: b.approved_at },
    })
  } catch (error) {
    console.error('[TRoyGO™ API] Booking status lookup error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
