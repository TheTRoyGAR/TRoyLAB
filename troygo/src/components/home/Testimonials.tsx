'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  travelType: string;
  destination: string;
  quote: string;
  rating: number;
  date: string;
  avatarGradient: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Thompson',
    location: 'San Francisco, USA',
    travelType: 'Honeymoon',
    destination: 'Bali, Indonesia',
    quote:
      "TRoyGO™ made our honeymoon absolutely magical. The AI planner suggested experiences we never would have discovered on our own — a private sunrise yoga session in the rice terraces, a cooking class with a local family, and a candlelit dinner on the beach. Every single detail was perfect. We're already planning our next adventure!",
    rating: 5,
    date: 'March 2026',
    avatarGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    initials: 'ST',
  },
  {
    id: 2,
    name: 'David & Emma Chen',
    location: 'Toronto, Canada',
    travelType: 'Family Holiday',
    destination: 'Japan & South Korea',
    quote:
      "Travelling with three kids can be stressful, but TRoyGO™ handled everything flawlessly. The itinerary balanced cultural experiences with kid-friendly activities perfectly. Our agent James was responsive at all hours and even helped us when one of the kids got sick mid-trip. We felt completely supported the entire time.",
    rating: 5,
    date: 'February 2026',
    avatarGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    initials: 'DC',
  },
  {
    id: 3,
    name: 'Alexandra Müller',
    location: 'Berlin, Germany',
    travelType: 'Solo Adventure',
    destination: 'South America',
    quote:
      "As a solo female traveler, safety is my top priority. TRoyGO™ not only found me incredible experiences across Colombia, Peru, and Argentina, but their 24/7 AI support gave me real peace of mind. The local insider tips were spot-on — I discovered hidden gems that aren't in any guidebook. Absolutely worth every penny.",
    rating: 5,
    date: 'January 2026',
    avatarGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    initials: 'AM',
  },
];

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cls}
          fill={star <= rating ? '#FFD700' : 'none'}
          stroke={star <= rating ? '#FFD700' : '#d1d5db'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial, isActive }: { testimonial: Testimonial; isActive: boolean }) {
  return (
    <div
      className={`
        absolute inset-0 flex flex-col gap-6 transition-all duration-500 ease-in-out
        ${isActive ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'}
      `}
    >
      {/* Quote icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(0,180,216,0.1)' }}
      >
        <Quote className="w-6 h-6 text-[#00B4D8]" />
      </div>

      {/* Stars */}
      <StarRating rating={testimonial.rating} />

      {/* Quote text */}
      <blockquote
        className="text-gray-700 text-lg leading-relaxed flex-1"
        style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' }}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-4 border-t border-gray-100 pt-5">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: testimonial.avatarGradient }}
        >
          {testimonial.initials}
        </div>
        <div className="flex-1">
          <p className="font-bold text-[#0A1628]">{testimonial.name}</p>
          <p className="text-gray-500 text-sm">{testimonial.location}</p>
        </div>
        <div className="text-right">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(0,180,216,0.1)', color: '#00B4D8' }}
          >
            {testimonial.travelType}
          </span>
          <p className="text-gray-400 text-xs mt-1">{testimonial.destination} · {testimonial.date}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  const pauseAuto = () => setIsAutoPlaying(false);
  const resumeAuto = () => setIsAutoPlaying(true);

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0A1628 0%, #0d1f3c 50%, #102444 100%)',
      }}
    >
      {/* Background decorations */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(0,180,216,0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 30%, rgba(255,215,0,0.05) 0%, transparent 50%)
          `,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#00B4D8] font-semibold text-sm uppercase tracking-widest mb-3">
            Traveler Stories
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white leading-tight"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            What Our Travelers Say
          </h2>
          <p className="text-white/50 mt-3 max-w-md mx-auto">
            Real experiences from real travelers — unfiltered and honest.
          </p>
        </div>

        {/* Main testimonial area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Sidebar: all testimonials navigation */}
          <div className="hidden lg:flex flex-col gap-3">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setCurrent(i); setIsAutoPlaying(false); }}
                className={`
                  flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200
                  ${current === i
                    ? 'bg-white/10 border border-white/20'
                    : 'hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                  style={{ background: t.avatarGradient }}
                >
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${current === i ? 'text-white' : 'text-white/60'}`}>
                    {t.name}
                  </p>
                  <p className={`text-xs truncate ${current === i ? 'text-white/60' : 'text-white/30'}`}>
                    {t.travelType} · {t.destination}
                  </p>
                </div>
                <StarRating rating={t.rating} size="sm" />
              </button>
            ))}

            {/* Trust stats */}
            <div className="mt-4 p-5 rounded-xl border border-white/10 bg-white/5">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">4.96</p>
                  <div className="flex justify-center my-1">
                    <StarRating rating={5} size="sm" />
                  </div>
                  <p className="text-white/50 text-xs">Average rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">10M+</p>
                  <p className="text-white/50 text-xs mt-1">Happy travelers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main card */}
          <div className="lg:col-span-2">
            <div
              className="relative bg-white rounded-3xl p-8 sm:p-10 shadow-2xl overflow-hidden"
              style={{ minHeight: 420 }}
              onMouseEnter={pauseAuto}
              onMouseLeave={resumeAuto}
            >
              {/* Decorative accent */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: 'linear-gradient(90deg, #00B4D8, #FFD700, #00B4D8)' }}
              />

              {/* Testimonial cards (stacked, only active is visible) */}
              <div className="relative" style={{ minHeight: 340 }}>
                {testimonials.map((t, i) => (
                  <TestimonialCard key={t.id} testimonial={t} isActive={current === i} />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-6">
              {/* Dot indicators */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setCurrent(i); setIsAutoPlaying(false); }}
                    className={`rounded-full transition-all duration-300 ${
                      current === i
                        ? 'w-8 h-2.5 bg-[#00B4D8]'
                        : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { prev(); setIsAutoPlaying(false); }}
                  className="p-3 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all duration-200"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => { next(); setIsAutoPlaying(false); }}
                  className="p-3 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all duration-200"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile: mini nav */}
            <div className="flex lg:hidden flex-col gap-2 mt-6">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setCurrent(i); setIsAutoPlaying(false); }}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200
                    ${current === i ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent'}
                  `}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ background: t.avatarGradient }}
                  >
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${current === i ? 'text-white' : 'text-white/60'}`}>
                      {t.name}
                    </p>
                    <p className={`text-xs ${current === i ? 'text-white/60' : 'text-white/30'}`}>
                      {t.travelType} · {t.destination}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
