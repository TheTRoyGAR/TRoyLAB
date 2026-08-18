'use client';

import { useEffect, useState } from 'react';

export interface UnsplashPhoto {
  url: string;
  thumbUrl: string;
  photographerName: string;
  photographerUrl: string;
  unsplashUrl: string;
  altDescription: string;
}

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

export function useDestinationPhoto(query: string): UnsplashPhoto | null {
  const [photo, setPhoto] = useState<UnsplashPhoto | null>(photoCache.get(query) ?? null);

  useEffect(() => {
    if (!query) return;
    if (photoCache.has(query)) {
      setPhoto(photoCache.get(query) ?? null);
      return;
    }
    let cancelled = false;
    fetchPhoto(query).then((p) => {
      if (!cancelled) setPhoto(p);
    });
    return () => { cancelled = true; };
  }, [query]);

  return photo;
}
