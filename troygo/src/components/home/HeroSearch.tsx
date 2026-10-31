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
  { id: 'cruises', label: 'Cruises', icon: <Ship className="w-4 h-4" /> },
  { id: 'packages', label: 'Packages', icon: <Package className="w-4 h-4" /> },
  { id: 'hotels', label: 'Hotels', icon: <Hotel className="w-4 h-4" /> },
  { id: 'cars', label: 'Cars', icon: <Car className="w-4 h-4" /> },
];

// Today as YYYY-MM-DD in the visitor's own time zone, so past dates cannot be picked.
function todayLocal(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/* A field is one rounded box: small label on top, the value underneath. */
const BOX =
  'group relative flex flex-col justify-center bg-white rounded-xl border border-slate-300 px-3.5 pt-2 pb-1.5 ' +
  'hover:border-slate-500 focus-within:border-[#0077b6] focus-within:ring-2 focus-within:ring-[#00B4D8]/30 transition-colors min-h-[58px]';
const LABEL = 'text-[11px] font-semibold text-slate-500 leading-none mb-1 flex items-center gap-1.5';
const INPUT =
  'w-full bg-transparent text-[15px] text-slate-900 placeholder-slate-400 focus:outline-none p-0 border-0';

interface InputFieldProps {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

function InputField({ icon, label, placeholder, type = 'text', value, onChange, className }: InputFieldProps) {
  return (
    <label className={clsx(BOX, 'cursor-text', className)}>
      <span className={LABEL}>
        <span className="text-slate-400">{icon}</span>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={INPUT}
      />
    </label>
  );
}

// Real airport lookup (resolves "Darwin" -> DRW via Duffel's own place
// search, same component the dedicated /flights page already uses).
function AirportField({
  label, placeholder, value, onChange, className,
}: { label: string; placeholder: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={clsx(BOX, className)}>
      <span className={LABEL}>
        <span className="text-slate-400"><MapPin className="w-3.5 h-3.5" /></span>
        {label}
      </span>
      <AirportAutocomplete
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={INPUT}
      />
    </div>
  );
}

// The real, visible native date input (so typing shows and the browser calendar works).
function DateFieldBox({
  label, value, onChange, min, className,
}: { label: string; value: string; onChange: (v: string) => void; min?: string; className?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={clsx(BOX, className)}>
      <span className={LABEL}>
        <button
          type="button"
          className="text-slate-400 hover:text-[#0077b6]"
          onClick={() => inputRef.current?.showPicker?.()}
          aria-label={`Open ${label} calendar`}
        >
          <Calendar className="w-3.5 h-3.5" />
        </button>
        {label}
      </span>
      <input
        ref={inputRef}
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(INPUT, '[color-scheme:light]')}
      />
    </div>
  );
}

const SEARCH_BTN =
  'flex items-center justify-center gap-2 bg-[#0077b6] hover:bg-[#006399] text-white font-semibold px-7 rounded-xl ' +
  'min-h-[58px] transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0077b6]';

function SearchButton({
  label = 'Search',
  tab,
  params,
  className,
}: {
  label?: string;
  tab: Tab;
  // Only non-empty values are included in the URL; the destination page
  // treats a missing param as "no filter" rather than a fake default.
  params: Record<string, string>;
  className?: string;
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
      className={clsx(SEARCH_BTN, className)}
    >
      <Search className="w-4 h-4" />
      {label}
    </button>
  );
}

function QuoteNote({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-slate-500 px-1">{children}</p>;
}

function FlightsForm() {
  const router = useRouter();
  const today = todayLocal();
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
    // These param names must match what /flights actually reads
    // (from, to, date, return, adults, children, infants).
    if (origin.trim()) query.set('from', origin.trim());
    if (destination.trim()) query.set('to', destination.trim());
    if (departure) query.set('date', departure);
    if (tripType === 'roundtrip' && returnDate) query.set('return', departure && returnDate < departure ? departure : returnDate);
    query.set('adults', String(passengerCounts.adults));
    if (passengerCounts.children.length > 0) query.set('children', passengerCounts.children.map((c) => c.age).join(','));
    if (passengerCounts.infants.length > 0) query.set('infants', passengerCounts.infants.map((i) => i.age).join(','));
    const qs = query.toString();
    router.push(qs ? `/flights?${qs}` : '/flights');
  }

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function onDeparture(v: string) {
    setDeparture(v);
    // Keep the return date from sitting before the departure date.
    if (returnDate && v && returnDate < v) setReturnDate(v);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Trip type" className="inline-flex rounded-full bg-slate-100 p-0.5">
          {([
            { value: 'roundtrip', label: 'Return' },
            { value: 'oneway', label: 'One way' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={tripType === opt.value}
              onClick={() => setTripType(opt.value)}
              className={clsx(
                'px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors',
                tripType === opt.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="inline-flex items-center rounded-full bg-slate-100 px-3.5 py-1.5 text-sm">
          <PassengerPicker value={passengerCounts} onChange={setPassengerCounts} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_auto_1.2fr_1fr_1fr_auto] gap-2 lg:items-stretch">
        <AirportField label="From" placeholder="City or airport" value={origin} onChange={setOrigin} />
        <button
          type="button"
          onClick={swap}
          aria-label="Swap origin and destination"
          className="hidden lg:flex items-center justify-center self-center w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-500 hover:text-[#0077b6] hover:border-[#0077b6] transition-colors"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>
        <AirportField label="To" placeholder="City or airport" value={destination} onChange={setDestination} />
        <DateFieldBox label="Depart" value={departure} onChange={onDeparture} min={today} />
        {tripType === 'roundtrip' ? (
          <DateFieldBox label="Return" value={returnDate} onChange={setReturnDate} min={departure || today} />
        ) : (
          <div className="hidden lg:block" />
        )}
        <button type="button" onClick={handleSearch} className={clsx(SEARCH_BTN, 'sm:col-span-2 lg:col-span-1')}>
          <Search className="w-4 h-4" />
          Search flights
        </button>
      </div>
    </div>
  );
}

function HotelsForm() {
  const today = todayLocal();
  const [destination, setDestination] = useState('');
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState('');

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-2">
        <InputField icon={<MapPin className="w-3.5 h-3.5" />} label="Where" placeholder="City, region or hotel" value={destination} onChange={setDestination} />
        <DateFieldBox label="Check-in" value={checkin} onChange={(v) => { setCheckin(v); if (checkout && v && checkout < v) setCheckout(v); }} min={today} />
        <DateFieldBox label="Check-out" value={checkout} onChange={setCheckout} min={checkin || today} />
        <InputField icon={<Users className="w-3.5 h-3.5" />} label="Guests" placeholder="2 guests, 1 room" value={guests} onChange={setGuests} />
        <SearchButton label="Search" tab="hotels" params={{ destination, checkin, checkout, guests }} className="sm:col-span-2 lg:col-span-1" />
      </div>
      <QuoteNote>Hotels are quoted personally: we reply with a confirmed price before you book.</QuoteNote>
    </div>
  );
}

function CarsForm() {
  const today = todayLocal();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <InputField icon={<MapPin className="w-3.5 h-3.5" />} label="Pick-up" placeholder="Airport, city or address" value={pickup} onChange={setPickup} />
        <InputField icon={<MapPin className="w-3.5 h-3.5" />} label="Return to" placeholder="Same as pick-up" value={dropoff} onChange={setDropoff} />
        <DateFieldBox label="Pick-up date" value={pickupDate} onChange={(v) => { setPickupDate(v); if (returnDate && v && returnDate < v) setReturnDate(v); }} min={today} />
        <InputField icon={<Clock className="w-3.5 h-3.5" />} label="Pick-up time" placeholder="Time" type="time" value={pickupTime} onChange={setPickupTime} />
        <DateFieldBox label="Return date" value={returnDate} onChange={setReturnDate} min={pickupDate || today} />
        <InputField icon={<Clock className="w-3.5 h-3.5" />} label="Return time" placeholder="Time" type="time" value={returnTime} onChange={setReturnTime} />
        <SearchButton label="Search" tab="cars" params={{ pickup, dropoff, pickupDate, pickupTime, returnDate, returnTime }} className="sm:col-span-2" />
      </div>
      <QuoteNote>Car hire is quoted personally: we reply with a confirmed price before you book.</QuoteNote>
    </div>
  );
}

function PackagesForm() {
  const today = todayLocal();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departure, setDeparture] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travelers, setTravelers] = useState('');

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-2">
        <InputField icon={<MapPin className="w-3.5 h-3.5" />} label="From" placeholder="Departure city" value={from} onChange={setFrom} />
        <InputField icon={<MapPin className="w-3.5 h-3.5" />} label="To" placeholder="Destination" value={to} onChange={setTo} />
        <DateFieldBox label="Depart" value={departure} onChange={(v) => { setDeparture(v); if (returnDate && v && returnDate < v) setReturnDate(v); }} min={today} />
        <DateFieldBox label="Return" value={returnDate} onChange={setReturnDate} min={departure || today} />
        <InputField icon={<Users className="w-3.5 h-3.5" />} label="Travellers" placeholder="2 adults" value={travelers} onChange={setTravelers} />
        <SearchButton label="Search" tab="packages" params={{ from, to, departure, returnDate, travelers }} className="sm:col-span-2 lg:col-span-1" />
      </div>
      <QuoteNote>Package prices are confirmed by us before you book: use Request a Quote on any package.</QuoteNote>
    </div>
  );
}

function CruisesForm() {
  const today = todayLocal();
  const [port, setPort] = useState('');
  const [region, setRegion] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [passengers, setPassengers] = useState('');

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-2">
        <InputField icon={<Ship className="w-3.5 h-3.5" />} label="Departure port" placeholder="Port of departure" value={port} onChange={setPort} />
        <InputField icon={<MapPin className="w-3.5 h-3.5" />} label="Region" placeholder="Europe, Asia…" value={region} onChange={setRegion} />
        <DateFieldBox label="From" value={dateFrom} onChange={(v) => { setDateFrom(v); if (dateTo && v && dateTo < v) setDateTo(v); }} min={today} />
        <DateFieldBox label="To" value={dateTo} onChange={setDateTo} min={dateFrom || today} />
        <InputField icon={<Users className="w-3.5 h-3.5" />} label="Travellers" placeholder="2 adults" value={passengers} onChange={setPassengers} />
        <SearchButton label="Search" tab="cruises" params={{ port, region, dateFrom, dateTo, passengers }} className="sm:col-span-2 lg:col-span-1" />
      </div>
      <QuoteNote>Cruises are Viking only, quoted personally: we confirm the price before you book.</QuoteNote>
    </div>
  );
}

export default function HeroSearch() {
  const [activeTab, setActiveTab] = useState<Tab>('flights');

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Tabs: underline style, keyboard reachable */}
      <div role="tablist" aria-label="What are you looking for" className="flex justify-center sm:justify-start gap-0 sm:gap-1 overflow-x-auto px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-[#0077b6] text-[#0077b6]'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300',
            )}
          >
            <span className="hidden sm:inline-flex">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search card */}
      <div role="tabpanel" className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgba(10,22,40,0.10)] p-4 sm:p-5">
        {activeTab === 'flights' && <FlightsForm />}
        {activeTab === 'hotels' && <HotelsForm />}
        {activeTab === 'cars' && <CarsForm />}
        {activeTab === 'packages' && <PackagesForm />}
        {activeTab === 'cruises' && <CruisesForm />}
      </div>
    </div>
  );
}
