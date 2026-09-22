'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plane,
  Hotel,
  Car,
  Package,
  Ship,
  MapPin,
  Calendar,
  Users,
  Search,
  ArrowRightLeft,
  Clock,
} from 'lucide-react';
import { clsx } from 'clsx';
import AirportAutocomplete from '@/components/flights/AirportAutocomplete';
import PassengerPicker, { type PassengerCounts } from '@/components/flights/PassengerPicker';

type Tab = 'flights' | 'hotels' | 'cars' | 'packages' | 'cruises';

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabConfig[] = [
  { id: 'flights', label: 'Flights', icon: <Plane className="w-4 h-4" /> },
  { id: 'hotels', label: 'Hotels', icon: <Hotel className="w-4 h-4" /> },
  { id: 'cars', label: 'Cars', icon: <Car className="w-4 h-4" /> },
  { id: 'packages', label: 'Packages', icon: <Package className="w-4 h-4" /> },
  { id: 'cruises', label: 'Cruises', icon: <Ship className="w-4 h-4" /> },
];

interface InputFieldProps {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

function InputField({
  icon,
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  className,
}: InputFieldProps) {
  return (
    <div className={clsx('flex flex-col', className)}>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 px-1">
        {label}
      </label>
      <div className="relative flex items-center bg-white rounded-xl shadow-sm border border-gray-200 hover:border-[#00B4D8] transition-colors focus-within:border-[#00B4D8] focus-within:ring-2 focus-within:ring-[#00B4D8]/20">
        <span className="absolute left-3 text-[#00B4D8]">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-3 bg-transparent text-gray-800 placeholder-gray-400 text-sm rounded-xl focus:outline-none"
        />
      </div>
    </div>
  );
}

// Real airport lookup (resolves "Darwin" -> DRW via Duffel's own place
// search, same component the dedicated /flights page already uses) styled
// to match this form's InputField boxes.
function AirportField({
  label, placeholder, value, onChange, className,
}: { label: string; placeholder: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={clsx('flex flex-col', className)}>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 px-1">
        {label}
      </label>
      <div className="relative flex items-center bg-white rounded-xl shadow-sm border border-gray-200 hover:border-[#00B4D8] transition-colors focus-within:border-[#00B4D8] focus-within:ring-2 focus-within:ring-[#00B4D8]/20">
        <span className="absolute left-3 text-[#00B4D8] pointer-events-none z-10">
          <MapPin className="w-4 h-4" />
        </span>
        <AirportAutocomplete
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-3 bg-transparent text-gray-800 placeholder-gray-400 text-sm rounded-xl focus:outline-none"
        />
      </div>
    </div>
  );
}

// The real, visible native date input — an earlier version hid this input
// (opacity-0) under a fake styled display, which meant typing gave no visual
// feedback at all and the real clickable calendar icon was invisible and in
// the wrong place. This keeps the real input on screen so typing is visible,
// and the decorative icon calls showPicker() so it's a genuine second way in.
function DateFieldBox({
  label, value, onChange, className,
}: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={clsx('flex flex-col', className)}>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 px-1">
        {label}
      </label>
      <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200 hover:border-[#00B4D8] transition-colors focus-within:border-[#00B4D8] focus-within:ring-2 focus-within:ring-[#00B4D8]/20 py-3 px-3">
        <button
          type="button"
          className="text-[#00B4D8] mr-2 shrink-0"
          onClick={() => inputRef.current?.showPicker?.()}
          aria-label={`Open ${label} calendar`}
        >
          <Calendar className="w-4 h-4" />
        </button>
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-800 focus:outline-none [color-scheme:light]"
        />
      </div>
    </div>
  );
}

function SearchButton({
  label = 'Search',
  tab,
  params,
}: {
  label?: string;
  tab: Tab;
  // Only non-empty values are included in the URL — the destination page
  // treats a missing param as "no filter" rather than a fake default.
  params: Record<string, string>;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
          if (value.trim()) query.set(key, value.trim());
        }
        const qs = query.toString();
        router.push(qs ? `/${tab}?${qs}` : `/${tab}`);
      }}
      className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#00B4D8] to-[#0096c7] hover:from-[#0096c7] hover:to-[#0077b6] text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-[#00B4D8]/30 transition-all duration-200 hover:shadow-[#00B4D8]/50 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
    >
      <Search className="w-4 h-4" />
      {label}
    </button>
  );
}

