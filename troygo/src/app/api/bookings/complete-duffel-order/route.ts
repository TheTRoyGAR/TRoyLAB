import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/db'
import { sendEmail } from '@/lib/email'

const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY

interface RouteSnapshot {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  cabinClass: string
}

interface TravelerRecord {
  title?: string
  gender?: string
  firstName: string
  lastName: string
  dob: string
  email?: string
  phone?: string
}

function ageAt(dob: string, onDate: string): number {
  const birth = new Date(dob)
  const ref = new Date(onDate)
  let age = ref.getFullYear() - birth.getFullYear()
  const monthDiff = ref.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) age--
  return age
}

// Real IATA age bands, same as the search API — this is recomputed from
// each traveler's real entered DOB, not trusted from the original search
// snapshot, since the DOB collected on the booking form is the authoritative
// real data for who's actually flying.
function classifyPassengers(travelers: TravelerRecord[], departureDate: string) {
  return travelers.map((t) => ({ ...t, age: ageAt(t.dob, departureDate) }))
    .sort((a, b) => b.age - a.age) // adults first, then children, then infants — matches Duffel's own real ordering convention
}

async function duffelFetch(path: string, body: unknown) {
  const res = await fetch(`https://api.duffel.com${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DUFFEL_API_KEY}`,
      'Content-Type': 'application/json',
      'Duffel-Version': 'v2',
      Accept: 'application/json',
    },
    body: JSON.stringify({ data: body }),
    signal: AbortSignal.timeout(25000),
  })
  const json = await res.json()
  return { ok: res.ok, status: res.status, json }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema()

    const { bookingRef } = await req.json() as { bookingRef: string }
    if (!bookingRef) {
      return NextResponse.json({ success: false, error: 'bookingRef is required' }, { status: 400 })
    }
    if (!DUFFEL_API_KEY) {
      return NextResponse.json({ success: false, error: 'DUFFEL_API_KEY not configured' }, { status: 503 })
    }

    const rows = await sql`SELECT * FROM bookings WHERE booking_ref = ${bookingRef}`
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: `Booking ${bookingRef} not found` }, { status: 404 })
    }
    const booking = rows[0]

    if (booking.type !== 'flight' || !booking.route_snapshot) {
      return NextResponse.json({ success: false, error: 'Booking has no real flight route to book — needs manual completion.' }, { status: 400 })
    }
    if (booking.duffel_order_status === 'booked') {
      return NextResponse.json({ success: true, message: 'Already booked', bookingReference: booking.duffel_booking_reference })
    }

    const route = booking.route_snapshot as RouteSnapshot
    const travelers = (booking.travelers as TravelerRecord[]) ?? []
    if (travelers.length === 0) {
      return NextResponse.json({ success: false, error: 'No traveler details on this booking.' }, { status: 400 })
    }

    const collectedAmount = Number(booking.total_amount)

    // Step 1: re-search for a fresh, valid offer. The offer selected during
    // browsing has almost certainly expired by the time owner approval and
    // Stripe payment complete (real offers are short-lived), so we can't
    // reuse the original offer ID — we reproduce the exact same real search.
    const classified = classifyPassengers(travelers, route.departureDate)
    const passengers = classified.map((t) =>
      t.age >= 12 ? { type: 'adult' } : { age: t.age }
    )
    const slices = [{ origin: route.origin, destination: route.destination, departure_date: route.departureDate }]
    if (route.returnDate) slices.push({ origin: route.destination, destination: route.origin, departure_date: route.returnDate })

    const searchResult = await duffelFetch('/air/offer_requests?return_offers=true', {
      slices,
      passengers,
      cabin_class: route.cabinClass || 'economy',
    })

    if (!searchResult.ok) {
      await sql`UPDATE bookings SET duffel_order_status = 'failed', duffel_order_error = ${`Re-search failed: ${JSON.stringify(searchResult.json)}`} WHERE booking_ref = ${bookingRef}`
      return NextResponse.json({ success: false, error: 'Re-search failed', details: searchResult.json }, { status: 502 })
    }

    const offers = searchResult.json.data?.offers ?? []
    const validOffers = offers.filter((o: { slices?: unknown[] }) => o.slices?.every((s: unknown) => (s as { segments?: unknown[] }).segments?.length))
    if (validOffers.length === 0) {
      await sql`
        UPDATE bookings
        SET duffel_order_status = 'needs_review',
            duffel_order_error = 'No real offers available on re-search — route may no longer be operating on this date.'
        WHERE booking_ref = ${bookingRef}
      `
      return NextResponse.json({ success: false, error: 'No real offers available on re-search — flagged for owner review.' }, { status: 409 })
    }

    // Pick the cheapest real, valid offer — same cabin class the client paid for.
    const chosen = validOffers.reduce((best: { total_amount: string }, cur: { total_amount: string }) =>
      Number(cur.total_amount) < Number(best.total_amount) ? cur : best
    )
    const freshPrice = Number(chosen.total_amount)

    // Real financial safety check: never silently spend more of TRoyGO's own
    // Duffel balance than was actually collected from the client. A small
    // tolerance covers minor fare fluctuation; anything beyond that needs a
    // real human decision, not an agent quietly absorbing the loss.
    const TOLERANCE = 5
    if (freshPrice > collectedAmount + TOLERANCE) {
      await sql`
        UPDATE bookings
        SET duffel_order_status = 'needs_review',
            duffel_order_error = ${`Fresh price ${freshPrice} ${chosen.total_currency} exceeds the ${collectedAmount} collected from the client — needs owner decision before booking.`}
        WHERE booking_ref = ${bookingRef}
      `
      return NextResponse.json({
        success: false,
        error: 'Fresh price exceeds amount collected — flagged for owner review, not auto-booked.',
        freshPrice, collectedAmount,
      }, { status: 409 })
    }

    // Step 2: create the real order, paying from TRoyGO's real Duffel balance.
    const offerPassengers = chosen.passengers as Array<{ id: string; type?: string; age?: number }>
    const passengerPayload = offerPassengers.map((op, i) => {
      const t = classified[i]
      return {
        id: op.id,
        given_name: t.firstName,
        family_name: t.lastName,
        born_on: t.dob,
        title: t.title || 'mr',
        gender: t.gender || 'm',
        email: t.email || travelers[0].email || 'no-email-provided@troytravelagency.com',
        phone_number: t.phone || travelers[0].phone || '+61000000000',
      }
    })

    const orderResult = await duffelFetch('/air/orders', {
      type: 'instant',
      selected_offers: [chosen.id],
      payments: [{ type: 'balance', currency: chosen.total_currency, amount: chosen.total_amount }],
      passengers: passengerPayload,
    })

    if (!orderResult.ok) {
      await sql`
        UPDATE bookings
        SET duffel_order_status = 'failed', duffel_order_error = ${JSON.stringify(orderResult.json)}
        WHERE booking_ref = ${bookingRef}
      `
      return NextResponse.json({ success: false, error: 'Real order creation failed', details: orderResult.json }, { status: 502 })
    }

    const order = orderResult.json.data
    const realBookingReference = order.booking_reference as string
    const duffelOrderId = order.id as string

    await sql`
      UPDATE bookings
      SET duffel_order_status = 'booked',
          duffel_order_id = ${duffelOrderId},
          duffel_booking_reference = ${realBookingReference},
          status = 'ticketed'
      WHERE booking_ref = ${bookingRef}
    `

    const leadEmail = booking.lead_traveler_email as string
    const leadName = booking.lead_traveler_name as string
    const confirmation = await sendEmail({
      to: leadEmail,
      subject: `Your Flight Is Booked — TRoyGO™ ${bookingRef} (${realBookingReference})`,
      text: [
        `${leadName}, your flight is now genuinely booked and ticketed.`,
        ``,
        `TRoyGO™ reference: ${bookingRef}`,
        `Airline booking reference (PNR): ${realBookingReference}`,
        ``,
        `${route.origin} → ${route.destination}${route.returnDate ? ` → ${route.origin}` : ''}`,
        `Departure: ${route.departureDate}${route.returnDate ? `, return: ${route.returnDate}` : ''}`,
        ``,
        `Keep your airline booking reference — you can look up your booking directly with the airline using it.`,
        ``,
        `— TRoyGO™`,
      ].join('\n'),
    })

    return NextResponse.json({
      success: true,
      bookingRef,
      duffelOrderId,
      airlineBookingReference: realBookingReference,
      confirmationEmailSent: confirmation.sent,
    })
  } catch (error) {
    console.error('[TRoyGO™ DUFFEL ORDER] Completion error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
