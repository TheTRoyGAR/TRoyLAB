# TRoyGO Travel Research Agent

A standalone Python agent (separate from the Next.js app) that searches the real web for current travel deals and writes them into `../../src/lib/data/packages-live.json`, which `packages.ts` imports at build time.

## One-time setup

```
py -3.13 -m pip install -e .
cp .env.example .env   # then fill in ANTHROPIC_API_KEY and SERPER_API_KEY
```

## Running it

From this folder:

```
py -3.13 run.py
```

This searches the web for real current deals, validates the results, and writes:

- `../../src/lib/data/packages-live.json` — consumed by the site
- `output/run-<timestamp>.log.json` — audit trail: raw output + every source URL the agent actually visited

## Full pipeline (research → rebuild → deploy)

Run `run_and_deploy.ps1` from this folder — it runs the agent, rebuilds the static site, and pushes the fresh build to the `gh-pages` branch. See that script's comments for the exact steps.

## Why a `sourceUrl` field

Every generated package includes the real URL the agent actually scraped to find it. This isn't optional — the script hard-fails a run if any item is missing one. It's the difference between "the agent found a real deal" and "the agent made something up that sounds plausible." Spot-check a few `sourceUrl`s by hand after each run.
