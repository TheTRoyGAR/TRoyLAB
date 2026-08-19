// Resolves a real photo once per real destination and writes it into
// src/lib/data/photo-cache.json, so the site shows the same photo for the
// same destination on every page load instead of live-searching Unsplash
// fresh each time (which could surface a different top result per request).
//
// Hits the site's own deployed /api/photos/search route rather than calling
// Unsplash directly — reuses the same key/rate-limit handling already there,
// and needs no local UNSPLASH_ACCESS_KEY (it only lives in Vercel).
//
// Run: node scripts/backfill-photo-cache.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'src', 'lib', 'data')
const SITE = 'https://troytravelagency.com'

function simplifyForPhotoSearch(destination) {
  return destination.replace(/\([^)]*\)/g, '').split(/[,&]/)[0].trim()
}

function readJson(file, fallback = []) {
  try {
    return JSON.parse(readFileSync(path.join(DATA_DIR, file), 'utf-8'))
  } catch {
    return fallback
  }
}

function collectQueries() {
  const queries = new Set()

  for (const p of readJson('packages-live.json')) {
    if (p.destination) queries.add(simplifyForPhotoSearch(p.destination))
  }
  for (const h of readJson('hotels-live.json')) {
    if (h.location?.city) queries.add(simplifyForPhotoSearch(h.location.city))
  }
  for (const c of readJson('cars-live.json')) {
    for (const loc of c.pickupLocations ?? []) {
      const simplified = simplifyForPhotoSearch(loc)
      // Generic labels ("Airport", "Downtown") aren't real search terms.
      if (simplified && !/^(airport|downtown)$/i.test(simplified)) queries.add(simplified)
    }
  }
  for (const cr of readJson('cruises-live.json')) {
    if (cr.departurePort) queries.add(simplifyForPhotoSearch(cr.departurePort))
  }

  // The hardcoded curated queries FeaturedDestinations.tsx uses directly.
  const curated = [
    'Paris France Eiffel Tower',
    'Bali Indonesia beach temple',
    'Cancun Mexico beach resort',
    'Tokyo Kyoto Japan travel',
    'Antigua Caribbean beach',
    'Italy Tuscany travel landscape',
  ]
  curated.forEach((q) => queries.add(q))

  return [...queries].filter(Boolean)
}

async function main() {
  const cachePath = path.join(DATA_DIR, 'photo-cache.json')
  const existing = readJson('photo-cache.json', {})
  const queries = collectQueries()

  console.log(`Resolving ${queries.length} destination photo queries...`)
  let resolved = 0
  let skipped = 0

  for (const query of queries) {
    if (existing[query] !== undefined) {
      skipped++
      continue
    }
    try {
      const res = await fetch(`${SITE}/api/photos/search?query=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (data.error) {
        // A real failure (e.g. rate limit) — leave unresolved so a future
        // run retries it, rather than permanently caching it as "no photo".
        console.log(`  ✗ ${query} — ${data.error}: ${data.details ?? ''}`)
        continue
      }
      existing[query] = data.photo ?? null
      resolved++
      console.log(`  ${data.photo ? '✓' : '·'} ${query}`)
    } catch (err) {
      console.log(`  ✗ ${query} — ${err.message}`)
    }
    // Unsplash demo tier: 50 req/hour — pace requests to stay well under.
    await new Promise((r) => setTimeout(r, 400))
  }

  writeFileSync(cachePath, JSON.stringify(existing, null, 2), 'utf-8')
  console.log(`\nResolved ${resolved} new, skipped ${skipped} already cached. Wrote ${cachePath}`)
}

main()
