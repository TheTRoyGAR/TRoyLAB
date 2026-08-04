'use client';

import { ArrowRight, Sparkles, MapPin, Calendar, Lightbulb, Clock } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Personalized Itineraries',
    description: 'AI crafts day-by-day plans tailored to your interests, budget, and travel style.',
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    title: 'Real-time Recommendations',
    description: 'Live suggestions for flights, hotels, and activities based on current availability.',
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: '24/7 Planning Assistance',
    description: 'Get answers and adjustments any time — our AI never sleeps.',
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    title: 'Local Insider Tips',
    description: 'Hidden gems, off-the-beaten-path restaurants, and local secrets at every destination.',
  },
];

const chatMessages = [
  {
    role: 'user' as const,
    text: 'Plan a 7-day trip to Japan for 2 people in October.',
  },
  {
    role: 'ai' as const,
    text: "Great choice! October is perfect — mild weather and autumn foliage. Here's a suggested itinerary:",
  },
  {
    role: 'ai' as const,
    text: '📍 Days 1–3: Tokyo — Shibuya, Harajuku, teamLab, Tsukiji Market\n🏔 Day 4: Day trip to Mt. Fuji (Hakone)\n⛩ Days 5–6: Kyoto — Fushimi Inari, Arashiyama bamboo, Gion district\n🍜 Day 7: Osaka — Dotonbori, street food, Osaka Castle',
  },
  {
    role: 'user' as const,
    text: 'Can you add a tea ceremony experience in Kyoto?',
  },
  {
    role: 'ai' as const,
    text: "Absolutely! I've added a traditional tea ceremony at En tea house in Gion for Day 5 afternoon. I also found flights from $1,249/pp. Shall I book?",
  },
];

function ChatBubble({ role, text }: { role: 'user' | 'ai'; text: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00B4D8] to-[#0096B5] flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
          isUser
            ? 'bg-[#00B4D8] text-white rounded-br-sm'
            : 'bg-white text-gray-700 rounded-bl-sm shadow-sm border border-gray-100'
        }`}
      >
        {text}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0A1628] to-[#152D55] flex items-center justify-center ml-2 flex-shrink-0 mt-0.5">
          <span className="text-white text-[10px] font-bold">You</span>
        </div>
      )}
    </div>
  );
}

export default function AIPlannerPromo() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text content */}
          <div className="flex flex-col gap-6">
            {/* Label */}
            <div className="inline-flex items-center gap-2 self-start">
              <span
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
                style={{
                  background: 'rgba(0,180,216,0.1)',
                  border: '1px solid rgba(0,180,216,0.3)',
                  color: '#00B4D8',
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Planning
              </span>
            </div>

            {/* Headline */}
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A1628] leading-tight"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Meet Your AI{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #00B4D8, #0096B5)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Travel Companion
              </span>
            </h2>

            <p className="text-gray-500 text-lg leading-relaxed">
              Stop spending hours researching. Our intelligent AI planner builds your perfect trip in minutes —
              fully personalized, instantly adjustable, and always improving.
            </p>

            {/* Feature list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(0,180,216,0.1)', color: '#00B4D8' }}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A1628] text-sm">{feature.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed mt-0.5">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link
                href="/trip-planner"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00B4D8] to-[#0096B5] hover:from-[#0096B5] hover:to-[#007A94] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-[#00B4D8]/30 transition-all duration-200 hover:shadow-[#00B4D8]/50 hover:gap-3"
              >
                <Sparkles className="w-4 h-4" />
                Start Planning with AI
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/trip-planner"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-[#00B4D8] text-gray-600 hover:text-[#00B4D8] font-semibold px-6 py-3.5 rounded-xl transition-all duration-200"
              >
                <Calendar className="w-4 h-4" />
                See Sample Itinerary
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {['#667eea', '#f5576c', '#4facfe', '#fa709a'].map((color, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white"
                    style={{ background: color }}
                  />
                ))}
              </div>
              <span>
                <strong className="text-[#0A1628]">50,000+</strong> trips planned this month
              </span>
            </div>
          </div>

          {/* Right: AI Chat mockup */}
          <div className="relative">
            {/* Decorative background blob */}
            <div
              className="absolute -inset-8 rounded-3xl pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 60% 40%, rgba(0,180,216,0.08) 0%, transparent 70%)',
              }}
            />

            {/* Chat container */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100"
              style={{ background: '#f8fafc' }}
            >
              {/* Chat header */}
              <div
                className="flex items-center gap-3 px-5 py-4"
                style={{
                  background: 'linear-gradient(135deg, #0A1628 0%, #152D55 100%)',
                }}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00B4D8] to-[#0096B5] flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">TRoy AI Planner</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white/60 text-xs">Online · Thinking in real-time</span>
                  </div>
                </div>
                <div className="ml-auto flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                </div>
              </div>

              {/* Messages */}
              <div className="px-4 py-5 space-y-1 min-h-[360px]" style={{ background: '#f8fafc' }}>
                {chatMessages.map((msg, i) => (
                  <ChatBubble key={i} role={msg.role} text={msg.text} />
                ))}

                {/* Typing indicator */}
                <div className="flex justify-start mt-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00B4D8] to-[#0096B5] flex items-center justify-center mr-2 flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>

              {/* Input area */}
              <div className="px-4 py-3 border-t border-gray-100 bg-white flex items-center gap-2">
                <input
                  readOnly
                  placeholder="Ask about your next adventure..."
                  className="flex-1 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 focus:outline-none cursor-default"
                />
                <button
                  type="button"
                  className="p-2.5 rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#0096B5] text-white hover:shadow-md transition-shadow"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Floating stat cards */}
            <div
              className="absolute -left-6 top-16 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-gray-100"
              style={{ minWidth: 160 }}
            >
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-green-500" />
              </div>
              <div>
                <p className="text-[#0A1628] font-bold text-sm">2 min</p>
                <p className="text-gray-500 text-xs">Avg. plan time</p>
              </div>
            </div>

            <div
              className="absolute -right-6 bottom-24 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-gray-100"
              style={{ minWidth: 160 }}
            >
              <div className="w-9 h-9 rounded-xl bg-[#00B4D8]/10 flex items-center justify-center">
                <MapPin className="w-4.5 h-4.5 text-[#00B4D8]" />
              </div>
              <div>
                <p className="text-[#0A1628] font-bold text-sm">195 Countries</p>
                <p className="text-gray-500 text-xs">Destinations covered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
