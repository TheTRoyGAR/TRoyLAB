import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { TrendingUp, Handshake, DollarSign, Cpu, ClipboardList, Activity, Mail } from 'lucide-react'

const DEPARTMENTS = [
  { name: 'Marketing', icon: TrendingUp, blurb: 'Real trend research, content built for actual conversion, and honest funnel audits.' },
  { name: 'Sales', icon: Handshake, blurb: 'Real prospect research, personalized outreach grounded in real facts, and objection handling.' },
  { name: 'Finance', icon: DollarSign, blurb: 'Real ROI models with stated assumptions, automated billing flows, and reporting you can actually trust.' },
  { name: 'CTO / Technical', icon: Cpu, blurb: 'Real workflow mapping, tool integration, working code — and honest, read-only codebase audits.' },
  { name: 'Management', icon: ClipboardList, blurb: 'The CEO Assistant — intakes every brief, delegates it to the right department, reviews the output.' },
  { name: 'Operations', icon: Activity, blurb: 'Real daily briefings pulled from actual agency activity, and process audits that find real inefficiencies.' },
  { name: 'Email', icon: Mail, blurb: 'Real inbox triage across every connected account, and reply drafts grounded in the actual thread.' },
]

export default function TeamPage() {
  return (
    <MainLayout>
      <div style={{ background: '#0A1628' }} className="text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1
            className="text-3xl sm:text-4xl font-black mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFD700' }}
          >
            Departments &amp; Agents
          </h1>
          <p className="text-white/60 mb-2 max-w-2xl">
            TRoyGO is run by a small, real human team — not a large office of staff —
            backed by <a href="https://troyaiagent.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#00B4D8' }}>TRoyAI™</a>,
            our sister company&apos;s AI automation agency. TRoyAI&apos;s own words: &ldquo;Real
            work, done by AI agents that never sleep.&rdquo;
          </p>
          <p className="text-white/50 text-sm mb-10">
            Founder &amp; CEO: I. Ertan Govdeli
          </p>

          <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#00B4D8' }}>
            TRoyAI&apos;s 7 Departments
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {DEPARTMENTS.map((d) => (
              <div key={d.name} className="bg-white/5 rounded-2xl p-5 flex gap-4">
                <d.icon className="h-6 w-6 shrink-0" style={{ color: '#FFD700' }} />
                <div>
                  <h3 className="font-bold mb-1">{d.name}</h3>
                  <p className="text-sm text-white/70">{d.blurb}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/50 text-sm mb-12">
            How it works, per TRoyAI: a brief comes in, the right department&apos;s
            agents research and draft the work, and nothing goes out without human
            review and sign-off.
          </p>

          <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#00B4D8' }}>
            This isn&apos;t just theory — it&apos;s live inside TRoyGO
          </h2>
          <div className="space-y-4">
            <div className="bg-white/5 rounded-2xl p-6">
              <h3 className="font-bold mb-1">Deals Research Agents</h3>
              <p className="text-sm text-white/70">
                Four agents search the live web for real current Travel, Hotel, Car
                Rental, and Cruise deals. Every result they save must include the
                actual source URL — the run fails if one is missing. You can browse
                what they&apos;ve found across our{' '}
                <Link href="/packages" className="underline" style={{ color: '#00B4D8' }}>Packages</Link>,{' '}
                <Link href="/hotels" className="underline" style={{ color: '#00B4D8' }}>Hotels</Link>,{' '}
                <Link href="/cars" className="underline" style={{ color: '#00B4D8' }}>Cars</Link>, and{' '}
                <Link href="/cruises" className="underline" style={{ color: '#00B4D8' }}>Cruises</Link> pages.
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6">
              <h3 className="font-bold mb-1">AI Trip Planner</h3>
              <p className="text-sm text-white/70">
                Tell it what you want and it drafts a real, personalized itinerary —
                try it on our <Link href="/trip-planner" className="underline" style={{ color: '#00B4D8' }}>Trip Planner</Link> page.
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6">
              <h3 className="font-bold mb-1">Operations &amp; Email</h3>
              <p className="text-sm text-white/70">
                Bookings, CRM, and revenue reporting run on a real database, not
                mocked figures, and our inbox is triaged with real reply drafts
                grounded in the actual conversation — reviewed by a person before
                anything is sent.
              </p>
            </div>
          </div>

          <p className="text-white/50 text-sm mt-12">
            Have a question about how we work?{' '}
            <Link href="/contact" className="underline" style={{ color: '#00B4D8' }}>Contact us</Link>.
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
