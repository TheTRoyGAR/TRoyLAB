import { NextRequest, NextResponse } from 'next/server'

// GET route, not POST — needs force-dynamic or searchParams.get() silently
// breaks under static rendering (hit this exact bug on /api/photos/search).
export const dynamic = 'force-dynamic'

interface GeocodeResult {
  lat: number
  lon: number
  displayName: string
}

// In-memory cache — Nominatim's usage policy caps free requests at ~1/sec
// and asks callers not to hammer the same query repeatedly.
const geocodeCache = new Map<string, GeocodeResult | null>()
const inFlight = new Map<string, Promise<GeocodeResult | null>>()

async function geocode(query: string): Promise<GeocodeResult | null> {
  if (geocodeCache.has(query)) return geocodeCache.get(query) ?? null
  if (inFlight.has(query)) return inFlight.get(query)!

  const promise = (async () => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        {
          headers: {
            // Nominatim's usage policy requires a descriptive User-Agent
            // identifying the application, not a generic/browser one.
            'User-Agent': 'TRoyGO-TravelPlanner/1.0 (https://troytravelagency.com)',
          },
        }
      )
      if (!res.ok) return null
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) return null
      const result: GeocodeResult = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      }
      geocodeCache.set(query, result)
      return result
    } catch {
      geocodeCache.set(query, null)
      return null
    } finally {
      inFlight.delete(query)
    }
  })()

  inFlight.set(query, promise)
  return promise
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query')
  if (!query) {
    return NextResponse.json({ error: 'query parameter is required' }, { status: 400 })
  }

  const result = await geocode(query)
  if (!result) {
    return NextResponse.json({ location: null })
  }
  return NextResponse.json({ location: result })
}
