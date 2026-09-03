'use client'

import Link from 'next/link'
import { Heart, Star, Plane, Building2, Utensils, Users, Clock, MapPin } from 'lucide-react'
import { useState } from 'react'

interface TravelPackage {
  id: string
  name: string
  slug: string
  destination: string
  countries: string[]
  duration: number
  price: number
  originalPrice?: number
  currency: string
  rating: number
  reviewCount: number
  images: string
  includes: string[]
  highlights: string[]
  category: string
  maxGroupSize: number
  difficulty?: string
  priceOnRequest?: boolean
}

const INCLUDE_ICONS: Record<string, React.ReactNode> = {
  flights: <Plane className="h-3.5 w-3.5" />,
  hotel: <Building2 className="h-3.5 w-3.5" />,
  meals: <Utensils className="h-3.5 w-3.5" />,
  guide: <Users className="h-3.5 w-3.5" />,
  transfers: <MapPin className="h-3.5 w-3.5" />,
}

const CATEGORY_COLORS: Record<string, string> = {
  adventure: 'bg-orange-500',
  luxury: 'bg-purple-600',
  family: 'bg-green-600',
  cultural: 'bg-blue-600',
  honeymoon: 'bg-pink-600',
  beach: 'bg-cyan-600',
}

export default function PackageCard({ pkg }: { pkg: TravelPackage }) {
  const [saved, setSaved] = useState(false)
  const discount = pkg.originalPrice
    ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
    : 0
  const isBestSeller = pkg.rating >= 4.7 && pkg.reviewCount > 0

  return (
    <Link
      href={`/packages/${pkg.slug}`}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col sm:flex-row"
    >
      {/* Image area */}
      <div className={`relative w-full sm:w-64 h-48 sm:h-auto shrink-0 bg-gradient-to-br ${pkg.images} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />

        {/* Category badge */}
        <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded-full ${CATEGORY_COLORS[pkg.category] ?? 'bg-gray-600'}`}>
          {pkg.category}
        </span>

        {/* Best seller */}
        {isBestSeller && (
          <span className="absolute top-3 right-10 text-[10px] font-bold uppercase tracking-wider text-[#0A1628] bg-[#FFD700] px-2.5 py-1 rounded-full">
            Best Seller
          </span>
        )}

        {/* Save button — stops the click from also triggering the card's own link */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSaved(!saved); }}
          aria-label={saved ? 'Remove from saved' : 'Save package'}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors z-10"
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </button>

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
            -{discount}%
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-[#0A1628] text-base leading-snug group-hover:text-[#00B4D8] transition-colors">
              {pkg.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
            <MapPin className="h-3.5 w-3.5 text-[#00B4D8]" />
            <span>{pkg.countries.join(' · ')}</span>
          </div>

          {/* Key stats */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#00B4D8]" />
              {pkg.duration} days
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-[#00B4D8]" />
              Max {pkg.maxGroupSize}
            </span>
          </div>

          {/* Includes badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {pkg.includes.map((inc) => (
              <span
                key={inc}
                className="flex items-center gap-1 text-[11px] font-medium text-[#00B4D8] bg-[#00B4D8]/10 px-2 py-0.5 rounded-full"
              >
                {INCLUDE_ICONS[inc.toLowerCase()]}
                {inc}
              </span>
            ))}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-3">
          <div>
            {pkg.priceOnRequest ? (
              <span className="text-base font-black text-[#0A1628]">Request a Quote</span>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-[#0A1628]">
                    ${pkg.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">/ person</span>
                </div>
                {pkg.originalPrice !== undefined && pkg.originalPrice > pkg.price && (
                  <span className="text-xs text-gray-400 line-through">
                    ${pkg.originalPrice.toLocaleString()}
                  </span>
                )}
              </>
            )}
            {pkg.reviewCount > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="h-3.5 w-3.5 fill-[#FFD700] text-[#FFD700]" />
                <span className="text-xs font-semibold text-[#0A1628]">{pkg.rating}</span>
                <span className="text-xs text-gray-400">({pkg.reviewCount.toLocaleString()})</span>
              </div>
            )}
          </div>
          <span
            className="shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all group-hover:scale-105"
            style={{ background: '#00B4D8' }}
          >
            {pkg.priceOnRequest ? 'View Details' : 'View Deal'}
          </span>
        </div>
      </div>
    </Link>
  )
}
