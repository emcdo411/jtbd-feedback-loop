# create-repo.ps1
# ─────────────────────────────────────────────────────────────────────
# JTBD Feedback Loop — GitHub Repository Setup Script
# Author: Erwin M. McDonald
# Updated: March 2026
#
# Creates the jtbd-feedback-loop GitHub repository, sets up the full
# directory structure, and pushes the initial commit.
#
# CURRENT REPO STRUCTURE (as of March 2026):
#
#   jtbd-feedback-loop/
#   ├── README.md                              ← Master overview
#   ├── .gitignore
#   ├── assets/                                ← Architecture diagrams + visuals
#   ├── docs/                                  ← All 4 presentation lenses
#   │   ├── jtbd-map.md
#   │   ├── technical-architecture.md
#   │   ├── stakeholder-mgmt.md
#   │   └── future-state.md
#   ├── poc/                                   ← Python CLI pipeline
#   │   ├── main.py
#   │   ├── prompts.py
#   │   ├── schema.py
#   │   ├── error_handler.py
#   │   ├── router.py
#   │   ├── sample_transcript.txt
#   │   ├── requirements.txt
#   │   └── README.md
#   ├── dashboard/                             ← React UI presentation layer (5 artifacts)
#   │   ├── README.md                          ← Dashboard-specific docs
#   │   ├── quick-launch.md                    ← One-command launch guide for Claude.ai
#   │   ├── jtbd-dashboard.jsx                 ← Static 4-lens demo dashboard
#   │   ├── jtbd-feedback-loop.jsx             ← Live extraction engine (calls Anthropic API)
#   │   ├── jtbd-dashboard-explainer.jsx       ← Dashboard panel explainer (dual audience)
#   │   ├── jtbd-pipeline-explainer.jsx        ← 7-stage pipeline explainer (dual audience)
#   │   └── jtbdpoc-vs-invoca.jsx              ← POC vs Invoca platform comparison
#   ├── skill/
#   │   └── jtbd-feedback-loop.skill
#   └── setup/
#       └── create-repo.ps1                    ← This script
#
# PREREQUISITES:
#   1. GitHub CLI installed: https://cli.github.com/
#   2. Authenticated: gh auth login
#   3. Git installed and configured
#   4. Run from the PARENT directory of where you want the repo cloned
#
# USAGE:
#   .\create-repo.ps1
#
# PARAMETERS (edit before running):
#   $RepoName     - Repository name (default: jtbd-feedback-loop)
#   $Description  - Repository description
#   $Visibility   - "public" or "private"
# ─────────────────────────────────────────────────────────────────────

param(
    [string]$RepoName    = "jtbd-feedback-loop",
    [string]$Description = "JTBD Feedback Loop Architect — Invoca Applied AI Analyst POC | Insight extraction, confidence scoring, and intelligent stakeholder routing from call transcripts.",
    [string]$Visibility  = "public"
)

# ─────────────────────────────────────────────────────────────────────
# STEP 0 — PRE-FLIGHT CHECKS
# ─────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  JTBD Feedback Loop — GitHub Repo Setup" -ForegroundColor Cyan
Write-Host "  Erwin M. McDonald · March 2026" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check GitHub CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "  ✗ GitHub CLI (gh) not found." -ForegroundColor Red
    Write-Host "    Install from: https://cli.github.com/" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ GitHub CLI found" -ForegroundColor Green

# Check Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "  ✗ Git not found." -ForegroundColor Red
    Write-Host "    Install from: https://git-scm.com/" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Git found" -ForegroundColor Green

# Check gh auth
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Not authenticated with GitHub." -ForegroundColor Red
    Write-Host "    Run: gh auth login" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ GitHub CLI authenticated" -ForegroundColor Green
Write-Host ""

# ─────────────────────────────────────────────────────────────────────
# STEP 1 — CREATE GITHUB REPOSITORY
# ─────────────────────────────────────────────────────────────────────

