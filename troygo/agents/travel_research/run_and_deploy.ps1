# Full pipeline: research real data for one or more categories -> commit ->
# push to main. Vercel auto-deploys on every push to main (troytravelagency.com
# is a Vercel domain as of 2026-08-18 — no more GitHub Pages / gh-pages
# worktree step needed; that whole dance is retired). Run from anywhere;
# paths are computed relative to this script's own location.
#
# Needs ANTHROPIC_API_KEY + SERPER_API_KEY (real API cost) unless -SkipResearch.
#
# Categories currently supported: packages (run.py), hotels (run_hotels.py).
# Add more (-Categories cars,cruises,flights) as their run_<category>.py
# scripts are built.

param(
    [switch]$SkipResearch,
    [string[]]$Categories = @("packages", "hotels", "cars", "cruises")
)

$ErrorActionPreference = "Stop"

$agentDir = $PSScriptRoot
$troygoDir = Join-Path $agentDir "..\.." | Resolve-Path
$repoRoot = Join-Path $troygoDir ".." | Resolve-Path

$scriptByCategory = @{
    packages = "run.py"
    hotels   = "run_hotels.py"
    cars     = "run_cars.py"
    cruises  = "run_cruises.py"
}
$dataFileByCategory = @{
    packages = "troygo/src/lib/data/packages-live.json"
    hotels   = "troygo/src/lib/data/hotels-live.json"
    cars     = "troygo/src/lib/data/cars-live.json"
    cruises  = "troygo/src/lib/data/cruises-live.json"
}

function Step($msg) {
    Write-Host ""
    Write-Host "==> $msg" -ForegroundColor Cyan
}

if (-not $SkipResearch) {
    Step "Installing Python dependencies"
    Set-Location $agentDir
    py -3.13 -m pip install -e . 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "pip install failed" }

    foreach ($cat in $Categories) {
        $script = $scriptByCategory[$cat]
        if (-not $script) { throw "Unknown category '$cat' - no run_<category>.py mapped for it" }
        Step "Running the $cat research agent (real web searches + LLM calls)"
        py -3.13 $script
        if ($LASTEXITCODE -ne 0) { throw "$script failed - see output above. Nothing was deployed." }
    }
} else {
    Step "Skipping research step (-SkipResearch) - deploying with whatever is currently in the live JSON files"
}

Step "Committing and pushing to main (Vercel auto-deploys from here)"
Set-Location $repoRoot
$dataFiles = $Categories | ForEach-Object { $dataFileByCategory[$_] }
git add $dataFiles "troygo/agents/travel_research/output/"
git commit -m "Update live travel data ($($Categories -join ', ')) from research agent run" 2>&1
git push origin (git branch --show-current)
if ($LASTEXITCODE -ne 0) { throw "git push failed" }

Step "Done. Vercel will build and deploy automatically - check https://vercel.com/thetroygarage-4832s-projects/t-roy-lab for build status, live at https://troytravelagency.com within a minute or two"
