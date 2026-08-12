'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plane,
  Hotel,
  Car,
  ChevronRight,
  Shield,
  Wifi,
  MapPin,
  Smartphone,
  ArrowUpCircle,
  CreditCard,
  Lock,
  Tag,
  CheckCircle,
  PartyPopper,
  Copy,
  ExternalLink,
  ChevronLeft,
  User,
  Calendar,
  Globe,
  Phone,
  Mail,
  AlertCircle,
  Package,
  Ship,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { sampleFlights } from '@/lib/data/flights'
import { sampleHotels } from '@/lib/data/hotels'
import { travelPackages, cruises } from '@/lib/data/packages'
import { carRentals } from '@/app/cars/page'
import BookingSteps, { type StepId } from '@/components/booking/BookingSteps'
import MainLayout from '@/components/layout/MainLayout'

/* ─── Types ───────────────────────────────────────────────────────────────── */
interface TravelerInfo {
  firstName: string
  lastName: string
  dob: string
  passport: string
  nationality: string
  email: string
  phone: string
}

interface AddOn {
  id: string
  name: string
  description: string
  price: number
  icon: React.ElementType
  selected: boolean
}

function emptyTraveler(): TravelerInfo {
  return { firstName: '', lastName: '', dob: '', passport: '', nationality: '', email: '', phone: '' }
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function generateRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'TRG-'
  for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

function getBookingItem(type: string | null, id: string | null, cls: string | null) {
  if (type === 'flight') {
    const f = sampleFlights.find((x) => x.id === id)
    if (!f) return null
    const cabin = (cls as 'economy' | 'business' | 'first') ?? 'economy'
    return {
      type: 'flight' as const,
      data: f,
      cabin,
      price: f.price[cabin],
      label: `${f.airline} ${f.flightNumber}`,
      subtitle: `${f.from.city} (${f.from.code}) → ${f.to.city} (${f.to.code})`,
      date: f.departure,
      icon: Plane,
    }
  }
  if (type === 'hotel') {
    const h = sampleHotels.find((x) => x.id === id)
    if (!h) return null
    return {
      type: 'hotel' as const,
      data: h,
      cabin: null,
      price: h.pricePerNight,
      label: h.name,
      subtitle: `${h.location.city}, ${h.location.country}`,
      date: null,
      icon: Hotel,
    }
  }
  if (type === 'package') {
    const p = travelPackages.find((x) => String(x.id) === id)
    if (!p) return null
    return {
      type: 'package' as const,
      data: p,
      cabin: null,
      price: p.price,
      label: p.name,
      subtitle: p.countries.join(', '),
      date: p.departureDates[0] ?? null,
      icon: Package,
    }
  }
  if (type === 'car') {
    const c = carRentals.find((x) => x.id === id)
    if (!c) return null
    return {
      type: 'car' as const,
      data: c,
      cabin: null,
      price: c.pricePerDay,
      label: `${c.name} (${c.model})`,
      subtitle: `${c.type} · ${c.supplier}`,
      date: null,
      icon: Car,
    }
  }
  if (type === 'cruise') {
    const cr = cruises.find((x) => String(x.id) === id)
    if (!cr) return null
    return {
      type: 'cruise' as const,
      data: cr,
      cabin: null,
      price: cr.price,
      label: cr.name,
      subtitle: `${cr.ship} · ${cr.cruiseLine}`,
      date: null,
      icon: Ship,
    }
  }
  // Default: sample flight for demo
  const f = sampleFlights[0]
  return {
    type: 'flight' as const,
    data: f,
    cabin: 'economy' as const,
    price: f.price.economy,
    label: `${f.airline} ${f.flightNumber}`,
    subtitle: `${f.from.city} (${f.from.code}) → ${f.to.city} (${f.to.code})`,
    date: f.departure,
    icon: Plane,
  }
}

/* ─── Step 1: Review ──────────────────────────────────────────────────────── */
function StepReview({
  item,
  passengers,
  onNext,
}: {
  item: NonNullable<ReturnType<typeof getBookingItem>>
  passengers: number
  onNext: () => void
}) {
  const Icon = item.icon
  const subtotal = item.price * passengers
  const taxes = Math.round(subtotal * 0.12)
  const fees = 25
  const total = subtotal + taxes + fees

  return (
    <div className="space-y-6">
      {/* Item card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-navy mb-4">Your Selection</h2>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: '#00B4D8' }}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-navy text-lg">{item.label}</p>
            <p className="text-slate-500 text-sm">{item.subtitle}</p>
            {item.cabin && (
              <span className="inline-block mt-1 text-xs font-semibold capitalize bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {item.cabin} class
              </span>
            )}
            {item.date && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(item.date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-black text-navy">${item.price.toLocaleString()}</p>
            <p className="text-xs text-slate-400">per person</p>
          </div>
        </div>
      </div>

      {/* Passengers / dates / travelers */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-navy mb-4">Trip Summary</h2>
        <dl className="space-y-3">
          <div className="flex justify-between text-sm">
            <dt className="text-slate-500">Travelers</dt>
            <dd className="font-semibold text-navy">{passengers} passenger{passengers > 1 ? 's' : ''}</dd>
          </div>
          {item.type === 'flight' && (
            <>
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">Aircraft</dt>
                <dd className="font-medium text-navy">{(item.data as typeof sampleFlights[0]).aircraft}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">Duration</dt>
                <dd className="font-medium text-navy">{(item.data as typeof sampleFlights[0]).duration}</dd>
              </div>
            </>
          )}
          {item.type === 'hotel' && (
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Stars</dt>
              <dd className="font-medium text-navy">{'★'.repeat((item.data as typeof sampleHotels[0]).stars)}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Price breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-navy mb-4">Price Breakdown</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">${item.price.toLocaleString()} × {passengers} traveler{passengers > 1 ? 's' : ''}</span>
            <span className="font-semibold">${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Taxes & fees (12%)</span>
            <span className="font-semibold">${taxes.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Service fee</span>
            <span className="font-semibold">${fees}</span>
          </div>
          <div className="border-t border-slate-100 pt-3 flex justify-between">
            <span className="font-bold text-navy">Total</span>
            <span className="font-black text-navy text-xl">${total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <button onClick={onNext} className="w-full py-4 rounded-xl font-bold text-white text-base shadow-lg hover:brightness-110 transition-all" style={{ background: '#00B4D8' }}>
        Continue to Traveler Details
      </button>
    </div>
  )
}

/* ─── Step 2: Traveler Details ────────────────────────────────────────────── */
function StepTravelerDetails({
  passengers,
  travelers,
  setTravelers,
  onNext,
  onBack,
}: {
  passengers: number
  travelers: TravelerInfo[]
  setTravelers: (v: TravelerInfo[]) => void
  onNext: () => void
  onBack: () => void
}) {
  function update(idx: number, field: keyof TravelerInfo, value: string) {
    const next = [...travelers]
    next[idx] = { ...next[idx], [field]: value }
    setTravelers(next)
  }

  function validate() {
    const lead = travelers[0]
    return lead.firstName && lead.lastName && lead.email && lead.phone
  }

  return (
    <div className="space-y-6">
      {travelers.map((t, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-navy mb-5 flex items-center gap-2">
            <User className="h-5 w-5" style={{ color: '#00B4D8' }} />
            {idx === 0 ? 'Lead Traveler' : `Co-Traveler ${idx + 1}`}
            {idx === 0 && <span className="text-xs font-semibold text-red-500 ml-1">* Required</span>}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                First Name {idx === 0 && '*'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-navy focus:outline-none focus:border-teal transition-colors"
                  value={t.firstName}
                  onChange={(e) => update(idx, 'firstName', e.target.value)}
                  placeholder="John"
                  style={{ '--tw-ring-color': '#00B4D8' } as React.CSSProperties}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#00B4D8')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '')}
                />
              </div>
            </div>

            {/* Last name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Last Name {idx === 0 && '*'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-navy focus:outline-none transition-colors"
                  value={t.lastName}
                  onChange={(e) => update(idx, 'lastName', e.target.value)}
                  placeholder="Smith"
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#00B4D8')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '')}
                />
              </div>
            </div>

            {/* DOB */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-navy focus:outline-none transition-colors"
                  value={t.dob}
                  onChange={(e) => update(idx, 'dob', e.target.value)}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#00B4D8')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '')}
                />
              </div>
            </div>

            {/* Passport */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Passport Number
              </label>
              <input
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-navy font-mono focus:outline-none transition-colors uppercase"
                value={t.passport}
                onChange={(e) => update(idx, 'passport', e.target.value.toUpperCase())}
                placeholder="A12345678"
                onFocus={(e) => (e.currentTarget.style.borderColor = '#00B4D8')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '')}
              />
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Nationality
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-navy focus:outline-none transition-colors"
                  value={t.nationality}
                  onChange={(e) => update(idx, 'nationality', e.target.value)}
                  placeholder="American"
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#00B4D8')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '')}
                />
              </div>
            </div>

            {/* Email (lead only) */}
            {idx === 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-navy focus:outline-none transition-colors"
                    value={t.email}
                    onChange={(e) => update(idx, 'email', e.target.value)}
                    placeholder="john@example.com"
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#00B4D8')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '')}
                  />
                </div>
              </div>
            )}

            {/* Phone (lead only) */}
            {idx === 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-navy focus:outline-none transition-colors"
                    value={t.phone}
                    onChange={(e) => update(idx, 'phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#00B4D8')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '')}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={() => { if (validate()) onNext() }}
          disabled={!validate()}
          className="flex-1 py-3 rounded-xl font-bold text-white text-base shadow-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: '#00B4D8' }}
        >
          Continue to Add-ons
        </button>
      </div>
    </div>
  )
}

/* ─── Step 3: Add-ons ─────────────────────────────────────────────────────── */
function StepAddOns({
  addOns,
  setAddOns,
  isFlightBooking,
  onNext,
  onBack,
}: {
  addOns: AddOn[]
  setAddOns: (v: AddOn[]) => void
  isFlightBooking: boolean
  onNext: () => void
  onBack: () => void
}) {
  function toggle(id: string) {
    setAddOns(addOns.map((a) => (a.id === id ? { ...a, selected: !a.selected } : a)))
  }

  const selected = addOns.filter((a) => a.selected)
  const total = selected.reduce((s, a) => s + a.price, 0)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-navy mb-2">Enhance Your Trip</h2>
        <p className="text-sm text-slate-500 mb-5">Optional extras to make your journey more comfortable.</p>

        <div className="space-y-3">
          {addOns.map((addOn) => {
            const Icon = addOn.icon
            return (
              <label
                key={addOn.id}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                  addOn.selected ? 'border-teal bg-teal/5' : 'border-slate-100 hover:border-slate-200 bg-white'
                )}
                style={addOn.selected ? { borderColor: '#00B4D8', background: 'rgba(0,180,216,0.04)' } : {}}
              >
                <div className="flex-1 flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: addOn.selected ? '#00B4D8' : '#f1f5f9', color: addOn.selected ? '#fff' : '#94a3b8' }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-sm">{addOn.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{addOn.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-navy">+${addOn.price}</span>
                  <input
                    type="checkbox"
                    checked={addOn.selected}
                    onChange={() => toggle(addOn.id)}
                    className="w-5 h-5 rounded"
                    style={{ accentColor: '#00B4D8' }}
                  />
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="bg-teal/10 rounded-xl p-4 flex items-center justify-between" style={{ background: 'rgba(0,180,216,0.08)' }}>
          <p className="text-sm font-semibold text-navy">{selected.length} add-on{selected.length > 1 ? 's' : ''} selected</p>
          <p className="font-bold text-navy">+${total}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl font-bold text-white text-base shadow-lg hover:brightness-110 transition-all"
          style={{ background: '#00B4D8' }}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  )
}

/* ─── Step 4: Payment ─────────────────────────────────────────────────────── */
function StepPayment({
  total,
  onNext,
  onBack,
  isSubmitting,
}: {
  total: number
  onNext: () => void
  onBack: () => void
  isSubmitting: boolean
}) {
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [promo, setPromo] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null)

  function formatCard(val: string) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }
  function formatExpiry(val: string) {
    const v = val.replace(/\D/g, '').slice(0, 4)
    return v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v
  }

  function applyPromo() {
    if (promo.toUpperCase() === 'TROY10') {
      setPromoDiscount(Math.round(total * 0.1))
      setPromoApplied(true)
    } else if (promo.toUpperCase() === 'WELCOME') {
      setPromoDiscount(50)
      setPromoApplied(true)
    } else {
      setPromoApplied(false)
      setPromoDiscount(0)
    }
  }

  const finalTotal = total - promoDiscount

  const isValid = cardNumber.replace(/\s/g, '').length === 16 && cardName && expiry.length === 5 && cvv.length >= 3 && agreedTerms

  return (
    <>
    <div className="space-y-6">
      {/* Card form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-navy mb-5 flex items-center gap-2">
          <CreditCard className="h-5 w-5" style={{ color: '#00B4D8' }} />
          Payment Details
        </h2>

        {/* Visual card preview */}
        <div
          className="rounded-2xl p-5 mb-6 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0A1628 0%, #152D55 50%, #00B4D8 100%)', minHeight: 160 }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white translate-x-8 -translate-y-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white -translate-x-6 translate-y-6" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <span className="text-xs font-semibold tracking-widest opacity-70">TRoyGO™ TRAVEL</span>
              <CreditCard className="h-6 w-6 opacity-60" />
            </div>
            <p className="text-lg font-mono tracking-widest mb-4">
              {cardNumber || '•••• •••• •••• ••••'}
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs opacity-60 uppercase tracking-wide">Cardholder</p>
                <p className="font-semibold">{cardName || 'YOUR NAME'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-60 uppercase tracking-wide">Expires</p>
                <p className="font-semibold">{expiry || 'MM/YY'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Card Number</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono text-navy focus:outline-none transition-colors"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCard(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#00B4D8')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '')}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Cardholder Name</label>
            <input
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-navy focus:outline-none transition-colors"
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              placeholder="JOHN SMITH"
              onFocus={(e) => (e.currentTarget.style.borderColor = '#00B4D8')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Expiry Date</label>
            <input
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono text-navy focus:outline-none transition-colors"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY"
              maxLength={5}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#00B4D8')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">CVV</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono text-navy focus:outline-none transition-colors"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="•••"
                maxLength={4}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#00B4D8')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '')}
              />
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
          <Lock className="h-3 w-3" />
          Your payment details are encrypted and secure. This is a demo form — no actual charge will be made.
        </p>
      </div>

      {/* Promo code */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-navy mb-3 flex items-center gap-2">
          <Tag className="h-4 w-4" style={{ color: '#FFD700' }} />
          Promo Code
        </h3>
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono text-navy focus:outline-none transition-colors uppercase"
            value={promo}
            onChange={(e) => { setPromo(e.target.value); setPromoApplied(false); setPromoDiscount(0) }}
            placeholder="Enter code (try TROY10)"
            onFocus={(e) => (e.currentTarget.style.borderColor = '#00B4D8')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '')}
          />
          <button
            onClick={applyPromo}
            className="px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110"
            style={{ background: '#FFD700', color: '#0A1628' }}
          >
            Apply
          </button>
        </div>
        {promoApplied && (
          <p className="mt-2 text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4" />
            Promo applied! You save ${promoDiscount}.
          </p>
        )}
      </div>

      {/* Price summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-navy mb-4">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-semibold">${total.toLocaleString()}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-600">Promo discount</span>
              <span className="font-semibold text-emerald-600">−${promoDiscount}</span>
            </div>
          )}
          <div className="border-t border-slate-100 pt-2 flex justify-between">
            <span className="font-bold text-navy">Total Due Today</span>
            <span className="font-black text-navy text-xl">${finalTotal.toLocaleString()}</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3" />
          This booking requires owner approval. A deposit link will be sent once confirmed.
        </p>
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={agreedTerms}
          onChange={(e) => setAgreedTerms(e.target.checked)}
          className="w-5 h-5 mt-0.5 rounded shrink-0"
          style={{ accentColor: '#00B4D8' }}
        />
        <span className="text-sm text-slate-600">
          I agree to the{' '}
          <button type="button" onClick={() => setNoticeMessage("Terms & Conditions page isn't built yet.")} className="underline hover:no-underline" style={{ color: '#00B4D8' }}>Terms & Conditions</button>
          {' '}and{' '}
          <button type="button" onClick={() => setNoticeMessage("Privacy Policy page isn't built yet.")} className="underline hover:no-underline" style={{ color: '#00B4D8' }}>Privacy Policy</button>
          . I understand this is a booking inquiry that requires approval.
        </span>
      </label>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid || isSubmitting}
          className="flex-1 py-3 rounded-xl font-bold text-white text-base shadow-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: '#00B4D8' }}
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Submit Booking Request
            </>
          )}
        </button>
      </div>
    </div>

    {/* Lightweight notice for not-yet-built pages */}
    {noticeMessage && (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <p className="text-sm text-gray-600 mb-5">{noticeMessage}</p>
          <button
            onClick={() => setNoticeMessage(null)}
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-white"
            style={{ background: '#0A1628' }}
          >
            Got it
          </button>
        </div>
      </div>
    )}
    </>
  )
}

/* ─── Step 5: Confirmation Pending ────────────────────────────────────────── */
function StepConfirmationPending({
  bookingRef,
  item,
  travelers,
}: {
  bookingRef: string
  item: NonNullable<ReturnType<typeof getBookingItem>>
  travelers: TravelerInfo[]
}) {
  const [copied, setCopied] = useState(false)
  const Icon = item.icon

  function copyRef() {
    navigator.clipboard.writeText(bookingRef)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Thank you banner */}
      <div
        className="rounded-2xl p-8 text-center text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #00B4D8 100%)' }}
      >
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl font-black mb-2">Booking Request Received!</h2>
        <p className="text-white/80 max-w-md mx-auto">
          Our travel expert will review your booking and contact you within 24 hours. You'll receive a confirmation email once approved.
        </p>
        <div className="mt-5 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide">Booking Reference</p>
            <p className="text-xl font-black tracking-widest">{bookingRef}</p>
          </div>
          <button
            onClick={copyRef}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Copy reference"
          >
            {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <AlertCircle className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <p className="font-bold text-amber-800">Pending Owner Review</p>
          <p className="text-sm text-amber-700">Troy will personally review your booking and reach out within 24 hours.</p>
        </div>
        <span className="ml-auto shrink-0 text-xs font-bold text-amber-700 bg-amber-200 px-3 py-1.5 rounded-full">
          PENDING
        </span>
      </div>

      {/* Booking summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-navy mb-4">Booking Summary</h3>
        <div className="flex items-start gap-3 pb-4 border-b border-slate-100 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: '#00B4D8' }}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-navy">{item.label}</p>
            <p className="text-sm text-slate-500">{item.subtitle}</p>
          </div>
        </div>
        <dl className="space-y-2">
          <div className="flex justify-between text-sm">
            <dt className="text-slate-500">Lead Traveler</dt>
            <dd className="font-semibold text-navy">{travelers[0]?.firstName} {travelers[0]?.lastName}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-semibold text-navy">{travelers[0]?.email}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-slate-500">Status</dt>
            <dd>
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending Review</span>
            </dd>
          </div>
        </dl>
      </div>

      {/* What's next */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-navy mb-5">What Happens Next?</h3>
        <div className="space-y-4">
          {[
            { step: 1, text: "You'll receive a booking acknowledgment email within the next few minutes." },
            { step: 2, text: "Our travel expert Troy will personally review your trip details." },
            { step: 3, text: "Once approved, you'll receive your full itinerary and documentation." },
            { step: 4, text: "A secure deposit payment link will be sent to complete your booking." },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                style={{ background: '#00B4D8' }}
              >
                {item.step}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed pt-0.5">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-navy rounded-2xl p-5 text-center" style={{ background: '#0A1628' }}>
        <p className="text-white/70 text-sm mb-1">Questions? Contact us directly:</p>
        <a href="mailto:troytravelagency@gmail.com" className="font-bold text-white text-sm hover:underline" style={{ color: '#00B4D8' }}>
          troytravelagency@gmail.com
        </a>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="flex-1 py-3 text-center rounded-xl font-bold text-sm text-white transition-all hover:brightness-110"
          style={{ background: '#00B4D8' }}
        >
          Continue Planning
        </Link>
        <Link
          href={`/booking/confirmation?ref=${bookingRef}`}
          className="flex-1 py-3 text-center rounded-xl font-bold text-sm border border-slate-200 text-navy hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
        >
          View My Booking <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
function BookingContent() {
  const params = useSearchParams()
  const router = useRouter()

  const type = params.get('type')
  const id = params.get('id')
  const cls = params.get('class')
  // PackageDetailClient's "Book Now" links send `travelers=`, flights/hotels
  // send `passengers=` — accept either so a package booking isn't silently
  // stuck at 1 traveler regardless of what was picked on the previous page.
  const passengersParam = Number(params.get('passengers') ?? params.get('travelers') ?? 1)

  const item = getBookingItem(type, id, cls)

  const [step, setStep] = useState<StepId>(1)
  const [travelers, setTravelers] = useState<TravelerInfo[]>(
    Array.from({ length: Math.max(1, passengersParam) }, emptyTraveler)
  )
  const [addOns, setAddOns] = useState<AddOn[]>([
    { id: 'insurance', name: 'Travel Insurance', description: 'Comprehensive coverage: medical, cancellation, lost baggage.', price: 89, icon: Shield, selected: false },
    { id: 'transfer', name: 'Airport Transfer', description: 'Private car transfer to/from the airport at your destination.', price: 65, icon: Car, selected: false },
    { id: 'sim', name: 'International SIM Card', description: '10GB data + calls in 80+ countries, delivered to your door.', price: 29, icon: Smartphone, selected: false },
    { id: 'wifi', name: 'Pocket Wi-Fi Device', description: 'Unlimited data portable Wi-Fi device, up to 10 devices.', price: 45, icon: Wifi, selected: false },
    ...(type === 'flight' ? [
      { id: 'seat', name: 'Seat Upgrade', description: 'Priority seating with extra legroom and preferred location.', price: 55, icon: ArrowUpCircle, selected: false },
    ] : []),
  ])
  const [bookingRef, setBookingRef] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const basePrice = item ? item.price * Math.max(1, passengersParam) : 0
  const taxes = Math.round(basePrice * 0.12)
  const fees = 25
  const addOnTotal = addOns.filter((a) => a.selected).reduce((s, a) => s + a.price, 0)
  const grandTotal = basePrice + taxes + fees + addOnTotal

  async function handlePaymentSubmit() {
    setIsSubmitting(true)
    try {
      const ref = generateRef()
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingRef: ref,
          type,
          itemId: id,
          travelers,
          addOns: addOns.filter((a) => a.selected).map((a) => a.name),
          totalAmount: grandTotal,
          cabinClass: cls,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setBookingRef(data.bookingRef ?? ref)
        setStep(5)
      }
    } catch {
      // Still advance even on network error in demo
      setBookingRef(generateRef())
      setStep(5)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!item) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-bold text-navy mb-2">No booking item selected</p>
            <Link href="/flights" className="text-teal hover:underline" style={{ color: '#00B4D8' }}>
              Browse Flights
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="py-6 px-4 md:px-8" style={{ background: '#0A1628' }}>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">Booking</span>
            </div>
            <h1 className="text-xl font-bold text-white mb-6">Complete Your Booking</h1>
            <BookingSteps
              currentStep={step}
              onStepClick={(s) => { if (s < step) setStep(s) }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
          {step === 1 && (
            <StepReview
              item={item}
              passengers={Math.max(1, passengersParam)}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepTravelerDetails
              passengers={Math.max(1, passengersParam)}
              travelers={travelers}
              setTravelers={setTravelers}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepAddOns
              addOns={addOns}
              setAddOns={setAddOns}
              isFlightBooking={type === 'flight'}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <StepPayment
              total={grandTotal}
              onNext={handlePaymentSubmit}
              onBack={() => setStep(3)}
              isSubmitting={isSubmitting}
            />
          )}
          {step === 5 && (
            <StepConfirmationPending
              bookingRef={bookingRef}
              item={item}
              travelers={travelers}
            />
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default function BookingPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>}><BookingContent /></Suspense>
}
