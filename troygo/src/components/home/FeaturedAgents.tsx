'use client';

import Link from 'next/link';
import { Star, MapPin, Briefcase, Globe, ArrowRight } from 'lucide-react';
import { localAgents } from '@/lib/data/agents';

interface Agent {
  id: number;
  name: string;
  initials: string;
  avatarGradient: string;
  specialty: string;
  location: string;
  country: string;
  rating: number;
  reviews: number;
  yearsExperience: number;
  toursCompleted: number;
  languages: string[];
  badge?: string;
}

// A small rotating palette — purely decorative (avatar background), not a
// factual claim, so it's fine to assign round-robin rather than pull from
// real data (which has no per-agent color field).
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #ffd200 0%, #f7971e 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
];

// Sourced from the real localAgents data (top-rated 4), each linking to
// their actual /agents/[id] profile — never a name/profile invented just
// for the homepage.
const agents: Agent[] = [...localAgents]
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 4)
  .map((a, i) => ({
    id: a.id,
    name: a.name,
    initials: a.avatar,
    avatarGradient: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
    specialty: a.specialty[0] ?? a.agency,
    location: a.location.city,
    country: a.location.country,
    rating: a.rating,
    reviews: a.reviewCount,
    yearsExperience: a.yearsExperience,
    toursCompleted: a.toursOffered,
    languages: a.languages,
    badge: a.certifications[0],
  }));

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

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden group">
      {/* Card top accent */}
      <div className="h-1.5 w-full" style={{ background: agent.avatarGradient }} />

      <div className="p-6 flex flex-col gap-4">
        {/* Avatar + badge + name */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md"
            style={{ background: agent.avatarGradient }}
          >
            {agent.initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-[#0A1628] text-base group-hover:text-[#00B4D8] transition-colors">
                  {agent.name}
                </h3>
                <p className="text-[#00B4D8] font-medium text-xs mt-0.5">{agent.specialty}</p>
              </div>
              {agent.badge && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: 'rgba(255,215,0,0.15)',
                    color: '#B8860B',
                    border: '1px solid rgba(255,215,0,0.4)',
                  }}
                >
                  {agent.badge}
                </span>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span>{agent.location}, {agent.country}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <StarRating rating={agent.rating} />
          <span className="font-bold text-[#0A1628] text-sm">{agent.rating.toFixed(2)}</span>
          <span className="text-gray-400 text-xs">({agent.reviews} reviews)</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#00B4D8] flex-shrink-0" />
            <div>
              <p className="text-[#0A1628] font-bold text-sm leading-none">{agent.yearsExperience}+ yrs</p>
              <p className="text-gray-500 text-xs mt-0.5">Experience</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00B4D8] flex-shrink-0" />
            <div>
              <p className="text-[#0A1628] font-bold text-sm leading-none">{agent.toursCompleted.toLocaleString()}</p>
              <p className="text-gray-500 text-xs mt-0.5">Tours done</p>
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="flex flex-wrap gap-1.5">
          {agent.languages.map((lang) => (
            <span
              key={lang}
              className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium"
            >
              {lang}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={`/agents/${agent.id}`}
          className="w-full flex items-center justify-center gap-2 border-2 border-[#0A1628] text-[#0A1628] hover:bg-[#0A1628] hover:text-white font-semibold py-2.5 rounded-xl transition-all duration-200 text-sm group/btn"
        >
          View Profile
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

export default function FeaturedAgents() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-[#00B4D8] font-semibold text-sm uppercase tracking-widest mb-2">
              Expert Guidance
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#0A1628] leading-tight"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Trusted Travel Experts
            </h2>
            <p className="text-gray-500 mt-2 max-w-md">
              Connect with certified travel specialists who know every corner of your dream destination.
            </p>
          </div>
          <Link
            href="/agents"
            className="self-start sm:self-auto flex items-center gap-2 text-[#0A1628] border-2 border-[#0A1628] hover:bg-[#0A1628] hover:text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap text-sm"
          >
            Meet All Experts
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        {/* Bottom CTA banner */}
        <div
          className="mt-12 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{
            background: 'linear-gradient(135deg, #0A1628 0%, #152D55 100%)',
          }}
        >
          <div>
            <h3
              className="text-xl font-bold text-white mb-1"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Are you a travel expert?
            </h3>
            <p className="text-white/60 text-sm">Join TRoyGO™ and reach thousands of travelers worldwide.</p>
          </div>
          <Link
            href="/partners#become-a-partner"
            className="flex items-center gap-2 bg-gradient-to-r from-[#FFD700] to-[#E6C200] hover:from-[#FFE033] hover:to-[#FFD700] text-[#0A1628] font-bold px-7 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/30 whitespace-nowrap"
          >
            Become an Expert
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