Write-Host "[ 1/6 ] Creating GitHub repository: $RepoName..." -ForegroundColor Yellow

gh repo create $RepoName `
    --description $Description `
    --$Visibility `
    --clone

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to create repository. It may already exist." -ForegroundColor Red
    Write-Host "    Check: gh repo view $RepoName" -ForegroundColor DarkGray
    exit 1
}

Write-Host "  ✓ Repository created and cloned" -ForegroundColor Green
Write-Host ""

Set-Location $RepoName

# ─────────────────────────────────────────────────────────────────────
# STEP 2 — CREATE DIRECTORY STRUCTURE
# ─────────────────────────────────────────────────────────────────────

Write-Host "[ 2/6 ] Creating directory structure..." -ForegroundColor Yellow

$directories = @(
    "poc",
    "docs",
    "dashboard",
    "skill",
    "setup",
    "assets"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    # .gitkeep ensures empty dirs are tracked by Git
    New-Item -ItemType File -Path "$dir\.gitkeep" -Force | Out-Null
}

Write-Host "  ✓ Folders created: poc/ docs/ dashboard/ skill/ setup/ assets/" -ForegroundColor Green
Write-Host ""

# ─────────────────────────────────────────────────────────────────────
# STEP 3 — COPY FILES FROM SOURCE
# ─────────────────────────────────────────────────────────────────────

Write-Host "[ 3/6 ] Copying project files..." -ForegroundColor Yellow

# Source path — assumes you have a local source folder named jtbd-feedback-loop-repo
# in the same parent directory. Adjust this path if your source is elsewhere.
$sourcePath = "..\jtbd-feedback-loop-repo"

if (Test-Path $sourcePath) {

    # ── POC files (Python pipeline) ───────────────────────────────────
    if (Test-Path "$sourcePath\poc") {
        Copy-Item "$sourcePath\poc\*" -Destination "poc\" -Recurse -Force
        Write-Host "  ✓ poc/ — Python pipeline files copied" -ForegroundColor Green
    } else {
        Write-Host "  ⚠  poc/ source not found — copy manually" -ForegroundColor Yellow
    }

    # ── Docs (4 presentation lenses) ──────────────────────────────────
    if (Test-Path "$sourcePath\docs") {
        Copy-Item "$sourcePath\docs\*" -Destination "docs\" -Recurse -Force
        Write-Host "  ✓ docs/ — 4 presentation lens docs copied" -ForegroundColor Green
    } else {
        Write-Host "  ⚠  docs/ source not found — copy manually" -ForegroundColor Yellow
    }

    # ── Dashboard (React UI — all 5 JSX artifacts + docs) ─────────────
    if (Test-Path "$sourcePath\dashboard") {
        Copy-Item "$sourcePath\dashboard\*" -Destination "dashboard\" -Recurse -Force
        Write-Host "  ✓ dashboard/ — all 5 artifacts + docs copied" -ForegroundColor Green
    } else {
        Write-Host "  ⚠  dashboard/ source not found — copy manually" -ForegroundColor Yellow
        Write-Host "     Expected files:" -ForegroundColor DarkGray
        Write-Host "       dashboard\README.md                      dashboard docs" -ForegroundColor DarkGray
        Write-Host "       dashboard\quick-launch.md                Claude.ai launch guide" -ForegroundColor DarkGray
        Write-Host "       dashboard\jtbd-dashboard.jsx             static 4-lens demo dashboard" -ForegroundColor DarkGray
        Write-Host "       dashboard\jtbd-feedback-loop.jsx         live extraction UI (Anthropic API)" -ForegroundColor DarkGray
        Write-Host "       dashboard\jtbd-dashboard-explainer.jsx   panel explainer, dual audience toggle" -ForegroundColor DarkGray
        Write-Host "       dashboard\jtbd-pipeline-explainer.jsx    pipeline explainer, dual audience toggle" -ForegroundColor DarkGray
        Write-Host "       dashboard\jtbdpoc-vs-invoca.jsx          POC vs Invoca comparison, side-by-side" -ForegroundColor DarkGray
    }

    # ── Skill ─────────────────────────────────────────────────────────
    if (Test-Path "$sourcePath\skill") {
        Copy-Item "$sourcePath\skill\*" -Destination "skill\" -Recurse -Force
        Write-Host "  ✓ skill/ — Claude skill file copied" -ForegroundColor Green
    } else {
        Write-Host "  ⚠  skill/ source not found — copy manually" -ForegroundColor Yellow
    }

    # ── Assets ────────────────────────────────────────────────────────
    if (Test-Path "$sourcePath\assets") {
        Copy-Item "$sourcePath\assets\*" -Destination "assets\" -Recurse -Force
        Write-Host "  ✓ assets/ — diagrams + visuals copied" -ForegroundColor Green
    }

    # ── Root README ───────────────────────────────────────────────────
    if (Test-Path "$sourcePath\README.md") {
        Copy-Item "$sourcePath\README.md" -Destination "." -Force
        Write-Host "  ✓ README.md — master overview copied" -ForegroundColor Green
    }

} else {
    Write-Host "  ⚠  Source path not found: $sourcePath" -ForegroundColor Yellow
    Write-Host "     Files must be copied manually before committing." -ForegroundColor Yellow
    Write-Host "     Expected source structure:" -ForegroundColor DarkGray
    Write-Host "       $sourcePath\poc\           Python pipeline files" -ForegroundColor DarkGray
    Write-Host "       $sourcePath\docs\          4 presentation lens docs" -ForegroundColor DarkGray
    Write-Host "       $sourcePath\dashboard\     React UI artifacts (5 JSX + docs)" -ForegroundColor DarkGray
    Write-Host "       $sourcePath\skill\         Claude skill file" -ForegroundColor DarkGray
    Write-Host "       $sourcePath\assets\        Diagrams + visuals" -ForegroundColor DarkGray
    Write-Host "       $sourcePath\README.md      Master README" -ForegroundColor DarkGray
}

# Copy this setup script into setup/
Copy-Item $PSCommandPath -Destination "setup\create-repo.ps1" -Force
Write-Host "  ✓ setup/create-repo.ps1 — this script self-copied" -ForegroundColor Green
Write-Host ""

# ─────────────────────────────────────────────────────────────────────
# STEP 4 — CONFIGURE .gitignore
# ─────────────────────────────────────────────────────────────────────

Write-Host "[ 4/6 ] Creating .gitignore..." -ForegroundColor Yellow

@"
# Python
__pycache__/
*.py[cod]
*.pyo
.Python
*.egg-info/
dist/
build/
.eggs/

# Virtual environments
venv/
.venv/
env/

# Environment variables — NEVER commit API keys
.env
.env.local
*.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# macOS
.DS_Store

# Windows
Thumbs.db
desktop.ini

# Logs
*.log
logs/

# Test outputs
test_outputs/

# Node (if React artifacts are ever built locally)
node_modules/
.next/
dist/
build/
"@ | Out-File -FilePath ".gitignore" -Encoding utf8

Write-Host "  ✓ .gitignore written" -ForegroundColor Green
Write-Host ""

# ─────────────────────────────────────────────────────────────────────
# STEP 5 — INITIAL COMMIT AND PUSH
# ─────────────────────────────────────────────────────────────────────

Write-Host "[ 5/6 ] Committing and pushing to GitHub..." -ForegroundColor Yellow

git add .

git commit -m "Initial commit: JTBD Feedback Loop Architect POC

Python pipeline (poc/):
- main.py                Pipeline orchestrator — entry point
- prompts.py             3-layer prompt engineering strategy
- schema.py              Typed data schema + confidence scoring
- error_handler.py       2-stage fallback extraction engine
- router.py              Stakeholder routing engine + alert formatters
- sample_transcript.txt  Demo: Acme Financial QBR (47 min)
- requirements.txt       Dependencies (one: anthropic)
- poc/README.md          Technical deep-dive

Docs — 4 presentation lenses (docs/):
- jtbd-map.md                Lens 1: JTBD framework + workflow maps
- technical-architecture.md  Lens 2: Architecture decisions
- stakeholder-mgmt.md        Lens 3: Human adoption strategy
- future-state.md            Lens 4: 18-month evolution vision

React UI — 5 artifacts (dashboard/):
- README.md                      Dashboard docs + artifact index
- quick-launch.md                One-command launch guide for Claude.ai
- jtbd-dashboard.jsx             Static 4-lens demo dashboard (hardcoded mock)
- jtbd-feedback-loop.jsx         Live extraction UI (calls Anthropic API)
- jtbd-dashboard-explainer.jsx   Dashboard panel explainer (dual audience toggle)
- jtbd-pipeline-explainer.jsx    7-stage pipeline explainer (dual audience toggle)
- jtbdpoc-vs-invoca.jsx          POC vs Invoca platform comparison (side-by-side)

Supporting files:
- skill/jtbd-feedback-loop.skill   Installable Claude JTBD skill
- setup/create-repo.ps1            This repo scaffold script
- README.md                        Master overview + dashboard layer section

Demo sequence:
  jtbd-dashboard.jsx          -> vision (what the system produces)
  jtbd-feedback-loop.jsx      -> proof (live extraction, right now)
  jtbd-pipeline-explainer.jsx -> clarity (any audience, any room)
  jtbd-dashboard-explainer.jsx -> depth (panel by panel walkthrough)
  jtbdpoc-vs-invoca.jsx       -> credibility (maps to Invoca actual stack)
  poc/main.py --mock          -> production path (Python, no API key)

Invoca Applied AI Analyst POC | Erwin M. McDonald"

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ⚠  Commit failed — check git status" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ Commit created" -ForegroundColor Green
}

git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Pushed to GitHub successfully" -ForegroundColor Green
} else {
    Write-Host "  ⚠  Push failed. Try: git pull origin main --rebase && git push origin main" -ForegroundColor Yellow
}
Write-Host ""

# ─────────────────────────────────────────────────────────────────────
# STEP 6 — OPEN IN BROWSER
# ─────────────────────────────────────────────────────────────────────

Write-Host "[ 6/6 ] Opening repository in browser..." -ForegroundColor Yellow
gh repo view --web

$ghUser = gh api user --jq '.login' 2>$null
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ Setup complete!" -ForegroundColor Green
Write-Host "  Repository: github.com/$ghUser/$RepoName" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Final structure:" -ForegroundColor White
Write-Host "  ├── README.md" -ForegroundColor DarkGray
Write-Host "  ├── .gitignore" -ForegroundColor DarkGray
Write-Host "  ├── assets/" -ForegroundColor DarkGray
Write-Host "  ├── docs/                              4 presentation lenses" -ForegroundColor DarkGray
Write-Host "  ├── poc/                               Python CLI pipeline" -ForegroundColor DarkGray
Write-Host "  ├── dashboard/" -ForegroundColor Green
Write-Host "  │   ├── README.md" -ForegroundColor Green
Write-Host "  │   ├── quick-launch.md" -ForegroundColor Green
Write-Host "  │   ├── jtbd-dashboard.jsx             static demo" -ForegroundColor Green
Write-Host "  │   ├── jtbd-feedback-loop.jsx         live extraction" -ForegroundColor Green
Write-Host "  │   ├── jtbd-dashboard-explainer.jsx   panel explainer" -ForegroundColor Green
Write-Host "  │   ├── jtbd-pipeline-explainer.jsx    pipeline explainer" -ForegroundColor Green
Write-Host "  │   └── jtbdpoc-vs-invoca.jsx          POC vs Invoca" -ForegroundColor Green
Write-Host "  ├── skill/" -ForegroundColor DarkGray
Write-Host "  └── setup/" -ForegroundColor DarkGray
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
