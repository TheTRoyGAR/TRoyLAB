'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plane, ArrowRight } from 'lucide-react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isPending?: boolean;
}

// ── Real flight offer shape (matches src/lib/duffel/search.ts output) ───────
interface FlightLeg {
  flightNumber: string;
  from: { city: string; code: string };
  to: { city: string; code: string };
  departure: string;
  arrival: string;
  duration: string;
  stops: 0 | 1 | 2;
  stopCity?: string;
}
interface FlightOffer extends FlightLeg {
  id: string;
  airline: string;
  returnLeg?: FlightLeg;
  price: { economy: number; business: number; first: number };
  currency: string;
  cabinClassSearched: string;
}
interface FlightRouteSnapshot {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number[];
  infants: number[];
  cabinClass: string;
}
interface FlightCardsPayload {
  flights: FlightOffer[];
  route: FlightRouteSnapshot;
}

const FLIGHTS_MARKER = /<<FLIGHTS_DATA>>([\s\S]*?)<<END_FLIGHTS_DATA>>/g;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

// ── Real, bookable flight offer card — a live Duffel result, not a text
// description. "Book this flight" stashes the exact offer + search params
// the same way /flights does, then hands off to the real booking flow. ──
function FlightOfferCard({ flight, route }: { flight: FlightOffer; route: FlightRouteSnapshot }) {
  const router = useRouter();
  const totalTravelers = route.adults + route.children.length + route.infants.length;

  const handleBook = () => {
    try {
      sessionStorage.setItem(`troygo_flight_${flight.id}`, JSON.stringify(flight));
      sessionStorage.setItem(`troygo_route_${flight.id}`, JSON.stringify(route));
    } catch {
      // sessionStorage can throw in private browsing — booking page falls
      // back gracefully if the stashed flight isn't found.
    }
    router.push(`/booking?type=flight&id=${flight.id}&class=${flight.cabinClassSearched}&passengers=${totalTravelers}`);
  };

  return (
    <div
      className="rounded-xl p-3 my-1.5"
      style={{ background: '#f8fafc', border: '1px solid rgba(0,180,216,0.2)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
            style={{ background: '#0A1628' }}
          >
            <Plane className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: '#0A1628' }}>{flight.airline}</p>
            <p className="text-[11px] text-gray-500">{flight.flightNumber}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold" style={{ color: '#00B4D8' }}>
            {flight.currency} {flight.price.economy.toFixed(2)}
          </p>
          <p className="text-[10px] text-gray-400">{flight.returnLeg ? 'round trip total' : 'total'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
        <span className="font-semibold" style={{ color: '#0A1628' }}>{flight.from.code}</span>
        <span>{formatTime(flight.departure)}</span>
        <ArrowRight className="w-3 h-3 text-gray-300" />
        <span className="font-semibold" style={{ color: '#0A1628' }}>{flight.to.code}</span>
        <span>{formatTime(flight.arrival)}</span>
        <span className="text-gray-400">· {flight.duration} · {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
      </div>
      <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(flight.departure)}</p>

      {flight.returnLeg && (
        <>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-600">
            <span className="font-semibold" style={{ color: '#0A1628' }}>{flight.returnLeg.from.code}</span>
            <span>{formatTime(flight.returnLeg.departure)}</span>
            <ArrowRight className="w-3 h-3 text-gray-300" />
            <span className="font-semibold" style={{ color: '#0A1628' }}>{flight.returnLeg.to.code}</span>
            <span>{formatTime(flight.returnLeg.arrival)}</span>
            <span className="text-gray-400">· {flight.returnLeg.duration} · {flight.returnLeg.stops === 0 ? 'Direct' : `${flight.returnLeg.stops} stop${flight.returnLeg.stops > 1 ? 's' : ''}`}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(flight.returnLeg.departure)} return</p>
        </>
      )}

      <button
        type="button"
        onClick={handleBook}
        className="w-full mt-2.5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:brightness-110"
        style={{ background: '#00B4D8' }}
      >
        Book this flight
      </button>
    </div>
  );
}

function FlightResultsBlock({ payload }: { payload: string }) {
  let data: FlightCardsPayload | null = null;
  try {
    data = JSON.parse(payload);
  } catch {
    return null;
  }
  if (!data || !data.flights?.length) return null;
  return (
    <div className="my-2">
      {data.flights.map((f) => (
        <FlightOfferCard key={f.id} flight={f} route={data!.route} />
      ))}
    </div>
  );
}

