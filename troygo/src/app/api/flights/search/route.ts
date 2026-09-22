export const dynamic = 'force-static'

import { searchFlights } from '@/lib/duffel/search'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      origin, destination, departureDate, returnDate,
      adults = 1, children = [], infants = [],
      cabinClass = 'economy',
    } = body as {
      origin: string
      destination: string
      departureDate: string
      returnDate?: string
      adults?: number
      children?: number[]
      infants?: number[]
      cabinClass?: string
    }

    const result = await searchFlights({ origin, destination, departureDate, returnDate, adults, children, infants, cabinClass })

    if ('error' in result) {
      return new Response(JSON.stringify({ error: result.error, details: result.details }), {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Flight search error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
