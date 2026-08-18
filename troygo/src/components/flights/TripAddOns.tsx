'use client'

import Link from 'next/link'
import { Building2, Car, MapPinned, ArrowRight, Sparkles } from 'lucide-react'
import { sampleHotels } from '@/lib/data/hotels'
import { carRentals } from '@/lib/data/cars'
import { travelPackages } from '@/lib/data/packages'

interface TripAddOnsProps {
  cityName: string
  departureDate?: string
  returnDate?: string
}

function matchesCity(value: string, city: string): boolean {
  const a = value.toLowerCase()
  const b = city.toLowerCase()
  return a.includes(b) || b.includes(a)
}

// Real cross-sell — after a flight search, surface real hotels/cars/tours
// TRoyGO already has for that same destination, pulled straight from the
// same live catalogs the other pages use (never fabricated for this panel).
// If nothing genuinely matches the searched city, it falls back to a single
// CTA into the Trip Planner instead of showing an empty or fake result.
export default function TripAddOns({ cityName, departureDate, returnDate }: TripAddOnsProps) {
  const matchedHotels = sampleHotels.filter((h) => matchesCity(h.location.city, cityName)).slice(0, 3)
  const matchedCars = carRentals
    .filter((c) => c.pickupLocations.some((loc) => matchesCity(loc, cityName)))
    .slice(0, 3)
  const matchedTours = travelPackages
    .filter((p) => matchesCity(p.destination, cityName) || p.countries.some((c) => matchesCity(c, cityName)))
    .slice(0, 3)

  const hasAnything = matchedHotels.length > 0 || matchedCars.length > 0 || matchedTours.length > 0

  const plannerParams = new URLSearchParams({ to: cityName })
  if (departureDate) plannerParams.set('departure', departureDate)
  if (returnDate) plannerParams.set('return', returnDate)
  const plannerHref = `/trip-planner?${plannerParams.toString()}`

  if (!hasAnything) {
    return (
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 justify-between"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #152D55 60%, #00B4D8 100%)' }}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-[#FFD700] shrink-0" />
          <p className="text-white text-sm sm:text-base">
            We don&apos;t have ready-made hotels, cars, or tours listed for {cityName} yet — but our
            Trip Planner can find real options for you right now.
          </p>
        </div>
        <Link
          href={plannerHref}
          className="shrink-0 flex items-center gap-2 bg-white text-[#0A1628] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors whitespace-nowrap"
        >
          Ask TRoyGO™ Trip Planner
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#0A1628] text-lg">Complete your trip to {cityName}</h3>
        <Link href={plannerHref} className="text-sm font-semibold flex items-center gap-1 hover:underline" style={{ color: '#00B4D8' }}>
          Or ask the Trip Planner <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {matchedHotels.length > 0 && (
        <section>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Building2 className="h-4 w-4" style={{ color: '#00B4D8' }} /> Stays in {cityName}
          </h4>
          <div className="grid sm:grid-cols-3 gap-3">
            {matchedHotels.map((h) => (
              <Link
                key={h.id}
                href={`/hotels?city=${encodeURIComponent(h.location.city)}`}
                className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-sm text-[#0A1628] truncate">{h.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{h.stars}★ · {h.location.city}</p>
                <p className="text-sm font-bold text-[#0A1628] mt-2">
                  ${h.pricePerNight.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ night</span>
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {matchedCars.length > 0 && (
        <section>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Car className="h-4 w-4" style={{ color: '#00B4D8' }} /> Cars in {cityName}
          </h4>
          <div className="grid sm:grid-cols-3 gap-3">
            {matchedCars.map((c) => (
              <Link
                key={c.id}
                href={`/cars?location=${encodeURIComponent(cityName)}`}
                className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-sm text-[#0A1628] truncate">{c.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{c.type} · {c.transmission}</p>
                <p className="text-sm font-bold text-[#0A1628] mt-2">
                  ${c.pricePerDay.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ day</span>
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {matchedTours.length > 0 && (
        <section>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <MapPinned className="h-4 w-4" style={{ color: '#00B4D8' }} /> Things to do in {cityName}
          </h4>
          <div className="grid sm:grid-cols-3 gap-3">
            {matchedTours.map((p) => (
              <Link
                key={p.id}
                href={`/packages/${p.slug}`}
                className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-sm text-[#0A1628] truncate">{p.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{p.duration} day{p.duration > 1 ? 's' : ''} · {p.category}</p>
                <p className="text-sm font-bold text-[#0A1628] mt-2">
                  ${p.price.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ person</span>
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
