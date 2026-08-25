'use client'

import { useState } from 'react'
import { ShieldCheck, ExternalLink, MapPin, UserPlus, CheckCircle2, Loader2 } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { trustedPartners } from '@/lib/data/partners'

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

function BecomeAPartnerForm() {
  const [state, setState] = useState<SubmitState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    setErrorMessage('')

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const res = await fetch('/api/partners/apply', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMessage(data.error ?? 'Something went wrong. Please try again.')
        setState('error')
        return
      }

      setState('success')
      form.reset()
    } catch {
      setErrorMessage('Network error. Please try again.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#0A1628] mb-2">Application received</h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Thank you — your application is now pending review. TRoyGO™&apos;s team will check your
          submission and reach out if it&apos;s a fit. This is not yet a confirmed partnership.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-[#0A1628] mb-1.5" htmlFor="name">
            Name / Company *
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0A1628] mb-1.5" htmlFor="email">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0A1628] mb-1.5" htmlFor="specialization">
          Specialization *
        </label>
        <input
          id="specialization"
          name="specialization"
          required
          placeholder="e.g. Japan bespoke travel design, luxury small-group tours"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0A1628] mb-1.5" htmlFor="destinationsCovered">
          Destinations Covered *
        </label>
        <input
          id="destinationsCovered"
          name="destinationsCovered"
          required
          placeholder="e.g. Japan, South Korea"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0A1628] mb-1.5" htmlFor="credentials">
          Accreditations / Credentials
        </label>
        <input
          id="credentials"
          name="credentials"
          placeholder="e.g. IATA, ATAS, licensed operator since 2018"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0A1628] mb-1.5" htmlFor="message">
          Tell us about your travel packages
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0A1628] mb-1.5" htmlFor="document">
          Travel Packages Document (PDF or MD, max 4.5MB)
        </label>
        <input
          id="document"
          name="document"
          type="file"
          accept=".pdf,.md"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#00B4D8]/10 file:px-3 file:py-1.5 file:text-[#00B4D8] file:font-semibold"
        />
      </div>

      {state === 'error' && (
        <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-[#0A1628] text-white font-semibold px-6 py-3 text-sm hover:bg-[#152D55] transition-colors disabled:opacity-60"
      >
        {state === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
          </>
        ) : (
          'Submit Application'
        )}
      </button>

      <p className="text-xs text-gray-400 pt-2 border-t border-gray-200">
        Submissions are reviewed by TRoyGO™&apos;s team before any partnership is confirmed —
        this is not an automatic listing.
      </p>
    </form>
  )
}

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

          <section id="become-a-partner" className="pt-6">
            <div className="text-center mb-8">
              <UserPlus className="h-9 w-9 text-[#00B4D8] mx-auto mb-3" />
              <h2
                className="text-2xl font-bold text-[#0A1628] mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Become a TRoyGO™ Partner
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto text-sm">
                A destination expert or ground operator not listed above? Submit your details and
                travel packages — TRoyGO™&apos;s team reviews every application before it becomes
                a confirmed partnership.
              </p>
            </div>
            <BecomeAPartnerForm />
          </section>
        </div>
      </main>
    </MainLayout>
  )
}
