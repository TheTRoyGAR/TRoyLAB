'use client';

import { use, useState, useCallback } from 'react';
import TripSetupForm, { type TripDetails } from '@/components/trip-planner/TripSetupForm';
import ChatInterface from '@/components/trip-planner/ChatInterface';

// ── Build a rich initial AI message from the trip details ────────────────────
function buildInitialMessage(details: TripDetails): string {
  const parts: string[] = [];

  const originStr = details.origins.filter(Boolean).join(', ');
  const destStr = details.destinations.join(', ');

  parts.push(
    `I'd like to plan a trip${originStr ? ` from ${originStr}` : ''} to ${destStr}.`,
  );

  if (details.departureDate) {
    const dep = new Date(details.departureDate).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const ret = details.returnDate
      ? new Date(details.returnDate).toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : null;
    parts.push(`We're departing on ${dep}${ret ? ` and returning on ${ret}` : ''}.`);
  }

  const totalTravelers = details.adults + details.children;
  if (totalTravelers > 0) {
    const tParts: string[] = [];
    if (details.adults) tParts.push(`${details.adults} adult${details.adults > 1 ? 's' : ''}`);
    if (details.children)
      tParts.push(`${details.children} child${details.children > 1 ? 'ren' : ''}`);
    parts.push(`Our group has ${tParts.join(' and ')}.`);
  }

  if (details.budget) {
    const budgetStr = details.budget >= 20000 ? '$20,000+' : `$${details.budget.toLocaleString()}`;
    parts.push(`Our total budget is around ${budgetStr}.`);
  }

  if (details.travelStyles.length) {
    parts.push(`Our travel style is: ${details.travelStyles.join(', ')}.`);
  }

  if (details.interests.length) {
    parts.push(`We're particularly interested in: ${details.interests.join(', ')}.`);
  }

  parts.push(
    `Please create a detailed day-by-day itinerary with morning, afternoon, and evening activities. Include local restaurant recommendations, hidden gems, practical tips, transportation advice, and an estimated cost breakdown for each day.`,
  );

  return parts.join(' ');
}

// ── Page state machine ───────────────────────────────────────────────────────
type PageState =
  | { view: 'setup' }
  | { view: 'chat'; tripDetails: TripDetails; initialMessage: string };

// ── Page component (Client, reads searchParams via React.use) ────────────────
export default function TripPlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(searchParams);

  // Build initial form values from URL query params
  const urlFrom = typeof params.from === 'string' ? params.from : '';
  const urlTo = typeof params.to === 'string' ? params.to : '';
  const urlDep = typeof params.departure === 'string' ? params.departure : '';
  const urlRet = typeof params.return === 'string' ? params.return : '';
  const urlAdults = typeof params.adults === 'string' ? parseInt(params.adults, 10) : undefined;
  const urlChildren =
    typeof params.children === 'string' ? parseInt(params.children, 10) : undefined;

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
    const initialMessage = buildInitialMessage(details);
    setState({ view: 'chat', tripDetails: details, initialMessage });
  }, []);

  if (state.view === 'chat') {
    return (
      <ChatInterface
        tripDetails={state.tripDetails}
        initialMessage={state.initialMessage}
      />
    );
  }

  return <TripSetupForm initialValues={initialFormValues} onSubmit={handleFormSubmit} />;
}
