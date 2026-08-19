'use client'

import DashboardLayout from '@/components/dashboard/DashboardLayout'
import activityData from '@/lib/data/agent-activity.json'
import { Bot, Building2, Car, Ship, MapPinned, Clock, ExternalLink } from 'lucide-react'

interface ActivityEntry {
  timestamp: string
  category: 'packages' | 'hotels' | 'cars' | 'cruises'
  addedCount: number
  addedNames: string[]
  alreadyExisted: number
  totalNow: number
}

const CATEGORY_META: Record<ActivityEntry['category'], { label: string; icon: React.ElementType; color: string }> = {
  packages: { label: 'Tour Packages', icon: MapPinned, color: '#00B4D8' },
  hotels: { label: 'Hotels', icon: Building2, color: '#8B5CF6' },
  cars: { label: 'Car Rentals', icon: Car, color: '#F59E0B' },
  cruises: { label: 'Cruises', icon: Ship, color: '#10B981' },
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diffMs / 3_600_000)
  if (hours < 1) return 'Less than an hour ago'
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

export default function AgentsPage() {
  const activity = activityData as ActivityEntry[]
  const latestByCategory = new Map<string, ActivityEntry>()
  for (const entry of activity) {
    if (!latestByCategory.has(entry.category)) latestByCategory.set(entry.category, entry)
  }
  const totalAddedAllTime = activity.reduce((sum, e) => sum + e.addedCount, 0)

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#0A1628] flex items-center gap-2">
              <Bot className="h-6 w-6" style={{ color: '#00B4D8' }} />
              Research Agents
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Real background agents that search the live web for genuine travel deals — every
              entry here is a real run, not a demo.
            </p>
          </div>
        </div>

        {/* Category status cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {(Object.keys(CATEGORY_META) as ActivityEntry['category'][]).map((cat) => {
            const meta = CATEGORY_META[cat]
            const latest = latestByCategory.get(cat)
            return (
              <div key={cat} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: `${meta.color}20` }}>
                  <meta.icon className="h-4.5 w-4.5" style={{ color: meta.color }} />
                </div>
                <p className="text-xs font-semibold text-gray-500">{meta.label}</p>
                {latest ? (
                  <>
                    <p className="text-xl font-black text-[#0A1628] mt-1">{latest.totalNow}</p>
                    <p className="text-[11px] text-gray-400">last run {timeAgo(latest.timestamp)}</p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">No runs yet</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-[#0A1628] text-sm">Run History</h2>
            <span className="text-xs text-gray-400">{totalAddedAllTime} real listings added all-time</span>
          </div>
          {activity.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              No agent runs recorded yet. Once the scheduled run fires (or a manual run is
              triggered), it will show up here.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activity.map((entry, i) => {
                const meta = CATEGORY_META[entry.category]
                return (
                  <div key={i} className="px-5 py-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${meta.color}20` }}>
                      <meta.icon className="h-4 w-4" style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0A1628]">
                        <span className="font-bold">+{entry.addedCount} new real {meta.label.toLowerCase()}</span>
                        {entry.alreadyExisted > 0 && (
                          <span className="text-gray-400"> ({entry.alreadyExisted} already in catalog)</span>
                        )}
                        <span className="text-gray-400"> — {entry.totalNow} total now</span>
                      </p>
                      {entry.addedNames.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {entry.addedNames.join(', ')}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {timeAgo(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <a
          href="https://github.com/TheTRoyGAR/TRoyLAB/actions"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[#00B4D8] transition-colors w-fit"
        >
          View raw run logs on GitHub Actions <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </DashboardLayout>
  )
}
