'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, Mail, ArrowRight, Map, Share2 } from 'lucide-react'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref') ?? 'TRG-XXXXXX'
  const status = searchParams.get('status') ?? 'pending'
  const packageName = searchParams.get('name') ?? 'Your Travel Package'

  const isConfirmed = status === 'confirmed'

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      {/* Banner */}
      <div
        className="w-full max-w-2xl rounded-3xl p-8 mb-6 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #102444 60%, #00B4D8 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #FFD700 0%, transparent 50%)' }} />
        <div className="relative z-10">
          <div className="text-5xl mb-4">{isConfirmed ? '🎉' : '⏳'}</div>
          <h1
            className="text-3xl sm:text-4xl font-black text-white mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {isConfirmed ? 'Booking Confirmed!' : 'Request Received!'}
          </h1>
          <p className="text-white/80 text-base mb-4">
            {isConfirmed
              ? 'Your trip has been confirmed. Get ready for an amazing journey!'
              : 'Your booking request is under review. Our expert will contact you within 24 hours.'}
          </p>

          {/* Booking reference */}
          <div className="inline-flex flex-col items-center bg-white/10 backdrop-blur rounded-2xl px-8 py-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">Booking Reference</span>
            <span className="text-2xl font-black text-[#FFD700] tracking-wider font-mono">{ref}</span>
          </div>
        </div>
      </div>

      {/* Status card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-md border border-gray-100 p-6 mb-5">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: isConfirmed ? '#10B98120' : '#F59E0B20' }}
          >
            {isConfirmed
              ? <CheckCircle2 className="h-5 w-5 text-green-600" />
              : <Clock className="h-5 w-5 text-amber-500" />
            }
          </div>
          <div>
            <p className="font-bold text-[#0A1628] text-sm">{packageName}</p>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isConfirmed ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {isConfirmed ? '✅ Confirmed' : '⏳ Pending Owner Review'}
            </span>
          </div>
        </div>

        {/* What's next */}
        <h3 className="font-bold text-[#0A1628] mb-4">What Happens Next</h3>
        <ol className="space-y-3">
          {[
            { step: 1, text: 'You\'ll receive a confirmation email at your registered address', done: true },
            { step: 2, text: 'Our travel expert reviews your trip details (within 24 hours)', done: isConfirmed },
            { step: 3, text: 'Once approved, your full itinerary will be sent to you', done: isConfirmed },
            { step: 4, text: 'A secure deposit payment link will be emailed to complete the booking', done: isConfirmed },
            { step: 5, text: 'Receive your travel documents 7 days before departure', done: false },
          ].map(({ step, text, done }) => (
            <li key={step} className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                done ? 'text-white' : 'border-2 border-gray-200 text-gray-400'
              }`} style={done ? { background: '#00B4D8' } : {}}>
                {done ? '✓' : step}
              </div>
              <p className={`text-sm ${done ? 'text-[#0A1628] font-medium' : 'text-gray-500'}`}>{text}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Contact + social */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 text-[#00B4D8]" />
            <span>Questions? Email us: </span>
            <a href="mailto:agency@troytravelagency.com" className="text-[#00B4D8] font-semibold hover:underline">
              agency@troytravelagency.com
            </a>
          </div>
          <div className="sm:ml-auto flex gap-2">
            <button
              onClick={() => {
                const shareData = { title: packageName, text: `My booking (${ref}) with TRoyGO — ${packageName}`, url: window.location.href }
                if (navigator.share) {
                  navigator.share(shareData).catch(() => {})
                } else {
                  navigator.clipboard.writeText(window.location.href)
                }
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#0A1628] border border-gray-200 px-3 py-2 rounded-xl hover:border-gray-300 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          </div>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-3">
        <Link
          href="/trip-planner"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90"
          style={{ background: '#00B4D8' }}
        >
          <Map className="h-4 w-4" /> Continue Planning
        </Link>
        <Link
          href="/packages"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm border-2 border-[#0A1628] text-[#0A1628] hover:bg-[#0A1628] hover:text-white transition-all"
        >
          Explore More Packages <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Follow us */}
      <p className="mt-8 text-sm text-gray-400 text-center">
        Follow us for travel inspiration:{' '}
        <a href="https://www.youtube.com/@TRoyGOtm" target="_blank" rel="noopener noreferrer" className="text-[#00B4D8] font-medium hover:underline">
          YouTube @TRoyGOtm
        </a>
        {' '}·{' '}
        <span className="text-[#0A1628] font-medium">@TRoy Travel Agency™</span> on all socials
      </p>
    </main>
  )
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
