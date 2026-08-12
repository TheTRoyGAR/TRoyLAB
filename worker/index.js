// TRoyGO Flight Proxy Worker
//
// The public site (troytravelagency.com) is a static export with no
// backend of its own, so it can't call OpenSky Network's live flight-state
// API directly from the browser — OpenSky's CORS policy only allows
// requests from their own origin. This Worker makes the request
// server-side and returns it with CORS headers that allow our domain,
// so it's the browser's real proxy to genuinely live flight data.
//
// Free, no API key required for OpenSky's anonymous tier (rate-limited to
// ~100 requests/day per IP — this Worker's IP, not each visitor's, so it's
// shared across all site visitors and cached briefly to stay well under
// that limit).

const ALLOWED_ORIGIN = "https://troytravelagency.com";
const UPSTREAM = "https://opensky-network.org/api/states/all";

function corsHeaders(origin) {
  const allow = origin === ALLOWED_ORIGIN || origin?.endsWith(".workers.dev") ? origin : ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    // Only forward the specific params OpenSky's states/all endpoint
    // accepts — never proxy arbitrary query strings upstream.
    const allowedParams = ["lamin", "lomin", "lamax", "lomax", "icao24"];
    const upstreamUrl = new URL(UPSTREAM);
    for (const key of allowedParams) {
      const value = url.searchParams.get(key);
      if (value !== null) upstreamUrl.searchParams.set(key, value);
    }

    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      headers: { Accept: "application/json" },
      cf: { cacheTtl: 10, cacheEverything: true },
    });

    const body = await upstreamResponse.text();
    return new Response(body, {
      status: upstreamResponse.status,
      headers: {
        ...headers,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=10",
      },
    });
  },
};
