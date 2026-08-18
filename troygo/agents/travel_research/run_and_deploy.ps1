# Full pipeline: research real deals -> commit -> push to main.
# Vercel auto-deploys on every push to main (troytravelagency.com is a
# Vercel domain as of 2026-08-18 — no more GitHub Pages / gh-pages worktree
# step needed; that whole dance is retired). Run from anywhere; paths are
# computed relative to this script's own location.
#
# Needs ANTHROPIC_API_KEY + SERPER_API_KEY (real API cost) unless -SkipResearch.

param(
    [switch]$SkipResearch
)

$ErrorActionPreference = "Stop"

$agentDir = $PSScriptRoot
$troygoDir = Join-Path $agentDir "..\.." | Resolve-Path
$repoRoot = Join-Path $troygoDir ".." | Resolve-Path

function Step($msg) {
    Write-Host ""
    Write-Host "==> $msg" -ForegroundColor Cyan
}

if (-not $SkipResearch) {
    Step "Installing Python dependencies"
    Set-Location $agentDir
    py -3.13 -m pip install -e . 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "pip install failed" }

    Step "Running the research agent (real web searches + LLM calls)"
    py -3.13 run.py
    if ($LASTEXITCODE -ne 0) { throw "run.py failed - see output above. Nothing was deployed." }
} else {
    Step "Skipping research step (-SkipResearch) - deploying with whatever is currently in packages-live.json"
}

Step "Committing and pushing to main (Vercel auto-deploys from here)"
Set-Location $repoRoot
git add "troygo/src/lib/data/packages-live.json" "troygo/agents/travel_research/output/"
git commit -m "Update live travel deals from research agent run" 2>&1
git push origin (git branch --show-current)
if ($LASTEXITCODE -ne 0) { throw "git push failed" }

Step "Done. Vercel will build and deploy automatically - check https://vercel.com/thetroygarage-4832s-projects/t-roy-lab for build status, live at https://troytravelagency.com/packages/ within a minute or two"
