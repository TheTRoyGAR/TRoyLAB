'use client'

import { useState, useMemo } from 'react'
import { localAgents, travelGuides } from '@/lib/data/agents'
import AgentCard from '@/components/agents/AgentCard'
import { Search, Users, ShieldCheck } from 'lucide-react'

type TabType = 'agents' | 'guides'

export default function AgentsPage() {
  const [tab, setTab] = useState<TabType>('agents')
  const [query, setQuery] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [minRating, setMinRating] = useState(0)

  const filteredAgents = useMemo(() => {
    let list = [...localAgents]
    if (verifiedOnly) list = list.filter((a) => a.verified)
    if (minRating > 0) list = list.filter((a) => a.rating >= minRating)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.agency.toLowerCase().includes(q) ||
          a.location.city.toLowerCase().includes(q) ||
          a.location.country.toLowerCase().includes(q) ||
          a.specialty.some((s) => s.toLowerCase().includes(q))
      )
    }
    return list
  }, [query, verifiedOnly, minRating])

  const filteredGuides = useMemo(() => {
    let list = [...travelGuides]
    if (verifiedOnly) list = list.filter((g) => g.verified)
    if (minRating > 0) list = list.filter((g) => g.rating >= minRating)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.location.city.toLowerCase().includes(q) ||
          g.location.country.toLowerCase().includes(q) ||
          g.specialty.some((s) => s.toLowerCase().includes(q))
      )
    }
    return list
  }, [query, verifiedOnly, minRating])

  const activeList = tab === 'agents' ? filteredAgents : filteredGuides

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div
        className="py-14 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #152D55 60%, #00B4D8 100%)' }}
      >
        <Users className="h-12 w-12 text-[#FFD700] mx-auto mb-4" />
        <h1
          className="text-4xl sm:text-5xl font-black text-white mb-3"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Find Your Perfect Travel Expert
        </h1>
        <p className="text-white/70 max-w-2xl mx-auto text-lg mb-6">
          We search across 10,000+ local agents, tour operators, and travel guides worldwide — all verified by TRoyGO™.
        </p>

        {/* Search bar */}
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, location, specialty…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl text-[#0A1628] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/40 shadow-xl"
          />
        </div>
      </div>

      {/* Tabs + filters */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Tabs */}
            <div className="flex">
              {([
                { key: 'agents', label: 'Travel Agents & Operators', count: filteredAgents.length },
                { key: 'guides', label: 'Travel Guides', count: filteredGuides.length },
              ] as { key: TabType; label: string; count: number }[]).map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${
                    tab === key
                      ? 'border-[#00B4D8] text-[#00B4D8]'
                      : 'border-transparent text-gray-500 hover:text-[#0A1628]'
                  }`}
                >
                  {label}
                  <span className="ml-2 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{count}</span>
                </button>
              ))}
            </div>

            {/* Quick filters */}
            <div className="flex items-center gap-4 py-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="accent-[#00B4D8]"
                />
                <ShieldCheck className="h-3.5 w-3.5 text-[#00B4D8]" />
                Verified only
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40"
              >
                <option value={0}>Any rating</option>
                <option value={4}>4+ stars</option>
                <option value={4.5}>4.5+ stars</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {activeList.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No experts match your search.</p>
            <button onClick={() => { setQuery(''); setVerifiedOnly(false); setMinRating(0) }} className="mt-2 text-[#00B4D8] text-sm font-medium underline">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Showing <span className="font-bold text-[#0A1628]">{activeList.length}</span> {tab === 'agents' ? 'agents & operators' : 'travel guides'}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tab === 'agents'
                ? filteredAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      id={agent.id}
                      name={agent.name}
                      agency={agent.agency}
                      specialty={agent.specialty}
                      regions={agent.regions}
                      location={agent.location}
                      rating={agent.rating}
                      reviewCount={agent.reviewCount}
                      yearsExperience={agent.yearsExperience}
                      toursOffered={agent.toursOffered}
                      languages={agent.languages}
                      avatar={agent.avatar}
                      verified={agent.verified}
                      bio={agent.bio}
                      featuredTours={agent.featuredTours}
                      type="agent"
                    />
                  ))
                : filteredGuides.map((guide) => (
                    <AgentCard
                      key={guide.id}
                      id={guide.id + 1000}
                      name={guide.name}
                      specialty={guide.specialty}
                      location={guide.location}
                      rating={guide.rating}
                      reviewCount={guide.reviewCount}
                      yearsExperience={guide.yearsExperience}
                      languages={guide.languages}
                      avatar={guide.avatar}
                      verified={guide.verified}
                      bio={guide.bio}
                      featuredTours={guide.tours.slice(0, 2).map((t) => ({ name: t.name, price: t.price, duration: t.duration }))}
                      type="guide"
                    />
                  ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
