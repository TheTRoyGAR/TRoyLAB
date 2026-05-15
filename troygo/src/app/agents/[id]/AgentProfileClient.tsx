'use client'

import { notFound, useSearchParams } from 'next/navigation'
import { localAgents, travelGuides } from '@/lib/data/agents'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Star, MapPin, Globe, ShieldCheck, Mail,
  Clock, Users, Award, MessageSquare, Calendar
} from 'lucide-react'

const AVATAR_COLORS = [
  'from-violet-500 to-purple-700',
  'from-teal-500 to-cyan-600',
  'from-orange-400 to-red-500',
  'from-green-500 to-emerald-700',
  'from-blue-500 to-indigo-700',
  'from-pink-500 to-rose-600',
]

function AgentProfileContent({ numId }: { numId: number }) {
  const searchParams = useSearchParams()

  const isGuide = numId >= 1000
  const agent = isGuide
    ? travelGuides.find((g) => g.id === numId - 1000)
    : localAgents.find((a) => a.id === numId)

  if (!agent) return notFound()

  const [showContact, setShowContact] = useState(searchParams.get('contact') === '1')
  const [form, setForm] = useState({ destination: '', dates: '', travelers: '2', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const colorClass = AVATAR_COLORS[numId % AVATAR_COLORS.length]
  const tours = 'tours' in agent ? agent.tours : agent.featuredTours
  const agency = 'agency' in agent ? agent.agency : null
  const certifications = 'certifications' in agent ? agent.certifications : []

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Back */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <Link href="/agents" className="inline-flex items-center gap-1.5 text-sm text-[#00B4D8] hover:underline font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Agents
        </Link>
      </div>

      {/* Profile hero */}
      <div
        className="py-10 px-4"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #102444 100%)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-3xl font-black text-white shrink-0`}>
            {agent.avatar}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1
                className="text-3xl font-black text-white"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {agent.name}
              </h1>
              {agent.verified && (
                <span className="flex items-center gap-1 bg-[#00B4D8]/20 text-[#00B4D8] text-xs font-bold px-3 py-1 rounded-full">
                  <ShieldCheck className="h-3.5 w-3.5" /> TRoyGO™ Verified
                </span>
              )}
            </div>
            {agency && <p className="text-white/70 text-sm mb-2">{agency}</p>}
            <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-[#00B4D8]" />{agent.location.city}, {agent.location.country}</span>
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-[#FFD700] text-[#FFD700]" />{agent.rating} ({agent.reviewCount} reviews)</span>
              <span className="flex items-center gap-1"><Award className="h-4 w-4 text-[#FFD700]" />{agent.yearsExperience} years experience</span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowContact(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: '#00B4D8' }}
            >
              <MessageSquare className="h-4 w-4" /> Request Quote
            </button>
            <a
              href={`mailto:${agent.contactEmail}`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border-2 border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              <Mail className="h-4 w-4" /> Email
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-[#0A1628] text-lg mb-3">About</h2>
            <p className="text-gray-600 leading-relaxed">{agent.bio}</p>
          </section>

          {/* Specialties */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-[#0A1628] text-lg mb-4">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {agent.specialty.map((s) => (
                <span key={s} className="bg-[#0A1628]/5 text-[#0A1628] text-sm font-medium px-3 py-1.5 rounded-full">{s}</span>
              ))}
            </div>
          </section>

          {/* Tours / Featured tours */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-[#0A1628] text-lg mb-4">
              {isGuide ? 'Available Tours' : 'Featured Tours'}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {(tours as { name: string; price: number; duration: string; maxGroup?: number; description?: string }[]).map((tour, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 hover:border-[#00B4D8]/40 transition-colors">
                  <h3 className="font-bold text-[#0A1628] text-sm mb-2">{tour.name}</h3>
                  {'description' in tour && tour.description && (
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">{tour.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{tour.duration}</span>
                      {tour.maxGroup && <span className="flex items-center gap-1"><Users className="h-3 w-3" />Max {tour.maxGroup}</span>}
                    </div>
                    <span className="font-bold text-[#00B4D8] text-sm">from ${tour.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-[#0A1628] text-lg mb-4">Traveler Reviews</h2>
            <div className="space-y-4">
              {[
                { name: 'Michael R.', date: '3 weeks ago', rating: 5, text: 'Outstanding experience! Incredibly knowledgeable and made our trip truly special. Every recommendation was perfect.' },
                { name: 'Laura K.', date: '1 month ago', rating: 5, text: 'Professional, responsive, and went above and beyond. Already planning our next trip with them!' },
                { name: 'David P.', date: '2 months ago', rating: 4, text: 'Great itinerary planning and excellent communication throughout. Highly recommend.' },
              ].map((r, i) => (
                <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="font-semibold text-sm text-[#0A1628]">{r.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{r.date}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? 'fill-[#FFD700] text-[#FFD700]' : 'fill-gray-200 text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{r.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Quick info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Globe className="h-4 w-4 text-[#00B4D8]" />
              <span>Languages: {agent.languages.join(', ')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4 text-[#00B4D8]" />
              <a href={`mailto:${agent.contactEmail}`} className="text-[#00B4D8] hover:underline truncate">{agent.contactEmail}</a>
            </div>
            {'toursOffered' in agent && agent.toursOffered && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 text-[#00B4D8]" />
                <span>{agent.toursOffered} tours available</span>
              </div>
            )}
            {certifications.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Certifications</p>
                <div className="flex flex-wrap gap-1.5">
                  {certifications.map((c: string) => (
                    <span key={c} className="text-xs bg-[#FFD700]/20 text-[#0A1628] font-medium px-2 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact form */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#0A1628] mb-4">Request a Quote</h3>
            {submitted ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✅</div>
                <p className="font-semibold text-[#0A1628] text-sm">Request sent!</p>
                <p className="text-xs text-gray-500 mt-1">You&apos;ll hear back within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Destination"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40"
                />
                <input
                  type="text"
                  placeholder="Travel dates"
                  value={form.dates}
                  onChange={(e) => setForm({ ...form, dates: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40"
                />
                <input
                  type="number"
                  placeholder="Travelers"
                  min={1}
                  value={form.travelers}
                  onChange={(e) => setForm({ ...form, travelers: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40"
                />
                <textarea
                  placeholder="Tell us about your dream trip…"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: '#00B4D8' }}
                >
                  Send Request
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function AgentProfileClient({ id }: { id: string }) {
  const numId = parseInt(id, 10)
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>}><AgentProfileContent numId={numId} /></Suspense>
}
