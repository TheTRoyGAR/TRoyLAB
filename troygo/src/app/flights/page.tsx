'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Plane,
  ArrowRight,
  ArrowLeftRight,
  Clock,
  Users,
  ChevronDown,
  Filter,
  SortAsc,
  Wifi,
  Utensils,
  Monitor,
  Bell,
  BellOff,
  ChevronRight,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { sampleFlights, type Flight } from '@/lib/data/flights'
import MainLayout from '@/components/layout/MainLayout'
import LiveFlightTracker from '@/components/flights/LiveFlightTracker'

/* ─── Types ───────────────────────────────────────────────────────────────── */
type SortMode = 'best' | 'cheapest' | 'fastest'
type DepartureTime = 'morning' | 'afternoon' | 'evening' | 'night'
type CabinClass = 'economy' | 'business' | 'first'

/* ─── Airline logo colors ─────────────────────────────────────────────────── */
const AIRLINE_COLORS: Record<string, string> = {
  BA: '#075AAA', AA: '#B01C2E', DL: '#E01933', JL: '#E40012',
  UA: '#003580', AF: '#002157', EK: '#C60C30', LH: '#05164D',
  SQ: '#0B2343', QF: '#EE0000', TK: '#C70A0C', IB: '#BB0024',
  KL: '#00A1DE', CX: '#006564', NK: '#FFCD00', DEFAULT: '#00B4D8',
}

function airlineColor(logo: string): string {
  return AIRLINE_COLORS[logo] ?? AIRLINE_COLORS.DEFAULT
}

/* ─── Utilities ───────────────────────────────────────────────────────────── */
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}
function formatDDMMYYYY(isoDate: string) {
  if (!isoDate) return ''
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-AU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}
function classPrice(flight: Flight, cls: CabinClass): number {
  return flight.price[cls]
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */
function AirlineLogo({ logo, airline }: { logo: string; airline: string }) {
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md"
      style={{ background: airlineColor(logo) }}
      title={airline}
    >
      {logo}
    </div>
  )
}

function StopsIndicator({ stops, stopCity }: { stops: 0 | 1 | 2; stopCity?: string }) {
  if (stops === 0) {
    return <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Direct</span>
  }
  return (
    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
      {stops} stop{stops > 1 ? 's' : ''}{stopCity ? ` · ${stopCity}` : ''}
    </span>
  )
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-2 mt-1 relative">
        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
        <span className="w-full text-sm font-semibold text-navy">
          {value ? formatDDMMYYYY(value) : <span className="text-slate-400 font-normal">dd/mm/yyyy</span>}
        </span>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
}

function AmenityIcons({ amenities }: { amenities: Flight['amenities'] }) {
  return (
    <div className="flex items-center gap-1.5">
      {amenities.wifi && <span title="Wi-Fi"><Wifi className="h-3.5 w-3.5 text-slate-400" /></span>}
      {amenities.meals && <span title="Meals"><Utensils className="h-3.5 w-3.5 text-slate-400" /></span>}
      {amenities.entertainment && <span title="Entertainment"><Monitor className="h-3.5 w-3.5 text-slate-400" /></span>}
    </div>
  )
}

