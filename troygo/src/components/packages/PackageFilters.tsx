'use client'

import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'

export interface PackageFilterState {
  priceMin: number
  priceMax: number
  durations: string[]
  categories: string[]
  minRating: number
  includes: string[]
}

const DEFAULT_FILTERS: PackageFilterState = {
  priceMin: 0,
  priceMax: 20000,
  durations: [],
  categories: [],
  minRating: 0,
  includes: [],
}

const DURATION_OPTIONS = [
  { value: '3-5', label: '3–5 days' },
  { value: '6-9', label: '6–9 days' },
  { value: '10-14', label: '10–14 days' },
  { value: '15+', label: '15+ days' },
]

const CATEGORY_OPTIONS = [
  { value: 'adventure', label: 'Adventure' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'family', label: 'Family' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'honeymoon', label: 'Honeymoon' },
  { value: 'beach', label: 'Beach' },
]

const INCLUDE_OPTIONS = [
  { value: 'flights', label: 'Flights' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'meals', label: 'Meals' },
  { value: 'guide', label: 'Guide' },
  { value: 'transfers', label: 'Transfers' },
]

function CheckOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-[#00B4D8] cursor-pointer"
      />
      <span className="text-sm text-gray-700 group-hover:text-[#0A1628] transition-colors">
        {label}
      </span>
    </label>
  )
}

interface Props {
  onChange: (filters: PackageFilterState) => void
}

export default function PackageFilters({ onChange }: Props) {
  const [filters, setFilters] = useState<PackageFilterState>(DEFAULT_FILTERS)
  const [open, setOpen] = useState(false)

  function update(patch: Partial<PackageFilterState>) {
    const next = { ...filters, ...patch }
    setFilters(next)
    onChange(next)
  }

  function toggleArray(key: 'durations' | 'categories' | 'includes', value: string) {
    const arr = filters[key]
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
    update({ [key]: next })
  }

  function clearAll() {
    setFilters(DEFAULT_FILTERS)
    onChange(DEFAULT_FILTERS)
  }

  const hasActive =
    filters.durations.length > 0 ||
    filters.categories.length > 0 ||
    filters.includes.length > 0 ||
    filters.minRating > 0 ||
    filters.priceMax < 20000 ||
    filters.priceMin > 0

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-[#0A1628] mb-4"
        onClick={() => setOpen(!open)}
      >
        <SlidersHorizontal className="h-4 w-4 text-[#00B4D8]" />
        Filters {hasActive && <span className="bg-[#00B4D8] text-white text-xs px-1.5 py-0.5 rounded-full">Active</span>}
      </button>

      <div className={`${open ? 'block' : 'hidden'} lg:block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-6`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#0A1628] text-sm uppercase tracking-wider">Filters</h3>
          {hasActive && (
            <button onClick={clearAll} className="flex items-center gap-1 text-xs text-[#00B4D8] hover:text-[#0096B5] font-medium">
              <X className="h-3 w-3" /> Clear All
            </button>
          )}
        </div>

        {/* Price range */}
        <div>
          <h4 className="text-sm font-semibold text-[#0A1628] mb-3">Price per Person</h4>
          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={20000}
              step={100}
              value={filters.priceMax}
              onChange={(e) => update({ priceMax: Number(e.target.value) })}
              className="w-full accent-[#00B4D8]"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>$0</span>
              <span className="font-semibold text-[#0A1628]">
                Up to ${filters.priceMax === 20000 ? '20,000+' : filters.priceMax.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div>
          <h4 className="text-sm font-semibold text-[#0A1628] mb-3">Duration</h4>
          <div className="space-y-2">
            {DURATION_OPTIONS.map((opt) => (
              <CheckOption
                key={opt.value}
                label={opt.label}
                checked={filters.durations.includes(opt.value)}
                onChange={() => toggleArray('durations', opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <h4 className="text-sm font-semibold text-[#0A1628] mb-3">Category</h4>
          <div className="space-y-2">
            {CATEGORY_OPTIONS.map((opt) => (
              <CheckOption
                key={opt.value}
                label={opt.label}
                checked={filters.categories.includes(opt.value)}
                onChange={() => toggleArray('categories', opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <h4 className="text-sm font-semibold text-[#0A1628] mb-3">Guest Rating</h4>
          <div className="space-y-2">
            {[4.5, 4.0, 3.5].map((r) => (
              <label key={r} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === r}
                  onChange={() => update({ minRating: r })}
                  className="accent-[#00B4D8]"
                />
                <span className="text-sm text-gray-700">{r}+ stars</span>
              </label>
            ))}
          </div>
        </div>

        {/* Includes */}
        <div>
          <h4 className="text-sm font-semibold text-[#0A1628] mb-3">Includes</h4>
          <div className="space-y-2">
            {INCLUDE_OPTIONS.map((opt) => (
              <CheckOption
                key={opt.value}
                label={opt.label}
                checked={filters.includes.includes(opt.value)}
                onChange={() => toggleArray('includes', opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Mobile apply */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden w-full py-2.5 rounded-xl font-bold text-sm text-white"
          style={{ background: '#00B4D8' }}
        >
          Show Results
        </button>
      </div>
    </>
  )
}
