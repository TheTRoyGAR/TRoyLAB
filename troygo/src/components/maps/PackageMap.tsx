'use client';

import dynamic from 'next/dynamic';
import { useGeocodeMany } from '@/hooks/useGeocode';
import type { MapPin } from './InteractiveMap';

// Leaflet reads `window`/`document` at import time, so it can never run
// during server-side rendering — must be loaded client-only.
const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
      Loading map…
    </div>
  ),
});

interface PackageMapProps {
  destination: string;
  countries: string[];
  className?: string;
}

export default function PackageMap({ destination, countries, className }: PackageMapProps) {
  // Geocode the destination plus every distinct country on the route so a
  // multi-country package (e.g. a Southeast Asia tour) shows a real route,
  // not just one pin.
  const queries = Array.from(new Set([destination, ...countries]));
  const locations = useGeocodeMany(queries);

  const pins: MapPin[] = locations.map((loc) => ({
    lat: loc.lat,
    lon: loc.lon,
    label: loc.displayName.split(',')[0],
  }));

  if (pins.length === 0) {
    return (
      <div
        className={`w-full h-52 rounded-2xl flex items-center justify-center text-white/70 font-medium ${className ?? ''}`}
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #102444 100%)' }}
      >
        🗺 Map unavailable for {destination}
      </div>
    );
  }

  return (
    <div className={`w-full h-52 rounded-2xl overflow-hidden ${className ?? ''}`}>
      <InteractiveMap pins={pins} className="w-full h-full" />
    </div>
  );
}
