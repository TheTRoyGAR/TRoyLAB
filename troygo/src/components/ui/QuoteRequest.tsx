'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import TurnstileWidget, { TURNSTILE_SITE_KEY } from '@/components/ui/TurnstileWidget'

export type QuoteKind = 'cruise' | 'package' | 'hotel' | 'car' | 'flight' | 'other'

interface Props {
  kind: QuoteKind
  itemName: string
  /** Prefilled, editable. */
  dates?: string
  travelers?: string
  label?: string
  className?: string
  style?: React.CSSProperties
}

const input =
  'w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-[15px] text-slate-900 placeholder-slate-400 ' +
  'focus:outline-none focus:border-[#0077b6] focus:ring-2 focus:ring-[#00B4D8]/30'

// A button that opens a short quote form. Needs no account. Sends to /api/quote
// (captcha + validation + limits server-side) and shows a real success or error.
export default function QuoteRequestButton({
  kind, itemName, dates = '', travelers = '', label = 'Request a Quote', className, style,
}: Props) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [captchaReset, setCaptchaReset] = useState(0)
  const [form, setForm] = useState({ name: '', email: '', phone: '', dates, travelers, message: '' })
  const firstField = useRef<HTMLInputElement>(null)
  const opener = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    firstField.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        opener.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  function close() {
    setOpen(false)
    opener.current?.focus()
  }

  function openDialog() {
    // Pick up the latest prefilled dates/travellers each time it opens.
    setForm((f) => ({ ...f, dates: f.dates || dates, travelers: f.travelers || travelers }))
    if (state === 'done') setState('idle')
    setOpen(true)
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, kind, itemName, turnstile: captcha }),
      })
      if (res.ok) {
        setState('done')
        return
      }
      let msg =
        'We could not send your request. Nothing has been submitted. Please try again, or email agency@troytravelagency.com.'
      try {
        const j = await res.json()
        if (j && typeof j.error === 'string' && res.status < 500) msg = j.error
      } catch {
        /* keep the default message */
      }
      setError(msg)
      setState('error')
      setCaptcha('')
      setCaptchaReset((n) => n + 1)
    } catch {
      setError('We could not reach our server. Nothing has been submitted. Please check your connection and try again.')
      setState('error')
      setCaptcha('')
      setCaptchaReset((n) => n + 1)
    }
  }

  return (
    <>
      <button ref={opener} type="button" onClick={openDialog} className={className} style={style}>
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close()
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-title"
            className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-100">
              <div>
                <h2 id="quote-title" className="text-lg font-bold text-[#0A1628]">Request a quote</h2>
                <p className="text-sm text-slate-500 mt-0.5">{itemName}</p>
              </div>
              <button type="button" onClick={close} aria-label="Close" className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {state === 'done' ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-lg font-bold text-[#0A1628] mb-1">Request received</p>
                <p className="text-sm text-slate-600 mb-5">
                  We will reply by email with a confirmed price and availability. You do not need to pay anything now.
                </p>
                <button type="button" onClick={close} className="px-6 py-2.5 rounded-xl bg-[#0077b6] text-white font-semibold hover:bg-[#006399]">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="p-5 pb-24 sm:pb-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-sm font-medium text-[#0A1628]">
                    Your name
                    <input ref={firstField} required maxLength={80} autoComplete="name" className={`${input} mt-1`} value={form.name} onChange={set('name')} />
                  </label>
                  <label className="block text-sm font-medium text-[#0A1628]">
                    Email
                    <input required type="email" maxLength={254} autoComplete="email" className={`${input} mt-1`} value={form.email} onChange={set('email')} />
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-sm font-medium text-[#0A1628]">
                    Preferred dates <span className="text-slate-400 font-normal">(optional)</span>
                    <input maxLength={120} className={`${input} mt-1`} value={form.dates} onChange={set('dates')} placeholder="e.g. March 2027" />
                  </label>
                  <label className="block text-sm font-medium text-[#0A1628]">
                    Travellers <span className="text-slate-400 font-normal">(optional)</span>
                    <input maxLength={60} className={`${input} mt-1`} value={form.travelers} onChange={set('travelers')} placeholder="e.g. 2 adults" />
                  </label>
                </div>
                <label className="block text-sm font-medium text-[#0A1628]">
                  Phone / WhatsApp <span className="text-slate-400 font-normal">(optional)</span>
                  <input maxLength={40} type="tel" autoComplete="tel" className={`${input} mt-1`} value={form.phone} onChange={set('phone')} />
                </label>
                <label className="block text-sm font-medium text-[#0A1628]">
                  Anything we should know <span className="text-slate-400 font-normal">(optional)</span>
                  <textarea rows={3} maxLength={2000} className={`${input} mt-1`} value={form.message} onChange={set('message')} />
                </label>

                <TurnstileWidget onToken={setCaptcha} resetKey={captchaReset} />

                {state === 'error' && (
                  <div role="alert" className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-3 text-red-800 text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={state === 'sending' || (!!TURNSTILE_SITE_KEY && !captcha)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#0077b6] hover:bg-[#006399] disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  <Send className="h-4 w-4" />
                  {state === 'sending' ? 'Sending…' : 'Send request'}
                </button>
                <p className="text-xs text-slate-500 text-center">We reply personally. No payment is taken at this step.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
