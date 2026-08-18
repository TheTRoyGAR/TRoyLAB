export const dynamic = 'force-dynamic'

const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY

interface DuffelPlace {
  type: 'airport' | 'city'
  iata_code: string | null
  name: string
  city_name: string | null
  iata_country_code: string | null
}

export interface AirportResult {
  code: string
  name: string
  city: string
  country: string
}

// In-memory cache — airport names/codes don't change between requests,
// no reason to re-hit Duffel for the same typed query repeatedly.
const cache = new Map<string, AirportResult[]>()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')?.trim() ?? ''

  if (query.length < 2) {
    return Response.json({ airports: [] })
  }

  if (!DUFFEL_API_KEY) {
    return Response.json({ error: 'Airport search is not configured (missing DUFFEL_API_KEY).' }, { status: 503 })
  }

  const cacheKey = query.toLowerCase()
  if (cache.has(cacheKey)) {
    return Response.json({ airports: cache.get(cacheKey) })
  }

  try {
    // Duffel's /air/airports endpoint has no free-text search (only
    // iata_country_code filtering) — it silently ignored a "name" query
    // param and always returned the same default alphabetical page, which
    // is why every typed city returned identical results. /places/suggestions
    // is Duffel's real text-search endpoint for this.
    const res = await fetch(
      `https://api.duffel.com/places/suggestions?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${DUFFEL_API_KEY}`,
          'Duffel-Version': 'v2',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      }
    )

    if (!res.ok) {
      return Response.json({ airports: [] })
    }

    const data = await res.json()
    const airports: AirportResult[] = ((data.data ?? []) as DuffelPlace[])
      .filter((p) => p.iata_code)
      .slice(0, 8)
      .map((p) => ({
        code: p.iata_code as string,
        name: p.name,
        city: p.city_name ?? p.name,
        country: p.iata_country_code ?? '',
      }))

    cache.set(cacheKey, airports)
    return Response.json({ airports })
  } catch {
    return Response.json({ airports: [] })
  }
}
