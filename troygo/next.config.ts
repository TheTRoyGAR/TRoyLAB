import type { NextConfig } from "next";

// Vercel is the sole deployment target as of 2026-08-18 — it serves
// troytravelagency.com directly and runs real server functions, which
// static export (the old GitHub Pages path) can't do (see
// src/app/api/ai-planner/route.ts). No `output: "export"` needed.
const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
