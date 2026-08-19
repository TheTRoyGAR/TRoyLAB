'use client';

import { useEffect, useState } from 'react';
import photoCacheData from '@/lib/data/photo-cache.json';

export interface UnsplashPhoto {
  url: string;
  thumbUrl: string;
  photographerName: string;
  photographerUrl: string;
  unsplashUrl: string;
  altDescription: string;
}

// Research-agent-generated destination strings are often messy —
// "Turkey (Istanbul, Gallipoli, Cappadocia & more)" — and Unsplash's search
// returns nothing for long punctuation-heavy queries like that even though
// a plain "Turkey" works fine. Strip parentheticals and keep just the
// primary place name before any comma/ampersand.
export function simplifyForPhotoSearch(destination: string): string {
  return destination
    .replace(/\([^)]*\)/g, '')
    .split(/[,&]/)[0]
    .trim();
}

// Pre-resolved real photos (built by scripts/backfill-photo-cache.mjs,
// hitting the same live Unsplash search this hook falls back to) — keeps
// the same destination showing the same photo across page loads instead of
// re-searching Unsplash live every time, which could surface a different
// top result on each request.
const staticCache = photoCacheData as Record<string, UnsplashPhoto | null>;

// Simple in-memory cache shared across every card on the page, keyed by
// search query — without this, a listing page with 12+ cards would fire
// 12+ separate Unsplash requests every render, quickly burning through the
// free tier's 50 requests/hour limit even for repeat queries.
const photoCache = new Map<string, UnsplashPhoto | null>();
const inFlight = new Map<string, Promise<UnsplashPhoto | null>>();

async function fetchPhoto(query: string): Promise<UnsplashPhoto | null> {
  if (photoCache.has(query)) return photoCache.get(query) ?? null;
  if (inFlight.has(query)) return inFlight.get(query)!;

  const promise = fetch(`/api/photos/search?query=${encodeURIComponent(query)}`)
    .then((res) => res.json())
    .then((data) => {
      const photo = (data.photo as UnsplashPhoto | undefined) ?? null;
      photoCache.set(query, photo);
      return photo;
    })
    .catch(() => {
      photoCache.set(query, null);
      return null;
    })
    .finally(() => {
      inFlight.delete(query);
    });

  inFlight.set(query, promise);
  return promise;
}

function resolveFromCache(rawQuery: string, query: string): UnsplashPhoto | null | undefined {
  if (staticCache[rawQuery] !== undefined) return staticCache[rawQuery];
  if (staticCache[query] !== undefined) return staticCache[query];
  if (photoCache.has(query)) return photoCache.get(query) ?? null;
  return undefined;
}

export function useDestinationPhoto(rawQuery: string): UnsplashPhoto | null {
  const query = simplifyForPhotoSearch(rawQuery || '');
  const [state, setState] = useState<{ rawQuery: string; photo: UnsplashPhoto | null }>({
    rawQuery,
    photo: resolveFromCache(rawQuery, query) ?? null,
  });

  // Query changed since last render — resync from any cache synchronously
  // during render (React's recommended pattern for adjusting state from
  // props) rather than via an effect, which would call setState directly
  // in the effect body for the cache-hit case.
  if (state.rawQuery !== rawQuery) {
    setState({ rawQuery, photo: resolveFromCache(rawQuery, query) ?? null });
  }

  useEffect(() => {
    if (!query) return;
    if (resolveFromCache(rawQuery, query) !== undefined) return;
    let cancelled = false;
    fetchPhoto(query).then((p) => {
      if (!cancelled) setState({ rawQuery, photo: p });
    });
    return () => { cancelled = true; };
  }, [rawQuery, query]);

  return state.photo;
}
