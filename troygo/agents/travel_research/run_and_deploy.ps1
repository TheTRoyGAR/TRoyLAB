# Full pipeline: research real deals -> rebuild the static site -> deploy to
# GitHub Pages (gh-pages branch). Run from anywhere; paths are computed
# relative to this script's own location.
#
# Steps 1-2 need ANTHROPIC_API_KEY + SERPER_API_KEY (real API cost).
# Steps 3-8 are the already-proven static-export + gh-pages-worktree deploy
# sequence used manually several times this session, just scripted here for
# repeatability. They can be run on their own (skip -SkipResearch) to prove
# the rebuild/redeploy half works without spending any LLM credit.

param(
    [switch]$SkipResearch
)

$ErrorActionPreference = "Stop"

$agentDir = $PSScriptRoot
$troygoDir = Join-Path $agentDir "..\.." | Resolve-Path
$repoRoot = Join-Path $troygoDir ".." | Resolve-Path
$worktreeDir = Join-Path $repoRoot "..\TRoyLAB-ghpages-deploy"

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

Step "Building the static site (GITHUB_PAGES_BUILD=true)"
Set-Location $troygoDir
if (Test-Path "out") { Remove-Item -Recurse -Force "out" }
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
$env:GITHUB_PAGES_BUILD = "true"
npm run build
if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }

Step "Preparing gh-pages worktree"
Set-Location $repoRoot
if (Test-Path $worktreeDir) {
    git worktree remove $worktreeDir --force 2>&1 | Out-Null
}
git worktree add $worktreeDir gh-pages
if ($LASTEXITCODE -ne 0) { throw "git worktree add failed" }

Step "Replacing worktree contents with the fresh build"
Get-ChildItem -Path $worktreeDir -Force | Where-Object { $_.Name -ne ".git" } | Remove-Item -Recurse -Force
Copy-Item -Path (Join-Path $troygoDir "out\*") -Destination $worktreeDir -Recurse -Force
$nojekyll = Join-Path $worktreeDir ".nojekyll"
if (-not (Test-Path $nojekyll)) { New-Item -ItemType File -Path $nojekyll | Out-Null }

Step "Committing and pushing gh-pages"
Set-Location $worktreeDir
git add -A
git commit -m "Deploy: refresh live travel deals $(Get-Date -Format 'yyyy-MM-dd HH:mm')" 2>&1
git push origin gh-pages
if ($LASTEXITCODE -ne 0) { throw "git push (gh-pages) failed" }

Set-Location $repoRoot
git worktree remove $worktreeDir --force

Step "Committing generated data files in the main repo"
Set-Location $repoRoot
git add "troygo/src/lib/data/packages-live.json" "troygo/agents/travel_research/output/"
git commit -m "Update live travel deals from research agent run" 2>&1
git push origin (git branch --show-current)

Step "Done. Live at https://thetroygar.github.io/TRoyLAB/packages/ (allow a minute for GitHub Pages to serve the new commit)"
