const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY

interface DuffelPlace {
  iata_code: string | null
  name: string
  city_name: string | null
}

const cache = new Map<string, string | null>()

// Resolves free text ("Sydney", "Darwin airport") or an already-valid
// 3-letter IATA code into a real airport code via Duffel's own place
// search — never guesses a code from memory, since a wrong code silently
// searches the wrong airport.
export async function resolveIataCode(input: string): Promise<string | null> {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase()
  if (!DUFFEL_API_KEY) return null

  const cacheKey = trimmed.toLowerCase()
  if (cache.has(cacheKey)) return cache.get(cacheKey)!

  try {
    const res = await fetch(
      `https://api.duffel.com/places/suggestions?query=${encodeURIComponent(trimmed)}`,
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
      cache.set(cacheKey, null)
      return null
    }
    const data = await res.json()
    const first = ((data.data ?? []) as DuffelPlace[]).find((p) => p.iata_code)
    const code = first?.iata_code ?? null
    cache.set(cacheKey, code)
    return code
  } catch {
    return null
  }
}