/* ─── Flight Card ─────────────────────────────────────────────────────────── */
function FlightCard({ flight, selectedClass }: { flight: Flight; selectedClass: CabinClass }) {
  const price = classPrice(flight, selectedClass)
  const isLowSeats = flight.seatsLeft < 5

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col md:flex-row md:items-center gap-5">
      {/* Airline */}
      <div className="flex items-center gap-3 md:w-44 shrink-0">
        <AirlineLogo logo={flight.logo} airline={flight.airline} />
        <div>
          <p className="text-sm font-semibold text-navy leading-tight">{flight.airline}</p>
          <p className="text-xs text-slate-400">{flight.flightNumber}</p>
          <p className="text-xs text-slate-400 mt-0.5">{flight.aircraft}</p>
        </div>
      </div>

      {/* Route / times */}
      <div className="flex-1 flex items-center gap-3">
        {/* Departure */}
        <div className="text-center min-w-[64px]">
          <p className="text-2xl font-bold text-navy tracking-tight">{formatTime(flight.departure)}</p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">{flight.from.code}</p>
          <p className="text-xs text-slate-400">{formatDate(flight.departure)}</p>
        </div>

        {/* Line */}
        <div className="flex-1 flex flex-col items-center gap-1 px-2">
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3" /> {flight.duration}
          </p>
          <div className="relative w-full flex items-center">
            <div className="flex-1 h-px bg-slate-200" />
            <Plane className="h-3.5 w-3.5 text-teal mx-1 shrink-0" />
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <StopsIndicator stops={flight.stops} stopCity={flight.stopCity} />
        </div>

        {/* Arrival */}
        <div className="text-center min-w-[64px]">
          <p className="text-2xl font-bold text-navy tracking-tight">{formatTime(flight.arrival)}</p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">{flight.to.code}</p>
          <p className="text-xs text-slate-400">{formatDate(flight.arrival)}</p>
        </div>
      </div>

      {/* Amenities + route label */}
      <div className="hidden lg:flex flex-col items-center gap-2 text-center w-28 shrink-0">
        <span className="text-xs font-medium text-slate-500">
          {flight.from.city} → {flight.to.city}
        </span>
        <AmenityIcons amenities={flight.amenities} />
      </div>

      {/* Price + CTA */}
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:w-36 shrink-0">
        <div className="text-right">
          {isLowSeats && (
            <p className="text-xs font-semibold text-red-600 flex items-center gap-1 justify-end mb-1">
              <AlertCircle className="h-3.5 w-3.5" /> {flight.seatsLeft} seats left
            </p>
          )}
          <p className="text-2xl font-black text-navy">${price.toLocaleString()}</p>
          <p className="text-xs text-slate-400 capitalize">{selectedClass} · per person</p>
          {selectedClass === 'economy' && (
            <div className="mt-0.5 space-y-0.5">
              <p className="text-xs text-slate-400">
                Business: <span className="font-medium text-slate-600">${flight.price.business.toLocaleString()}</span>
              </p>
              {flight.price.first > 0 && (
                <p className="text-xs text-slate-400">
                  First: <span className="font-medium text-slate-600">${flight.price.first.toLocaleString()}</span>
                </p>
              )}
            </div>
          )}
        </div>
        <Link
          href={`/booking?type=flight&id=${flight.id}&class=${selectedClass}`}
          className="px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 hover:-translate-y-0.5 shadow-sm whitespace-nowrap"
          style={{ background: '#00B4D8' }}
        >
          Select
        </Link>
      </div>
    </div>
  )
}

type FlightLeg = { id: string; from: string; to: string; date: string }

