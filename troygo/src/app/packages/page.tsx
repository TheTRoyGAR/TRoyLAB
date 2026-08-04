'use client'

import { useState, useMemo } from 'react'
import { travelPackages } from '@/lib/data/packages'
import PackageCard from '@/components/packages/PackageCard'
import PackageFilters, { PackageFilterState } from '@/components/packages/PackageFilters'
import { ChevronDown, Package } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
]

const PER_PAGE = 9

export default function PackagesPage() {
  const [sort, setSort] = useState('recommended')
  const [filters, setFilters] = useState<PackageFilterState>({
    priceMin: 0,
    priceMax: 20000,
    durations: [],
    categories: [],
    minRating: 0,
    includes: [],
  })
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let list = [...travelPackages]

    // price
    list = list.filter((p) => p.price >= filters.priceMin && p.price <= filters.priceMax)

    // duration
    if (filters.durations.length > 0) {
      list = list.filter((p) => {
        return filters.durations.some((d) => {
          if (d === '3-5') return p.duration >= 3 && p.duration <= 5
          if (d === '6-9') return p.duration >= 6 && p.duration <= 9
          if (d === '10-14') return p.duration >= 10 && p.duration <= 14
          if (d === '15+') return p.duration >= 15
          return false
        })
      })
    }

    // category
    if (filters.categories.length > 0) {
      list = list.filter((p) => filters.categories.includes(p.category))
    }

    // rating
    if (filters.minRating > 0) {
      list = list.filter((p) => p.rating >= filters.minRating)
    }

    // includes
    if (filters.includes.length > 0) {
      list = list.filter((p) =>
        filters.includes.every((inc) => p.includes[inc as keyof typeof p.includes])
      )
    }

    // sort
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        list.sort((a, b) => b.rating - a.rating)
        break
      case 'popular':
        list.sort((a, b) => b.reviewCount - a.reviewCount)
        break
    }

    return list
  }, [filters, sort])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function handleFilterChange(f: PackageFilterState) {
    setFilters(f)
    setPage(1)
  }

  // Adapter: convert TravelPackage → PackageCard prop shape
  const toCardPkg = (p: typeof travelPackages[0]) => ({
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    destination: p.destination,
    countries: p.countries,
    duration: p.duration,
    price: p.price,
    originalPrice: p.originalPrice,
    currency: p.currency,
    rating: p.rating,
    reviewCount: p.reviewCount,
    images: p.imageGradient,
    includes: Object.entries(p.includes)
      .filter(([, v]) => v)
      .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)),
    highlights: p.highlights,
    category: p.category,
    maxGroupSize: p.maxGroupSize,
    difficulty: p.difficulty,
  })

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div
        className="py-14 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #102444 60%, #00B4D8 100%)' }}
      >
        <div className="flex justify-center mb-4">
          <Package className="h-10 w-10 text-[#FFD700]" />
        </div>
        <h1
          className="text-4xl font-black text-white mb-3"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Explore Our Travel Packages
        </h1>
        <p className="text-white/70 max-w-xl mx-auto text-lg">
          Handcrafted journeys for every traveller — all-inclusive, stress-free, unforgettable.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Sort bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            <span className="font-bold text-[#0A1628]">{filtered.length}</span> packages found
          </p>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1) }}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-gray-200 text-sm font-medium text-[#0A1628] bg-white focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters sidebar */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <PackageFilters onChange={handleFilterChange} />
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Mobile filters */}
            <div className="lg:hidden mb-4">
              <PackageFilters onChange={handleFilterChange} />
            </div>

            {paged.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No packages match your filters.</p>
                <button
                  onClick={() => handleFilterChange({ priceMin: 0, priceMax: 20000, durations: [], categories: [], minRating: 0, includes: [] })}
                  className="mt-3 text-[#00B4D8] text-sm font-medium underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paged.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={toCardPkg(pkg)} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                      p === page
                        ? 'text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-[#00B4D8]'
                    }`}
                    style={p === page ? { background: '#00B4D8' } : {}}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
