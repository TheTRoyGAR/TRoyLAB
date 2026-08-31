'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Hotel,
  Star,
  MapPin,
  Wifi,
  Dumbbell,
  Waves,
  Sparkles,
  Car,
  Search,
  Filter,
  LayoutGrid,
  Map,
  ChevronRight,
  Calendar,
  Users,
  CheckCircle,
} from 'lucide-react'
import { cn, defaultSearchDate } from '@/lib/utils'
import { sampleHotels, type Hotel as HotelType } from '@/lib/data/hotels'
import MainLayout from '@/components/layout/MainLayout'

/* ─── Types ───────────────────────────────────────────────────────────────── */
type SortMode = 'recommended' | 'price-asc' | 'stars' | 'rating'
type ViewMode = 'list' | 'map'
type HotelTypeFilter = 'hotel' | 'resort' | 'hostel' | 'boutique'

/* ─── Amenity icon map ────────────────────────────────────────────────────── */
const AMENITY_ICONS: Record<string, React.ElementType> = {
  WiFi: Wifi,
  Gym: Dumbbell,
  Pool: Waves,
  'Private Pool': Waves,
  Spa: Sparkles,
  Parking: Car,
  Valet: Car,
}

function AmenityIcon({ amenity }: { amenity: string }) {
  const Icon = AMENITY_ICONS[amenity]
  if (!Icon) return null
  return <Icon className="h-3.5 w-3.5 text-slate-400" title={amenity} />
}

/* ─── Star display ────────────────────────────────────────────────────────── */
function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-current" style={{ color: '#FFD700' }} />
      ))}
    </div>
  )
}

/* ─── Rating badge ────────────────────────────────────────────────────────── */
function RatingBadge({ rating }: { rating: number }) {
  const bg =
    rating >= 9.5 ? '#0A1628' :
    rating >= 9.0 ? '#0D6EFD' :
    rating >= 8.5 ? '#198754' : '#6C757D'

  return (
    <div
      className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-white font-black text-base shadow"
      style={{ background: bg }}
    >
      {rating.toFixed(1)}
    </div>
  )
}

