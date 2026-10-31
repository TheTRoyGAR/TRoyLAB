import type { NextConfig } from "next";

// Vercel is the sole deployment target as of 2026-08-18 — it serves
// troytravelagency.com directly and runs real server functions, which
// static export (the old GitHub Pages path) can't do (see
// src/app/api/ai-planner/route.ts). No `output: "export"` needed.
const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // The old agent/guide profile pages described people who were never real; send old links to /agents.
      { source: "/agents/:path+", destination: "/agents", permanent: true },
      // The Track Flights page was removed (2026-11-01): old links go to flight search instead of a 404.
      { source: "/flight-tracker", destination: "/flights", permanent: true },
      { source: "/flight-tracker.html", destination: "/flights", permanent: true },
    ];
  },
};

export default nextConfig;
