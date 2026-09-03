import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'

export default function AboutPage() {
  return (
    <MainLayout>
      <div style={{ background: '#0A1628' }} className="text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1
            className="text-3xl sm:text-4xl font-black mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFD700' }}
          >
            About TRoy Travel Agency™
          </h1>
          <p className="text-white/60 mb-10">
            Your World, Your Journey.
          </p>

          <div className="space-y-6 text-white/80 leading-relaxed">
            <p>
              TRoy Travel Agency™ (TRoyGO™) is a registered Australian travel agency
              (ABN 30 302 098 137), booking flights, hotels, car rentals, vacation
              packages, cruises, and custom trip planning.
            </p>

            <div className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-2" style={{ color: '#00B4D8' }}>Part of TRoy Group™</h2>
              <p className="text-white/70">
                TRoyGO is one company within TRoy Group™, a family of focused
                businesses each run by a small, real team backed by AI agents rather
                than large departments. Alongside TRoyGO, the Group includes{' '}
                <strong className="text-white">TRoyAI™</strong> (an AI automation
                agency — see below) and <strong className="text-white">TRoyMAR™</strong> (maritime),
                with sister ventures in shared services, R&amp;D, media, and trading
                operating under the same TRoy™ name.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-2" style={{ color: '#00B4D8' }}>How TRoyAI™ powers TRoyGO™</h2>
              <p className="text-white/70 mb-3">
                TRoyAI™ (<a href="https://troyaiagent.com" target="_blank" rel="noopener noreferrer" className="underline">troyaiagent.com</a>) describes
                itself plainly: &ldquo;Real work, done by AI agents that never sleep.&rdquo;
                TRoyGO is a working example of that model, not just a slogan —
                several of its own real agents run inside this site today:
              </p>
              <ul className="space-y-2 text-white/70 list-disc list-inside">
                <li>Four research agents (Travel, Hotel, Car Rental, and Cruise Deals Researchers) that search the live web for real current deals — every result they save must carry the actual source URL they found it at, or the run fails outright.</li>
                <li>An AI trip planner that builds a personalized itinerary directly from a traveler&apos;s brief.</li>
                <li>Real, database-backed booking, CRM, and email systems behind the scenes — no mocked or simulated data standing in for them.</li>
              </ul>
            </div>

            <p>
              Read more about the department structure behind TRoyAI™&apos;s agents on
              our <Link href="/team" className="underline" style={{ color: '#00B4D8' }}>Departments &amp; Agents</Link> page.
            </p>

            <div className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-2" style={{ color: '#00B4D8' }}>Get in touch</h2>
              <p className="text-white/70">
                Email <a href="mailto:agency@troytravelagency.com" className="underline">agency@troytravelagency.com</a>{' '}
                or call <a href="tel:+61422781807" className="underline">+61 422 781 807</a>.
                Based at University Drive North, Brinkin NT 0810, Australia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
