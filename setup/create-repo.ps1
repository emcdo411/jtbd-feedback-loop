# create-repo.ps1
# ─────────────────────────────────────────────────────────────────────
# JTBD Feedback Loop — GitHub Repository Setup Script
# Author: Erwin M. McDonald
#
# Creates the jtbd-feedback-loop GitHub repository, sets up structure,
# and pushes initial commit.
#
# PREREQUISITES:
#   1. GitHub CLI installed: https://cli.github.com/
#   2. Authenticated: gh auth login
#   3. Git installed and configured
#   4. Run from the parent directory of your local jtbd-feedback-loop folder
#
# USAGE:
#   .\setup\create-repo.ps1
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

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  JTBD Feedback Loop — GitHub Repo Setup" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Check GitHub CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI (gh) not found. Install from https://cli.github.com/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ GitHub CLI found" -ForegroundColor Green

# Check Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git not found. Install from https://git-scm.com/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Git found" -ForegroundColor Green

# Check gh auth status
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not authenticated with GitHub. Run: gh auth login" -ForegroundColor Red
    exit 1
}
Write-Host "✅ GitHub CLI authenticated`n" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────
# STEP 1 — CREATE GITHUB REPOSITORY
# ─────────────────────────────────────────────────────────────────────

Write-Host "📦 Creating GitHub repository: $RepoName" -ForegroundColor Yellow

gh repo create $RepoName `
    --description $Description `
    --$Visibility `
    --clone

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create repository. It may already exist." -ForegroundColor Red
    Write-Host "   Try: gh repo view $RepoName" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Repository created and cloned`n" -ForegroundColor Green

# Move into cloned repo
Set-Location $RepoName

# ─────────────────────────────────────────────────────────────────────
# STEP 2 — CREATE DIRECTORY STRUCTURE
# ─────────────────────────────────────────────────────────────────────

Write-Host "📁 Creating directory structure..." -ForegroundColor Yellow

$directories = @(
    "poc",
    "docs",
    "skill",
    "setup",
    "assets"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    # Add .gitkeep so empty dirs are tracked
    New-Item -ItemType File -Path "$dir\.gitkeep" -Force | Out-Null
}

Write-Host "✅ Directory structure created`n" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────
# STEP 3 — COPY FILES FROM SOURCE
# ─────────────────────────────────────────────────────────────────────

Write-Host "📋 Copying project files..." -ForegroundColor Yellow

# Define source path (assumes you ran this from parent of jtbd-feedback-loop-repo)
$sourcePath = "..\jtbd-feedback-loop-repo"

if (Test-Path $sourcePath) {
    # POC files
    Copy-Item "$sourcePath\poc\*" -Destination "poc\" -Recurse -Force
    Write-Host "   ✅ POC files copied" -ForegroundColor Green

    # Docs
    Copy-Item "$sourcePath\docs\*" -Destination "docs\" -Recurse -Force
    Write-Host "   ✅ Docs copied" -ForegroundColor Green

    # Skill
    Copy-Item "$sourcePath\skill\*" -Destination "skill\" -Recurse -Force
    Write-Host "   ✅ Skill file copied" -ForegroundColor Green

    # Root README
    Copy-Item "$sourcePath\README.md" -Destination "." -Force
    Write-Host "   ✅ README.md copied" -ForegroundColor Green

} else {
    Write-Host "   ⚠️  Source path not found: $sourcePath" -ForegroundColor Yellow
    Write-Host "   Files must be copied manually before committing." -ForegroundColor Yellow
}

# Copy this setup script into setup/
Copy-Item $PSCommandPath -Destination "setup\create-repo.ps1" -Force
Write-Host "   ✅ Setup script copied to setup/`n" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────
# STEP 4 — CONFIGURE .gitignore
# ─────────────────────────────────────────────────────────────────────

Write-Host "📝 Creating .gitignore..." -ForegroundColor Yellow

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

# Logs
*.log
logs/

# Test outputs
test_outputs/
"@ | Out-File -FilePath ".gitignore" -Encoding utf8

Write-Host "✅ .gitignore created`n" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────
# STEP 5 — INITIAL COMMIT AND PUSH
# ─────────────────────────────────────────────────────────────────────

Write-Host "🚀 Committing and pushing to GitHub..." -ForegroundColor Yellow

git add .

git commit -m "Initial commit: JTBD Feedback Loop Architect POC

- Full insight extraction + routing pipeline (main.py)
- Prompt engineering strategy with 3-layer architecture (prompts.py)
- Typed data schema with confidence scoring (schema.py)
- Two-stage error handling with fallback extraction (error_handler.py)
- Stakeholder routing engine with alert formatters (router.py)
- Realistic demo transcript — Acme Financial QBR (sample_transcript.txt)
- JTBD map + current/future state workflow (docs/jtbd-map.md)
- Technical architecture decisions (docs/technical-architecture.md)
- Stakeholder management strategy (docs/stakeholder-mgmt.md)
- 18-month future state vision (docs/future-state.md)
- JTBD Feedback Loop Claude skill (skill/)
- Master README with architecture overview

Invoca Applied AI Analyst Presentation | Erwin M. McDonald"

git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Repository pushed successfully!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Push may have failed. Check: git status" -ForegroundColor Yellow
}

# ─────────────────────────────────────────────────────────────────────
# STEP 6 — OPEN IN BROWSER
# ─────────────────────────────────────────────────────────────────────

Write-Host "`n🌐 Opening repository in browser..." -ForegroundColor Cyan
gh repo view --web

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Setup complete! Repository: github.com/$(gh api user --jq '.login')/$RepoName" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan
