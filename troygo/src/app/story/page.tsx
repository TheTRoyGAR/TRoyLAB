import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { Compass, Handshake, Database, PlaneTakeoff } from 'lucide-react'

export default function StoryPage() {
  return (
    <MainLayout>
      <div style={{ background: '#0A1628' }} className="text-white">
        {/* Hero */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14">
          <div
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: '#00B4D8' }}
          >
            Our Story
          </div>
          <h1
            className="text-3xl sm:text-5xl font-black leading-tight mb-5"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Twenty-five years of booking journeys by hand, now run by{' '}
            <span style={{ color: '#FFD700' }}>AI agents</span>.
          </h1>
          <p className="text-white/60 text-lg max-w-xl">
            Prepared by the founder — one owner, four industries, two countries,
            twenty-five years.
          </p>
        </div>

        {/* Founder timeline */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-white/10">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-8" style={{ color: '#00B4D8' }}>
            The founder
          </h2>
          <div className="space-y-8 border-l border-white/10 pl-6">
            <div>
              <div className="text-xs font-mono mb-1" style={{ color: '#00B4D8' }}>1998 — Turkey</div>
              <h3 className="font-bold text-lg mb-1">Troy Travel Agency &amp; Troy Shipping Agency</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Founded together as part of a group of companies — the first time
                running a travel business as owner-operator, not employee.
              </p>
            </div>
            <div>
              <div className="text-xs font-mono mb-1" style={{ color: '#00B4D8' }}>2011 — Australia</div>
              <h3 className="font-bold text-lg mb-1">Relocation to Darwin, NT</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Moved to Australia and restarted, building toward what would become
                today&apos;s group of companies.
              </p>
            </div>
            <div>
              <div className="text-xs font-mono mb-1" style={{ color: '#00B4D8' }}>2022–2023</div>
              <h3 className="font-bold text-lg mb-1">Small-Business Mentorship Program</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Awarded a three-year free membership with a local small-business
                support program.
              </p>
            </div>
            <div>
              <div className="text-xs font-mono mb-1" style={{ color: '#00B4D8' }}>2026 — Today</div>
              <h3 className="font-bold text-lg mb-1">TRoyGO™ — TRoy Travel Agency™</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Same owner, same instinct to run every part of the business
                personally — now the proving ground for the AI-agent template built
                first at{' '}
                <a href="https://troyaiagent.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#00B4D8' }}>
                  TRoyAI™
                </a>.
              </p>
            </div>
          </div>
        </div>

        {/* Then / Next */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-white/10">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-6" style={{ color: '#00B4D8' }}>
            Then and next
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="text-xs font-mono uppercase tracking-wider mb-2 text-white/40">Then</div>
              <h3 className="font-bold mb-2">Troy Travel Agency</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Bookings researched, quoted, and confirmed by hand, one traveler at
                a time.
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6" style={{ borderTop: '2px solid #FFD700' }}>
              <div className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: '#FFD700' }}>Next</div>
              <h3 className="font-bold mb-2">TRoyGO™</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                An unmanned AI-agent travel agency — the same booking judgment,
                running on real infrastructure instead of a single person&apos;s hours.
              </p>
            </div>
          </div>
        </div>

        {/* Real build */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-white/10">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#00B4D8' }}>
            The build — TRoyGO™
          </h2>
          <p className="text-white/60 mb-8 max-w-xl leading-relaxed">
            TRoyGO doesn&apos;t run its own separate department roster — it runs on{' '}
            <a href="https://troyaiagent.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#00B4D8' }}>
              TRoyAI™
            </a>&apos;s 7 departments and 31 agents, the same shared template proven
            across TRoy Group. Several of those agents are live on this site today.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-white/5 rounded-2xl p-6 flex gap-4">
              <Compass className="h-6 w-6 shrink-0" style={{ color: '#FFD700' }} />
              <div>
                <h3 className="font-bold mb-1">4 live research agents</h3>
                <p className="text-sm text-white/60">
                  Travel, Hotel, Car Rental, and Cruise Deals Researchers search the
                  live web for real current deals — every result must carry the
                  actual source URL it was found at, or the run fails outright.
                </p>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 flex gap-4">
              <PlaneTakeoff className="h-6 w-6 shrink-0" style={{ color: '#FFD700' }} />
              <div>
                <h3 className="font-bold mb-1">AI trip planner</h3>
                <p className="text-sm text-white/60">
                  Builds a personalized itinerary directly from a traveler&apos;s
                  brief — try it on the{' '}
                  <Link href="/trip-planner" className="underline" style={{ color: '#00B4D8' }}>
                    Trip Planner
                  </Link>{' '}
                  page.
                </p>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 flex gap-4">
              <Database className="h-6 w-6 shrink-0" style={{ color: '#FFD700' }} />
              <div>
                <h3 className="font-bold mb-1">Real infrastructure</h3>
                <p className="text-sm text-white/60">
                  A live Postgres database behind bookings, CRM, and reporting; live
                  flight search through the Duffel API — no mocked or simulated
                  data standing in for any of it.
                </p>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 flex gap-4">
              <Handshake className="h-6 w-6 shrink-0" style={{ color: '#FFD700' }} />
              <div>
                <h3 className="font-bold mb-1">Real partner pipeline</h3>
                <p className="text-sm text-white/60">
                  A working application system for ground operators — every
                  submission is reviewed by TRoyGO&apos;s team before any
                  partnership is confirmed.
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-6 mt-4"
            style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.3)' }}
          >
            <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#FFD700' }}>
              Honest state, not a pitch exaggeration
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              TRoyGO is a registered Australian travel agency (ABN 30 302 098 137)
              with real booking infrastructure already live, not a mockup.
            </p>
            <p className="text-sm text-white/50 leading-relaxed mt-2">
              It&apos;s the second company built on the AI-agent template TRoyAI
              proved first — still early, still growing the partner and customer
              base, and never presenting a placeholder as a confirmed deal or price.
            </p>
          </div>
        </div>

        {/* Closing */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10">
          <h2
            className="text-2xl sm:text-3xl font-black leading-snug mb-8 max-w-xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Twenty-five years booking journeys by hand. Now building the version
            that doesn&apos;t need hands at all.
          </h2>
          <div className="mb-2" style={{ fontFamily: "Georgia, serif" }}>
            — I. Ertan Govdeli, Founder &amp; CEO
          </div>
          <div className="text-white/50 text-sm mb-8">troytravelagency.com · TRoy Group™</div>
          <Link
            href="/"
            className="inline-block font-bold text-sm px-7 py-3 rounded-lg"
            style={{ background: '#00B4D8', color: '#0A1628' }}
          >
            Back to Home →
          </Link>
        </div>
      </div>
    </MainLayout>
  )
}
