'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

export default function ContactPage() {
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    setErrorMessage('')

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setErrorMessage(json.error ?? 'Something went wrong. Please try again.')
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

  return (
    <MainLayout>
      <div style={{ background: '#0A1628' }} className="text-white min-h-[70vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1
            className="text-3xl sm:text-4xl font-black mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFD700' }}
          >
            Contact Us
          </h1>
          <p className="text-white/60 mb-12 max-w-xl">
            Have a question about a trip, a booking, or want to talk to a real person? Send us
            a message and we'll get back to you.
          </p>

          <div className="grid md:grid-cols-5 gap-10">
            <div className="md:col-span-2 space-y-5">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#00B4D8' }} />
                <a href="mailto:agency@troytravelagency.com" className="text-white/80 hover:text-white">
                  agency@troytravelagency.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#00B4D8' }} />
                <a href="tel:+61422781807" className="text-white/80 hover:text-white">
                  +61 422 781 807
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#00B4D8' }} />
                <span className="text-white/80">University Drive North, Brinkin NT 0810, Australia</span>
              </div>
            </div>

            <div className="md:col-span-3">
              {state === 'success' ? (
                <div className="flex flex-col items-center text-center gap-3 py-12 bg-white/5 rounded-2xl">
                  <CheckCircle2 className="h-10 w-10" style={{ color: '#00B4D8' }} />
                  <p className="text-lg font-semibold">Message sent — thank you.</p>
                  <p className="text-white/60 text-sm">We'll be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-1.5" htmlFor="name">Your name</label>
                    <input
                      id="name" name="name" required
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1.5" htmlFor="email">Email</label>
                    <input
                      id="email" name="email" type="email" required
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1.5" htmlFor="message">Message</label>
                    <textarea
                      id="message" name="message" required rows={5}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 resize-none"
                      placeholder="How can we help?"
                    />
                  </div>
                  {state === 'error' && <p className="text-sm text-red-400">{errorMessage}</p>}
                  <button
                    type="submit"
                    disabled={state === 'submitting'}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold disabled:opacity-60"
                    style={{ background: '#FFD700', color: '#0A1628' }}
                  >
                    {state === 'submitting' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