// ── Simple markdown renderer ─────────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;
  let i = 0;

  const inlineFormat = (line: string): React.ReactNode => {
    // Bold + italic combinations, then each separately, then code
    const parts = line.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, pi) => {
      if (part.startsWith('***') && part.endsWith('***')) {
        return <strong key={pi}><em>{part.slice(3, -3)}</em></strong>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pi}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={pi}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code
            key={pi}
            className="px-1 py-0.5 rounded text-xs font-mono"
            style={{ background: 'rgba(0,180,216,0.15)', color: '#00B4D8' }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  while (i < lines.length) {
    const line = lines[i];

    // H2: ## heading
    if (/^## (.+)/.test(line)) {
      nodes.push(
        <h2
          key={key++}
          className="text-base font-bold mt-4 mb-1"
          style={{ color: '#0A1628' }}
        >
          {inlineFormat(line.replace(/^## /, ''))}
        </h2>,
      );
      i++;
      continue;
    }

    // H3: ### heading
    if (/^### (.+)/.test(line)) {
      nodes.push(
        <h3
          key={key++}
          className="text-sm font-semibold mt-3 mb-1"
          style={{ color: '#00B4D8' }}
        >
          {inlineFormat(line.replace(/^### /, ''))}
        </h3>,
      );
      i++;
      continue;
    }

    // H1: # heading
    if (/^# (.+)/.test(line)) {
      nodes.push(
        <h1
          key={key++}
          className="text-lg font-bold mt-4 mb-2"
          style={{ color: '#0A1628' }}
        >
          {inlineFormat(line.replace(/^# /, ''))}
        </h1>,
      );
      i++;
      continue;
    }

    // Bullet list item
    if (/^[-*] (.+)/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-*] (.+)/.test(lines[i])) {
        items.push(
          <li key={i} className="ml-1">
            {inlineFormat(lines[i].replace(/^[-*] /, ''))}
          </li>,
        );
        i++;
      }
      nodes.push(
        <ul key={key++} className="list-disc list-inside space-y-0.5 my-1 text-sm">
          {items}
        </ul>,
      );
      continue;
    }

    // Numbered list
    if (/^\d+\. (.+)/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\. (.+)/.test(lines[i])) {
        items.push(
          <li key={i} className="ml-1">
            {inlineFormat(lines[i].replace(/^\d+\. /, ''))}
          </li>,
        );
        i++;
      }
      nodes.push(
        <ol key={key++} className="list-decimal list-inside space-y-0.5 my-1 text-sm">
          {items}
        </ol>,
      );
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={key++} className="my-3 border-black/10" />);
      i++;
      continue;
    }

    // Empty line → paragraph break
    if (line.trim() === '') {
      nodes.push(<div key={key++} className="h-2" />);
      i++;
      continue;
    }

    // Regular paragraph text
    nodes.push(
      <p key={key++} className="text-sm leading-relaxed">
        {inlineFormat(line)}
      </p>,
    );
    i++;
  }

  return nodes;
}

// Splits the message on <<FLIGHTS_DATA>> markers, rendering real bookable
// flight cards inline and everything else as markdown text.
function renderContent(text: string): React.ReactNode {
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let segKey = 0;
  FLIGHTS_MARKER.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = FLIGHTS_MARKER.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    if (before.trim()) {
      segments.push(<React.Fragment key={`t${segKey++}`}>{renderMarkdown(before)}</React.Fragment>);
    }
    segments.push(<FlightResultsBlock key={`f${segKey++}`} payload={match[1]} />);
    lastIndex = FLIGHTS_MARKER.lastIndex;
  }
  const rest = text.slice(lastIndex);
  if (rest.trim()) {
    segments.push(<React.Fragment key={`t${segKey++}`}>{renderMarkdown(rest)}</React.Fragment>);
  }
  return segments;
}

// ── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ background: 'linear-gradient(135deg, #00B4D8, #0096B5)' }}
      >
        AI
      </div>
      {/* Skeleton lines */}
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 rounded animate-pulse" style={{ background: '#e2e8f0', width: '75%' }} />
        <div className="h-3 rounded animate-pulse" style={{ background: '#e2e8f0', width: '60%' }} />
        <div className="h-3 rounded animate-pulse" style={{ background: '#e2e8f0', width: '80%' }} />
      </div>
    </div>
  );
}

// ── Format timestamp ─────────────────────────────────────────────────────────
function formatMsgTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── ChatMessage component ────────────────────────────────────────────────────
export default function ChatMessage({ message }: { message: Message }) {
  if (message.isPending) {
    return (
      <div className="px-4 py-3">
        <LoadingSkeleton />
      </div>
    );
  }

  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-2">
        <div className="max-w-[80%] flex flex-col items-end gap-1">
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm text-white leading-relaxed"
            style={{ background: 'linear-gradient(135deg, #00B4D8, #0096B5)' }}
          >
            {message.content}
          </div>
          <span className="text-[10px] text-black/40 pr-1">{formatMsgTime(message.timestamp)}</span>
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      {/* TRoyGO™ AI Avatar */}
      <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
          style={{ background: 'linear-gradient(135deg, #00B4D8, #0096B5)' }}
        >
          AI
        </div>
        <span
          className="text-[8px] font-bold tracking-tight whitespace-nowrap"
          style={{ color: '#00B4D8' }}
        >
          TRoyGO™
        </span>
      </div>

      {/* Bubble */}
      <div className="flex-1 max-w-[88%] flex flex-col gap-1">
        <div
          className="px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(0,180,216,0.15)',
            color: '#0A1628',
          }}
        >
          <div className="space-y-0.5">{renderContent(message.content)}</div>
        </div>
        <span className="text-[10px] text-black/40 pl-1">{formatMsgTime(message.timestamp)}</span>
      </div>
    </div>
  );
}
