'use client'

import { type TravelPackage } from '@/lib/data/packages'
import { useState } from 'react'
import Link from 'next/link'
import {
  Star, Clock, Users, MapPin, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Plane, Building2, Utensils,
  ArrowLeft, Calendar, Share2, Heart
} from 'lucide-react'
import { format } from 'date-fns'

const TABS = ['Overview', 'Itinerary', 'Inclusions', 'Reviews', 'Booking'] as const
type Tab = typeof TABS[number]

export default function PackageDetailClient({ pkg }: { pkg: TravelPackage }) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [openDay, setOpenDay] = useState<number | null>(1)
  const [travelers, setTravelers] = useState(2)
  const [selectedDate, setSelectedDate] = useState(pkg.departureDates[0] ?? '')
  const [saved, setSaved] = useState(false)

  const includesList = Object.entries(pkg.includes)
    .filter(([, v]) => v)
    .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))

  const excludesList = ['Visa fees', 'Personal expenses', 'Optional activities', 'Travel insurance']

  const totalPrice = pkg.price * travelers

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Back nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <Link href="/packages" className="inline-flex items-center gap-1.5 text-sm text-[#00B4D8] hover:underline font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Packages
        </Link>
      </div>

      {/* Hero */}
      <div className={`w-full h-72 sm:h-96 bg-gradient-to-br ${pkg.imageGradient} relative`}>
        <div className="absolute inset-0 bg-black/30 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-white/80 bg-white/20 px-3 py-1 rounded-full mb-3 inline-block">
              {pkg.category}
            </span>
            <h1
              className="text-3xl sm:text-4xl font-black text-white mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {pkg.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{pkg.countries.join(', ')}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{pkg.duration} Days</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" />Max {pkg.maxGroupSize}</span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-[#FFD700] text-[#FFD700]" />
                {pkg.rating} ({pkg.reviewCount.toLocaleString()} reviews)
              </span>
            </div>
          </div>
        </div>
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={() => setSaved(!saved)} className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <Heart className={`h-5 w-5 ${saved ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: pkg.name, url: window.location.href }).catch(() => {})
              } else {
                navigator.clipboard.writeText(window.location.href)
              }
            }}
            className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Share2 className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="flex gap-0 border-b border-gray-200 mb-6 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-[#00B4D8] text-[#00B4D8]'
                      : 'border-transparent text-gray-500 hover:text-[#0A1628]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview */}
            {activeTab === 'Overview' && (
              <div className="space-y-6">
                <p className="text-gray-600 leading-relaxed">{pkg.description}</p>
                <div>
                  <h3 className="font-bold text-[#0A1628] text-lg mb-3">Trip Highlights</h3>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {pkg.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-[#00B4D8] mt-0.5 shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Map placeholder */}
                <div
                  className="w-full h-52 rounded-2xl flex items-center justify-center text-white/70 font-medium"
                  style={{ background: 'linear-gradient(135deg, #0A1628 0%, #102444 100%)' }}
                >
                  🗺 Interactive Map · {pkg.countries.join(' → ')}
                </div>
              </div>
            )}

            {/* Itinerary */}
            {activeTab === 'Itinerary' && (
              <div className="space-y-3">
                {pkg.itinerary.map((day) => (
                  <div key={day.day} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors"
                      onClick={() => setOpenDay(openDay === day.day ? null : day.day)}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                          style={{ background: '#00B4D8' }}
                        >
                          {day.day}
                        </span>
                        <span className="font-semibold text-[#0A1628] text-sm text-left">{day.title}</span>
                      </div>
                      {openDay === day.day ? (
                        <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                      )}
                    </button>
                    {openDay === day.day && (
                      <div className="px-5 pb-4 pt-2 bg-gray-50 text-sm text-gray-600 leading-relaxed">
                        {day.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Inclusions */}
            {activeTab === 'Inclusions' && (
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" /> What&apos;s Included
                  </h3>
                  <ul className="space-y-2">
                    {includesList.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        {item === 'Flights' && <Plane className="h-3.5 w-3.5 text-gray-400" />}
                        {item === 'Hotel' && <Building2 className="h-3.5 w-3.5 text-gray-400" />}
                        {item === 'Meals' && <Utensils className="h-3.5 w-3.5 text-gray-400" />}
                        {item}
                      </li>
                    ))}
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      24/7 TRoyGO™ support
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-400" /> Not Included
                  </h3>
                  <ul className="space-y-2">
                    {excludesList.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-500">
                        <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'Reviews' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-black text-[#0A1628]">{pkg.rating}</div>
                  <div>
                    <div className="flex gap-0.5 mb-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`h-5 w-5 ${s <= Math.round(pkg.rating) ? 'fill-[#FFD700] text-[#FFD700]' : 'text-gray-200 fill-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">{pkg.reviewCount.toLocaleString()} reviews</p>
                  </div>
                </div>
                {[
                  { name: 'Sarah M.', location: 'New York, USA', date: '2 weeks ago', rating: 5, text: 'Absolutely incredible experience! Every detail was perfectly planned. The local guides were knowledgeable and passionate. Would book again in a heartbeat.' },
                  { name: 'James T.', location: 'London, UK', date: '1 month ago', rating: 5, text: 'Best travel experience of my life. The itinerary struck the perfect balance between guided tours and free time. Hotels were top-notch.' },
                  { name: 'Ana C.', location: 'Sydney, AU', date: '2 months ago', rating: 4, text: 'Wonderful trip overall. A few minor scheduling hiccups but the TRoyGO™ team handled everything smoothly. Highly recommend!' },
                ].map((review, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-[#0A1628] text-sm">{review.name}</p>
                        <p className="text-xs text-gray-400">{review.location} · {review.date}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-[#FFD700] text-[#FFD700]' : 'text-gray-200 fill-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Booking tab */}
            {activeTab === 'Booking' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-md">
                <h3 className="font-bold text-[#0A1628] text-lg mb-5">Book This Package</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Departure Date</label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40"
                    >
                      {pkg.departureDates.map((d) => (
                        <option key={d} value={d}>{format(new Date(d), 'MMMM d, yyyy')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Number of Travelers</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setTravelers(Math.max(1, travelers - 1))} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-lg font-bold hover:border-[#00B4D8] transition-colors">−</button>
                      <span className="font-bold text-[#0A1628] w-6 text-center">{travelers}</span>
                      <button onClick={() => setTravelers(Math.min(pkg.maxGroupSize, travelers + 1))} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-lg font-bold hover:border-[#00B4D8] transition-colors">+</button>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">${pkg.price.toLocaleString()} × {travelers} travelers</span>
                      <span className="font-bold text-[#0A1628]">${totalPrice.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-400">Final price includes taxes & fees</p>
                  </div>
                  <Link
                    href={`/booking?type=package&id=${pkg.id}&travelers=${travelers}&date=${selectedDate}&price=${totalPrice}&name=${encodeURIComponent(pkg.name)}`}
                    className="block w-full text-center py-3 rounded-xl font-bold text-[#0A1628] text-sm hover:brightness-110 transition-all"
                    style={{ background: '#FFD700' }}
                  >
                    Book Now — ${totalPrice.toLocaleString()}
                  </Link>
                  <p className="text-xs text-center text-gray-400">Free cancellation up to 30 days before departure</p>
                </div>
              </div>
            )}
          </div>

          {/* Sticky sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-black text-[#0A1628]">${pkg.price.toLocaleString()}</div>
                {pkg.originalPrice > pkg.price && (
                  <div className="text-sm text-gray-400 line-through">${pkg.originalPrice.toLocaleString()}</div>
                )}
                <div className="text-xs text-gray-400">per person</div>
              </div>
              <div className="flex items-center justify-center gap-1 mb-5">
                <Star className="h-4 w-4 fill-[#FFD700] text-[#FFD700]" />
                <span className="font-semibold text-[#0A1628] text-sm">{pkg.rating}</span>
                <span className="text-xs text-gray-400">({pkg.reviewCount.toLocaleString()})</span>
              </div>
              <div className="space-y-2 mb-5 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4 text-[#00B4D8]" />
                  <span>Next: {pkg.departureDates[0] ? format(new Date(pkg.departureDates[0]), 'MMM d, yyyy') : 'TBD'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 text-[#00B4D8]" />
                  <span>{pkg.duration} days / {pkg.duration - 1} nights</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4 text-[#00B4D8]" />
                  <span>Max group size: {pkg.maxGroupSize}</span>
                </div>
              </div>
              <Link
                href={`/booking?type=package&id=${pkg.id}&name=${encodeURIComponent(pkg.name)}&price=${pkg.price}`}
                className="block w-full text-center py-3 rounded-xl font-bold text-[#0A1628] text-sm hover:brightness-110 transition-all mb-3"
                style={{ background: '#FFD700' }}
              >
                Book Now
              </Link>
              <button
                onClick={() => setActiveTab('Booking')}
                className="block w-full text-center py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-all"
                style={{ background: '#00B4D8' }}
              >
                Customize Trip
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
