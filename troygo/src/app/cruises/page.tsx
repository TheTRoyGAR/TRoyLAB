'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { cruises } from '@/lib/data/packages'
import { Star, Ship, MapPin, Clock, ChevronDown, Heart, Anchor } from 'lucide-react'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'

// Matches the real `category` values in lib/data/packages.ts — these used
// to be fictional placeholder names that matched nothing in the actual
// data, so selecting any option here would have shown zero results.
// Cruise line options are no longer a static guess-list (see
// linesWithCounts below) — they're derived from the real cruises actually
// in the catalog, so an option is never shown unless it has real results.
const REGION_OPTIONS = ['Caribbean', 'Mediterranean', 'Alaska', 'Asia', 'Europe', 'Expedition', 'Transatlantic']

function CruisesContent() {
  const params = useSearchParams()
  const [selectedRegion, setSelectedRegion] = useState(params.get('region') ?? '')
  const [selectedLine, setSelectedLine] = useState('')
  const [maxPrice, setMaxPrice] = useState(20000)
  const [maxDuration, setMaxDuration] = useState(21)
  const [sort, setSort] = useState('recommended')
  const [saved, setSaved] = useState<Set<number>>(new Set())

  // Derived from the real cruises actually in the data, not a static guess
  // list — so every option shown is guaranteed to return real results, and
  // new lines the research agent finds show up here automatically.
  const linesWithCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of cruises) counts.set(c.cruiseLine, (counts.get(c.cruiseLine) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [])

  const filtered = useMemo(() => {
    let list = [...cruises]
    if (maxPrice < 20000) list = list.filter((c) => c.price <= maxPrice)
    if (maxDuration < 21) list = list.filter((c) => c.duration <= maxDuration)
    if (selectedRegion) list = list.filter((c) => c.category === selectedRegion)
    if (selectedLine) list = list.filter((c) => c.cruiseLine === selectedLine)
    switch (sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break
      case 'price-desc': list.sort((a, b) => b.price - a.price); break
      case 'rating': list.sort((a, b) => b.rating - a.rating); break
    }
    return list
  }, [maxPrice, maxDuration, selectedRegion, selectedLine, sort])

  function toggleSave(id: number) {
    setSaved((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <MainLayout>
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div
        className="py-16 px-4 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #102444 50%, #0096B5 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #00B4D8 0%, transparent 50%), radial-gradient(circle at 80% 20%, #FFD700 0%, transparent 50%)' }} />
        <div className="relative z-10">
          <Anchor className="h-12 w-12 text-[#FFD700] mx-auto mb-4" />
          <h1
            className="text-4xl sm:text-5xl font-black text-white mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Sail the World&apos;s Most Beautiful Waters
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Discover handpicked cruise itineraries from the Caribbean to Antarctica — luxury cabins, world-class dining, unforgettable destinations.
          </p>
        </div>
      </div>

      {/* Browse by Cruise Line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <h2 className="text-sm font-bold text-[#0A1628] uppercase tracking-wider mb-4">Browse by Cruise Line</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <button
            onClick={() => setSelectedLine('')}
            className={`rounded-xl border p-3 text-left transition-all ${
              selectedLine === '' ? 'border-[#00B4D8] bg-[#00B4D8]/10' : 'border-gray-200 bg-white hover:border-[#00B4D8]/40'
            }`}
          >
            <p className="font-bold text-sm text-[#0A1628]">All Lines</p>
            <p className="text-xs text-gray-400">{cruises.length} cruises</p>
          </button>
          {linesWithCounts.map(([line, count]) => (
            <button
              key={line}
              onClick={() => setSelectedLine(selectedLine === line ? '' : line)}
              className={`rounded-xl border p-3 text-left transition-all ${
                selectedLine === line ? 'border-[#00B4D8] bg-[#00B4D8]/10' : 'border-gray-200 bg-white hover:border-[#00B4D8]/40'
              }`}
            >
              <p className="font-bold text-sm text-[#0A1628] truncate">{line}</p>
              <p className="text-xs text-gray-400">{count} cruise{count === 1 ? '' : 's'}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-6">
              <h3 className="font-bold text-[#0A1628] text-sm uppercase tracking-wider">Filter Cruises</h3>

              {/* Price */}
              <div>
                <h4 className="text-sm font-semibold text-[#0A1628] mb-3">Price per Cabin</h4>
                <input type="range" min={500} max={20000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-[#00B4D8]" />
                <p className="text-xs text-gray-500 mt-1">Up to ${maxPrice === 20000 ? '20,000+' : maxPrice.toLocaleString()}</p>
              </div>

              {/* Duration */}
              <div>
                <h4 className="text-sm font-semibold text-[#0A1628] mb-3">Duration (nights)</h4>
                <input type="range" min={3} max={21} step={1} value={maxDuration} onChange={(e) => setMaxDuration(Number(e.target.value))} className="w-full accent-[#00B4D8]" />
                <p className="text-xs text-gray-500 mt-1">Up to {maxDuration === 21 ? '21+ nights' : `${maxDuration} nights`}</p>
              </div>

              {/* Region */}
              <div>
                <h4 className="text-sm font-semibold text-[#0A1628] mb-3">Region</h4>
                <div className="space-y-2">
                  {REGION_OPTIONS.map((r) => (
                    <label key={r} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="region"
                        checked={selectedRegion === r}
                        onChange={() => setSelectedRegion(selectedRegion === r ? '' : r)}
                        className="accent-[#00B4D8]"
                      />
                      <span className="text-sm text-gray-700">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cruise line */}
              <div>
                <h4 className="text-sm font-semibold text-[#0A1628] mb-3">Cruise Line</h4>
                <div className="relative">
                  <select
                    value={selectedLine}
                    onChange={(e) => setSelectedLine(e.target.value)}
                    className="w-full appearance-none px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40"
                  >
                    <option value="">All Lines</option>
                    {linesWithCounts.map(([l]) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                <span className="font-bold text-[#0A1628]">{filtered.length}</span> cruises found
              </p>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-4">
              {filtered.map((cruise) => (
                <div key={cruise.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col sm:flex-row">
                  {/* Image — real ship photo when the research agent found one, gradient fallback otherwise */}
                  <div
                    className={`relative w-full sm:w-64 h-48 sm:h-auto shrink-0 ${cruise.imageUrl ? 'bg-gray-200 bg-cover bg-center' : `bg-gradient-to-br ${cruise.imageGradient}`}`}
                    style={cruise.imageUrl ? { backgroundImage: `url(${cruise.imageUrl})` } : undefined}
                  >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                    <span className="absolute top-3 left-3 text-xs font-bold text-white bg-[#0A1628]/70 px-2.5 py-1 rounded-full">
                      {cruise.cruiseLine}
                    </span>
                    <button
                      onClick={() => toggleSave(cruise.id)}
                      className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                    >
                      <Heart className={`h-4 w-4 ${saved.has(cruise.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                    <div className="absolute bottom-3 left-3">
                      <Ship className="h-8 w-8 text-white/60" />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-[#0A1628] text-base mb-1 group-hover:text-[#00B4D8] transition-colors">
                        {cruise.name}
                      </h3>
                      <p className="text-xs text-gray-400 mb-2">🚢 {cruise.ship}</p>

                      {/* Ports */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {cruise.itinerary.slice(0, 5).map((stop, i) => (
                          <span key={i} className="text-xs bg-[#00B4D8]/10 text-[#00B4D8] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{stop.port}
                          </span>
                        ))}
                        {cruise.itinerary.length > 5 && (
                          <span className="text-xs text-gray-400 px-2 py-0.5">+{cruise.itinerary.length - 5} more</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-[#00B4D8]" />{cruise.duration} nights</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[#00B4D8]" />From {cruise.departurePort}</span>
                      </div>

                      {/* Cabin types */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {cruise.cabinTypes.map((c) => (
                          <span key={c.name} className="text-xs border border-gray-200 px-2 py-0.5 rounded-lg text-gray-600">
                            {c.name}: from ${c.price.toLocaleString()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-[#0A1628]">${cruise.price.toLocaleString()}</span>
                          <span className="text-xs text-gray-400">/ cabin</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="h-3.5 w-3.5 fill-[#FFD700] text-[#FFD700]" />
                          <span className="text-xs font-semibold text-[#0A1628]">{cruise.rating}</span>
                          <span className="text-xs text-gray-400">({cruise.reviewCount.toLocaleString()})</span>
                        </div>
                      </div>
                      <Link
                        href={`/booking?type=cruise&id=${cruise.id}&name=${encodeURIComponent(cruise.name)}&price=${cruise.price}`}
                        className="shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                        style={{ background: '#00B4D8' }}
                      >
                        View Cruise
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
    </MainLayout>
  )
}

export default function CruisesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>}>
      <CruisesContent />
    </Suspense>
  )
}
