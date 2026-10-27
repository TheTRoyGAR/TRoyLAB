'use client'

import { useState } from 'react'
import { ShieldCheck, UserPlus, CheckCircle2, Loader2 } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import TurnstileWidget, { TURNSTILE_SITE_KEY } from '@/components/ui/TurnstileWidget'

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

function BecomeAPartnerForm() {
  const [state, setState] = useState<SubmitState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [captchaReset, setCaptchaReset] = useState(0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    setErrorMessage('')

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('turnstile', captcha)

    try {
      const res = await fetch('/api/partners/apply', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMessage(data.error ?? 'Something went wrong. Please try again.')
        setState('error')
        setCaptcha(''); setCaptchaReset((n) => n + 1)
        return
      }

      setState('success')
      form.reset()
    } catch {
      setErrorMessage('Network error. Please try again.')
      setState('error')
      setCaptcha(''); setCaptchaReset((n) => n + 1)
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
          <label className="block text-sm font-semibold text-[#0A1628] mb-1.5" htmlFor="organisation">
            Business or organisation name *
          </label>
          <input
            id="organisation"
            name="organisation"
            required
            autoComplete="organization"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
          />
          
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0A1628] mb-1.5" htmlFor="name">
            Contact person *
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
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
            required
            type="email" autoComplete="email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
          />
          
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0A1628] mb-1.5" htmlFor="country">
            Country you operate from *
          </label>
          <input
            id="country"
            name="country"
            required
            autoComplete="country-name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
          />
          
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0A1628] mb-1.5" htmlFor="website">
            Website
          </label>
          <input
            id="website"
            name="website"
            
            placeholder="https://example.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
          />
          
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0A1628] mb-1.5" htmlFor="registrationNumber">
            Business registration number
          </label>
          <input
            id="registrationNumber"
            name="registrationNumber"
            
            placeholder="ABN if Australian, or your local company number"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
          />
          <p className="mt-1 text-xs text-gray-500">Helps us verify you. Australian businesses: your ABN.</p>
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

      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" name="consent" required className="w-5 h-5 mt-0.5 rounded shrink-0" style={{ accentColor: '#00B4D8' }} />
        <span className="text-sm text-gray-600">
          I confirm the details above are accurate and that I am authorised to offer these services and packages.
          I understand TRoyGO™ reviews every application and that applying does not create a partnership.
        </span>
      </label>

      <TurnstileWidget onToken={setCaptcha} resetKey={captchaReset} />

      {state === 'error' && (
        <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={state === 'submitting' || (!!TURNSTILE_SITE_KEY && !captcha)}
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
            Partner with TRoyGO™
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Local tour operators, travel agencies, destination companies and guides, big and small, from anywhere in
            the world: tell us about your business and your packages.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-14 space-y-14">
          <section id="registered-with">
            <h2
              className="text-2xl font-bold text-[#0A1628] mb-6 text-center"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Registered with
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#0A1628] mb-2">Duffel</h3>
                <p className="text-sm text-gray-700">
                  Flight search and booking technology. TROYGO holds a live Duffel account, and the flights you
                  search on TRoyGO™ come from Duffel.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#0A1628] mb-2">Jetstar</h3>
                <p className="text-sm text-gray-700">
                  TROYGO is registered with Jetstar as a travel agent. Jetstar fares are not yet bookable on
                  TRoyGO™; we are working on this with Jetstar and Duffel.
                </p>
              </div>
            </div>
          </section>

          <section id="become-a-partner">
            <div className="text-center mb-8">
              <UserPlus className="h-9 w-9 text-[#00B4D8] mx-auto mb-3" />
              <h2
                className="text-2xl font-bold text-[#0A1628] mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Become a TRoyGO™ Partner
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto text-sm">
                Submit your details and travel packages. TRoyGO™&apos;s team reviews every application by hand, and
                applying does not create a partnership.
              </p>
            </div>
            <BecomeAPartnerForm />
          </section>
        </div>
      </main>
    </MainLayout>
  )
}
