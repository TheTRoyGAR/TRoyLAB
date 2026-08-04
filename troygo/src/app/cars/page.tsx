'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Car,
  Users,
  Luggage,
  Wind,
  Filter,
  ChevronRight,
  MapPin,
  Calendar,
  Gauge,
  CheckCircle,
  DoorOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import MainLayout from '@/components/layout/MainLayout'

/* ─── Types ───────────────────────────────────────────────────────────────── */
type CarType = 'Economy' | 'Compact' | 'SUV' | 'Luxury' | 'Van'
type Transmission = 'Automatic' | 'Manual'

interface CarRental {
  id: string
  name: string
  model: string
  type: CarType
  transmission: Transmission
  seats: number
  bags: number
  doors: number
  ac: boolean
  pricePerDay: number
  supplier: string
  supplierLogo: string
  gradient: string
  features: string[]
  pickupLocations: string[]
  fuelPolicy: string
  mileage: string
}

/* ─── Mock car data ───────────────────────────────────────────────────────── */
const carRentals: CarRental[] = [
  {
    id: 'CAR001',
    name: 'Toyota Corolla',
    model: '2025',
    type: 'Economy',
    transmission: 'Automatic',
    seats: 5,
    bags: 2,
    doors: 4,
    ac: true,
    pricePerDay: 45,
    supplier: 'Hertz',
    supplierLogo: 'H',
    gradient: 'from-slate-600 via-gray-500 to-zinc-600',
    features: ['USB Charging', 'Bluetooth', 'Backup Camera'],
    pickupLocations: ['Airport', 'Downtown'],
    fuelPolicy: 'Full-to-Full',
    mileage: 'Unlimited',
  },
  {
    id: 'CAR002',
    name: 'Honda Civic',
    model: '2025',
    type: 'Compact',
    transmission: 'Automatic',
    seats: 5,
    bags: 3,
    doors: 4,
    ac: true,
    pricePerDay: 58,
    supplier: 'Enterprise',
    supplierLogo: 'E',
    gradient: 'from-blue-700 via-blue-600 to-indigo-700',
    features: ['Apple CarPlay', 'Android Auto', 'Lane Assist'],
    pickupLocations: ['Airport', 'Downtown', 'Hotel Delivery'],
    fuelPolicy: 'Full-to-Full',
    mileage: 'Unlimited',
  },
  {
    id: 'CAR003',
    name: 'Ford Explorer',
    model: '2025',
    type: 'SUV',
    transmission: 'Automatic',
    seats: 7,
    bags: 4,
    doors: 5,
    ac: true,
    pricePerDay: 95,
    supplier: 'Avis',
    supplierLogo: 'A',
    gradient: 'from-red-700 via-rose-600 to-pink-700',
    features: ['4WD', 'Apple CarPlay', 'Panoramic Roof', 'Backup Camera'],
    pickupLocations: ['Airport', 'Downtown'],
    fuelPolicy: 'Full-to-Full',
    mileage: 'Unlimited',
  },
  {
    id: 'CAR004',
    name: 'Mercedes-Benz E-Class',
    model: '2025',
    type: 'Luxury',
    transmission: 'Automatic',
    seats: 5,
    bags: 3,
    doors: 4,
    ac: true,
    pricePerDay: 185,
    supplier: 'Sixt',
    supplierLogo: 'S',
    gradient: 'from-zinc-700 via-stone-600 to-neutral-700',
    features: ['Leather Seats', 'Navigation', 'Ambient Lighting', 'Adaptive Cruise'],
    pickupLocations: ['Airport', 'Hotel Delivery', 'Chauffeur Option'],
    fuelPolicy: 'Full-to-Full',
    mileage: 'Unlimited',
  },
  {
    id: 'CAR005',
    name: 'Chrysler Pacifica',
    model: '2025',
    type: 'Van',
    transmission: 'Automatic',
    seats: 8,
    bags: 6,
    doors: 5,
    ac: true,
    pricePerDay: 120,
    supplier: 'National',
    supplierLogo: 'N',
    gradient: 'from-emerald-700 via-green-600 to-teal-700',
    features: ['Stow & Go Seats', 'Rear Entertainment', 'Apple CarPlay', 'Sliding Doors'],
    pickupLocations: ['Airport', 'Downtown'],
    fuelPolicy: 'Full-to-Full',
    mileage: '250 miles/day',
  },
  {
    id: 'CAR006',
    name: 'Nissan Versa',
    model: '2025',
    type: 'Economy',
    transmission: 'Manual',
    seats: 5,
    bags: 2,
    doors: 4,
    ac: true,
    pricePerDay: 32,
    supplier: 'Budget',
    supplierLogo: 'B',
    gradient: 'from-yellow-600 via-amber-500 to-orange-600',
    features: ['Bluetooth', 'USB Port'],
    pickupLocations: ['Airport', 'Downtown'],
    fuelPolicy: 'Full-to-Full',
    mileage: '150 miles/day',
  },
  {
    id: 'CAR007',
    name: 'BMW 5 Series',
    model: '2025',
    type: 'Luxury',
    transmission: 'Automatic',
    seats: 5,
    bags: 3,
    doors: 4,
    ac: true,
    pricePerDay: 220,
    supplier: 'Sixt',
    supplierLogo: 'S',
    gradient: 'from-indigo-700 via-violet-600 to-purple-700',
    features: ['Head-Up Display', 'Heated Seats', 'Harman Kardon Audio', 'Parking Assistant'],
    pickupLocations: ['Airport', 'Hotel Delivery', 'Valet Return'],
    fuelPolicy: 'Full-to-Full',
    mileage: 'Unlimited',
  },
  {
    id: 'CAR008',
    name: 'Toyota RAV4',
    model: '2025',
    type: 'SUV',
    transmission: 'Automatic',
    seats: 5,
    bags: 4,
    doors: 5,
    ac: true,
    pricePerDay: 78,
    supplier: 'Hertz',
    supplierLogo: 'H',
    gradient: 'from-cyan-700 via-sky-600 to-blue-700',
    features: ['AWD', 'Safety Sense', 'Apple CarPlay', 'Power Tailgate'],
    pickupLocations: ['Airport', 'Downtown'],
    fuelPolicy: 'Full-to-Full',
    mileage: 'Unlimited',
  },
  {
    id: 'CAR009',
    name: 'Volkswagen Golf',
    model: '2025',
    type: 'Compact',
    transmission: 'Manual',
    seats: 5,
    bags: 3,
    doors: 4,
    ac: true,
    pricePerDay: 48,
    supplier: 'Europcar',
    supplierLogo: 'EP',
    gradient: 'from-teal-700 via-emerald-600 to-green-700',
    features: ['Digital Cockpit', 'Wireless Charging', 'LED Lights'],
    pickupLocations: ['Airport', 'City Center'],
    fuelPolicy: 'Full-to-Full',
    mileage: 'Unlimited',
  },
  {
    id: 'CAR010',
    name: 'Mercedes-Benz Sprinter',
    model: '2025',
    type: 'Van',
    transmission: 'Automatic',
    seats: 12,
    bags: 10,
    doors: 5,
    ac: true,
    pricePerDay: 195,
    supplier: 'National',
    supplierLogo: 'N',
    gradient: 'from-slate-700 via-gray-600 to-slate-800',
    features: ['High Roof', 'Commercial AC', 'Navigation', 'Backup Camera', 'USB x6'],
    pickupLocations: ['Airport', 'Downtown', 'Commercial Hub'],
    fuelPolicy: 'Full-to-Full',
    mileage: 'Unlimited',
  },
]

