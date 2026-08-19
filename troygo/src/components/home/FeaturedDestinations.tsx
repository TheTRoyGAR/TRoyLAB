'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { useDestinationPhoto } from '@/hooks/useDestinationPhoto';

interface Destination {
  name: string;
  country: string;
  price: number;
  photoQuery: string;
  gradient: string;
  tag?: string;
  patternColor: string;
}

// Real destinations pulled from the current live package data
// (src/lib/data/packages-live.json, refreshed by the research agent — see
// agents/travel_research/). Kept in sync manually for now since this
// component can't import server-refreshed JSON without becoming a client
// data-fetch; if the research agent's destination mix changes significantly,
// update this list to match so "Explore" never leads to an empty results page.
const destinations: Destination[] = [
  {
    name: 'Paris',
    country: 'France',
    price: 1800,
    photoQuery: 'Paris France Eiffel Tower',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    tag: 'Most Loved',
    patternColor: 'rgba(255,255,255,0.06)',
  },
  {
    name: 'Southeast Asia',
    country: 'Thailand, Malaysia & Indonesia',
    price: 1734,
    photoQuery: 'Bali Indonesia beach temple',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    tag: 'Trending',
    patternColor: 'rgba(255,255,255,0.06)',
  },
  {
    name: 'Cancun',
    country: 'Mexico',
    price: 1200,
    photoQuery: 'Cancun Mexico beach resort',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    patternColor: 'rgba(255,255,255,0.06)',
  },
  {
    name: 'Japan',
    country: 'Japan',
    price: 1649,
    photoQuery: 'Tokyo Kyoto Japan travel',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    tag: 'Editor\'s Pick',
    patternColor: 'rgba(255,255,255,0.06)',
  },
  {
    name: 'Antigua',
    country: 'Antigua and Barbuda',
    price: 1400,
    photoQuery: 'Antigua Caribbean beach',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    patternColor: 'rgba(255,255,255,0.06)',
  },
  {
    name: 'Italy',
    country: 'Italy',
    price: 2431,
    photoQuery: 'Italy Tuscany travel landscape',
    gradient: 'linear-gradient(135deg, #ffd200 0%, #f7971e 100%)',
    tag: 'Luxury',
    patternColor: 'rgba(0,0,0,0.08)',
  },
];

function DestinationCard({ dest }: { dest: Destination }) {
  const photo = useDestinationPhoto(dest.photoQuery);
  const router = useRouter();
  const href = `/packages?to=${encodeURIComponent(dest.name)}`;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => { if (e.key === 'Enter') router.push(href); }}
      className="group relative block rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
      style={{
        background: photo
          ? `linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.15) 55%), url(${photo.url})`
          : dest.gradient,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: 220,
      }}
    >
      {/* Decorative circles — only shown while the real photo is still loading */}
      {!photo && (
        <>
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full"
            style={{ background: dest.patternColor }}
          />
          <div
            className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full"
            style={{ background: dest.patternColor }}
          />
        </>
      )}

      {/* Tag badge */}
      {dest.tag && (
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/30">
            <TrendingUp className="w-3 h-3" />
            {dest.tag}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col h-full justify-end" style={{ minHeight: 220 }}>
        <div className="mt-auto pt-16">
          <p className="text-white/75 text-sm font-medium">{dest.country}</p>
          <h3 className="text-white text-2xl font-bold mt-0.5 mb-2">{dest.name}</h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white/70 text-xs">From</span>
              <p className="text-white font-bold text-xl leading-none">
                ${dest.price.toLocaleString()}
              </p>
              <span className="text-white/60 text-xs">per person</span>
            </div>
            <span className="flex items-center gap-1.5 bg-white/20 group-hover:bg-white backdrop-blur-sm text-white group-hover:text-gray-800 text-sm font-semibold px-4 py-2 rounded-xl border border-white/30 transition-colors">
              Explore
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
          {/* Required Unsplash attribution — only shown once a real photo has loaded */}
          {photo && (
            <p className="mt-2 text-[10px] text-white/50">
              Photo by{' '}
              <a
                href={photo.photographerUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="underline hover:text-white/80 transition-colors"
              >
                {photo.photographerName}
              </a>{' '}
              on{' '}
              <a
                href={photo.unsplashUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="underline hover:text-white/80 transition-colors"
              >
                Unsplash
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeaturedDestinations() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-[#00B4D8] font-semibold text-sm uppercase tracking-widest mb-2">
              Explore the World
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#0A1628] leading-tight"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Top Destinations
            </h2>
            <p className="text-gray-500 mt-2 max-w-md">
              Handpicked by our travel experts — the world&apos;s most captivating places waiting for you.
            </p>
          </div>
          <Link
            href="/packages"
            className="self-start sm:self-auto flex items-center gap-2 text-[#0A1628] border-2 border-[#0A1628] hover:bg-[#0A1628] hover:text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap"
          >
            View All Destinations
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <DestinationCard key={dest.name} dest={dest} />
          ))}
        </div>
      </div>
    </section>
  );
}