function FlightsForm() {
  const router = useRouter();
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departure, setDeparture] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengerCounts, setPassengerCounts] = useState<PassengerCounts>({
    adults: 1, children: [], infants: [],
  });

  function handleSearch() {
    const query = new URLSearchParams();
    // These param names must match what /flights actually reads (from, to,
    // date, return, adults) -- the old field names here ("departure",
    // "returnDate") silently didn't match, so dates never carried through
    // from a homepage search.
    if (origin.trim()) query.set('from', origin.trim());
    if (destination.trim()) query.set('to', destination.trim());
    if (departure) query.set('date', departure);
    if (tripType === 'roundtrip' && returnDate) query.set('return', returnDate);
    query.set('adults', String(passengerCounts.adults));
    if (passengerCounts.children.length > 0) query.set('children', passengerCounts.children.map((c) => c.age).join(','));
    if (passengerCounts.infants.length > 0) query.set('infants', passengerCounts.infants.map((i) => i.age).join(','));
    const qs = query.toString();
    router.push(qs ? `/flights?${qs}` : '/flights');
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Trip type */}
      <div className="flex items-center gap-1">
        {([
          { value: 'roundtrip', label: 'Round Trip' },
          { value: 'oneway', label: 'One Way' },
        ] as const).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTripType(opt.value)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
              tripType === opt.value ? 'text-white bg-[#00B4D8]' : 'text-gray-500 hover:text-gray-800'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <AirportField
            label="From"
            placeholder="City or airport"
            value={origin}
            onChange={setOrigin}
          />
          <button
            type="button"
            className="absolute right-0 top-1/2 translate-x-1/2 z-10 bg-white border border-gray-200 rounded-full p-1 shadow text-[#00B4D8] hover:bg-[#00B4D8] hover:text-white transition-colors hidden lg:flex"
            aria-label="Swap origin and destination"
            onClick={() => {
              const tmp = origin;
              setOrigin(destination);
              setDestination(tmp);
            }}
          >
            <ArrowRightLeft className="w-3 h-3" />
          </button>
        </div>
        <AirportField
          label="To"
          placeholder="City or airport"
          value={destination}
          onChange={setDestination}
        />
        <DateFieldBox label="Departure" value={departure} onChange={setDeparture} />
        {tripType === 'roundtrip' ? (
          <DateFieldBox label="Return" value={returnDate} onChange={setReturnDate} />
        ) : (
          <div className="hidden lg:block" />
        )}
      </div>
      <div className="flex gap-3 items-end">
        <div className="flex flex-col flex-1 max-w-xs">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 px-1">
            Passengers
          </label>
          <div className="relative flex items-center bg-white rounded-xl shadow-sm border border-gray-200 hover:border-[#00B4D8] transition-colors px-3 py-3">
            <span className="text-[#00B4D8] mr-2 shrink-0">
              <Users className="w-4 h-4" />
            </span>
            <PassengerPicker value={passengerCounts} onChange={setPassengerCounts} />
          </div>
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#00B4D8] to-[#0096c7] hover:from-[#0096c7] hover:to-[#0077b6] text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-[#00B4D8]/30 transition-all duration-200 hover:shadow-[#00B4D8]/50 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
        >
          <Search className="w-4 h-4" />
          Search Flights
        </button>
      </div>
    </div>
  );
}

function HotelsForm() {
  const [destination, setDestination] = useState('');
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState('');

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <InputField
          icon={<MapPin className="w-4 h-4" />}
          label="Destination"
          placeholder="City, region, or hotel"
          value={destination}
          onChange={setDestination}
          className="lg:col-span-1"
        />
        <DateFieldBox label="Check-in" value={checkin} onChange={setCheckin} />
        <DateFieldBox label="Check-out" value={checkout} onChange={setCheckout} />
        <InputField
          icon={<Users className="w-4 h-4" />}
          label="Guests / Rooms"
          placeholder="2 Guests, 1 Room"
          value={guests}
          onChange={setGuests}
        />
      </div>
      <div className="flex justify-end">
        <SearchButton
          label="Search Hotels"
          tab="hotels"
          params={{ destination, checkin, checkout, guests }}
        />
      </div>
    </div>
  );
}

