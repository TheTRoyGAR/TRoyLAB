// Server-side checks for POST /api/bookings/create.
//
// Why this exists: the booking route used to trust everything the browser sent
// (the reference number, the total, the traveller fields) and would OVERWRITE an
// existing booking that had the same reference. Now:
//  - the server makes the reference, and never overwrites a booking;
//  - every field is validated and clipped;
//  - the price is never taken from the browser. Only flights have a price that
//    can be re-checked (a fresh Duffel search); everything else is "to be quoted".

export const BOOKING_TYPES = ['flight', 'package', 'cruise', 'hotel', 'car'] as const
export type BookingType = (typeof BOOKING_TYPES)[number]

// The only extras a customer can tick. They carry no price: TRoyGO quotes them.
export const EXTRA_NAMES = ['Travel insurance', 'Airport transfers', 'Seat selection'] as const

const CABINS = ['economy', 'premium_economy', 'business', 'first'] as const

export interface CleanTraveler {
  firstName: string
  lastName: string
  dob?: string
  passport?: string
  nationality?: string
  email?: string
  phone?: string
}

export interface CleanRoute {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  adults: number
  children: number[]
  infants: number[]
  cabinClass: string
}

export interface FlightKey {
  airline: string
  flightNumber: string
  departure: string
}

export interface CleanBooking {
  type: BookingType
  itemId: string
  travelers: CleanTraveler[]
  addOns: string[]
  cabinClass: string | null
  routeSnapshot: CleanRoute | null
  flightKey: FlightKey | null
  clientEstimate: number | null // what the customer saw; for the owner's notes only, never charged
}

export type CleanResult = { ok: true; booking: CleanBooking } | { ok: false; error: string }

const EMAIL_RE = /^[^\s@<>"',;]{1,64}@[^\s@<>"',;]{1,190}\.[A-Za-z]{2,}$/
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}' .\-]{0,59}$/u
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const IATA_RE = /^[A-Z]{3}$/

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

function intIn(v: unknown, min: number, max: number): number | null {
  return typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max ? v : null
}

function ages(v: unknown): number[] | null {
  if (v === undefined || v === null) return []
  if (!Array.isArray(v) || v.length > 9) return null
  const out: number[] = []
  for (const a of v) {
    const n = intIn(a, 0, 17)
    if (n === null) return null
    out.push(n)
  }
  return out
}

export function cleanBooking(input: unknown): CleanResult {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Invalid request.' }
  const b = input as Record<string, unknown>

  const type = b.type
  if (typeof type !== 'string' || !(BOOKING_TYPES as readonly string[]).includes(type)) {
    return { ok: false, error: 'Unknown booking type.' }
  }

  const itemId = str(b.itemId, 80)
  if (!/^[A-Za-z0-9_\-.:]{1,80}$/.test(itemId)) return { ok: false, error: 'Missing or invalid item.' }

  if (!Array.isArray(b.travelers) || b.travelers.length < 1 || b.travelers.length > 9) {
    return { ok: false, error: 'Between 1 and 9 travellers are required.' }
  }
  const travelers: CleanTraveler[] = []
  for (let i = 0; i < b.travelers.length; i++) {
    const t = b.travelers[i] as Record<string, unknown> | null
    if (!t || typeof t !== 'object') return { ok: false, error: 'Invalid traveller details.' }
    const firstName = str(t.firstName, 60)
    const lastName = str(t.lastName, 60)
    if (!NAME_RE.test(firstName) || !NAME_RE.test(lastName)) {
      return { ok: false, error: `Please check the name of traveller ${i + 1}.` }
    }
    const clean: CleanTraveler = { firstName, lastName }
    const dob = str(t.dob, 10)
    if (dob) {
      if (!DATE_RE.test(dob)) return { ok: false, error: `Please check the date of birth of traveller ${i + 1}.` }
      clean.dob = dob
    }
    const passport = str(t.passport, 30)
    if (passport) clean.passport = passport.replace(/[^A-Za-z0-9 \-]/g, '')
    const nationality = str(t.nationality, 40)
    if (nationality) clean.nationality = nationality.replace(/[^\p{L}\p{M} \-]/gu, '')
    if (i === 0) {
      const email = str(t.email, 254)
      if (!EMAIL_RE.test(email)) return { ok: false, error: 'A valid email address is required for the lead traveller.' }
      clean.email = email
      const phone = str(t.phone, 30)
      if (phone) clean.phone = phone.replace(/[^0-9+()\- ]/g, '')
    }
    travelers.push(clean)
  }

  const addOns = Array.isArray(b.addOns)
    ? [...new Set(b.addOns.filter((a): a is string => typeof a === 'string' && (EXTRA_NAMES as readonly string[]).includes(a)))]
    : []

  const cabinRaw = str(b.cabinClass, 20)
  const cabinClass = (CABINS as readonly string[]).includes(cabinRaw) ? cabinRaw : null

  let routeSnapshot: CleanRoute | null = null
  let flightKey: FlightKey | null = null
  if (type === 'flight') {
    const r = b.routeSnapshot as Record<string, unknown> | null | undefined
    if (r && typeof r === 'object') {
      const origin = str(r.origin, 3).toUpperCase()
      const destination = str(r.destination, 3).toUpperCase()
      const departureDate = str(r.departureDate, 10)
      const returnDate = str(r.returnDate, 10)
      const adults = intIn(r.adults, 1, 9)
      const children = ages(r.children)
      const infants = ages(r.infants)
      if (
        IATA_RE.test(origin) && IATA_RE.test(destination) && DATE_RE.test(departureDate) &&
        (!returnDate || DATE_RE.test(returnDate)) && adults !== null && children !== null && infants !== null
      ) {
        routeSnapshot = {
          origin, destination, departureDate,
          ...(returnDate ? { returnDate } : {}),
          adults, children, infants,
          cabinClass: (CABINS as readonly string[]).includes(str(r.cabinClass, 20)) ? str(r.cabinClass, 20) : (cabinClass ?? 'economy'),
        }
      }
    }
    const k = b.flightKey as Record<string, unknown> | null | undefined
    if (k && typeof k === 'object') {
      const airline = str(k.airline, 80)
      const flightNumber = str(k.flightNumber, 20)
      const departure = str(k.departure, 40)
      if (airline && flightNumber && departure) flightKey = { airline, flightNumber, departure }
    }
  }

  const est = typeof b.clientEstimate === 'number' && Number.isFinite(b.clientEstimate) && b.clientEstimate >= 0 && b.clientEstimate < 10_000_000
    ? Math.round(b.clientEstimate * 100) / 100
    : null

  return {
    ok: true,
    booking: { type: type as BookingType, itemId, travelers, addOns, cabinClass, routeSnapshot, flightKey, clientEstimate: est },
  }
}

