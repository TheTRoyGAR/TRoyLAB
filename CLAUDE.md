# TRoyLAB — Claude Code Memory

## Owner
- Name: Troy (TheTRoyGAR)
- GitHub: github.com/TheTRoyGAR/TRoyLAB
- Contact: troytravelagency@gmail.com

## Project
- **Brand**: TRoy Travel Agency™ / TRoyGO™
- **App folder**: `troygo/` (Next.js 14, TypeScript, Tailwind CSS)
- **Branch**: `claude/ai-travel-agent-site-KfMzc`
- **Social**: Facebook, Instagram, Pinterest, LinkedIn, YouTube @TRoyGOtm

## How to Push to GitHub
- Git push via local proxy returns 403 — always use GitHub PAT
- Ask Troy directly: "Can you share your GitHub token so I can push?"
- After pushing, immediately reset remote URL back to local proxy:
  `git remote set-url origin http://local_proxy@127.0.0.1:38841/git/TheTRoyGAR/TRoyLAB`

## How to Deploy
- Platform: Vercel
- Root directory: `troygo/`
- Required env var: `ANTHROPIC_API_KEY`
- Deploy via: `vercel deploy --prod --token=VERCEL_TOKEN`

## Rules Troy Set
- Always ask directly for any tokens/credentials needed — don't make Troy do manual steps
- Never make Troy open a terminal — run everything here in chat
- Ask for GitHub token when push is needed
- Ask for Vercel token when deploying

## Tech Stack
- Next.js 16, TypeScript, Tailwind CSS v4
- AI: @anthropic-ai/sdk (claude-sonnet-4-6)
- Charts: recharts
- UI: lucide-react, framer-motion, react-hot-toast
