// NOT force-static: this route reads a real query string (?query=) on every
// request, which static rendering evaluates without the actual request URL —
// that was silently breaking search param reading (always saw query=null).
// The other routes here (ai-planner, flights/search) read POST bodies
// instead, which isn't affected by this the same way.
export const dynamic = 'force-dynamic'

// Real destination photos via Unsplash. Follows Unsplash's API guidelines:
// hotlink their image URLs directly (never download/rehost), trigger their
// download-tracking endpoint when a photo is actually used, and always
// return photographer + Unsplash attribution for the UI to display.
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

export async function GET(request: Request) {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      return new Response(JSON.stringify({ error: 'Photo search is not configured (missing UNSPLASH_ACCESS_KEY).' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    if (!query) {
      return new Response(JSON.stringify({ error: 'query parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        signal: AbortSignal.timeout(15000),
      }
    )

    if (!res.ok) {
      const errBody = await res.text()
      return new Response(JSON.stringify({ error: 'Unsplash search failed', details: errBody }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await res.json()
    const photo = data.results?.[0]
    if (!photo) {
      return new Response(JSON.stringify({ photo: null }), { headers: { 'Content-Type': 'application/json' } })
    }

    // Required by Unsplash's API guidelines: trigger their download endpoint
    // whenever a photo is actually used/displayed, not just searched.
    // Fire-and-forget — don't block the response on this.
    fetch(photo.links.download_location, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    }).catch(() => {})

    return new Response(
      JSON.stringify({
        photo: {
          url: photo.urls.regular,
          thumbUrl: photo.urls.small,
          photographerName: photo.user.name,
          photographerUrl: `${photo.user.links.html}?utm_source=troygo&utm_medium=referral`,
          unsplashUrl: `${photo.links.html}?utm_source=troygo&utm_medium=referral`,
          altDescription: photo.alt_description ?? query,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Photo search error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
