import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Sun,
  Moon,
  Droplets,
  Wind,
  Gauge,
  CalendarDays,
  MapPin,
  Plane,
  Hotel,
  Compass,
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import PackageCard from '@/components/packages/PackageCard'
import { getDarwinToday } from '@/lib/darwin-today'
import { darwinAttractions, darwinEvents, darwinPackageSlugs } from '@/lib/data/darwin-guide'
import { travelPackages } from '@/lib/data/packages'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Darwin Today — Weather, Season & What’s On | Darwin Travel Guide',
  description:
    'Darwin today: live weather, UV, sunrise & sunset for Darwin, Australia, plus what’s on this season, the best time to visit, top things to do, and real Top End tour packages.',
  keywords: [
    'Darwin today',
    'Darwin travel guide',
    'what is in Darwin today',
    'what’s on in Darwin today',
    'things to do in Darwin Australia',
    'Darwin Northern Territory weather',
    'best time to visit Darwin',
    'Darwin dry season',
    'Darwin wet season',
    'Top End travel guide',
  ],
  openGraph: {
    title: 'Darwin Today — Live Weather, Season & What’s On',
    description:
      'Live conditions for Darwin, Australia right now, plus a full travel guide: best time to visit, top attractions, annual events and real Top End tour packages.',
    type: 'website',
    url: 'https://troytravelagency.com/travel-guide/darwin',
  },
}

