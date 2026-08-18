'use client'

import { ShieldCheck, ExternalLink, MapPin } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { trustedPartners } from '@/lib/data/partners'

export default function PartnersPage() {
  const byCountry = trustedPartners.reduce<Record<string, typeof trustedPartners>>((acc, p) => {
    (acc[p.country] ??= []).push(p)
    return acc
  }, {})

  return (
    <MainLayout>
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div
          className="py-14 px-4 text-center"
          style={{ background: 'linear-gradient(135deg, #0A1628 0%, #152D55 60%, #00B4D8 100%)' }}
        >
          <ShieldCheck className="h-12 w-12 text-[#FFD700] mx-auto mb-4" />
          <h1
            className="text-4xl sm:text-5xl font-black text-white mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Trusted Local Partners
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Independent, real ground operators and destination management companies TRoyGO™ works with
            for local expertise — not our own staff, but vetted specialists on the ground.
          </p>
          <p className="text-white/50 max-w-2xl mx-auto text-sm mt-3">
            TRoyGO™ is Darwin, Northern Territory based — the Top End operators below aren't just
            another researched region for us, they're our own backyard.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-14 space-y-14">
          {Object.entries(byCountry).map(([country, partners]) => (
            <section key={country}>
              <h2
                className="text-2xl font-bold text-[#0A1628] mb-6 flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                <MapPin className="h-5 w-5 text-[#00B4D8]" />
                {country}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {partners.map((p) => (
                  <a
                    key={p.name}
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-[#0A1628]">{p.name}</h3>
                      <ExternalLink className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Covers: {p.destinationsCovered.join(', ')}
                    </p>
                    <p className="text-sm text-gray-700 mb-3">{p.description}</p>
                    {p.accreditations && p.accreditations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.accreditations.map((a) => (
                          <span
                            key={a}
                            className="text-[10px] font-semibold text-[#00B4D8] bg-[#00B4D8]/10 px-2 py-1 rounded-full"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </section>
          ))}

          <p className="text-xs text-gray-400 text-center pt-6 border-t border-gray-200">
            Listed as independent reference partners based on public reputation and accreditation.
            Not yet a confirmed commercial partnership with TRoyGO™ unless stated otherwise.
          </p>
        </div>
      </main>
    </MainLayout>
  )
}
