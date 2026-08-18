export const dynamic = 'force-dynamic'

const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY

interface DuffelAirport {
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
    const res = await fetch(
      `https://api.duffel.com/air/airports?name=${encodeURIComponent(query)}&limit=8`,
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
    const airports: AirportResult[] = ((data.data ?? []) as DuffelAirport[])
      .filter((a) => a.iata_code)
      .map((a) => ({
        code: a.iata_code as string,
        name: a.name,
        city: a.city_name ?? a.name,
        country: a.iata_country_code ?? '',
      }))

    cache.set(cacheKey, airports)
    return Response.json({ airports })
  } catch {
    return Response.json({ airports: [] })
  }
}