function CarsForm() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <InputField
          icon={<MapPin className="w-4 h-4" />}
          label="Pickup Location"
          placeholder="Airport, city, or address"
          value={pickup}
          onChange={setPickup}
        />
        <InputField
          icon={<MapPin className="w-4 h-4" />}
          label="Return Location"
          placeholder="Same as pickup"
          value={dropoff}
          onChange={setDropoff}
        />
        <div className="grid grid-cols-2 gap-2">
          <DateFieldBox label="Pickup Date" value={pickupDate} onChange={setPickupDate} />
          <InputField
            icon={<Clock className="w-4 h-4" />}
            label="Pickup Time"
            placeholder="Time"
            type="time"
            value={pickupTime}
            onChange={setPickupTime}
          />
        </div>
      </div>
      <div className="flex gap-3 items-end">
        <div className="grid grid-cols-2 gap-2 flex-1 max-w-sm">
          <DateFieldBox label="Return Date" value={returnDate} onChange={setReturnDate} />
          <InputField
            icon={<Clock className="w-4 h-4" />}
            label="Return Time"
            placeholder="Time"
            type="time"
            value={returnTime}
            onChange={setReturnTime}
          />
        </div>
        <SearchButton
          label="Search Cars"
          tab="cars"
          params={{ pickup, dropoff, pickupDate, pickupTime, returnDate, returnTime }}
        />
      </div>
    </div>
  );
}

function PackagesForm() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departure, setDeparture] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travelers, setTravelers] = useState('');

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <InputField
          icon={<MapPin className="w-4 h-4" />}
          label="From"
          placeholder="Departure city"
          value={from}
          onChange={setFrom}
        />
        <InputField
          icon={<MapPin className="w-4 h-4" />}
          label="To"
          placeholder="Destination"
          value={to}
          onChange={setTo}
        />
        <DateFieldBox label="Departure" value={departure} onChange={setDeparture} />
        <DateFieldBox label="Return" value={returnDate} onChange={setReturnDate} />
      </div>
      <div className="flex gap-3 items-end">
        <InputField
          icon={<Users className="w-4 h-4" />}
          label="Travelers"
          placeholder="2 Adults"
          value={travelers}
          onChange={setTravelers}
          className="flex-1 max-w-xs"
        />
        <SearchButton
          label="Search Packages"
          tab="packages"
          params={{ from, to, departure, returnDate, travelers }}
        />
      </div>
    </div>
  );
}

function CruisesForm() {
  const [port, setPort] = useState('');
  const [region, setRegion] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [passengers, setPassengers] = useState('');

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <InputField
          icon={<Ship className="w-4 h-4" />}
          label="Departure Port"
          placeholder="Port of departure"
          value={port}
          onChange={setPort}
        />
        <InputField
          icon={<MapPin className="w-4 h-4" />}
          label="Destination / Region"
          placeholder="Caribbean, Mediterranean…"
          value={region}
          onChange={setRegion}
        />
        <DateFieldBox label="Date From" value={dateFrom} onChange={setDateFrom} />
        <DateFieldBox label="Date To" value={dateTo} onChange={setDateTo} />
      </div>
      <div className="flex gap-3 items-end">
        <InputField
          icon={<Users className="w-4 h-4" />}
          label="Passengers"
          placeholder="2 Adults"
          value={passengers}
          onChange={setPassengers}
          className="flex-1 max-w-xs"
        />
        <SearchButton
          label="Search Cruises"
          tab="cruises"
          params={{ port, region, dateFrom, dateTo, passengers }}
        />
      </div>
    </div>
  );
}

export default function HeroSearch() {
  const [activeTab, setActiveTab] = useState<Tab>('flights');

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Tab bar */}
      <div className="flex gap-1 bg-[#0A1628]/60 backdrop-blur-sm rounded-t-2xl p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200',
              activeTab === tab.id
                ? 'bg-white text-[#0A1628] shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search panel */}
      <div className="bg-white/95 backdrop-blur-md rounded-b-2xl rounded-tr-2xl p-5 shadow-2xl">
        {activeTab === 'flights' && <FlightsForm />}
        {activeTab === 'hotels' && <HotelsForm />}
        {activeTab === 'cars' && <CarsForm />}
        {activeTab === 'packages' && <PackagesForm />}
        {activeTab === 'cruises' && <CruisesForm />}
      </div>
    </div>
  );
}
