# TRoyGO™ Trip Planner — Chrome Extension

A lightweight popup that embeds the real, live TRoyGO™ site (troytravelagency.com) — Trip Planner, Flights, Hotels, Packages, and Home — directly in the browser toolbar. No separate backend: it's an iframe into the live site, so it's always up to date with production.

## Load it locally (for testing, before Web Store submission)

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select this `chrome-extension/` folder.
5. The TRoyGO™ icon appears in the toolbar — click it to open the popup.

## Publishing to the Chrome Web Store

Requires a separate one-time $5 USD Chrome Web Store developer registration (different from a Google Play Developer account). Once registered:

1. Zip the contents of this folder (not the folder itself — manifest.json should be at the zip root).
2. Upload at https://chrome.google.com/webstore/devconsole.
3. Fill in store listing details (screenshots, description, privacy policy — required since the extension loads a live remote site).
4. Submit for review (typically a few days).

## Files

- `manifest.json` — Manifest V3 config.
- `popup.html` / `popup.js` — the popup UI, tab bar, and iframe logic.
- `icons/` — generated from the real TRoy Travel Agency™ logo.