/* ─── Hotel Card ──────────────────────────────────────────────────────────── */
function HotelCard({ hotel }: { hotel: HotelType }) {
  const isFree = hotel.cancellationPolicy === 'Free cancellation'
  const discount = Math.round(((hotel.originalPrice - hotel.pricePerNight) / hotel.originalPrice) * 100)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col md:flex-row">
      {/* Image */}
      <div className={cn('h-48 md:h-auto md:w-56 lg:w-64 shrink-0 relative bg-gradient-to-br', hotel.images)}>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Hotel className="h-14 w-14 text-white/25" />
        </div>
        {discount > 0 && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow"
            style={{ background: '#00B4D8' }}
          >
            -{discount}%
          </div>
        )}
        {isFree && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
            <CheckCircle className="h-3 w-3" />
            Free cancellation
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Stars count={hotel.stars} />
              <span className="text-xs font-semibold capitalize text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {hotel.type}
              </span>
            </div>
            <h3 className="text-lg font-bold text-navy leading-tight mb-1 truncate">{hotel.name}</h3>
            <div className="flex items-center gap-1 text-slate-500 text-sm mb-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{hotel.location.address}</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{hotel.description}</p>
          </div>
          <RatingBadge rating={hotel.rating} />
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {hotel.amenities.slice(0, 6).map((a) => (
            <span key={a} className="flex items-center gap-1 text-xs text-slate-500">
              <AmenityIcon amenity={a} />
              {a}
            </span>
          ))}
          {hotel.amenities.length > 6 && (
            <span className="text-xs text-slate-400">+{hotel.amenities.length - 6} more</span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto pt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">per night from</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-navy">${hotel.pricePerNight.toLocaleString()}</span>
              {hotel.originalPrice > hotel.pricePerNight && (
                <span className="text-sm text-slate-400 line-through">${hotel.originalPrice.toLocaleString()}</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{hotel.reviewCount.toLocaleString()} reviews</p>
          </div>
          <Link
            href={`/booking?type=hotel&id=${hotel.id}`}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm hover:brightness-110 hover:-translate-y-0.5 transition-all whitespace-nowrap"
            style={{ background: '#00B4D8' }}
          >
            View Hotel
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ─── Search Bar ──────────────────────────────────────────────────────────── */
function SearchBar({
  destination, setDestination,
  checkIn, setCheckIn,
  checkOut, setCheckOut,
  guests, setGuests,
  rooms, setRooms,
  onSearch,
}: {
  destination: string; setDestination: (v: string) => void
  checkIn: string; setCheckIn: (v: string) => void
  checkOut: string; setCheckOut: (v: string) => void
  guests: number; setGuests: (v: number) => void
  rooms: number; setRooms: (v: number) => void
  onSearch: () => void
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 border border-slate-100">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Destination</label>
          <div className="flex items-center gap-2 mt-1">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              className="w-full text-sm font-semibold text-navy outline-none bg-transparent"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="City, hotel, or landmark"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Check-in</label>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="date"
              className="w-full text-sm font-semibold text-navy outline-none bg-transparent"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Check-out</label>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="date"
              className="w-full text-sm font-semibold text-navy outline-none bg-transparent"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Guests & Rooms</label>
          <div className="flex items-center gap-2 mt-1">
            <Users className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              className="w-full text-sm font-semibold text-navy outline-none bg-transparent"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}, {rooms} Room{rooms > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={onSearch}
          className="px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm hover:brightness-110 transition-all"
          style={{ background: '#00B4D8' }}
        >
          Search Hotels
        </button>
      </div>
    </div>
  )
}

/* ─── Filter Sidebar ──────────────────────────────────────────────────────── */
function FilterSidebar({
  starFilter, setStarFilter,
  priceRange, setPriceRange,
  amenityFilter, setAmenityFilter,
  ratingMin, setRatingMin,
  typeFilter, setTypeFilter,
}: {
  starFilter: Set<number>; setStarFilter: (v: Set<number>) => void
  priceRange: [number, number]; setPriceRange: (v: [number, number]) => void
  amenityFilter: Set<string>; setAmenityFilter: (v: Set<string>) => void
  ratingMin: number; setRatingMin: (v: number) => void
  typeFilter: Set<HotelTypeFilter>; setTypeFilter: (v: Set<HotelTypeFilter>) => void
}) {
  function toggleSet<T>(set: Set<T>, val: T, setter: (v: Set<T>) => void) {
    const next = new Set(set)
    next.has(val) ? next.delete(val) : next.add(val)
    setter(next)
  }

  const amenities = ['WiFi', 'Pool', 'Gym', 'Spa', 'Parking', 'Restaurant', 'Bar']

  return (
    <aside className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-6 h-fit sticky top-28">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" style={{ color: '#00B4D8' }} />
        <h3 className="font-bold text-navy text-sm">Filters</h3>
      </div>

      {/* Star rating */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Star Rating</h4>
        <div className="flex flex-wrap gap-2">
          {[3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => toggleSet(starFilter, s, setStarFilter)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all',
                starFilter.has(s)
                  ? 'text-white border-transparent'
                  : 'text-slate-500 border-slate-200 hover:border-slate-300'
              )}
              style={starFilter.has(s) ? { background: '#0A1628', borderColor: '#0A1628' } : {}}
            >
              {s} <Star className="h-3 w-3 fill-current" style={{ color: starFilter.has(s) ? '#FFD700' : 'currentColor' }} />
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Price Per Night</h4>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">$0</span>
          <span className="text-xs font-semibold text-navy">Up to ${priceRange[1].toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={0}
          max={3000}
          step={50}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([0, Number(e.target.value)])}
          className="w-full"
          style={{ accentColor: '#00B4D8' }}
        />
      </div>

      {/* Guest rating */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Guest Rating</h4>
        <div className="space-y-2">
          {[
            { label: 'Exceptional (9.5+)', value: 9.5 },
            { label: 'Wonderful (9.0+)', value: 9.0 },
            { label: 'Excellent (8.5+)', value: 8.5 },
            { label: 'Very Good (8.0+)', value: 8.0 },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={ratingMin === opt.value}
                onChange={() => setRatingMin(opt.value)}
                style={{ accentColor: '#00B4D8' }}
              />
              <span className="text-sm text-slate-600 group-hover:text-navy transition-colors">{opt.label}</span>
            </label>
          ))}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="rating"
              checked={ratingMin === 0}
              onChange={() => setRatingMin(0)}
              style={{ accentColor: '#00B4D8' }}
            />
            <span className="text-sm text-slate-600 group-hover:text-navy transition-colors">Any rating</span>
          </label>
        </div>
      </div>

      {/* Hotel type */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Hotel Type</h4>
        <div className="space-y-2">
          {(['hotel', 'resort', 'hostel', 'boutique'] as HotelTypeFilter[]).map((type) => (
            <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={typeFilter.has(type)}
                onChange={() => toggleSet(typeFilter, type, setTypeFilter)}
                style={{ accentColor: '#00B4D8' }}
              />
              <span className="text-sm text-slate-600 group-hover:text-navy transition-colors capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Amenities</h4>
        <div className="space-y-2">
          {amenities.map((a) => (
            <label key={a} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={amenityFilter.has(a)}
                onChange={() => toggleSet(amenityFilter, a, setAmenityFilter)}
                style={{ accentColor: '#00B4D8' }}
              />
              <span className="text-sm text-slate-600 group-hover:text-navy transition-colors">{a}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          setStarFilter(new Set([3, 4, 5]))
          setPriceRange([0, 3000])
          setAmenityFilter(new Set())
          setRatingMin(0)
          setTypeFilter(new Set(['hotel', 'resort', 'hostel', 'boutique']))
        }}
        className="w-full py-2 text-sm font-semibold text-slate-500 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
      >
        Reset Filters
      </button>
    </aside>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
function HotelsContent() {
  const params = useSearchParams()
  const [destination, setDestination] = useState(params.get('destination') ?? '')
  const [checkIn, setCheckIn] = useState(params.get('checkin') || defaultSearchDate(21))
  const [checkOut, setCheckOut] = useState(params.get('checkout') || defaultSearchDate(26))
  const [guests, setGuests] = useState(2)
  const [rooms, setRooms] = useState(1)

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortMode, setSortMode] = useState<SortMode>('recommended')

  const [starFilter, setStarFilter] = useState<Set<number>>(new Set([3, 4, 5]))
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000])
  const [amenityFilter, setAmenityFilter] = useState<Set<string>>(new Set())
  const [ratingMin, setRatingMin] = useState(0)
  const [typeFilter, setTypeFilter] = useState<Set<HotelTypeFilter>>(new Set(['hotel', 'resort', 'hostel', 'boutique']))

  const filtered = useMemo(() => {
    return sampleHotels.filter((h) => {
      if (!starFilter.has(h.stars)) return false
      if (h.pricePerNight > priceRange[1]) return false
      if (h.rating < ratingMin) return false
      if (!typeFilter.has(h.type)) return false
      if (amenityFilter.size > 0) {
        for (const a of amenityFilter) {
          if (!h.amenities.includes(a)) return false
        }
      }
      if (destination) {
        const q = destination.toLowerCase()
        if (!h.name.toLowerCase().includes(q) && !h.location.city.toLowerCase().includes(q) && !h.location.country.toLowerCase().includes(q)) {
          return false
        }
      }
      return true
    })
  }, [starFilter, priceRange, amenityFilter, ratingMin, typeFilter, destination])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortMode === 'price-asc') return a.pricePerNight - b.pricePerNight
      if (sortMode === 'stars') return b.stars - a.stars
      if (sortMode === 'rating') return b.rating - a.rating
      // recommended: stars * rating
      return (b.stars * b.rating) - (a.stars * a.rating)
    })
  }, [filtered, sortMode])

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50">
        {/* Hero bar */}
        <div className="py-8 px-4 md:px-8" style={{ background: '#0A1628' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">Hotels</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-6">Find Your Perfect Stay</h1>
            <SearchBar
              destination={destination} setDestination={setDestination}
              checkIn={checkIn} setCheckIn={setCheckIn}
              checkOut={checkOut} setCheckOut={setCheckOut}
              guests={guests} setGuests={setGuests}
              rooms={rooms} setRooms={setRooms}
              onSearch={() => document.getElementById('hotel-results')?.scrollIntoView({ behavior: 'smooth' })}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64 shrink-0">
              <FilterSidebar
                starFilter={starFilter} setStarFilter={setStarFilter}
                priceRange={priceRange} setPriceRange={setPriceRange}
                amenityFilter={amenityFilter} setAmenityFilter={setAmenityFilter}
                ratingMin={ratingMin} setRatingMin={setRatingMin}
                typeFilter={typeFilter} setTypeFilter={setTypeFilter}
              />
            </div>

            {/* Results */}
            <div id="hotel-results" className="flex-1 min-w-0">
              {/* Sort + view toggle bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-bold text-navy">{sorted.length}</span> properties
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Sort */}
                  <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
                    {([
                      { label: 'Recommended', value: 'recommended' },
                      { label: 'Price', value: 'price-asc' },
                      { label: 'Stars', value: 'stars' },
                      { label: 'Rating', value: 'rating' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSortMode(opt.value)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                          sortMode === opt.value ? 'text-white shadow-sm' : 'text-slate-500 hover:text-navy'
                        )}
                        style={sortMode === opt.value ? { background: '#00B4D8' } : {}}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* View mode */}
                  <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'p-2 rounded-lg transition-all',
                        viewMode === 'list' ? 'text-white shadow-sm' : 'text-slate-500 hover:text-navy'
                      )}
                      style={viewMode === 'list' ? { background: '#00B4D8' } : {}}
                      title="List view"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={cn(
                        'p-2 rounded-lg transition-all',
                        viewMode === 'map' ? 'text-white shadow-sm' : 'text-slate-500 hover:text-navy'
                      )}
                      style={viewMode === 'map' ? { background: '#00B4D8' } : {}}
                      title="Map view"
                    >
                      <Map className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              {viewMode === 'map' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-96 flex flex-col items-center justify-center mb-5 text-slate-400">
                  <Map className="h-16 w-16 mb-3 text-slate-200" />
                  <p className="font-semibold text-lg text-slate-300">Interactive Map</p>
                  <p className="text-sm text-slate-300 mt-1">Map integration coming soon</p>
                  <p className="text-xs text-slate-200 mt-1">{sorted.length} hotels in this area</p>
                </div>
              )}

              {/* Hotel list */}
              <div className="space-y-4">
                {sorted.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                    <Hotel className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-lg font-bold text-navy mb-2">No hotels found</p>
                    <p className="text-slate-500 text-sm">Try adjusting your filters or search criteria.</p>
                  </div>
                ) : (
                  sorted.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default function HotelsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>}>
      <HotelsContent />
    </Suspense>
  )
}
