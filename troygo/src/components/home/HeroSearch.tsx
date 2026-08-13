'use client';

import { useState } from 'react';
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
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departure, setDeparture] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('1 Adult');

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <InputField
            icon={<MapPin className="w-4 h-4" />}
            label="From"
            placeholder="Origin city or airport"
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
        <InputField
          icon={<MapPin className="w-4 h-4" />}
          label="To"
          placeholder="Destination city or airport"
          value={destination}
          onChange={setDestination}
        />
        <InputField
          icon={<Calendar className="w-4 h-4" />}
          label="Departure"
          placeholder="Select date"
          type="date"
          value={departure}
          onChange={setDeparture}
        />
        <InputField
          icon={<Calendar className="w-4 h-4" />}
          label="Return"
          placeholder="Select date"
          type="date"
          value={returnDate}
          onChange={setReturnDate}
        />
      </div>
      <div className="flex gap-3 items-end">
        <InputField
          icon={<Users className="w-4 h-4" />}
          label="Passengers"
          placeholder="1 Adult"
          value={passengers}
          onChange={setPassengers}
          className="flex-1 max-w-xs"
        />
        <SearchButton
          label="Search Flights"
          tab="flights"
          params={{ from: origin, to: destination, departure, returnDate, passengers }}
        />
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
        <InputField
          icon={<Calendar className="w-4 h-4" />}
          label="Check-in"
          placeholder="Select date"
          type="date"
          value={checkin}
          onChange={setCheckin}
        />
        <InputField
          icon={<Calendar className="w-4 h-4" />}
          label="Check-out"
          placeholder="Select date"
          type="date"
          value={checkout}
          onChange={setCheckout}
        />
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
          <InputField
            icon={<Calendar className="w-4 h-4" />}
            label="Pickup Date"
            placeholder="Date"
            type="date"
            value={pickupDate}
            onChange={setPickupDate}
          />
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
          <InputField
            icon={<Calendar className="w-4 h-4" />}
            label="Return Date"
            placeholder="Date"
            type="date"
            value={returnDate}
            onChange={setReturnDate}
          />
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
        <InputField
          icon={<Calendar className="w-4 h-4" />}
          label="Departure"
          placeholder="Select date"
          type="date"
          value={departure}
          onChange={setDeparture}
        />
        <InputField
          icon={<Calendar className="w-4 h-4" />}
          label="Return"
          placeholder="Select date"
          type="date"
          value={returnDate}
          onChange={setReturnDate}
        />
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
        <InputField
          icon={<Calendar className="w-4 h-4" />}
          label="Date From"
          placeholder="Select date"
          type="date"
          value={dateFrom}
          onChange={setDateFrom}
        />
        <InputField
          icon={<Calendar className="w-4 h-4" />}
          label="Date To"
          placeholder="Select date"
          type="date"
          value={dateTo}
          onChange={setDateTo}
        />
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
