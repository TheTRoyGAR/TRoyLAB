import type { NextConfig } from "next";

// GitHub Pages (thetroygar.github.io/TRoyLAB) can only serve static files, so
// that build needs `output: "export"` + basePath. Vercel runs real server
// functions and needs neither — critically, `output: "export"` disables API
// routes entirely (see src/app/api/ai-planner/route.ts), so it must NOT be
// set for the Vercel build. Gated by GITHUB_PAGES_BUILD, set only in the
// GitHub Pages deploy step — unset (the Vercel default) skips both.
const isGithubPagesBuild = process.env.GITHUB_PAGES_BUILD === "true";

const nextConfig: NextConfig = {
  ...(isGithubPagesBuild
    ? { output: "export" as const, basePath: "/TRoyLAB", trailingSlash: true }
    : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