function SunUvBadge({ uv }: { uv: number }) {
  let label = 'Low'
  let color = '#22c55e'
  if (uv >= 8) { label = 'Very High'; color = '#ef4444' }
  else if (uv >= 6) { label = 'High'; color = '#f97316' }
  else if (uv >= 3) { label = 'Moderate'; color = '#eab308' }
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}22`, color }}
    >
      {label}
    </span>
  )
}

export default async function DarwinTravelGuidePage() {
  const today = await getDarwinToday()

  const darwinPackages = darwinPackageSlugs
    .map((slug) => travelPackages.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({
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
    }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: 'Darwin, Northern Territory, Australia',
    description:
      'Darwin travel guide covering live daily conditions, the best time to visit, top attractions, annual events, and Top End tour packages.',
    url: 'https://troytravelagency.com/travel-guide/darwin',
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: 'Northern Territory, Australia',
    },
  }

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
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
            Darwin Travel Guide
          </h1>
          <p className="text-white/70 leading-relaxed max-w-2xl">
            Australia&apos;s tropical northern capital — croc-filled harbours, Southeast
            Asian-influenced night markets, and the gateway to Kakadu and Litchfield. Here&apos;s
            what Darwin is like right now, and everything you need to plan a trip.
          </p>
        </div>
      </div>

      {/* ── Darwin Today (live) ──────────────────────────────────────────── */}
      <div className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
            <h2
              className="text-2xl sm:text-3xl font-black"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0A1628' }}
            >
              Darwin Today
            </h2>
            <span className="text-xs text-gray-400">
              {today.localDayOfWeek}, {today.localDateLabel} · Darwin local time
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Live weather sourced from Open-Meteo; sunrise/sunset from sunrise-sunset.org. Updated hourly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Weather card */}
            <div className="rounded-2xl border border-gray-200 p-5 col-span-1 sm:col-span-2">
              {today.weather.live ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl font-black text-[#0A1628]">{today.weather.tempC}°C</span>
                    <SunUvBadge uv={today.weather.uvIndex} />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{today.weather.conditionLabel} · feels like {today.weather.feelsLikeC}°C</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Droplets className="h-3.5 w-3.5" /> {today.weather.humidityPct}% humidity</span>
                    <span className="flex items-center gap-1"><Wind className="h-3.5 w-3.5" /> {today.weather.windKph} km/h wind</span>
                    <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> UV {today.weather.uvIndex}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Live weather is temporarily unavailable — check back shortly.</p>
              )}
            </div>

            {/* Sun times card */}
            <div className="rounded-2xl border border-gray-200 p-5">
              {today.sun.live ? (
                <>
                  <p className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Sun className="h-4 w-4" style={{ color: '#FFD700' }} /> Sunrise <span className="font-semibold text-[#0A1628]">{today.sun.sunriseLocal}</span>
                  </p>
                  <p className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Moon className="h-4 w-4" style={{ color: '#00B4D8' }} /> Sunset <span className="font-semibold text-[#0A1628]">{today.sun.sunsetLocal}</span>
                  </p>
                  <p className="text-xs text-gray-400">{today.sun.dayLengthLabel} of daylight</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Sun times are temporarily unavailable.</p>
              )}
            </div>

            {/* Season card */}
            <div className="rounded-2xl p-5 text-white" style={{ background: '#0A1628' }}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#00B4D8' }}>Right now</p>
              <p className="text-lg font-bold mb-2" style={{ color: '#FFD700' }}>{today.season}</p>
              <p className="text-xs text-white/60 leading-relaxed">{today.seasonNote}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── What's On in Darwin ──────────────────────────────────────────── */}
      <div className="bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2
            className="flex items-center gap-2 text-2xl sm:text-3xl font-black mb-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0A1628' }}
          >
            <CalendarDays className="h-6 w-6" style={{ color: '#00B4D8' }} />
            What&apos;s On in Darwin
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Darwin&apos;s recurring annual markets and events. Exact dates shift year to year —
            confirm current listings before you travel.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {darwinEvents.map((event) => (
              <div key={event.name} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="font-bold text-[#0A1628]">{event.name}</h3>
                </div>
                <p className="text-xs font-semibold mb-2" style={{ color: '#00B4D8' }}>{event.when}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top things to do ─────────────────────────────────────────────── */}
      <div className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2
            className="text-2xl sm:text-3xl font-black mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0A1628' }}
          >
            Top Things to Do in Darwin
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {darwinAttractions.map((a) => (
              <div key={a.name} className="flex gap-3">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#FFD700' }} />
                <div>
                  <h3 className="font-bold text-[#0A1628] mb-1">{a.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Best time to visit / Getting there ──────────────────────────── */}
      <div className="bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-xl font-black mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0A1628' }}>
              Best Time to Visit
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              The <strong>dry season (May–October)</strong> is Darwin&apos;s peak travel season —
              warm, sunny days, low humidity and open access to waterfalls and national parks.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              The <strong>wet season (November–April)</strong> brings dramatic afternoon storms,
              lush green landscapes and lower prices — but some outdoor tours reduce or pause
              during the heaviest months.
            </p>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0A1628' }}>
              <Plane className="h-5 w-5" style={{ color: '#00B4D8' }} />
              Getting to Darwin
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Darwin International Airport (DRW) is served by regular domestic flights from
              Australia&apos;s major cities and select international routes into Southeast Asia.
            </p>
            <Link href="/flights" className="text-sm font-semibold underline" style={{ color: '#00B4D8' }}>
              Search flights to Darwin →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Where to stay ────────────────────────────────────────────────── */}
      <div className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="flex items-center gap-2 text-2xl sm:text-3xl font-black mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0A1628' }}>
            <Hotel className="h-6 w-6" style={{ color: '#00B4D8' }} />
            Where to Stay
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4 max-w-2xl">
            From CBD high-rises on Mitchell Street to the Waterfront precinct, TRoyGO™ lists
            real Darwin properties including the Hilton Darwin and Vibe Hotel Darwin Waterfront.
          </p>
          <Link
            href="/hotels?destination=Darwin"
            className="inline-block px-5 py-2.5 rounded-lg font-bold text-sm transition-all hover:brightness-110"
            style={{ background: '#FFD700', color: '#0A1628' }}
          >
            Browse Darwin hotels
          </Link>
        </div>
      </div>

      {/* ── Real packages ────────────────────────────────────────────────── */}
      {darwinPackages.length > 0 && (
        <div className="bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl sm:text-3xl font-black mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0A1628' }}>
              Top End Tour Packages
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {darwinPackages.map((pkg) => (
                <PackageCard key={pkg.slug} pkg={pkg} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Back to hub ──────────────────────────────────────────────────── */}
      <div style={{ background: '#0A1628' }} className="text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <Link href="/travel-guide" className="text-sm font-semibold underline" style={{ color: '#00B4D8' }}>
            ← Back to the TRoyGO™ Travel Guide hub
          </Link>
        </div>
      </div>
    </MainLayout>
  )
}