/* ─── Search Bar ──────────────────────────────────────────────────────────── */
function SearchBar({
  from, setFrom, to, setTo,
  date, setDate, returnDate, setReturnDate,
  passengers, setPassengers, cabinClass, setCabinClass,
  extraLegs, onAddLeg, onRemoveLeg, onUpdateLeg,
  onSearch,
}: {
  from: string; setFrom: (v: string) => void
  to: string; setTo: (v: string) => void
  date: string; setDate: (v: string) => void
  returnDate: string; setReturnDate: (v: string) => void
  passengers: number; setPassengers: (v: number) => void
  cabinClass: CabinClass; setCabinClass: (v: CabinClass) => void
  extraLegs: FlightLeg[]
  onAddLeg: () => void
  onRemoveLeg: (id: string) => void
  onUpdateLeg: (id: string, patch: Partial<FlightLeg>) => void
  onSearch: () => void
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 border border-slate-100">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* From */}
        <div className="lg:col-span-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">From</label>
          <div className="flex items-center gap-2 mt-1">
            <Plane className="h-4 w-4 text-teal shrink-0" style={{ color: '#00B4D8' }} />
            <input
              className="w-full text-sm font-semibold text-navy outline-none bg-transparent"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="City or airport"
            />
          </div>
        </div>

        {/* Swap + To */}
        <div className="lg:col-span-1 flex items-end gap-2">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">To</label>
            <div className="flex items-center gap-2 mt-1">
              <Plane className="h-4 w-4 rotate-90 shrink-0" style={{ color: '#00B4D8' }} />
              <input
                className="w-full text-sm font-semibold text-navy outline-none bg-transparent"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="City or airport"
              />
            </div>
          </div>
          <button
            onClick={() => { const tmp = from; setFrom(to); setTo(tmp) }}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0 mb-0.5"
            title="Swap"
          >
            <ArrowLeftRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* Date */}
        <DateField label="Depart" value={date} onChange={setDate} />

        {/* Return */}
        <DateField label="Return" value={returnDate} onChange={setReturnDate} />

        {/* Passengers */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Passengers</label>
          <div className="flex items-center gap-2 mt-1">
            <Users className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              className="w-full text-sm font-semibold text-navy outline-none bg-transparent"
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Class */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Class</label>
          <div className="flex items-center gap-2 mt-1">
            <select
              className="w-full text-sm font-semibold text-navy outline-none bg-transparent capitalize"
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value as CabinClass)}
            >
              <option value="economy">Economy</option>
              <option value="business">Business</option>
              <option value="first">First Class</option>
            </select>
          </div>
        </div>
      </div>
      {/* Extra legs (multi-city) */}
      {extraLegs.length > 0 && (
        <div className="mt-3 space-y-2">
          {extraLegs.map((leg, i) => (
            <div key={leg.id} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <div className="lg:col-span-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">From</label>
                <div className="flex items-center gap-2 mt-1">
                  <Plane className="h-4 w-4 text-teal shrink-0" style={{ color: '#00B4D8' }} />
                  <input
                    className="w-full text-sm font-semibold text-navy outline-none bg-transparent"
                    value={leg.from}
                    onChange={(e) => onUpdateLeg(leg.id, { from: e.target.value })}
                    placeholder="City or airport"
                  />
                </div>
              </div>
              <div className="lg:col-span-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">To (leg {i + 2})</label>
                <div className="flex items-center gap-2 mt-1">
                  <Plane className="h-4 w-4 rotate-90 shrink-0" style={{ color: '#00B4D8' }} />
                  <input
                    className="w-full text-sm font-semibold text-navy outline-none bg-transparent"
                    value={leg.to}
                    onChange={(e) => onUpdateLeg(leg.id, { to: e.target.value })}
                    placeholder="City or airport"
                  />
                </div>
              </div>
              <DateField label="Depart" value={leg.date} onChange={(v) => onUpdateLeg(leg.id, { date: v })} />
              <div className="flex items-end">
                <button
                  onClick={() => onRemoveLeg(leg.id)}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 px-2 py-2"
                  title="Remove this destination"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={onAddLeg}
          className="text-sm font-semibold hover:underline"
          style={{ color: '#00B4D8' }}
        >
          + Add another destination
        </button>
        <button
          onClick={onSearch}
          className="px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm hover:brightness-110 transition-all"
          style={{ background: '#00B4D8' }}
        >
          Search Flights
        </button>
      </div>
    </div>
  )
}

/* ─── Filter Sidebar ──────────────────────────────────────────────────────── */
function FilterSidebar({
  stops, setStops, priceRange, setPriceRange,
  airlines, setAirlines, departureTimes, setDepartureTimes,
  maxDuration, setMaxDuration,
}: {
  stops: Set<number>; setStops: (v: Set<number>) => void
  priceRange: [number, number]; setPriceRange: (v: [number, number]) => void
  airlines: Set<string>; setAirlines: (v: Set<string>) => void
  departureTimes: Set<DepartureTime>; setDepartureTimes: (v: Set<DepartureTime>) => void
  maxDuration: number; setMaxDuration: (v: number) => void
}) {
  const allAirlines = [...new Set(sampleFlights.map((f) => f.airline))].sort()

  function toggleSet<T>(set: Set<T>, val: T, setter: (v: Set<T>) => void) {
    const next = new Set(set)
    next.has(val) ? next.delete(val) : next.add(val)
    setter(next)
  }

  return (
    <aside className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-6 h-fit sticky top-28">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-teal" style={{ color: '#00B4D8' }} />
        <h3 className="font-bold text-navy text-sm">Filters</h3>
      </div>

      {/* Stops */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Stops</h4>
        <div className="space-y-2">
          {[{ label: 'Direct', value: 0 }, { label: '1 Stop', value: 1 }, { label: '2+ Stops', value: 2 }].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={stops.has(opt.value)}
                onChange={() => toggleSet(stops, opt.value, setStops)}
                className="w-4 h-4 accent-teal rounded"
                style={{ accentColor: '#00B4D8' }}
              />
              <span className="text-sm text-slate-600 group-hover:text-navy transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Price Range</h4>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-slate-500">${priceRange[0]}</span>
          <div className="flex-1" />
          <span className="text-xs font-semibold text-navy">${priceRange[1].toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={0}
          max={2000}
          step={50}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full"
          style={{ accentColor: '#00B4D8' }}
        />
      </div>

      {/* Departure time */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Departure Time</h4>
        <div className="grid grid-cols-2 gap-2">
          {([
            { label: 'Morning', value: 'morning', sub: '5am–12pm' },
            { label: 'Afternoon', value: 'afternoon', sub: '12pm–6pm' },
            { label: 'Evening', value: 'evening', sub: '6pm–9pm' },
            { label: 'Night', value: 'night', sub: '9pm–5am' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleSet(departureTimes, opt.value, setDepartureTimes)}
              className={cn(
                'flex flex-col items-center p-2 rounded-xl border text-xs transition-all',
                departureTimes.has(opt.value)
                  ? 'border-teal text-teal font-semibold'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              )}
              style={departureTimes.has(opt.value) ? { borderColor: '#00B4D8', color: '#00B4D8' } : {}}
            >
              <span className="font-semibold">{opt.label}</span>
              <span className="text-[10px] opacity-70">{opt.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Max duration */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Max Duration</h4>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">Any</span>
          <span className="text-xs font-semibold text-navy">{maxDuration}h</span>
        </div>
        <input
          type="range"
          min={4}
          max={24}
          step={1}
          value={maxDuration}
          onChange={(e) => setMaxDuration(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: '#00B4D8' }}
        />
      </div>

      {/* Airlines */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Airlines</h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {allAirlines.map((airline) => (
            <label key={airline} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={airlines.has(airline)}
                onChange={() => toggleSet(airlines, airline, setAirlines)}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#00B4D8' }}
              />
              <span className="text-sm text-slate-600 group-hover:text-navy transition-colors truncate">{airline}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          setStops(new Set([0, 1, 2]))
          setPriceRange([0, 2000])
          setAirlines(new Set())
          setDepartureTimes(new Set())
          setMaxDuration(24)
        }}
        className="w-full py-2 text-sm font-semibold text-slate-500 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
      >
        Reset Filters
      </button>
    </aside>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
function FlightsContent() {
  const params = useSearchParams()

  const [from, setFrom] = useState(params.get('from') ?? '')
  const [to, setTo] = useState(params.get('to') ?? '')
  const [date, setDate] = useState(params.get('date') ?? '2026-06-15')
  const [returnDate, setReturnDate] = useState(params.get('return') ?? '')
  const [passengers, setPassengers] = useState(Number(params.get('passengers') ?? 1))
  const [cabinClass, setCabinClass] = useState<CabinClass>((params.get('class') as CabinClass) ?? 'economy')

  const [extraLegs, setExtraLegs] = useState<FlightLeg[]>([])

  function addLeg() {
    const lastTo = extraLegs.length > 0 ? extraLegs[extraLegs.length - 1].to : to
    setExtraLegs((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, from: lastTo, to: '', date: '' }])
  }
  function removeLeg(id: string) {
    setExtraLegs((prev) => prev.filter((l) => l.id !== id))
  }
  function updateLeg(id: string, patch: Partial<FlightLeg>) {
    setExtraLegs((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  const [sortMode, setSortMode] = useState<SortMode>('best')
  const [priceAlert, setPriceAlert] = useState(false)

  // Filters
  const [stops, setStops] = useState<Set<number>>(new Set([0, 1, 2]))
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
  const [airlines, setAirlines] = useState<Set<string>>(new Set())
  const [departureTimes, setDepartureTimes] = useState<Set<DepartureTime>>(new Set())
  const [maxDuration, setMaxDuration] = useState(24)

  function getDepartureSlot(iso: string): DepartureTime {
    const h = new Date(iso).getHours()
    if (h >= 5 && h < 12) return 'morning'
    if (h >= 12 && h < 18) return 'afternoon'
    if (h >= 18 && h < 21) return 'evening'
    return 'night'
  }

  function parseDurationHours(d: string): number {
    const match = d.match(/(\d+)h\s*(\d+)?m?/)
    if (!match) return 99
    return Number(match[1]) + (Number(match[2] ?? 0) / 60)
  }

  function matchesRoute(query: string, endpoint: { city: string; code: string }): boolean {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return endpoint.city.toLowerCase().includes(q) || endpoint.code.toLowerCase() === q
  }

  function filterByLeg(legFrom: string, legTo: string) {
    return sampleFlights.filter((f) => {
      if (!matchesRoute(legFrom, f.from)) return false
      if (!matchesRoute(legTo, f.to)) return false
      if (!stops.has(f.stops)) return false
      const price = f.price[cabinClass]
      if (price < priceRange[0] || price > priceRange[1]) return false
      if (airlines.size > 0 && !airlines.has(f.airline)) return false
      if (departureTimes.size > 0 && !departureTimes.has(getDepartureSlot(f.departure))) return false
      if (parseDurationHours(f.duration) > maxDuration) return false
      return true
    })
  }

  function sortResults(list: Flight[]) {
    return [...list].sort((a, b) => {
      if (sortMode === 'cheapest') return a.price[cabinClass] - b.price[cabinClass]
      if (sortMode === 'fastest') return parseDurationHours(a.duration) - parseDurationHours(b.duration)
      // best: score = stops * 500 + price
      return (a.stops * 500 + a.price[cabinClass]) - (b.stops * 500 + b.price[cabinClass])
    })
  }

  const filtered = useMemo(
    () => filterByLeg(from, to),
    [from, to, stops, priceRange, airlines, departureTimes, maxDuration, cabinClass]
  )

  const sorted = useMemo(() => sortResults(filtered), [filtered, sortMode, cabinClass])

  // When extra destinations are added, show each leg's results separately.
  const legResults = useMemo(() => {
    if (extraLegs.length === 0) return null
    const legs = [
      { label: `${from || 'Anywhere'} → ${to || 'Anywhere'}`, legFrom: from, legTo: to },
      ...extraLegs.map((l) => ({ label: `${l.from || 'Anywhere'} → ${l.to || 'Anywhere'}`, legFrom: l.from, legTo: l.to })),
    ]
    return legs.map((leg) => ({ ...leg, results: sortResults(filterByLeg(leg.legFrom, leg.legTo)) }))
  }, [from, to, extraLegs, stops, priceRange, airlines, departureTimes, maxDuration, cabinClass, sortMode])

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50">
        {/* Hero bar */}
        <div className="py-8 px-4 md:px-8" style={{ background: '#0A1628' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">Flights</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-6">Search Flights</h1>
            <SearchBar
              from={from} setFrom={setFrom}
              to={to} setTo={setTo}
              date={date} setDate={setDate}
              returnDate={returnDate} setReturnDate={setReturnDate}
              passengers={passengers} setPassengers={setPassengers}
              cabinClass={cabinClass} setCabinClass={setCabinClass}
              extraLegs={extraLegs} onAddLeg={addLeg} onRemoveLeg={removeLeg} onUpdateLeg={updateLeg}
              onSearch={() => document.getElementById('flight-results')?.scrollIntoView({ behavior: 'smooth' })}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="mb-6">
            <LiveFlightTracker />
          </div>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64 shrink-0">
              <FilterSidebar
                stops={stops} setStops={setStops}
                priceRange={priceRange} setPriceRange={setPriceRange}
                airlines={airlines} setAirlines={setAirlines}
                departureTimes={departureTimes} setDepartureTimes={setDepartureTimes}
                maxDuration={maxDuration} setMaxDuration={setMaxDuration}
              />
            </div>

            {/* Results */}
            <div id="flight-results" className="flex-1 min-w-0">
              {/* Sort bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <p className="text-sm text-slate-500">
                  {legResults ? (
                    <>Showing <span className="font-bold text-navy">{legResults.reduce((n, l) => n + l.results.length, 0)}</span> flights across <span className="font-bold text-navy">{legResults.length}</span> destinations</>
                  ) : (
                    <>Showing <span className="font-bold text-navy">{sorted.length}</span> flights</>
                  )}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Sort */}
                  <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
                    {(['best', 'cheapest', 'fastest'] as SortMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSortMode(mode)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize',
                          sortMode === mode
                            ? 'text-white shadow-sm'
                            : 'text-slate-500 hover:text-navy'
                        )}
                        style={sortMode === mode ? { background: '#00B4D8' } : {}}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  {/* Price alert */}
                  <button
                    onClick={() => setPriceAlert((v) => !v)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all',
                      priceAlert
                        ? 'text-white border-transparent shadow-sm'
                        : 'text-slate-600 border-slate-200 hover:border-slate-300'
                    )}
                    style={priceAlert ? { background: '#FFD700', color: '#0A1628', borderColor: '#FFD700' } : {}}
                  >
                    {priceAlert ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                    Price Alert {priceAlert ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              {/* Flight list */}
              {legResults ? (
                <div className="space-y-8">
                  {legResults.map((leg, i) => (
                    <div key={i}>
                      <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[11px] font-bold" style={{ background: '#00B4D8' }}>
                          {i + 1}
                        </span>
                        {leg.label}
                      </h3>
                      <div className="space-y-3">
                        {leg.results.length === 0 ? (
                          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                            <p className="text-sm font-semibold text-navy mb-1">No flights found for this leg</p>
                            <p className="text-slate-500 text-xs">Try adjusting your filters or the route entered.</p>
                          </div>
                        ) : (
                          leg.results.map((flight) => (
                            <FlightCard key={flight.id} flight={flight} selectedClass={cabinClass} />
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {sorted.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                      <Plane className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-lg font-bold text-navy mb-2">No flights found</p>
                      <p className="text-slate-500 text-sm">Try adjusting your filters or search criteria.</p>
                    </div>
                  ) : (
                    sorted.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} selectedClass={cabinClass} />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default function FlightsPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>}><FlightsContent /></Suspense>
}
