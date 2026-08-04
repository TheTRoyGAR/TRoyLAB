'use client';

import React, { useState, useCallback } from 'react';
import { Plus, X, MapPin, Calendar, Users, Wallet, Sparkles } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
export interface TripDetails {
  origins: string[];
  destinations: string[];
  departureDate: string;
  returnDate: string;
  adults: number;
  children: number;
  budget: number;
  travelStyles: string[];
  interests: string[];
}

interface TripSetupFormProps {
  initialValues?: Partial<TripDetails>;
  onSubmit: (details: TripDetails) => void;
}

// ── Constants ────────────────────────────────────────────────────────────────
const TRAVEL_STYLES = [
  'Adventure',
  'Luxury',
  'Budget',
  'Family',
  'Cultural',
  'Romantic',
  'Business',
];

const INTERESTS = [
  'Beaches',
  'Mountains',
  'Food & Wine',
  'History',
  'Nightlife',
  'Shopping',
  'Nature',
  'Art',
];

const BUDGET_MIN = 500;
const BUDGET_MAX = 20000;

// ── Sub-components ───────────────────────────────────────────────────────────
function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span style={{ color: '#00B4D8' }}>{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#0A1628' }}>
        {text}
      </span>
    </div>
  );
}

function InputField({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{
        background: 'rgba(255,255,255,0.9)',
        border: '1.5px solid rgba(0,180,216,0.2)',
        color: '#0A1628',
      }}
      onFocus={(e) => {
        e.currentTarget.style.border = '1.5px solid #00B4D8';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,180,216,0.12)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.border = '1.5px solid rgba(0,180,216,0.2)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

function CounterInput({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(0,180,216,0.2)' }}
    >
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white transition-opacity hover:opacity-80"
          style={{ background: '#00B4D8' }}
          disabled={value <= min}
        >
          −
        </button>
        <span className="w-5 text-center font-semibold text-sm" style={{ color: '#0A1628' }}>
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white transition-opacity hover:opacity-80"
          style={{ background: '#00B4D8' }}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ── Main Form ────────────────────────────────────────────────────────────────
export default function TripSetupForm({ initialValues, onSubmit }: TripSetupFormProps) {
  const [origins, setOrigins] = useState<string[]>(initialValues?.origins ?? ['']);
  const [destinations, setDestinations] = useState<string[]>(initialValues?.destinations ?? ['']);
  const [departureDate, setDepartureDate] = useState(initialValues?.departureDate ?? '');
  const [returnDate, setReturnDate] = useState(initialValues?.returnDate ?? '');
  const [adults, setAdults] = useState(initialValues?.adults ?? 2);
  const [children, setChildren] = useState(initialValues?.children ?? 0);
  const [budget, setBudget] = useState(initialValues?.budget ?? 5000);
  const [travelStyles, setTravelStyles] = useState<string[]>(initialValues?.travelStyles ?? []);
  const [interests, setInterests] = useState<string[]>(initialValues?.interests ?? []);
  const [error, setError] = useState('');

  const toggleStyle = useCallback((style: string) => {
    setTravelStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style],
    );
  }, []);

  const toggleInterest = useCallback((interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  }, []);

  const updateOrigin = (index: number, value: string) => {
    setOrigins((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const updateDestination = (index: number, value: string) => {
    setDestinations((prev) => prev.map((d, i) => (i === index ? value : d)));
  };

  const addOrigin = () => setOrigins((prev) => [...prev, '']);
  const removeOrigin = (index: number) =>
    setOrigins((prev) => prev.filter((_, i) => i !== index));

  const addDestination = () => setDestinations((prev) => [...prev, '']);
  const removeDestination = (index: number) =>
    setDestinations((prev) => prev.filter((_, i) => i !== index));

  const budgetLabel =
    budget >= BUDGET_MAX ? '$20,000+' : `$${budget.toLocaleString()}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validOrigins = origins.filter((o) => o.trim());
    const validDestinations = destinations.filter((d) => d.trim());

    if (!validDestinations.length) {
      setError('Please enter at least one destination.');
      return;
    }
    if (!departureDate) {
      setError('Please select a departure date.');
      return;
    }

    onSubmit({
      origins: validOrigins,
      destinations: validDestinations,
      departureDate,
      returnDate,
      adults,
      children,
      budget,
      travelStyles,
      interests,
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        background: 'linear-gradient(135deg, #0A1628 0%, #0d1f3c 40%, #0a2744 70%, #0A1628 100%)',
      }}
    >
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute"
          style={{
            width: 400,
            height: 400,
            top: '-10%',
            right: '-5%',
            background: 'radial-gradient(circle, rgba(0,180,216,0.12), transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          className="absolute"
          style={{
            width: 300,
            height: 300,
            bottom: '5%',
            left: '-5%',
            background: 'radial-gradient(circle, rgba(255,215,0,0.07), transparent 70%)',
            borderRadius: '50%',
          }}
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl"
      >
        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div
            className="px-8 py-7"
            style={{
              background: 'linear-gradient(135deg, #0A1628, #152D55)',
              borderBottom: '3px solid #FFD700',
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #00B4D8, #0096B5)' }}
              >
                AI
              </div>
              <div>
                <h1
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  TRoyGO™ AI Trip Planner
                </h1>
                <p className="text-xs text-white/50">Powered by Claude AI · Personalized for you</p>
              </div>
            </div>
            <p className="text-sm text-white/70 mt-2">
              Tell us about your dream trip and our AI will craft a personalized day-by-day
              itinerary with local insights, restaurant picks, and budget breakdowns.
            </p>
          </div>

          {/* Form body */}
          <div className="px-8 py-7 space-y-6" style={{ background: '#f8fafd' }}>
            {/* ── From / To ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* FROM */}
              <div>
                <SectionLabel icon={<MapPin className="w-3.5 h-3.5" />} text="Where From" />
                <div className="space-y-2">
                  {origins.map((origin, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="flex-1">
                        <InputField
                          value={origin}
                          onChange={(v) => updateOrigin(i, v)}
                          placeholder={i === 0 ? 'City or airport' : 'Another origin'}
                        />
                      </div>
                      {origins.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOrigin(i)}
                          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {origins.length < 3 && (
                    <button
                      type="button"
                      onClick={addOrigin}
                      className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
                      style={{ color: '#00B4D8' }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add departure city
                    </button>
                  )}
                </div>
              </div>

              {/* TO */}
              <div>
                <SectionLabel icon={<MapPin className="w-3.5 h-3.5" />} text="Where To" />
                <div className="space-y-2">
                  {destinations.map((dest, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="flex-1">
                        <InputField
                          value={dest}
                          onChange={(v) => updateDestination(i, v)}
                          placeholder={i === 0 ? 'City or country' : 'Another destination'}
                        />
                      </div>
                      {destinations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDestination(i)}
                          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {destinations.length < 5 && (
                    <button
                      type="button"
                      onClick={addDestination}
                      className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
                      style={{ color: '#00B4D8' }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add destination
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Dates ───────────────────────────────────────────────── */}
            <div>
              <SectionLabel icon={<Calendar className="w-3.5 h-3.5" />} text="Travel Dates" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1 ml-1">Departure</label>
                  <InputField
                    type="date"
                    value={departureDate}
                    onChange={setDepartureDate}
                    placeholder=""
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1 ml-1">Return</label>
                  <InputField
                    type="date"
                    value={returnDate}
                    onChange={setReturnDate}
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            {/* ── Travelers ───────────────────────────────────────────── */}
            <div>
              <SectionLabel icon={<Users className="w-3.5 h-3.5" />} text="Travelers" />
              <div className="grid grid-cols-2 gap-3">
                <CounterInput
                  label="Adults"
                  value={adults}
                  onChange={setAdults}
                  min={1}
                  max={20}
                />
                <CounterInput
                  label="Children"
                  value={children}
                  onChange={setChildren}
                  min={0}
                  max={10}
                />
              </div>
            </div>

            {/* ── Budget ──────────────────────────────────────────────── */}
            <div>
              <SectionLabel icon={<Wallet className="w-3.5 h-3.5" />} text="Budget Range" />
              <div
                className="px-4 pt-4 pb-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(0,180,216,0.2)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">Total budget (per trip)</span>
                  <span className="text-base font-bold" style={{ color: '#0A1628' }}>
                    {budgetLabel}
                  </span>
                </div>
                <input
                  type="range"
                  min={BUDGET_MIN}
                  max={BUDGET_MAX}
                  step={250}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #00B4D8 0%, #00B4D8 ${((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100}%, #e2e8f0 ${((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100}%, #e2e8f0 100%)`,
                  }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-gray-400">$500</span>
                  <span className="text-[10px] text-gray-400">$20,000+</span>
                </div>
              </div>
            </div>

            {/* ── Travel Style ────────────────────────────────────────── */}
            <div>
              <SectionLabel icon={<Sparkles className="w-3.5 h-3.5" />} text="Travel Style" />
              <div className="flex flex-wrap gap-2">
                {TRAVEL_STYLES.map((style) => {
                  const active = travelStyles.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleStyle(style)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={
                        active
                          ? {
                              background: 'linear-gradient(135deg, #00B4D8, #0096B5)',
                              color: '#fff',
                              border: '1.5px solid #00B4D8',
                            }
                          : {
                              background: '#fff',
                              color: '#0A1628',
                              border: '1.5px solid rgba(0,180,216,0.3)',
                            }
                      }
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Interests ───────────────────────────────────────────── */}
            <div>
              <SectionLabel icon={<Sparkles className="w-3.5 h-3.5" />} text="Interests" />
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => {
                  const active = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={
                        active
                          ? {
                              background: 'linear-gradient(135deg, #FFD700, #E6C200)',
                              color: '#0A1628',
                              border: '1.5px solid #FFD700',
                            }
                          : {
                              background: '#fff',
                              color: '#0A1628',
                              border: '1.5px solid rgba(255,215,0,0.4)',
                            }
                      }
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl text-base font-bold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #E6C200)',
                color: '#0A1628',
                boxShadow: '0 4px 20px rgba(255,215,0,0.4)',
              }}
            >
              <Sparkles className="w-5 h-5" />
              Start Planning with AI
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
