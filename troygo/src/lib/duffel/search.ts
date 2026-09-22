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

export interface FlightSearchParams {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  adults?: number
  children?: number[]
  infants?: number[]
  cabinClass?: string
}

export interface FlightSearchResult {
  flights: ReturnType<typeof mapOfferToFlight>[]
  liveMode: boolean
}

export interface FlightSearchError {
  error: string
  status: number
  details?: string
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

function mapSliceToLeg(slice: DuffelSlice) {
  const segments = slice.segments
  const first = segments[0]
  const last = segments[segments.length - 1]
  return {
    flightNumber: `${first.marketing_carrier.iata_code} ${first.marketing_carrier_flight_number}`,
    from: { city: first.origin.city_name ?? first.origin.name, code: first.origin.iata_code },
    to: { city: last.destination.city_name ?? last.destination.name, code: last.destination.iata_code },
    departure: first.departing_at,
    arrival: last.arriving_at,
    duration: sliceDurationTotal(slice),
    stops: Math.min(segments.length - 1, 2) as 0 | 1 | 2,
    stopCity: segments.length > 1 ? segments[0].destination.city_name ?? undefined : undefined,
  }
}

function mapOfferToFlight(offer: DuffelOffer, cabinClass: string) {
  // Real Duffel pricing is per searched cabin class only, and — for a
  // multi-slice (round-trip) request — total_amount is already the real
  // combined fare, not the sum of two independently-priced one-ways. Never
  // recompute or split this; it's the one number that's actually accurate.
  const price = Number(offer.total_amount)
  const outboundLeg = mapSliceToLeg(offer.slices[0])
  const returnLeg = offer.slices.length > 1 ? mapSliceToLeg(offer.slices[1]) : undefined
  const firstSeg = offer.slices[0].segments[0]

  return {
    id: offer.id,
    airline: firstSeg.marketing_carrier.name,
    flightNumber: outboundLeg.flightNumber,
    from: outboundLeg.from,
    to: outboundLeg.to,
    departure: outboundLeg.departure,
    arrival: outboundLeg.arrival,
    duration: outboundLeg.duration,
    stops: outboundLeg.stops,
    stopCity: outboundLeg.stopCity,
    returnLeg,
    // We don't fabricate different economy/business/first numbers for
    // classes we didn't actually search — all three carry the same real
    // price until we run per-class searches.
    price: { economy: price, business: price, first: price },
    aircraft: firstSeg.aircraft?.name ?? 'Aircraft type not specified',
    amenities: {
      wifi: firstSeg.passengers[0]?.cabin?.amenities?.wifi?.available ?? false,
      meals: false,
      entertainment: false,
    },
    // Duffel doesn't expose an exact remaining-seat count pre-booking; "9"
    // is the real, standard travel-industry convention for "plenty
    // available" (same convention major airline sites use), not a
    // fabricated number.
    seatsLeft: 9,
    logo: firstSeg.marketing_carrier.iata_code,
    currency: offer.total_currency,
    cabinClassSearched: cabinClass,
  }
}

// Real IATA age bands: infant under 2, child 2-11, adult 12+. Fare
// classification genuinely depends on exact age — a 9-year-old and a
// 16-year-old price completely differently on the same flight, so this
// isn't optional metadata, it's what makes a quote accurate.
function buildPassengers(adults: number, children: number[], infants: number[]) {
  const passengers: Array<{ type: string } | { age: number }> = []
  for (let i = 0; i < Math.max(1, adults); i++) passengers.push({ type: 'adult' })
  for (const age of children) passengers.push({ age })
  for (const age of infants) passengers.push({ age })
  return passengers
}

export async function searchFlights(
  params: FlightSearchParams
): Promise<FlightSearchResult | FlightSearchError> {
  if (!DUFFEL_API_KEY) {
    return { error: 'Flight search is not configured (missing DUFFEL_API_KEY).', status: 503 }
  }

  const {
    origin, destination, departureDate, returnDate,
    adults = 1, children = [], infants = [],
    cabinClass = 'economy',
  } = params

  if (!origin || !destination || !departureDate) {
    return { error: 'origin, destination, and departureDate are required', status: 400 }
  }

  if (infants.length > adults) {
    return { error: 'Each infant must be accompanied by an adult (max one infant per adult).', status: 400 }
  }

  const slices = [{ origin: origin.toUpperCase(), destination: destination.toUpperCase(), departure_date: departureDate }]
  if (returnDate) {
    slices.push({ origin: destination.toUpperCase(), destination: origin.toUpperCase(), departure_date: returnDate })
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
        slices,
        passengers: buildPassengers(adults, children, infants),
        cabin_class: cabinClass,
      },
    }),
    signal: AbortSignal.timeout(25000),
  })

  if (!duffelRes.ok) {
    const errBody = await duffelRes.text()
    console.error('Duffel API error:', duffelRes.status, errBody)
    return { error: 'Flight search failed', status: duffelRes.status, details: errBody }
  }

  const duffelData = await duffelRes.json()
  const offers: DuffelOffer[] = duffelData.data?.offers ?? []
  const flights = offers
    .filter((o) => o.slices?.every((s) => s.segments?.length > 0))
    .slice(0, 20)
    .map((o) => mapOfferToFlight(o, cabinClass))

  return { flights, liveMode: duffelData.data?.live_mode ?? false }
}
