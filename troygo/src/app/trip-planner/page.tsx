'use client';

import { Suspense, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import TripSetupForm, { type TripDetails } from '@/components/trip-planner/TripSetupForm';
import ChatInterface from '@/components/trip-planner/ChatInterface';

function buildInitialMessage(details: TripDetails): string {
  const parts: string[] = [];
  const originStr = details.origins.filter(Boolean).join(', ');
  const destStr = details.destinations.join(', ');
  parts.push(`I'd like to plan a trip${originStr ? ` from ${originStr}` : ''} to ${destStr}.`);
  if (details.departureDate) {
    const dep = new Date(details.departureDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const ret = details.returnDate ? new Date(details.returnDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : null;
    parts.push(`We're departing on ${dep}${ret ? ` and returning on ${ret}` : ''}.`);
  }
  const total = details.adults + details.children;
  if (total > 0) {
    const t: string[] = [];
    if (details.adults) t.push(`${details.adults} adult${details.adults > 1 ? 's' : ''}`);
    if (details.children) t.push(`${details.children} child${details.children > 1 ? 'ren' : ''}`);
    parts.push(`Our group has ${t.join(' and ')}.`);
  }
  if (details.budget) parts.push(`Our total budget is around ${details.budget >= 20000 ? '$20,000+' : `$${details.budget.toLocaleString()}`}.`);
  if (details.travelStyles.length) parts.push(`Travel style: ${details.travelStyles.join(', ')}.`);
  if (details.interests.length) parts.push(`Interests: ${details.interests.join(', ')}.`);
  parts.push(`Please create a detailed day-by-day itinerary with morning, afternoon, and evening activities. Include local restaurant recommendations, hidden gems, practical tips, transportation advice, and an estimated cost breakdown for each day.`);
  return parts.join(' ');
}

type PageState = { view: 'setup' } | { view: 'chat'; tripDetails: TripDetails; initialMessage: string };

function TripPlannerContent() {
  const params = useSearchParams();
  const urlFrom = params.get('from') ?? '';
  const urlTo = params.get('to') ?? '';
  const urlDep = params.get('departure') ?? '';
  const urlRet = params.get('return') ?? '';
  const urlAdults = params.get('adults') ? parseInt(params.get('adults')!, 10) : undefined;
  const urlChildren = params.get('children') ? parseInt(params.get('children')!, 10) : undefined;

  const initialFormValues: Partial<TripDetails> = {
    origins: urlFrom ? [urlFrom] : undefined,
    destinations: urlTo ? [urlTo] : undefined,
    departureDate: urlDep || undefined,
    returnDate: urlRet || undefined,
    adults: urlAdults && !isNaN(urlAdults) ? urlAdults : undefined,
    children: urlChildren && !isNaN(urlChildren) ? urlChildren : undefined,
  };

  const [state, setState] = useState<PageState>({ view: 'setup' });

  const handleFormSubmit = useCallback((details: TripDetails) => {
    setState({ view: 'chat', tripDetails: details, initialMessage: buildInitialMessage(details) });
  }, []);

  if (state.view === 'chat') {
    return <ChatInterface tripDetails={state.tripDetails} initialMessage={state.initialMessage} />;
  }

  return <TripSetupForm initialValues={initialFormValues} onSubmit={handleFormSubmit} />;
}

export default function TripPlannerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>}>
      <TripPlannerContent />
    </Suspense>
  );
}
