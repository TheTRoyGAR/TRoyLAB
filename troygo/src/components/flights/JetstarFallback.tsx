import { ExternalLink, Plane } from 'lucide-react'
import { buildJetstarSearchUrl, isAustralianDomestic } from '@/lib/jetstar'

interface Props {
  from: string
  to: string
  date?: string
  returnDate?: string
  adults: number
  children: number
  infants: number
}

function niceDate(d?: string): string | null {
  if (!d) return null
  const t = new Date(`${d}T00:00:00`)
  return Number.isNaN(t.getTime()) ? null : t.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Shown only when our live search found nothing on an Australian domestic route. The customer finishes on
// Jetstar's own website (dates, seats, bags, payment), so TRoyGO handles no money for these bookings.
export default function JetstarFallback({ from, to, date, returnDate, adults, children, infants }: Props) {
  if (!isAustralianDomestic(from, to)) return null

  const url = buildJetstarSearchUrl({ from, to, adults, children, infants })
  const parts = [`${adults} adult${adults === 1 ? '' : 's'}`]
  if (children > 0) parts.push(`${children} child${children === 1 ? '' : 'ren'}`)
  if (infants > 0) parts.push(`${infants} infant${infants === 1 ? '' : 's'}`)
  const when = [niceDate(date), niceDate(returnDate)].filter(Boolean).join(' to ')

  return (
    <div className="mt-6 text-left rounded-2xl border border-orange-200 bg-orange-50/60 p-5">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
          <Plane className="h-5 w-5 text-orange-600" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[#0A1628] text-sm">Search Jetstar directly</p>
          <p className="text-slate-600 text-sm mt-1">
            Our live search doesn&apos;t include Jetstar flights yet. We&apos;ll open Jetstar&apos;s own website with your route
            and passengers filled in. There you choose your dates (one way or return), seats and bags, and pay Jetstar
            directly. TRoyGO doesn&apos;t take payment for these bookings.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            {from.trim().toUpperCase()} → {to.trim().toUpperCase()} · {parts.join(', ')}
            {when ? ` · you searched ${when}` : ''}
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 bg-[#0A1628] hover:bg-[#152D55] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            Open Jetstar
            <ExternalLink className="h-4 w-4" />
          </a>
          <p className="text-slate-400 text-xs mt-2">Jetstar doesn&apos;t fly every route. If it shows no flights, try another date or airport.</p>
        </div>
      </div>
    </div>
  )
}
