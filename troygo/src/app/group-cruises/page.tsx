'use client'

import MainLayout from '@/components/layout/MainLayout'
import { groupCruisePrograms, groupCruiseProgramsNeedingConfirmation, GroupCruiseProgram } from '@/lib/data/groupCruisePrograms'
import { Users, CheckCircle2, ExternalLink, PartyPopper, Mail } from 'lucide-react'

const TIERS: GroupCruiseProgram['tier'][] = ['Mainstream & Family', 'Premium', 'Luxury']

export default function GroupCruisesPage() {
  return (
    <MainLayout>
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div
          className="py-16 px-4 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0A1628 0%, #102444 50%, #0096B5 100%)' }}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #00B4D8 0%, transparent 50%), radial-gradient(circle at 80% 20%, #FFD700 0%, transparent 50%)' }} />
          <div className="relative z-10">
            <PartyPopper className="h-12 w-12 text-[#FFD700] mx-auto mb-4" />
            <h1
              className="text-4xl sm:text-5xl font-black text-white mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Group Cruises, Made Easy
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              Weddings, family reunions, corporate retreats — TRoyGO organizes the booking,
              your group gets the cruise line&apos;s real group perks.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
          {TIERS.map((tier) => {
            const lines = groupCruisePrograms.filter((p) => p.tier === tier)
            if (lines.length === 0) return null
            return (
              <section key={tier}>
                <h2
                  className="text-2xl font-bold text-[#0A1628] mb-6 flex items-center gap-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  <Users className="h-5 w-5 text-[#00B4D8]" />
                  {tier}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {lines.map((program) => (
                    <div
                      key={program.cruiseLine}
                      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-lg font-bold text-[#0A1628]">{program.cruiseLine}</h3>
                        <a href={program.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#00B4D8] shrink-0 mt-1">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      {program.programName && (
                        <p className="text-xs font-semibold text-[#00B4D8] mb-2">{program.programName}</p>
                      )}
                      <p className="text-sm text-gray-500 mb-3">
                        <span className="font-semibold text-[#0A1628]">Minimum:</span> {program.minimumStaterooms}
                      </p>
                      <ul className="space-y-1.5 mb-3">
                        {program.benefits.map((b) => (
                          <li key={b} className="text-sm text-gray-600 flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#00B4D8] shrink-0 mt-0.5" />
                            {b}
                          </li>
                        ))}
                      </ul>
                      {program.note && (
                        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-3">{program.note}</p>
                      )}
                      <a
                        href={`mailto:agency@troytravelagency.com?subject=${encodeURIComponent(`Group Cruise Enquiry - ${program.cruiseLine}`)}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00B4D8] hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Enquire about {program.cruiseLine}
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}

          {groupCruiseProgramsNeedingConfirmation.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500">
                Also available on request — real group programs exist but full terms haven&apos;t
                been independently confirmed yet:{' '}
                <span className="font-semibold text-[#0A1628]">
                  {groupCruiseProgramsNeedingConfirmation.join(', ')}
                </span>
              </p>
            </section>
          )}

          {/* CTA */}
          <section className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <Mail className="h-8 w-8 text-[#00B4D8] mx-auto mb-3" />
            <h3 className="text-xl font-bold text-[#0A1628] mb-2">Planning a group cruise?</h3>
            <p className="text-gray-500 mb-5 max-w-xl mx-auto">
              Tell us your group size, occasion, and preferred cruise line — we&apos;ll handle
              the booking and make sure you get every real perk you&apos;re entitled to.
            </p>
            <a
              href="mailto:agency@troytravelagency.com?subject=Group%20Cruise%20Enquiry"
              className="inline-block px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
              style={{ background: '#00B4D8' }}
            >
              Enquire About a Group Cruise
            </a>
          </section>
        </div>
      </main>
    </MainLayout>
  )
}
