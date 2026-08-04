'use client';

import Link from 'next/link';
import { ArrowRight, Star, Clock, MapPin, Plane, Hotel, Car, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

interface Package {
  id: number;
  name: string;
  // Matches a real slug in src/lib/data/packages.ts -> links straight to
  // that package's detail page. Omitted where no matching package exists
  // yet, so the card falls back to the general listing instead of a
  // fabricated/broken link.
  slug?: string;
  duration: string;
  destinations: string[];
  pricePerPerson: number;
  originalPrice: number;
  gradient: string;
  accentColor: string;
  rating: number;
  reviews: number;
  tag?: string;
  tagColor?: string;
  description: string;
}

const packages: Package[] = [
  {
    id: 1,
    name: 'Europe Grand Tour',
    slug: 'europe-grand-tour',
    duration: '14 Days',
    destinations: ['Paris', 'Rome', 'Barcelona', 'Amsterdam'],
    pricePerPerson: 2499,
    originalPrice: 3199,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    accentColor: '#667eea',
    rating: 4.9,
    reviews: 1284,
    tag: 'Best Seller',
    tagColor: '#FFD700',
    description: 'An unforgettable journey through Europe\'s most iconic cities, rich history, and vibrant cultures.',
  },
  {
    id: 2,
    name: 'Bali Paradise Escape',
    slug: 'bali-paradise-escape',
    duration: '7 Days',
    destinations: ['Ubud', 'Seminyak', 'Uluwatu'],
    pricePerPerson: 1299,
    originalPrice: 1699,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    accentColor: '#f5576c',
    rating: 4.8,
    reviews: 937,
    tag: 'Top Rated',
    tagColor: '#00B4D8',
    description: 'Immerse yourself in Bali\'s lush rice terraces, sacred temples, and world-class beach clubs.',
  },
  {
    id: 3,
    name: 'Japan Cultural Journey',
    slug: 'japan-cultural-journey',
    duration: '10 Days',
    destinations: ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima'],
    pricePerPerson: 3199,
    originalPrice: 3999,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    accentColor: '#fa709a',
    rating: 4.9,
    reviews: 762,
    tag: 'Editor\'s Pick',
    tagColor: '#FFD700',
    description: 'From neon-lit Tokyo streets to serene Kyoto temples — experience Japan\'s past and future.',
  },
  {
    id: 4,
    name: 'Caribbean Cruise Adventure',
    duration: '8 Days',
    destinations: ['Nassau', 'St. Thomas', 'St. Maarten', 'Cozumel'],
    pricePerPerson: 1899,
    originalPrice: 2399,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    accentColor: '#4facfe',
    rating: 4.7,
    reviews: 1103,
    description: 'Sail the crystal-blue Caribbean, exploring pristine beaches and vibrant island cultures.',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className="w-3.5 h-3.5"
          fill={star <= Math.round(rating) ? '#FFD700' : 'none'}
          stroke={star <= Math.round(rating) ? '#FFD700' : '#d1d5db'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function PackageCard({ pkg }: { pkg: Package }) {
  const savings = pkg.originalPrice - pkg.pricePerPerson;
  const savingsPct = Math.round((savings / pkg.originalPrice) * 100);

  return (
    <div className="flex-none w-[320px] sm:w-[360px] bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100 group">
      {/* Image / gradient banner */}
      <div
        className="relative h-48 overflow-hidden"
        style={{ background: pkg.gradient }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10" />

        {/* Tag */}
        {pkg.tag && (
          <div className="absolute top-4 left-4 z-10">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: pkg.tagColor, color: '#0A1628' }}
            >
              {pkg.tag}
            </span>
          </div>
        )}

        {/* Savings badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Save {savingsPct}%
          </span>
        </div>

        {/* Duration badge at bottom */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1.5 rounded-full border border-white/20">
          <Clock className="w-3.5 h-3.5" />
          {pkg.duration}
        </div>

        {/* Destinations overlay */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 text-white/90 text-xs">
          <MapPin className="w-3 h-3" />
          <span>{pkg.destinations.length} destinations</span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-bold text-[#0A1628] group-hover:text-[#00B4D8] transition-colors">
            {pkg.name}
          </h3>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed line-clamp-2">
            {pkg.description}
          </p>
        </div>

        {/* Destinations */}
        <div className="flex flex-wrap gap-1.5">
          {pkg.destinations.map((dest) => (
            <span
              key={dest}
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
            >
              {dest}
            </span>
          ))}
        </div>

        {/* Includes */}
        <div className="flex items-center gap-3 text-gray-500 text-xs border-t border-gray-100 pt-3">
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <Plane className="w-3.5 h-3.5" /> Flights
          </span>
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <Hotel className="w-3.5 h-3.5" /> Hotel
          </span>
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <Car className="w-3.5 h-3.5" /> Transfers
          </span>
        </div>

        {/* Rating & price */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <StarRating rating={pkg.rating} />
              <span className="text-[#0A1628] font-bold text-sm">{pkg.rating}</span>
              <span className="text-gray-400 text-xs">({pkg.reviews.toLocaleString()} reviews)</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs line-through">${pkg.originalPrice.toLocaleString()}</p>
            <p className="text-[#0A1628] font-bold text-xl leading-tight">
              ${pkg.pricePerPerson.toLocaleString()}
            </p>
            <p className="text-gray-400 text-xs">per person</p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={pkg.slug ? `/packages/${pkg.slug}` : '/packages'}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00B4D8] to-[#0096B5] hover:from-[#0096B5] hover:to-[#007A94] text-white font-bold py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#00B4D8]/30 hover:gap-3"
        >
          View Deal
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

export default function FeaturedPackages() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -380 : 380, behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-[#00B4D8] font-semibold text-sm uppercase tracking-widest mb-2">
              Curated for You
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#0A1628] leading-tight"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Handpicked Travel Packages
            </h2>
            <p className="text-gray-500 mt-2 max-w-md">
              All-inclusive packages combining flights, hotels, and transfers — crafted for every type of traveler.
            </p>
          </div>

          {/* Scroll controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-2.5 rounded-full border-2 border-gray-200 hover:border-[#00B4D8] hover:text-[#00B4D8] text-gray-500 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-2.5 rounded-full border-2 border-gray-200 hover:border-[#00B4D8] hover:text-[#00B4D8] text-gray-500 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {packages.map((pkg) => (
            <div key={pkg.id} className="snap-start">
              <PackageCard pkg={pkg} />
            </div>
          ))}
        </div>

        {/* View all CTA */}
        <div className="flex justify-center mt-10">
          <Link
            href="/packages"
            className="flex items-center gap-2 border-2 border-[#0A1628] text-[#0A1628] hover:bg-[#0A1628] hover:text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200"
          >
            View All Packages
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
