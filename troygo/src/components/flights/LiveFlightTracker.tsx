'use client'

import { useEffect, useState } from 'react'
import { Plane, RefreshCw, Radio } from 'lucide-react'

// Proxies OpenSky Network's live aircraft-state API through our own
// Cloudflare Worker (worker/index.js in this repo) — OpenSky's CORS policy
// only allows requests from their own origin, so the browser can't call
// them directly from a static site. This Worker is genuinely our own code,
// just not our own radar receivers.
const PROXY_URL = 'https://troygo-flight-proxy.troyaiagent.workers.dev'

interface Region {
  label: string
  lamin: number
  lomin: number
  lamax: number
  lomax: number
}

// OpenSky state vector array indices (per their API docs) — kept as
// constants rather than a magic-number tuple destructure.
const IDX = { ICAO24: 0, CALLSIGN: 1, ORIGIN_COUNTRY: 2, VELOCITY: 9, TRUE_TRACK: 10, GEO_ALT: 13, ON_GROUND: 8 } as const

interface LiveFlight {
  icao24: string
  callsign: string
  originCountry: string
  velocityMs: number | null
  altitudeM: number | null
  onGround: boolean
}

const REGIONS: Region[] = [
  { label: 'Darwin, Australia', lamin: -13, lomin: 130, lamax: -11, lomax: 132 },
  { label: 'Sydney, Australia', lamin: -34.5, lomin: 150.3, lamax: -33.2, lomax: 151.8 },
  { label: 'London, UK', lamin: 51.1, lomin: -0.9, lamax: 51.9, lomax: 0.5 },
  { label: 'Los Angeles, USA', lamin: 33.4, lomin: -118.9, lamax: 34.4, lomax: -117.5 },
]

function toNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' ? value : null
}

function parseStates(raw: unknown): LiveFlight[] {
  const states = (raw as { states?: unknown[][] })?.states ?? []
  return states
    .filter((s) => !s[IDX.ON_GROUND])
    .map((s) => ({
      icao24: String(s[IDX.ICAO24] ?? ''),
      callsign: String(s[IDX.CALLSIGN] ?? '').trim() || 'Unknown',
      originCountry: String(s[IDX.ORIGIN_COUNTRY] ?? ''),
      velocityMs: toNumberOrNull(s[IDX.VELOCITY]),
      altitudeM: toNumberOrNull(s[IDX.GEO_ALT]),
      onGround: Boolean(s[IDX.ON_GROUND]),
    }))
    .slice(0, 8)
}

export default function LiveFlightTracker() {
  const [regionIdx, setRegionIdx] = useState(0)
  const [flights, setFlights] = useState<LiveFlight[]>([])
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const region = REGIONS[regionIdx]

  useEffect(() => {
    let cancelled = false

    async function fetchFlights() {
      setStatus('loading')
      try {
        const params = new URLSearchParams({
          lamin: String(region.lamin),
          lomin: String(region.lomin),
          lamax: String(region.lamax),
          lomax: String(region.lomax),
        })
        const res = await fetch(`${PROXY_URL}?${params}`)
        if (!res.ok) throw new Error(`Proxy returned ${res.status}`)
        const data = await res.json()
        if (cancelled) return
        setFlights(parseStates(data))
        setUpdatedAt(new Date())
        setStatus('ok')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    fetchFlights()
    const interval = setInterval(fetchFlights, 20000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [region])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#00B4D8]" />
          <h3 className="font-bold text-[#0A1628] text-base">Live Flights Right Now</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">
            Real-time · OpenSky Network
          </span>
        </div>
        <select
          value={regionIdx}
          onChange={(e) => setRegionIdx(Number(e.target.value))}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40"
        >
          {REGIONS.map((r, i) => (
            <option key={r.label} value={i}>{r.label}</option>
          ))}
        </select>
      </div>

      {status === 'error' && (
        <p className="text-sm text-gray-500">Live flight data is temporarily unavailable — try again shortly.</p>
      )}

      {status !== 'error' && flights.length === 0 && (
        <p className="text-sm text-gray-500">
          {status === 'loading' ? 'Loading live aircraft…' : 'No aircraft currently in this region.'}
        </p>
      )}

      {flights.length > 0 && (
        <div className="space-y-2">
          {flights.map((f) => (
            <div key={f.icao24} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <Plane className="w-3.5 h-3.5 text-[#00B4D8] flex-shrink-0" />
                <span className="font-semibold text-[#0A1628]">{f.callsign}</span>
                <span className="text-gray-400 text-xs truncate">{f.originCountry}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 text-xs flex-shrink-0">
                {f.altitudeM !== null && <span>{Math.round(f.altitudeM).toLocaleString()} m</span>}
                {f.velocityMs !== null && <span>{Math.round(f.velocityMs * 3.6)} km/h</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {updatedAt && (
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />
          Updated {updatedAt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })} · refreshes every 20s
        </p>
      )}
    </div>
  )
}
