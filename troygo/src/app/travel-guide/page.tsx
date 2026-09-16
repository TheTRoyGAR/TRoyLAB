import type { Metadata } from 'next'
import Link from 'next/link'
import { Compass, ArrowRight, Sparkles } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

export const metadata: Metadata = {
  title: 'Travel Guide — Local Guides & Live Daily Conditions',
  description:
    'TRoyGO™ Travel Guide: real destination guides with live daily weather, season and what’s-on updates — starting with Darwin, Australia.',
  keywords: [
    'travel guide',
    'destination guide',
    'Darwin travel guide',
    'Darwin today',
    'local travel guide',
    'TRoyGO travel guide',
  ],
  openGraph: {
    title: 'TRoyGO™ Travel Guide',
    description:
      'Real destination guides with live daily conditions and what’s on — starting with Darwin, Australia.',
    type: 'website',
    url: 'https://troytravelagency.com/travel-guide',
  },
}

const DESTINATIONS = [
  {
    name: 'Darwin',
    country: 'Australia',
    href: '/travel-guide/darwin',
    tagline: 'Live weather, season & what’s on in the Top End’s tropical capital.',
    featured: true,
  },
  {
    name: 'Istanbul',
    country: 'Turkey',
    href: '/travel-guide/istanbul',
    tagline: 'Live weather, season & what’s on in the city spanning two continents.',
    featured: true,
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    href: '/travel-guide/tokyo',
    tagline: 'Live weather, season & what’s on in Japan’s capital and gateway to the Golden Route.',
    featured: true,
  },
  {
    name: 'Bangkok',
    country: 'Thailand',
    href: '/travel-guide/bangkok',
    tagline: 'Live weather, season & what’s on in the City of Angels.',
    featured: true,
  },
  {
    name: 'Sydney',
    country: 'Australia',
    href: '/travel-guide/sydney',
    tagline: 'Live weather, season & what’s on around the Harbour Bridge and Opera House.',
    featured: true,
  },
]

export default function TravelGuideHubPage() {
  return (
    <MainLayout>
      <div style={{ background: '#0A1628' }} className="text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <p
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#00B4D8' }}
          >
            <Compass className="h-3.5 w-3.5" />
            TRoyGO™ Travel Guide
          </p>
          <h1
            className="text-3xl sm:text-5xl font-black mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFD700' }}
          >
            Real Guides, Live Daily Conditions
          </h1>
          <p className="text-white/70 leading-relaxed max-w-2xl">
            Each destination in the TRoyGO™ Travel Guide pairs a real, editorial guide with live
            daily data — current weather, season and what’s actually on — instead of a
            static page that goes stale.
          </p>
        </div>
      </div>

      <div className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="group relative rounded-2xl border border-gray-200 p-6 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
                style={{ background: '#0A1628' }}
              >
                {d.featured && (
                  <span
                    className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                    style={{ background: '#FFD700', color: '#0A1628' }}
                  >
                    <Sparkles className="h-3 w-3" /> Live Today
                  </span>
                )}
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#00B4D8' }}>
                  {d.country}
                </p>
                <h2
                  className="text-2xl font-black mb-2 text-white"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {d.name}
                </h2>
                <p className="text-sm text-white/60 leading-relaxed mb-4">{d.tagline}</p>
                <span
                  className="flex items-center gap-1 text-sm font-semibold transition-transform group-hover:translate-x-1"
                  style={{ color: '#FFD700' }}
                >
                  Explore {d.name} <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}

            {/* Honest placeholder — no fabricated destinations */}
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center text-gray-400">
              <Compass className="h-6 w-6 mb-2" />
              <p className="text-sm font-semibold">More destinations coming soon</p>
              <p className="text-xs mt-1">Each guide launches once it has real, verified content.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
