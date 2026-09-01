import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { sql, ensureSchema } from '@/lib/db'
import Stripe from 'stripe'

// Real Stripe webhook — verifies the signature (never trust an unverified
// POST body for payment state), then marks the real booking as paid.
export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[TRoyGO™ STRIPE] Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingRef = session.metadata?.bookingRef
    if (bookingRef) {
      await ensureSchema()
      await sql`
        UPDATE bookings
        SET payment_status = 'paid', paid_at = now()
        WHERE booking_ref = ${bookingRef}
      `
      console.log(`[TRoyGO™ STRIPE] Booking ${bookingRef} marked as PAID via real Stripe webhook`)
    }
  }

  return NextResponse.json({ received: true })
}
