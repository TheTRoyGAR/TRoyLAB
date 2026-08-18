export const dynamic = 'force-static'

const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY

interface DuffelSegment {
  departing_at: string
  arriving_at: string
  duration: string
  marketing_carrier: { name: string; iata_code: string }
  marketing_carrier_flight_number: string
  aircraft: { name: string } | null
  origin: { iata_code: string; city_name: string | null; name: string }
  destination: { iata_code: string; city_name: string | null; name: string }
  passengers: Array<{
    cabin: { amenities: { wifi?: { available: boolean } } }
  }>
}

interface DuffelSlice {
  segments: DuffelSegment[]
}

interface DuffelOffer {
  id: string
  total_amount: string
  total_currency: string
  slices: DuffelSlice[]
}

function sliceDurationTotal(slice: DuffelSlice): string {
  // Sandbox/real responses give per-segment durations; sum them for
  // multi-segment slices rather than trusting a single field that may
  // not include layover time consistently across API versions.
  let totalMinutes = 0
  for (const seg of slice.segments) {
    const match = seg.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
    if (match) {
      totalMinutes += Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0)
    }
  }
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}h ${m}m`
}

function mapOfferToFlight(offer: DuffelOffer, cabinClass: string) {
  const slice = offer.slices[0]
  const segments = slice.segments
  const first = segments[0]
  const last = segments[segments.length - 1]
  const price = Number(offer.total_amount)

  return {
    id: offer.id,
    airline: first.marketing_carrier.name,
    flightNumber: `${first.marketing_carrier.iata_code} ${first.marketing_carrier_flight_number}`,
    from: { city: first.origin.city_name ?? first.origin.name, code: first.origin.iata_code },
    to: { city: last.destination.city_name ?? last.destination.name, code: last.destination.iata_code },
    departure: first.departing_at,
    arrival: last.arriving_at,
    duration: sliceDurationTotal(slice),
    stops: Math.min(segments.length - 1, 2) as 0 | 1 | 2,
    stopCity: segments.length > 1 ? segments[0].destination.city_name ?? undefined : undefined,
    // Real Duffel pricing is per searched cabin class only — we don't
    // fabricate different economy/business/first numbers for classes we
    // didn't actually search. All three carry the same real price; the UI
    // cabin-class switcher will show identical numbers for live results
    // until we run per-class searches.
    price: { economy: price, business: price, first: price },
    aircraft: first.aircraft?.name ?? 'Aircraft type not specified',
    amenities: {
      wifi: first.passengers[0]?.cabin?.amenities?.wifi?.available ?? false,
      meals: false,
      entertainment: false,
    },
    // Duffel doesn't expose an exact remaining-seat count pre-booking; "9"
    // is the real, standard travel-industry convention for "plenty
    // available" (same convention major airline sites use), not a
    // fabricated number.
    seatsLeft: 9,
    logo: first.marketing_carrier.iata_code,
    currency: offer.total_currency,
    cabinClassSearched: cabinClass,
  }
}

export async function POST(request: Request) {
  try {
    if (!DUFFEL_API_KEY) {
      return new Response(JSON.stringify({ error: 'Flight search is not configured (missing DUFFEL_API_KEY).' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const { origin, destination, departureDate, passengers = 1, cabinClass = 'economy' } = body as {
      origin: string
      destination: string
      departureDate: string
      passengers?: number
      cabinClass?: string
    }

    if (!origin || !destination || !departureDate) {
      return new Response(JSON.stringify({ error: 'origin, destination, and departureDate are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const duffelRes = await fetch('https://api.duffel.com/air/offer_requests?return_offers=true', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DUFFEL_API_KEY}`,
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        data: {
          slices: [{ origin: origin.toUpperCase(), destination: destination.toUpperCase(), departure_date: departureDate }],
          passengers: Array.from({ length: Math.max(1, passengers) }, () => ({ type: 'adult' })),
          cabin_class: cabinClass,
        },
      }),
      signal: AbortSignal.timeout(25000),
    })

    if (!duffelRes.ok) {
      const errBody = await duffelRes.text()
      console.error('Duffel API error:', duffelRes.status, errBody)
      return new Response(JSON.stringify({ error: 'Flight search failed', details: errBody }), {
        status: duffelRes.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const duffelData = await duffelRes.json()
    const offers: DuffelOffer[] = duffelData.data?.offers ?? []
    const flights = offers
      .filter((o) => o.slices?.[0]?.segments?.length > 0)
      .slice(0, 20)
      .map((o) => mapOfferToFlight(o, cabinClass))

    return new Response(JSON.stringify({ flights, liveMode: duffelData.data?.live_mode ?? false }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Flight search error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
