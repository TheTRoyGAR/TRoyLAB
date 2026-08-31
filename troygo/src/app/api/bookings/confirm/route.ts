import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/db'
import { sendEmail } from '@/lib/email'

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

    const existing = await sql`SELECT booking_ref, lead_traveler_name, lead_traveler_email FROM bookings WHERE booking_ref = ${bookingId}`
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: `Booking ${bookingId} not found.` },
        { status: 404 }
      )
    }
    const leadName = existing[0].lead_traveler_name as string
    const leadEmail = existing[0].lead_traveler_email as string

    const newStatus = ownerApproved ? 'confirmed' : 'declined'
    const approvedAt = new Date().toISOString()

    await sql`
      UPDATE bookings
      SET status = ${newStatus}, owner_notes = ${ownerNotes ?? null}, approved_at = ${approvedAt}
      WHERE booking_ref = ${bookingId}
    `

    if (ownerApproved) {
      console.log(`[TRoyGO™ CRM] ✅ OWNER APPROVED booking ${bookingId}`)

      // Real email, actually sent - not console.log pretending to be one.
      // NOTE: no real payment processor is integrated yet (no Stripe/etc),
      // so there is no real deposit payment link to send - do not claim one
      // was dispatched.
      const confirmation = await sendEmail({
        to: leadEmail,
        subject: `Your TRoyGO™ Booking ${bookingId} Is Confirmed`,
        text: [
          `Great news, ${leadName}!`,
          `Your booking ${bookingId} has been confirmed.`,
          ownerNotes ? `Note from your travel expert: ${ownerNotes}` : '',
          `We'll be in touch shortly with next steps and payment details.`,
        ].filter(Boolean).join('\n\n'),
      })
      if (!confirmation.sent) {
        console.error(`[TRoyGO™ EMAIL] Confirmation email FAILED for ${bookingId}:`, confirmation.error)
      }

      return NextResponse.json({
        success: true,
        message: confirmation.sent
          ? `Booking ${bookingId} has been confirmed. Confirmation email sent.`
          : `Booking ${bookingId} has been confirmed, but the confirmation email failed to send — please follow up manually.`,
        booking: {
          id: bookingId,
          status: 'confirmed',
          approvedAt,
          ownerNotes: ownerNotes ?? null,
          confirmationEmailSent: confirmation.sent,
          nextSteps: [
            confirmation.sent ? 'Confirmation email sent to customer' : 'Confirmation email FAILED - follow up manually',
            'Payment link: not yet available — no payment processor is integrated',
          ],
        },
      })
    } else {
      console.log(`[TRoyGO™ CRM] ❌ OWNER DECLINED booking ${bookingId}`)

      const declineEmail = await sendEmail({
        to: leadEmail,
        subject: `Update on Your TRoyGO™ Booking Request ${bookingId}`,
        text: [
          `Hi ${leadName},`,
          `Unfortunately we're unable to confirm booking ${bookingId} at this time.`,
          ownerNotes ? `Note from your travel expert: ${ownerNotes}` : '',
          `Please get in touch and we'll help find an alternative.`,
        ].filter(Boolean).join('\n\n'),
      })
      if (!declineEmail.sent) {
        console.error(`[TRoyGO™ EMAIL] Decline email FAILED for ${bookingId}:`, declineEmail.error)
      }

      return NextResponse.json({
        success: true,
        message: declineEmail.sent
          ? `Booking ${bookingId} has been declined. Customer notification sent.`
          : `Booking ${bookingId} has been declined, but the notification email failed to send — please follow up manually.`,
        booking: {
          id: bookingId,
          status: 'declined',
          declinedAt: approvedAt,
          ownerNotes: ownerNotes ?? null,
          declineEmailSent: declineEmail.sent,
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
