export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  try {
    // Using Open Exchange Rates free tier
    // Free tier provides ~1500 requests/month
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      headers: { 'Accept-Encoding': 'gzip' },
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates')
    }

    const data = await response.json()

    return Response.json({
      base: 'USD',
      rates: {
        USD: 1,
        EUR: data.rates.EUR,
        GBP: data.rates.GBP,
        JPY: data.rates.JPY,
        CAD: data.rates.CAD,
        AUD: data.rates.AUD,
        AED: data.rates.AED,
      },
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Exchange rates API error:', error)

    // Fallback rates
    return Response.json({
      base: 'USD',
      rates: {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 149.5,
        CAD: 1.36,
        AUD: 1.53,
        AED: 3.67,
      },
      timestamp: Date.now(),
    })
  }
}