/* ─── Supplier colors ─────────────────────────────────────────────────────── */
const SUPPLIER_COLORS: Record<string, string> = {
  H: '#FFBE00', E: '#006747', A: '#CE1921', S: '#FF8200', N: '#0053A0', B: '#ED1C24', EP: '#009B77',
}

/* ─── Car Card ────────────────────────────────────────────────────────────── */
function CarCard({ car, pickupDate, returnDate }: { car: CarRental; pickupDate: string; returnDate: string }) {
  const days = Math.max(1, Math.ceil((new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / 86400000))
  const total = car.pricePerDay * days

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col md:flex-row">
      {/* Car image placeholder */}
      <div className={cn('h-44 md:h-auto md:w-56 lg:w-64 shrink-0 relative bg-gradient-to-br flex items-center justify-center', car.gradient)}>
        <Car className="h-16 w-16 text-white/30" />
        <div
          className="absolute top-3 left-3 w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow"
          style={{ background: SUPPLIER_COLORS[car.supplierLogo] ?? '#00B4D8' }}
          title={car.supplier}
        >
          {car.supplierLogo}
        </div>
        <span className="absolute bottom-3 left-3 text-xs font-bold text-white bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
          {car.type}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-lg font-bold text-navy leading-tight">{car.name} <span className="text-slate-400 font-normal text-base">{car.model}</span></h3>
            <p className="text-sm text-slate-500">{car.supplier} · {car.fuelPolicy} · {car.mileage}</p>
          </div>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap text-white"
            style={{ background: '#00B4D8' }}
          >
            {car.transmission}
          </span>
        </div>

        {/* Specs */}
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Users className="h-4 w-4 text-slate-400" />
            <span>{car.seats} seats</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Luggage className="h-4 w-4 text-slate-400" />
            <span>{car.bags} bags</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <DoorOpen className="h-4 w-4 text-slate-400" />
            <span>{car.doors} doors</span>
          </div>
          {car.ac && (
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Wind className="h-4 w-4 text-slate-400" />
              <span>A/C</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Gauge className="h-4 w-4 text-slate-400" />
            <span>{car.transmission}</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {car.features.map((f) => (
            <span key={f} className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle className="h-3 w-3" />
              {f}
            </span>
          ))}
        </div>

        {/* Pickup locations */}
        <div className="flex flex-wrap gap-2 mb-4">
          {car.pickupLocations.map((loc) => (
            <span key={loc} className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3" />
              {loc}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">per day</p>
            <p className="text-2xl font-black text-navy">${car.pricePerDay}</p>
            <p className="text-sm text-slate-500">
              Total: <span className="font-bold text-navy">${total.toLocaleString()}</span>
              {days > 1 && <span className="text-slate-400"> ({days} days)</span>}
            </p>
          </div>
          <Link
            href={`/booking?type=car&id=${car.id}`}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm hover:brightness-110 hover:-translate-y-0.5 transition-all whitespace-nowrap"
            style={{ background: '#00B4D8' }}
          >
            Reserve
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function CarsPage() {
  const [pickupLocation, setPickupLocation] = useState('')
  const [returnLocation, setReturnLocation] = useState('')
  const [pickupDate, setPickupDate] = useState('2026-06-20')
  const [pickupTime, setPickupTime] = useState('10:00')
  const [returnDate, setReturnDate] = useState('2026-06-25')
  const [returnTime, setReturnTime] = useState('10:00')
  const [sameReturn, setSameReturn] = useState(true)

  // Filters
  const [typeFilter, setTypeFilter] = useState<Set<CarType>>(new Set(['Economy', 'Compact', 'SUV', 'Luxury', 'Van']))
  const [transmissionFilter, setTransmissionFilter] = useState<Set<Transmission>>(new Set(['Automatic', 'Manual']))
  const [supplierFilter, setSupplierFilter] = useState<Set<string>>(new Set())
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300])

  const allSuppliers = [...new Set(carRentals.map((c) => c.supplier))].sort()

  function toggleSet<T>(set: Set<T>, val: T, setter: (v: Set<T>) => void) {
    const next = new Set(set)
    next.has(val) ? next.delete(val) : next.add(val)
    setter(next)
  }

  const filtered = useMemo(() => {
    return carRentals.filter((c) => {
      if (!typeFilter.has(c.type)) return false
      if (!transmissionFilter.has(c.transmission)) return false
      if (supplierFilter.size > 0 && !supplierFilter.has(c.supplier)) return false
      if (c.pricePerDay > priceRange[1]) return false
      return true
    })
  }, [typeFilter, transmissionFilter, supplierFilter, priceRange])

  const days = Math.max(1, Math.ceil((new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / 86400000))

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50">
        {/* Hero bar */}
        <div className="py-8 px-4 md:px-8" style={{ background: '#0A1628' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">Car Rentals</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-6">Find Your Rental Car</h1>

            {/* Search form */}
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {/* Pickup */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pickup Location</label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <input
                      className="w-full text-sm font-semibold text-navy outline-none bg-transparent"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="City or airport"
                    />
                  </div>
                </div>

                {/* Return */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Return Location</label>
                    <label className="flex items-center gap-1 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameReturn}
                        onChange={(e) => setSameReturn(e.target.checked)}
                        className="w-3 h-3"
                        style={{ accentColor: '#00B4D8' }}
                      />
                      Same
                    </label>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <input
                      className="w-full text-sm font-semibold text-navy outline-none bg-transparent disabled:opacity-50"
                      value={sameReturn ? pickupLocation : returnLocation}
                      onChange={(e) => setReturnLocation(e.target.value)}
                      placeholder="City or airport"
                      disabled={sameReturn}
                    />
                  </div>
                </div>

                {/* Pickup date/time */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pickup Date & Time</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <input
                      type="date"
                      className="text-sm font-semibold text-navy outline-none bg-transparent"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                    />
                    <input
                      type="time"
                      className="text-sm text-slate-500 outline-none bg-transparent"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Return date/time */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Return Date & Time</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <input
                      type="date"
                      className="text-sm font-semibold text-navy outline-none bg-transparent"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                    />
                    <input
                      type="time"
                      className="text-sm text-slate-500 outline-none bg-transparent"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">{days} day{days > 1 ? 's' : ''} rental</p>
                <button
                  onClick={() => document.getElementById('car-results')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm hover:brightness-110 transition-all"
                  style={{ background: '#00B4D8' }}
                >
                  Search Cars
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-6 h-fit sticky top-28">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" style={{ color: '#00B4D8' }} />
                  <h3 className="font-bold text-navy text-sm">Filters</h3>
                </div>

                {/* Car type */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Car Type</h4>
                  <div className="space-y-2">
                    {(['Economy', 'Compact', 'SUV', 'Luxury', 'Van'] as CarType[]).map((type) => (
                      <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={typeFilter.has(type)}
                          onChange={() => toggleSet(typeFilter, type, setTypeFilter)}
                          style={{ accentColor: '#00B4D8' }}
                        />
                        <span className="text-sm text-slate-600 group-hover:text-navy transition-colors">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Transmission */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Transmission</h4>
                  <div className="space-y-2">
                    {(['Automatic', 'Manual'] as Transmission[]).map((t) => (
                      <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={transmissionFilter.has(t)}
                          onChange={() => toggleSet(transmissionFilter, t, setTransmissionFilter)}
                          style={{ accentColor: '#00B4D8' }}
                        />
                        <span className="text-sm text-slate-600 group-hover:text-navy transition-colors">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price per day */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Max Price/Day</h4>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">$0</span>
                    <span className="text-xs font-semibold text-navy">${priceRange[1]}/day</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={300}
                    step={10}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full"
                    style={{ accentColor: '#00B4D8' }}
                  />
                </div>

                {/* Supplier */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Supplier</h4>
                  <div className="space-y-2">
                    {allSuppliers.map((s) => (
                      <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={supplierFilter.has(s)}
                          onChange={() => toggleSet(supplierFilter, s, setSupplierFilter)}
                          style={{ accentColor: '#00B4D8' }}
                        />
                        <span className="text-sm text-slate-600 group-hover:text-navy transition-colors">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTypeFilter(new Set(['Economy', 'Compact', 'SUV', 'Luxury', 'Van']))
                    setTransmissionFilter(new Set(['Automatic', 'Manual']))
                    setSupplierFilter(new Set())
                    setPriceRange([0, 300])
                  }}
                  className="w-full py-2 text-sm font-semibold text-slate-500 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </aside>

            {/* Results */}
            <div id="car-results" className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-bold text-navy">{filtered.length}</span> vehicles
                  {days > 1 && <span className="text-slate-400"> · {days}-day total shown</span>}
                </p>
              </div>

              <div className="space-y-4">
                {filtered.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                    <Car className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-lg font-bold text-navy mb-2">No cars found</p>
                    <p className="text-slate-500 text-sm">Try adjusting your filters.</p>
                  </div>
                ) : (
                  filtered.map((car) => (
                    <CarCard key={car.id} car={car} pickupDate={pickupDate} returnDate={returnDate} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
