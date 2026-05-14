'use client';

import { useEffect, useRef } from 'react';
import { Shield, Globe, Clock, Tag } from 'lucide-react';
import HeroSearch from './HeroSearch';

const trustBadges = [
  { icon: <Globe className="w-5 h-5" />, value: '10M+', label: 'Travelers' },
  { icon: <Shield className="w-5 h-5" />, value: '195', label: 'Countries' },
  { icon: <Clock className="w-5 h-5" />, value: '24/7', label: 'AI Support' },
  { icon: <Tag className="w-5 h-5" />, value: '100%', label: 'Best Price Guarantee' },
];

function FloatingDot({
  size,
  top,
  left,
  delay,
  duration,
  opacity,
}: {
  size: number;
  top: string;
  left: string;
  delay: number;
  duration: number;
  opacity: number;
}) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        top,
        left,
        opacity,
        background: 'radial-gradient(circle, #00B4D8, transparent)',
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

const floatingDots = [
  { size: 120, top: '8%', left: '5%', delay: 0, duration: 7, opacity: 0.15 },
  { size: 80, top: '15%', left: '80%', delay: 1.5, duration: 9, opacity: 0.12 },
  { size: 200, top: '60%', left: '75%', delay: 0.8, duration: 11, opacity: 0.08 },
  { size: 60, top: '70%', left: '10%', delay: 2, duration: 8, opacity: 0.18 },
  { size: 150, top: '35%', left: '90%', delay: 3, duration: 10, opacity: 0.1 },
  { size: 40, top: '50%', left: '50%', delay: 1, duration: 6, opacity: 0.2 },
  { size: 90, top: '85%', left: '40%', delay: 2.5, duration: 9, opacity: 0.12 },
];

export default function HeroSection() {
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (styleRef.current) return;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-20px) scale(1.05); }
      }
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
    `;
    document.head.appendChild(style);
    styleRef.current = style;
  }, []);

  return (
    <section
      className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg,
            #0A1628 0%,
            #0d1f3c 25%,
            #0a2744 50%,
            #062040 75%,
            #0A1628 100%
          )
        `,
      }}
    >
      {/* Mesh / pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(0,180,216,0.12) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(255,215,0,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 100%, rgba(0,180,216,0.08) 0%, transparent 60%)
          `,
        }}
      />

      {/* Grid lines overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating decorative dots */}
      {floatingDots.map((dot, i) => (
        <FloatingDot key={i} {...dot} />
      ))}

      {/* Gold accent line top */}
      <div
        className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center gap-8">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
          style={{
            background: 'rgba(255,215,0,0.12)',
            border: '1px solid rgba(255,215,0,0.4)',
            color: '#FFD700',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse" />
          Premium Global Travel Agency
        </div>

        {/* Headline */}
        <div className="text-center max-w-4xl">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-4"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Discover Your{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00B4D8, #FFD700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Perfect Journey
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70 font-light max-w-2xl mx-auto">
            AI-powered travel planning for every destination worldwide — curated
            experiences, expert guides, unbeatable prices.
          </p>
        </div>

        {/* Hero search — floats below headline */}
        <div className="w-full max-w-5xl">
          <HeroSearch />
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-2">
          {trustBadges.map((badge, i) => (
            <div key={i} className="flex items-center gap-2 text-white/90">
              <div className="text-[#00B4D8]">{badge.icon}</div>
              <div>
                <span className="font-bold text-base">{badge.value}</span>{' '}
                <span className="text-sm text-white/60">{badge.label}</span>
              </div>
              {i < trustBadges.length - 1 && (
                <div className="hidden sm:block w-px h-5 bg-white/20 ml-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade to page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
