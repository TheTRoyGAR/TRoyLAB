'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, Send, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

type Status = 'idle' | 'sending' | 'sent' | 'error'

// Honest version: TRoyGO has no public directory of local agents yet, so this page does not list anyone,
// rate anyone or quote any prices. It takes a real request that lands in the agency inbox.
export default function AgentsPage() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', destination: '', dates: '', travelers: '', message: '' })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/agents/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, expertName: 'Local expert introduction' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) throw new Error(data.error || 'Something went wrong. Please email us instead.')
      setStatus('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please email us instead.')
      setStatus('error')
    }
  }

  const input =
    'w-full px-4 py-3 rounded-xl border border-gray-200 text-[#0A1628] text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40 bg-white'

  return (
    <MainLayout>
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div
          className="py-14 px-4 text-center"
          style={{ background: 'linear-gradient(135deg, #0A1628 0%, #152D55 60%, #00B4D8 100%)' }}
        >
          <Users className="h-12 w-12 text-[#FFD700] mx-auto mb-4" />
          <h1
            className="text-4xl sm:text-5xl font-black text-white mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Local Travel Experts
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            We&apos;re building a network of local agents, tour operators and guides. It isn&apos;t open yet, so we don&apos;t
            list anyone here. Tell us where you&apos;re going and our team will reply personally.
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          {/* How it works */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">How it works</h2>
            <ol className="space-y-3 text-gray-600 text-sm list-decimal list-inside">
              <li>Tell us your destination and what you&apos;d like help with.</li>
              <li>Our team reads your request and replies by email.</li>
              <li>If we can help, we&apos;ll say how. If we can&apos;t, we&apos;ll tell you honestly. No obligation.</li>
            </ol>
          </section>

          {/* Request form */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-[#0A1628] mb-1">Ask for a local expert introduction</h2>
            <p className="text-gray-500 text-sm mb-5">We use your details only to reply to this request.</p>

            {status === 'sent' ? (
              <div role="status" className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 p-4 text-green-800 text-sm">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>Thanks, your request has been received. Our team will reply to {form.email} by email.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-sm font-medium text-[#0A1628]">
                    Your name
                    <input required className={`${input} mt-1`} value={form.name} onChange={set('name')} autoComplete="name" />
                  </label>
                  <label className="block text-sm font-medium text-[#0A1628]">
                    Email
                    <input required type="email" className={`${input} mt-1`} value={form.email} onChange={set('email')} autoComplete="email" />
                  </label>
                </div>
                <label className="block text-sm font-medium text-[#0A1628]">
                  Where are you going?
                  <input required className={`${input} mt-1`} value={form.destination} onChange={set('destination')} placeholder="City or country" />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-sm font-medium text-[#0A1628]">
                    Travel dates (optional)
                    <input className={`${input} mt-1`} value={form.dates} onChange={set('dates')} placeholder="e.g. March 2027" />
                  </label>
                  <label className="block text-sm font-medium text-[#0A1628]">
                    Travellers (optional)
                    <input className={`${input} mt-1`} value={form.travelers} onChange={set('travelers')} placeholder="e.g. 2 adults" />
                  </label>
                </div>
                <label className="block text-sm font-medium text-[#0A1628]">
                  What would you like help with?
                  <textarea required rows={4} className={`${input} mt-1`} value={form.message} onChange={set('message')} />
                </label>

                {status === 'error' && (
                  <div role="alert" className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p>
                      {error} You can also write to{' '}
                      <a className="underline font-semibold" href="mailto:agency@troytravelagency.com">agency@troytravelagency.com</a>.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="inline-flex items-center gap-2 bg-[#0A1628] hover:bg-[#152D55] disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  <Send className="h-4 w-4" />
                  {status === 'sending' ? 'Sending…' : 'Send request'}
                </button>
              </form>
            )}
          </section>

          {/* For local experts */}
          <section className="rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #152D55 100%)' }}>
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Are you a local agent, operator or guide?</h2>
              <p className="text-white/60 text-sm">Tell us about your business and we&apos;ll be in touch.</p>
            </div>
            <Link
              href="/partners#become-a-partner"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFD700] to-[#E6C200] text-[#0A1628] font-bold px-6 py-3 rounded-xl whitespace-nowrap self-start sm:self-auto"
            >
              Partner with us
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </main>
    </MainLayout>
  )
}
