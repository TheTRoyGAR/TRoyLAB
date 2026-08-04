'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Users,
  Wallet,
  Bookmark,
  Share2,
  CreditCard,
  Sun,
  Sunset,
  Moon,
  Clock,
  X,
} from 'lucide-react';
import type { TripDetails } from './TripSetupForm';

// ── Types ────────────────────────────────────────────────────────────────────
export interface DayActivity {
  time: 'Morning' | 'Afternoon' | 'Evening';
  activity: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  activities: DayActivity[];
  estimatedCost?: string;
}

export interface ParsedItinerary {
  days: ItineraryDay[];
  totalEstimatedCost?: string;
}

// ── Parse AI response to extract itinerary structure ─────────────────────────
export function parseItineraryFromText(text: string): ParsedItinerary {
  const days: ItineraryDay[] = [];
  const lines = text.split('\n');

  let currentDay: ItineraryDay | null = null;
  let currentTime: DayActivity['time'] | null = null;
  let activityBuffer: string[] = [];
  let totalCost: string | undefined;

  const flushActivity = () => {
    if (currentDay && currentTime && activityBuffer.length > 0) {
      currentDay.activities.push({
        time: currentTime,
        activity: activityBuffer.join(' ').trim(),
      });
      activityBuffer = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Match "## Day N: Title" or "## Day N - Title"
    const dayMatch = line.match(/^#+\s*Day\s+(\d+)[:\-–\s]+(.+)/i);
    if (dayMatch) {
      flushActivity();
      if (currentDay) days.push(currentDay);
      currentDay = {
        dayNumber: parseInt(dayMatch[1], 10),
        title: dayMatch[2].trim(),
        activities: [],
      };
      currentTime = null;
      continue;
    }

    // Match "### Morning" / "### Afternoon" / "### Evening"
    const timeMatch = line.match(/^#+\s*(Morning|Afternoon|Evening)/i);
    if (timeMatch) {
      flushActivity();
      currentTime = timeMatch[1] as DayActivity['time'];
      continue;
    }

    // Estimated cost line
    const costMatch = line.match(/\*?\*?Estimated\s+Cost[:\s]+(\$[\d,\s\-–]+)/i);
    if (costMatch && currentDay) {
      currentDay.estimatedCost = costMatch[1].trim();
      continue;
    }

    // Total cost
    const totalMatch = line.match(/Total.*?Cost[:\s]+(\$[\d,\s\-–]+)/i);
    if (totalMatch) {
      totalCost = totalMatch[1].trim();
      continue;
    }

    // Bullet or content lines under a time section
    if (currentDay && currentTime) {
      const stripped = line.replace(/^[-*•]\s*/, '').replace(/\*\*/g, '');
      if (stripped) activityBuffer.push(stripped);
    }
  }

  // Flush final
  flushActivity();
  if (currentDay) days.push(currentDay);

  return { days, totalEstimatedCost: totalCost };
}

// ── Time icon ────────────────────────────────────────────────────────────────
function TimeIcon({ time }: { time: DayActivity['time'] }) {
  const props = { className: 'w-3.5 h-3.5 flex-shrink-0' };
  if (time === 'Morning') return <Sun {...props} style={{ color: '#FFD700' }} />;
  if (time === 'Afternoon') return <Sunset {...props} style={{ color: '#FF8C42' }} />;
  return <Moon {...props} style={{ color: '#00B4D8' }} />;
}

// ── MapPlaceholder ───────────────────────────────────────────────────────────
function MapPlaceholder({ day, destination }: { day: number; destination: string }) {
  return (
    <div
      className="relative w-full h-36 rounded-2xl overflow-hidden flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0A1628, #152D55, #0d3a5c, #0A1628)',
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,180,216,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Glow dot */}
      <div
        className="absolute rounded-full animate-pulse"
        style={{
          width: 40,
          height: 40,
          background: 'radial-gradient(circle, rgba(0,180,216,0.6), transparent 70%)',
          top: '30%',
          left: '45%',
        }}
      />
      <div
        className="absolute w-2.5 h-2.5 rounded-full border-2 border-white"
        style={{ background: '#00B4D8', top: '43%', left: '47%' }}
      />
      {/* Labels */}
      <div className="relative z-10 text-center">
        <MapPin className="w-5 h-5 mx-auto mb-1" style={{ color: '#00B4D8' }} />
        <p className="text-white text-xs font-semibold">{destination || 'Your Destination'}</p>
        <p className="text-white/50 text-[10px] mt-0.5">Interactive Map · Day {day}</p>
      </div>
    </div>
  );
}

// ── Cost breakdown row ───────────────────────────────────────────────────────
function CostRow({ label, amount }: { label: string; amount: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold" style={{ color: '#0A1628' }}>
        {amount}
      </span>
    </div>
  );
}

// ── Main ItineraryPanel ──────────────────────────────────────────────────────
interface ItineraryPanelProps {
  itinerary: ParsedItinerary;
  tripDetails?: TripDetails;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function ItineraryPanel({
  itinerary,
  tripDetails,
  isOpen,
  onToggle,
  onClose,
}: ItineraryPanelProps) {
  const [activeDay, setActiveDay] = useState(1);

  const destination = useMemo(
    () => tripDetails?.destinations?.join(', ') ?? 'Your Destination',
    [tripDetails],
  );

  const activeDayData = useMemo(
    () => itinerary.days.find((d) => d.dayNumber === activeDay) ?? itinerary.days[0],
    [itinerary.days, activeDay],
  );

  const dateRange = useMemo(() => {
    if (!tripDetails?.departureDate) return null;
    const dep = new Date(tripDetails.departureDate);
    const ret = tripDetails.returnDate ? new Date(tripDetails.returnDate) : null;
    const fmt = (d: Date) =>
      d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return ret ? `${fmt(dep)} – ${fmt(ret)}` : fmt(dep);
  }, [tripDetails]);

  const travelers = useMemo(() => {
    if (!tripDetails) return null;
    const parts = [];
    if (tripDetails.adults) parts.push(`${tripDetails.adults} adult${tripDetails.adults > 1 ? 's' : ''}`);
    if (tripDetails.children) parts.push(`${tripDetails.children} child${tripDetails.children > 1 ? 'ren' : ''}`);
    return parts.join(', ');
  }, [tripDetails]);

  const hasItinerary = itinerary.days.length > 0;

  return (
    <>
      {/* ── Toggle Tab (left edge, only visible when panel is closed or as handle) ── */}
      <button
        onClick={onToggle}
        className="hidden md:flex fixed top-1/2 -translate-y-1/2 z-40 items-center justify-center gap-1 py-8 px-2 rounded-l-2xl shadow-xl transition-all hover:px-3"
        style={{
          right: isOpen ? 420 : 0,
          background: 'linear-gradient(180deg, #0A1628, #152D55)',
          color: '#00B4D8',
          border: '1px solid rgba(0,180,216,0.3)',
          borderRight: 'none',
          writingMode: 'vertical-rl',
        }}
        aria-label={isOpen ? 'Close itinerary panel' : 'Open itinerary panel'}
      >
        <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase rotate-180">
          Itinerary
        </span>
        {isOpen ? (
          <ChevronRight className="w-4 h-4 mt-2" />
        ) : (
          <ChevronLeft className="w-4 h-4 mt-2" />
        )}
      </button>

      {/* ── Mobile overlay backdrop ─────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* ── Panel ──────────────────────────────────────────────────────────── */}
      <div
        className="fixed top-0 right-0 h-full z-40 flex flex-col shadow-2xl transition-transform duration-300"
        style={{
          width: '100vw',
          maxWidth: 420,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          background: '#f8fafd',
          borderLeft: '1px solid rgba(0,180,216,0.2)',
        }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #0A1628, #152D55)',
            borderBottom: '2px solid #FFD700',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #00B4D8, #0096B5)' }}
            >
              AI
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Your Itinerary</h2>
              <p className="text-[10px] text-white/50">
                {hasItinerary ? `${itinerary.days.length} day${itinerary.days.length > 1 ? 's' : ''} planned` : 'AI is planning…'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Trip Summary Card */}
          <div
            className="mx-4 mt-4 rounded-2xl p-4 space-y-3"
            style={{
              background: 'linear-gradient(135deg, #0A1628, #152D55)',
              border: '1px solid rgba(0,180,216,0.2)',
            }}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: '#00B4D8' }} />
              <span className="text-white font-semibold text-sm truncate">{destination}</span>
            </div>
            {dateRange && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: '#FFD700' }} />
                <span className="text-white/70 text-xs">{dateRange}</span>
              </div>
            )}
            {travelers && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 flex-shrink-0" style={{ color: '#00B4D8' }} />
                <span className="text-white/70 text-xs">{travelers}</span>
              </div>
            )}
            {tripDetails?.budget && (
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 flex-shrink-0" style={{ color: '#FFD700' }} />
                <span className="text-white/70 text-xs">
                  Budget: {tripDetails.budget >= 20000 ? '$20,000+' : `$${tripDetails.budget.toLocaleString()}`}
                </span>
              </div>
            )}
          </div>

          {!hasItinerary ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.2)' }}
              >
                <Clock className="w-8 h-8" style={{ color: '#00B4D8' }} />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Itinerary Coming Soon</h3>
              <p className="text-sm text-gray-500">
                Chat with TRoyGO™ AI to generate your personalized day-by-day itinerary. It will
                appear here as the AI builds it.
              </p>
            </div>
          ) : (
            <>
              {/* Day selector tabs */}
              <div className="px-4 mt-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {itinerary.days.map((day) => (
                    <button
                      key={day.dayNumber}
                      onClick={() => setActiveDay(day.dayNumber)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={
                        activeDay === day.dayNumber
                          ? {
                              background: 'linear-gradient(135deg, #00B4D8, #0096B5)',
                              color: '#fff',
                            }
                          : {
                              background: '#fff',
                              color: '#0A1628',
                              border: '1.5px solid rgba(0,180,216,0.3)',
                            }
                      }
                    >
                      Day {day.dayNumber}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active day card */}
              {activeDayData && (
                <div className="mx-4 mt-3 space-y-3">
                  {/* Day title */}
                  <div
                    className="rounded-2xl px-4 py-3"
                    style={{
                      background: '#fff',
                      border: '1px solid rgba(0,180,216,0.15)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(0,180,216,0.12)', color: '#00B4D8' }}
                      >
                        Day {activeDayData.dayNumber}
                      </span>
                      {activeDayData.estimatedCost && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full ml-auto"
                          style={{ background: 'rgba(255,215,0,0.15)', color: '#B8960C' }}
                        >
                          {activeDayData.estimatedCost}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm" style={{ color: '#0A1628' }}>
                      {activeDayData.title}
                    </h3>
                  </div>

                  {/* Map placeholder */}
                  <MapPlaceholder day={activeDayData.dayNumber} destination={destination} />

                  {/* Activities */}
                  {(['Morning', 'Afternoon', 'Evening'] as const).map((time) => {
                    const acts = activeDayData.activities.filter((a) => a.time === time);
                    if (!acts.length) return null;
                    return (
                      <div
                        key={time}
                        className="rounded-2xl p-4"
                        style={{
                          background: '#fff',
                          border: '1px solid rgba(0,180,216,0.12)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <TimeIcon time={time} />
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            {time}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {acts.map((act, i) => (
                            <p key={i} className="text-sm text-gray-700 leading-relaxed">
                              {act.activity}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Cost breakdown */}
              {(itinerary.totalEstimatedCost || itinerary.days.some((d) => d.estimatedCost)) && (
                <div
                  className="mx-4 mt-3 rounded-2xl p-4"
                  style={{ background: '#fff', border: '1px solid rgba(0,180,216,0.12)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Wallet className="w-4 h-4" style={{ color: '#00B4D8' }} />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Estimated Costs
                    </span>
                  </div>
                  {itinerary.days.map(
                    (day) =>
                      day.estimatedCost && (
                        <CostRow
                          key={day.dayNumber}
                          label={`Day ${day.dayNumber} – ${day.title}`}
                          amount={day.estimatedCost}
                        />
                      ),
                  )}
                  {itinerary.totalEstimatedCost && (
                    <div
                      className="flex items-center justify-between pt-3 mt-2"
                      style={{ borderTop: '2px solid rgba(0,180,216,0.2)' }}
                    >
                      <span className="text-sm font-bold" style={{ color: '#0A1628' }}>
                        Total Estimated
                      </span>
                      <span className="text-base font-bold" style={{ color: '#00B4D8' }}>
                        {itinerary.totalEstimatedCost}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom padding for action buttons */}
              <div className="h-36" />
            </>
          )}
        </div>

        {/* ── Fixed Action Buttons ──────────────────────────────────────────── */}
        <div
          className="flex-shrink-0 px-4 py-4 space-y-2"
          style={{
            background: '#f8fafd',
            borderTop: '1px solid rgba(0,180,216,0.15)',
          }}
        >
          {/* Book button */}
          <button
            className="w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #E6C200)',
              color: '#0A1628',
              boxShadow: '0 4px 16px rgba(255,215,0,0.35)',
            }}
          >
            <CreditCard className="w-4 h-4" />
            Book This Itinerary
          </button>

          {/* Save + Share */}
          <div className="flex gap-2">
            <button
              className="flex-1 py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{
                background: '#fff',
                color: '#0A1628',
                border: '1.5px solid rgba(0,180,216,0.3)',
              }}
            >
              <Bookmark className="w-4 h-4" style={{ color: '#00B4D8' }} />
              Save Trip
            </button>
            <button
              className="flex-1 py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{
                background: '#fff',
                color: '#0A1628',
                border: '1.5px solid rgba(0,180,216,0.3)',
              }}
            >
              <Share2 className="w-4 h-4" style={{ color: '#00B4D8' }} />
              Share
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
