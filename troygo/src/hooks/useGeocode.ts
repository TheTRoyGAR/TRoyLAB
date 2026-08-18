'use client';

import { useEffect, useState } from 'react';

export interface GeocodedLocation {
  lat: number;
  lon: number;
  displayName: string;
}

// Same shared-cache pattern as useDestinationPhoto — keeps repeat lookups
// (e.g. the same country appearing on multiple package cards) from firing
// duplicate requests against Nominatim's free, rate-limited endpoint.
const geocodeCache = new Map<string, GeocodedLocation | null>();
const inFlight = new Map<string, Promise<GeocodedLocation | null>>();

async function fetchLocation(query: string): Promise<GeocodedLocation | null> {
  if (geocodeCache.has(query)) return geocodeCache.get(query) ?? null;
  if (inFlight.has(query)) return inFlight.get(query)!;

  const promise = fetch(`/api/geocode?query=${encodeURIComponent(query)}`)
    .then((res) => res.json())
    .then((data) => {
      const location = (data.location as GeocodedLocation | undefined) ?? null;
      geocodeCache.set(query, location);
      return location;
    })
    .catch(() => {
      geocodeCache.set(query, null);
      return null;
    })
    .finally(() => {
      inFlight.delete(query);
    });

  inFlight.set(query, promise);
  return promise;
}

export function useGeocode(query: string): GeocodedLocation | null {
  const [state, setState] = useState<{ query: string; location: GeocodedLocation | null }>({
    query,
    location: geocodeCache.get(query) ?? null,
  });

  // Query changed since last render — resync from cache immediately during
  // render (React's recommended pattern for adjusting state from props)
  // instead of via an effect, which would otherwise call setState
  // synchronously inside the effect body.
  if (state.query !== query) {
    setState({ query, location: geocodeCache.get(query) ?? null });
  }

  useEffect(() => {
    if (!query || geocodeCache.has(query)) return;
    let cancelled = false;
    fetchLocation(query).then((loc) => {
      if (!cancelled) setState({ query, location: loc });
    });
    return () => { cancelled = true; };
  }, [query]);

  return state.location;
}

// Geocodes several queries at once (e.g. a package's destination + each
// country on its route), returning only the ones that resolved.
export function useGeocodeMany(queries: string[]): GeocodedLocation[] {
  const [locations, setLocations] = useState<GeocodedLocation[]>([]);
  const key = queries.join('|');

  useEffect(() => {
    if (queries.length === 0) return;
    let cancelled = false;
    Promise.all(queries.map(fetchLocation)).then((results) => {
      if (cancelled) return;
      const resolved = results.filter((r): r is GeocodedLocation => r !== null);
      setLocations(resolved);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return locations;
}
