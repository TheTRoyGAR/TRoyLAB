import type { NextConfig } from "next";

// GitHub Pages, served at the custom domain troytravelagency.com (apex, no
// path prefix), can only serve static files, so that build needs
// `output: "export"`. No basePath — the site is served from the domain
// root, not a /TRoyLAB subpath (that only applied to the old
// thetroygar.github.io/TRoyLAB address, retired once the custom domain went
// live 2026-08-12). Vercel runs real server functions and needs neither —
// critically, `output: "export"` disables API routes entirely (see
// src/app/api/ai-planner/route.ts), so it must NOT be set for the Vercel
// build. Gated by GITHUB_PAGES_BUILD, set only in the GitHub Pages deploy
// step — unset (the Vercel default) skips both.
const isGithubPagesBuild = process.env.GITHUB_PAGES_BUILD === "true";

const nextConfig: NextConfig = {
  ...(isGithubPagesBuild
    ? { output: "export" as const, trailingSlash: true }
    : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
