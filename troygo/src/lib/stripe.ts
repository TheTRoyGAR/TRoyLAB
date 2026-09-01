import Stripe from 'stripe'

// Real Stripe client. Sandbox (test mode) keys until TROYGO Group completes
// Stripe's business verification and switches the account to live.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-08-26.dahlia',
})

// Creates a real Stripe Checkout Session for a confirmed booking and
// returns its real hosted payment URL. Amount is in whole dollars (matches
// bookings.total_amount) — Stripe wants the smallest currency unit (cents).
export async function createBookingCheckoutSession(opts: {
  bookingRef: string
  amount: number
  customerEmail: string
  description: string
}): Promise<{ url: string | null; sessionId: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://troytravelagency.com'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: opts.customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `TRoyGO™ Booking ${opts.bookingRef}`, description: opts.description },
          unit_amount: Math.round(opts.amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { bookingRef: opts.bookingRef },
    success_url: `${baseUrl}/booking/confirmation?ref=${opts.bookingRef}&paid=1`,
    cancel_url: `${baseUrl}/booking/confirmation?ref=${opts.bookingRef}&paid=0`,
  })

  return { url: session.url, sessionId: session.id }
}