// ── Price ─────────────────────────────────────────────────────────────────────
export interface PriceResult {
  total: number // 0 = "to be quoted": no payment link is ever made for a 0 total
  verified: boolean
  note: string
}

interface SearchedFlight {
  airline: string
  flightNumber: string
  departure: string
  price: Record<string, number>
  currency?: string
}

export interface PriceDeps {
  searchFlights: (route: CleanRoute) => Promise<{ flights: SearchedFlight[] } | { error: string }>
  now?: () => Date
}

// Duffel's total_amount already covers the whole searched party, so the total is
// that figure as returned, never multiplied by the number of travellers.
export async function priceBooking(b: CleanBooking, deps: PriceDeps): Promise<PriceResult> {
  if (b.type !== 'flight') {
    return { total: 0, verified: false, note: 'Price to be quoted (no online price for this item).' }
  }
  if (!b.routeSnapshot || !b.flightKey) {
    return { total: 0, verified: false, note: 'Flight details were incomplete: fare NOT verified. Re-check the fare before quoting.' }
  }
  let res
  try {
    res = await deps.searchFlights(b.routeSnapshot)
  } catch {
    return { total: 0, verified: false, note: 'Fare could not be re-checked (search failed): fare NOT verified.' }
  }
  if ('error' in res) {
    return { total: 0, verified: false, note: 'Fare could not be re-checked (search error): fare NOT verified.' }
  }
  const k = b.flightKey
  const f = res.flights.find((x) => x.flightNumber === k.flightNumber && x.departure === k.departure && x.airline === k.airline)
  if (!f) {
    return { total: 0, verified: false, note: 'This flight is no longer offered at the same time: fare NOT verified. Re-check before quoting.' }
  }
  const cabin = b.routeSnapshot.cabinClass
  const price = Number(f.price[cabin] ?? f.price.economy)
  if (!Number.isFinite(price) || price <= 0) {
    return { total: 0, verified: false, note: 'No valid fare returned: fare NOT verified.' }
  }
  const at = (deps.now ? deps.now() : new Date()).toISOString()
  const warn = b.clientEstimate !== null && Math.abs(b.clientEstimate - price) > 0.5
    ? ` The customer saw an estimate of ${b.clientEstimate}; the fare changed.`
    : ''
  return { total: Math.round(price * 100) / 100, verified: true, note: `Fare re-checked with Duffel at ${at} (${f.currency ?? 'currency not stated'}).${warn}` }
}

// ── Reference ─────────────────────────────────────────────────────────────────
function secureRandom(): number {
  const a = new Uint32Array(1)
  globalThis.crypto.getRandomValues(a)
  return a[0] / 4294967296
}

export function newBookingRef(random: () => number = secureRandom): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I look-alikes
  let out = 'TRG-'
  for (let i = 0; i < 6; i++) out += chars[Math.floor(random() * chars.length)]
  return out
}
