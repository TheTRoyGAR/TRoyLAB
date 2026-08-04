import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'AI Trip Planner | TRoyGO™ – Plan Your Perfect Journey',
  description:
    'Plan your dream trip with TRoyGO™ AI. Get personalized day-by-day itineraries, local insights, hotel and flight recommendations, budget estimates, and travel tips — powered by Claude AI.',
  keywords: [
    'AI trip planner',
    'travel itinerary',
    'personalized travel',
    'TRoyGO',
    'travel planning',
    'AI travel assistant',
    'vacation planner',
  ],
  openGraph: {
    title: 'AI Trip Planner | TRoyGO™',
    description:
      'Chat with TRoyGO™ AI to craft personalized travel itineraries, discover hidden gems, and plan the perfect journey.',
    type: 'website',
    siteName: 'TRoyGO™',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Trip Planner | TRoyGO™',
    description:
      'Plan your perfect journey with TRoyGO™ AI — personalized itineraries, local insights, and budget breakdowns.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TripPlannerLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
