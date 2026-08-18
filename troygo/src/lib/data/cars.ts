import liveData from './cars-live.json'

export type CarType = 'Economy' | 'Compact' | 'SUV' | 'Luxury' | 'Van'
export type Transmission = 'Automatic' | 'Manual'

export interface CarRental {
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

const fallbackCarRentals: CarRental[] = [
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

// Real, web-sourced car rentals from the research agent take over once they
// exist. Until the agent has run successfully at least once, cars-live.json
// is `[]` and the site falls back to the array above — this can never blank
// out the live site with an empty car list. Same pattern as packages.ts/hotels.ts.
const liveCarRentals = liveData as CarRental[]

export const carRentals: CarRental[] =
  liveCarRentals.length > 0 ? liveCarRentals : fallbackCarRentals
