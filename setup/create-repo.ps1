# =============================================================================
#  JTBD FEEDBACK LOOP ARCHITECT — MASTER REPO SETUP SCRIPT
#  Author: Erwin M. McDonald
#  Version: 2.0 — Full Scaffold (creates every file, not just folders)
# =============================================================================
#
#  ✅ WHAT THIS SCRIPT DOES (step by step):
#     1. Checks that Git and GitHub CLI are installed (and walks you through
#        installing them if they're missing)
#     2. Creates the jtbd-feedback-loop GitHub repository under your account
#     3. Clones it to your computer
#     4. Creates EVERY file in the repo with its full contents
#     5. Makes an initial commit and pushes everything to GitHub
#     6. Opens your new repo in the browser
#
#  📋 BEFORE YOU RUN THIS SCRIPT:
#     You need two free tools installed:
#       A) Git      → https://git-scm.com/download/win
#       B) GitHub CLI (gh) → https://cli.github.com/
#
#     After installing GitHub CLI, open a NEW PowerShell window and run:
#       gh auth login
#     Follow the prompts — choose "GitHub.com", "HTTPS", then
#     "Login with a web browser". It will open a page — just click Authorize.
#
#  ▶️  HOW TO RUN:
#     1. Open PowerShell (search "PowerShell" in the Start menu)
#     2. Paste this ENTIRE script and press Enter
#     3. That's it. The script will do everything else.
#
#  ⚠️  If PowerShell says "scripts are disabled on this system", run this first:
#     Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
#     Then press Y and Enter, then try again.
#
# =============================================================================

# ── PARAMETERS (change these if you want a different repo name or visibility) ──
$RepoName   = "jtbd-feedback-loop"
$RepoDesc   = "JTBD Feedback Loop Architect — Invoca Applied AI Analyst POC. Insight extraction, confidence scoring, and intelligent stakeholder routing from call transcripts."
$Visibility = "public"    # Change to "private" if you want a private repo

# =============================================================================
#  HELPER FUNCTIONS
# =============================================================================

function Write-Banner {
    param([string]$Text, [string]$Color = "Cyan")
    Write-Host ""
    Write-Host ("═" * 70) -ForegroundColor $Color
    Write-Host "  $Text" -ForegroundColor $Color
    Write-Host ("═" * 70) -ForegroundColor $Color
    Write-Host ""
}

function Write-Step {
    param([string]$Step, [string]$Message)
    Write-Host "  [$Step] $Message" -ForegroundColor Yellow
}

function Write-OK   { param([string]$Msg) Write-Host "  ✅ $Msg" -ForegroundColor Green }
function Write-Fail { param([string]$Msg) Write-Host "  ❌ $Msg" -ForegroundColor Red }
function Write-Warn { param([string]$Msg) Write-Host "  ⚠️  $Msg" -ForegroundColor DarkYellow }
function Write-Info { param([string]$Msg) Write-Host "  ℹ️  $Msg" -ForegroundColor Gray }

# Writes a file and confirms
function New-RepoFile {
    param([string]$RelPath, [string]$Content)
    $FullPath = Join-Path (Get-Location) $RelPath
    $Dir = Split-Path $FullPath -Parent
    if (-not (Test-Path $Dir)) { New-Item -ItemType Directory -Path $Dir -Force | Out-Null }
    [System.IO.File]::WriteAllText($FullPath, $Content, [System.Text.Encoding]::UTF8)
    Write-Info "Created: $RelPath"
}

# =============================================================================
#  STEP 0 — WELCOME BANNER
# =============================================================================

Write-Banner "JTBD FEEDBACK LOOP — GITHUB REPO SETUP v2.0" "Cyan"
Write-Host "  This script will build your complete GitHub repo from scratch."
Write-Host "  Estimated time: 2-3 minutes."
Write-Host ""

# =============================================================================
#  STEP 1 — PRE-FLIGHT CHECKS
# =============================================================================

Write-Banner "STEP 1 — CHECKING REQUIRED TOOLS" "Yellow"

# Check Git
Write-Step "1/3" "Checking for Git..."
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitVersion = git --version
    Write-OK "Git found: $gitVersion"
} else {
    Write-Fail "Git is NOT installed."
    Write-Host ""
    Write-Host "  Please install Git from: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "  After installing, close this PowerShell window, open a new one, and run this script again." -ForegroundColor White
    Write-Host ""
    Read-Host "  Press Enter to exit"
    exit 1
}

# Check GitHub CLI
Write-Step "2/3" "Checking for GitHub CLI (gh)..."
if (Get-Command gh -ErrorAction SilentlyContinue) {
    $ghVersion = gh --version | Select-Object -First 1
    Write-OK "GitHub CLI found: $ghVersion"
} else {
    Write-Fail "GitHub CLI is NOT installed."
    Write-Host ""
    Write-Host "  Please install GitHub CLI from: https://cli.github.com/" -ForegroundColor White
    Write-Host "  After installing, close this window, open a new PowerShell, run:" -ForegroundColor White
    Write-Host "    gh auth login" -ForegroundColor Cyan
    Write-Host "  Then run this script again." -ForegroundColor White
    Write-Host ""
    Read-Host "  Press Enter to exit"
    exit 1
}

# Check GitHub auth
Write-Step "3/3" "Checking GitHub authentication..."
$authCheck = gh auth status 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-OK "GitHub CLI is authenticated"
} else {
    Write-Fail "You are NOT logged in to GitHub CLI."
    Write-Host ""
    Write-Host "  Please run this command, then try this script again:" -ForegroundColor White
    Write-Host "    gh auth login" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  At the prompts:" -ForegroundColor White
    Write-Host "    - Choose: GitHub.com" -ForegroundColor Gray
    Write-Host "    - Choose: HTTPS" -ForegroundColor Gray
    Write-Host "    - Choose: Login with a web browser" -ForegroundColor Gray
    Write-Host "    - Copy the code shown, press Enter, paste the code in the browser" -ForegroundColor Gray
    Write-Host ""
    Read-Host "  Press Enter to exit"
    exit 1
}

# =============================================================================
#  STEP 2 — CREATE GITHUB REPOSITORY
# =============================================================================

Write-Banner "STEP 2 — CREATING GITHUB REPOSITORY" "Yellow"

# Check if repo already exists
Write-Step "1/2" "Checking if '$RepoName' already exists on GitHub..."
$repoCheck = gh repo view $RepoName 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Warn "Repository '$RepoName' already exists on your GitHub."
    Write-Host ""
    $continue = Read-Host "  Do you want to clone it and re-scaffold all files? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "  Exiting. No changes made." -ForegroundColor Gray
        exit 0
    }
    Write-Step "2/2" "Cloning existing repository..."
    git clone "https://github.com/$(gh api user --jq '.login')/$RepoName.git"
} else {
    Write-Step "2/2" "Creating new repository: $RepoName..."
    gh repo create $RepoName `
        --description $RepoDesc `
        --$Visibility `
        --clone

    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Failed to create repository. Check your network and GitHub CLI auth."
        exit 1
    }
    Write-OK "Repository created and cloned successfully"
}

# Move into repo directory
Set-Location $RepoName

# =============================================================================
#  STEP 3 — CREATE .gitignore
# =============================================================================

Write-Banner "STEP 3 — CREATING PROJECT FILES" "Yellow"
Write-Step "1/?" "Creating .gitignore..."

New-RepoFile ".gitignore" @"
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
ENV/

# Environment variables — NEVER commit API keys
.env
.env.local
*.env

# IDE
.vscode/
.idea/
*.swp
*.swo
*.code-workspace

# macOS
.DS_Store
.AppleDouble
.LSOverride

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini

# Logs
*.log
logs/

# Test outputs
test_outputs/

# Python packaging
*.whl
*.egg
MANIFEST
"@

Write-OK ".gitignore created"

# =============================================================================
#  STEP 4 — CREATE poc/ FILES
# =============================================================================

Write-Step "2/?" "Creating poc/requirements.txt..."
New-RepoFile "poc/requirements.txt" @"
# JTBD Feedback Loop — Python Dependencies
# Install with: pip install -r requirements.txt

anthropic>=0.25.0
"@

# ── poc/sample_transcript.txt ────────────────────────────────────────────────
Write-Step "3/?" "Creating poc/sample_transcript.txt..."
New-RepoFile "poc/sample_transcript.txt" @"
TRANSCRIPT ID: TXN-2025-0312-ACM
ACCOUNT: Acme Financial Services
CSM: Jordan Rivera
CALL DATE: March 12, 2025
CALL TYPE: Quarterly Business Review
DURATION: 47 minutes
ARR: `$84,000
RENEWAL DATE: June 30, 2025

---

Jordan: Hi Sarah, Marcus — thanks for making time today. How's everything going on your end?

Sarah (VP Marketing, Acme): Honestly Jordan, it's been a mixed quarter. We've had some wins but there are a few things I really need to get on the record today because they're starting to affect how we think about our tech stack.

Jordan: Absolutely, that's exactly what this call is for. Walk me through it.

Sarah: Okay so the big one — the call attribution data has been inconsistent for the past six weeks. I'm seeing discrepancies between what Invoca is reporting and what we're seeing in our Google Ads dashboard. We've flagged it twice to support and the ticket is still open. It's not a minor thing — we're making media spend decisions based on this data.

Marcus (Marketing Ops, Acme): Yeah I can give you the ticket number. It's been 41 days. Our paid search team has basically stopped trusting the attribution numbers because they can't reconcile them. They've started doing manual spot-checks which is eating up time we don't have.

Jordan: Marcus, that's not acceptable and I'm going to escalate that personally today. I'm sorry that's been sitting that long.

Sarah: I appreciate that. The other thing — and this is more of a wishlist item — we're doing a big push into SMS and chat channels this summer. We have a ton of call intelligence now from Invoca, but none of that transfers to our chat interactions. It would be really valuable if there was some kind of unified view — like, the same kind of intent scoring and attribution you do for calls but across all the channels where customers are reaching us.

Jordan: That's really interesting. Is that something you've seen competitors doing, or is it more of an internal need you've identified?

Sarah: Honestly, we had a demo with Marchex last month. They were pitching something they called "omnichannel conversation intelligence" — I don't know how mature it actually is, but it got our leadership asking questions. We're not going anywhere, but I want to be transparent that we're being asked to evaluate alternatives.

Marcus: The Marchex thing was mostly a vendor pitch, Sarah. But the omnichannel gap is real regardless of who solves it.

Sarah: Right. And look — we love the platform overall. The call scoring has been incredibly valuable and our inside sales team actually credits Invoca with a 23% improvement in qualified lead rate this quarter, which is huge. So it's not like we're unhappy. It's more that the attribution bug is making people nervous and the omnichannel piece is a real strategic gap for us.

Jordan: I'm glad to hear the call scoring is delivering. That 23% lift is significant — I want to make sure we're capturing that as part of your success story. On the attribution issue, I'm going to create a P1 escalation today and get engineering on it before end of week. On the omnichannel question — I can't make product promises, but I can make sure that feedback gets to the right people.

Sarah: That would be helpful. And Jordan, one more thing — we got our renewal quote last week and the price increase is 18%. I understand costs go up but our marketing budget got cut 15% this quarter. I'm going to have a hard time getting this through finance at that number. I don't want to make this a negotiation on this call, but I wanted you to know it's a real concern before we get to renewal conversations.

Jordan: Sarah, I really appreciate you telling me directly. Let me bring this to my leadership before we get into formal renewal discussions. I want to make sure we come to that conversation with options.

Sarah: Thanks Jordan. Overall we like where this is going, but the bug needs to get fixed and the pricing conversation needs to happen before June. Otherwise honestly I don't know what the board is going to say.

Jordan: Understood. I'll follow up with a written summary of today's call and the escalation ticket by end of day tomorrow.

Sarah: Perfect. Thanks Jordan.

---
END OF TRANSCRIPT
"@

# ── poc/schema.py ─────────────────────────────────────────────────────────────
Write-Step "4/?" "Creating poc/schema.py..."
New-RepoFile "poc/schema.py" @'
"""
schema.py — Data Structure Definitions
=======================================
JTBD Feedback Loop Architect | Invoca Applied AI Analyst POC
Author: Erwin M. McDonald

Every insight extracted from a call transcript conforms to this schema.
The schema is the contract between the extraction engine and the routing layer.

Design Decision: Typed dataclasses over raw dicts.
Reason: Makes prompt output validation explicit and self-documenting.
        When the model returns unexpected structure, we catch it here —
        not silently downstream.
"""

from dataclasses import dataclass, field
from typing import Optional
from enum import Enum


# ─────────────────────────────────────────────────────────────
# ENUMS — Controlled Vocabularies
# ─────────────────────────────────────────────────────────────

class InsightType(str, Enum):
    """
    The classification taxonomy for extracted insights.
    Every insight must be one of these types — no free-text classification.

    Design Decision: Hard enum over open string.
    Reason: Prevents routing ambiguity. "pricing issue" vs "Pricing Friction"
            are the same thing but route differently if uncontrolled.
    """
    COMPETITOR_MENTION  = "competitor_mention"
    FEATURE_REQUEST     = "feature_request"
    BUG_REPORT          = "bug_report"
    PRICING_FRICTION    = "pricing_friction"
    CHURN_SIGNAL        = "churn_signal"
    POSITIVE_SIGNAL     = "positive_signal"
    GENERAL_FEEDBACK    = "general_feedback"


class SentimentLabel(str, Enum):
    POSITIVE = "positive"
    NEUTRAL  = "neutral"
    NEGATIVE = "negative"
    CRITICAL = "critical"    # Negative + urgency signal present


class RoutingDestination(str, Enum):
    """Named stakeholder routing targets. Each maps to a real team at Invoca."""
    PRODUCT_MANAGEMENT  = "Product Management"
    ENGINEERING         = "Engineering"
    SALES_LEADERSHIP    = "Sales Leadership"
    CUSTOMER_SUCCESS    = "Customer Success Leadership"
    HUMAN_REVIEW        = "Human Review Queue"


class UrgencyLevel(str, Enum):
    LOW      = "low"
    MEDIUM   = "medium"
    HIGH     = "high"
    CRITICAL = "critical"


# ─────────────────────────────────────────────────────────────
# CORE DATA STRUCTURES
# ─────────────────────────────────────────────────────────────

@dataclass
class ExtractedInsight:
    """
    A single structured insight extracted from a call transcript.

    Confidence Score Scale:
        0.90 - 1.00 : High — auto-route, no human review
        0.75 - 0.89 : Confident — auto-route with flag
        0.60 - 0.74 : Uncertain — route to Human Review Queue
        0.00 - 0.59 : Low — discard or flag for CSM follow-up
    """
    insight_type:       InsightType
    summary:            str
    verbatim_quote:     Optional[str]
    sentiment:          SentimentLabel
    urgency:            UrgencyLevel
    confidence_score:   float
    routing_target:     RoutingDestination
    competitor_named:   Optional[str]
    feature_requested:  Optional[str]
    bug_description:    Optional[str]
    action_required:    bool
    suggested_action:   Optional[str]


@dataclass
class CallMetadata:
    """
    Context envelope around the transcript.
    Source attribution — ensures CSM credit is preserved.

    Design Decision: Metadata is separate from insights.
    Reason: The metadata travels with every routed insight, ensuring
            the CSM is visible as the source — not erased by automation.
    """
    csm_name:       str
    account_name:   str
    account_arr:    Optional[str]
    renewal_date:   Optional[str]
    call_date:      str
    call_duration:  Optional[str]
    transcript_id:  str


@dataclass
class ExtractionResult:
    """Full output of one transcript processing run."""
    metadata:           CallMetadata
    insights:           list
    total_insights:     int
    high_confidence:    int
    routed_to_review:   int
    processing_note:    Optional[str]


@dataclass
class RoutedAlert:
    """
    The final structured alert delivered to a stakeholder.

    Design Decision: RoutedAlert wraps ExtractedInsight + CallMetadata.
    Reason: Recipient should never need to look up context.
            Everything needed to act is in the alert itself.
    """
    destination:        RoutingDestination
    urgency:            UrgencyLevel
    insight:            ExtractedInsight
    metadata:           CallMetadata
    alert_id:           str
    requires_response:  bool
    response_sla:       str


# ─────────────────────────────────────────────────────────────
# ROUTING RULES TABLE
# Maps InsightType → RoutingDestination + SLA
# ─────────────────────────────────────────────────────────────

ROUTING_RULES = {
    InsightType.COMPETITOR_MENTION: {
        "primary":   RoutingDestination.SALES_LEADERSHIP,
        "secondary": RoutingDestination.PRODUCT_MANAGEMENT,
        "sla":       "48 hours",
    },
    InsightType.FEATURE_REQUEST: {
        "primary":   RoutingDestination.PRODUCT_MANAGEMENT,
        "secondary": None,
        "sla":       "1 week",
    },
    InsightType.BUG_REPORT: {
        "primary":   RoutingDestination.ENGINEERING,
        "secondary": RoutingDestination.PRODUCT_MANAGEMENT,
        "sla":       "24 hours",
    },
    InsightType.PRICING_FRICTION: {
        "primary":   RoutingDestination.SALES_LEADERSHIP,
        "secondary": RoutingDestination.PRODUCT_MANAGEMENT,
        "sla":       "48 hours",
    },
    InsightType.CHURN_SIGNAL: {
        "primary":   RoutingDestination.CUSTOMER_SUCCESS,
        "secondary": RoutingDestination.SALES_LEADERSHIP,
        "sla":       "24 hours",
    },
    InsightType.POSITIVE_SIGNAL: {
        "primary":   RoutingDestination.PRODUCT_MANAGEMENT,
        "secondary": None,
        "sla":       "1 week",
    },
    InsightType.GENERAL_FEEDBACK: {
        "primary":   RoutingDestination.PRODUCT_MANAGEMENT,
        "secondary": None,
        "sla":       "1 week",
    },
}

CRITICAL_SLA         = "4 hours"
CONFIDENCE_THRESHOLD = 0.75
'@

# ── poc/prompts.py ────────────────────────────────────────────────────────────
Write-Step "5/?" "Creating poc/prompts.py..."
New-RepoFile "poc/prompts.py" @'
"""
prompts.py — Prompt Engineering Strategy
=========================================
JTBD Feedback Loop Architect | Invoca Applied AI Analyst POC
Author: Erwin M. McDonald

Three prompt layers:
    1. SYSTEM_PROMPT     — Model persona + constraints + output contract
    2. EXTRACTION_PROMPT — Structured extraction with context injection
    3. FALLBACK_PROMPT   — Simplified schema used on primary failure

Design Philosophy:
    - Prompts are code. They are versioned, documented, and testable.
    - The extraction schema is embedded in the prompt — not assumed.
    - The model is told what to do when it is uncertain (confidence scoring).
    - Output format is JSON only — no prose, no markdown, no ambiguity.
"""


SYSTEM_PROMPT = """You are a precision insight extraction engine for a B2B SaaS company.

Your job is to analyze customer call transcripts and extract structured business insights
that help Product, Engineering, and Sales teams make better decisions.

PERSONA:
You think like a senior CSM who has been on thousands of enterprise software calls.
You know the difference between a customer venting and a customer about to churn.
You know the difference between casual competitor name-dropping and a real competitive threat.
You know when a "small bug" is actually blocking a workflow.

CORE RULES:
1. Extract ONLY what is explicitly present in the transcript. Do not infer beyond the evidence.
2. If you are not confident about a classification, lower the confidence_score — do not guess.
3. Every extracted insight must have a verbatim_quote if the transcript supports it.
4. Sentiment must reflect the CUSTOMER's sentiment, not the CSM's tone.
5. Urgency is determined by language signals: "cancel", "considering alternatives",
   "this is blocking us", "every time", "still not fixed" = HIGH or CRITICAL.
6. You must return valid JSON only. No prose. No markdown. No explanation outside the JSON.
7. If the transcript contains no extractable insights, return an empty insights array.

OUTPUT CONTRACT:
You must always return a JSON object matching exactly this structure:
{
  "insights": [
    {
      "insight_type": "<one of: competitor_mention | feature_request | bug_report | pricing_friction | churn_signal | positive_signal | general_feedback>",
      "summary": "<1-2 sentence structured summary of the insight>",
      "verbatim_quote": "<exact words from transcript, or null if not isolatable>",
      "sentiment": "<one of: positive | neutral | negative | critical>",
      "urgency": "<one of: low | medium | high | critical>",
      "confidence_score": <float between 0.0 and 1.0>,
      "competitor_named": "<competitor name if insight_type is competitor_mention, else null>",
      "feature_requested": "<feature description if insight_type is feature_request, else null>",
      "bug_description": "<bug description if insight_type is bug_report, else null>",
      "action_required": <true or false>,
      "suggested_action": "<what the receiving team should do, or null>"
    }
  ],
  "processing_note": "<any anomalies, ambiguities, or extraction edge cases, or null>"
}

CONFIDENCE SCORE CALIBRATION:
0.90 - 1.00 : The transcript explicitly and unambiguously contains this insight
0.75 - 0.89 : High confidence — clear signal with minor interpretive judgment
0.60 - 0.74 : Uncertain — present but could be interpreted differently
0.00 - 0.59 : Low — weak signal, likely noise, should not auto-route

When in doubt, score lower. A 0.65 that routes to human review is better than
a 0.85 that routes incorrectly.
"""


def build_extraction_prompt(transcript, csm_name, account_name, call_date, additional_context=""):
    """
    Builds the full extraction prompt with call context injected.

    Design Decision: Context injection over generic extraction.
    Reason: Knowing the account name and CSM lets the model distinguish
            "they mentioned Gong" (competitive intel) from
            "they use Gong internally" (stack context, not competitive threat).
    """
    context_block = ""
    if additional_context:
        context_block = f"""
ADDITIONAL ACCOUNT CONTEXT (use to inform extraction, do not hallucinate from it):
{additional_context}
"""

    return f"""Analyze the following customer call transcript and extract all structured insights.

CALL CONTEXT:
  CSM: {csm_name}
  Account: {account_name}
  Call Date: {call_date}
{context_block}

EXTRACTION TARGETS — look specifically for:
  * Competitor mentions (named competitors, comparisons, "we looked at X")
  * Feature requests (things the customer wants that don't exist yet)
  * Bug reports (things that are broken, not working, or inconsistent)
  * Pricing friction (cost concerns, ROI questions, pricing model complaints)
  * Churn signals (cancellation language, dissatisfaction, switching intent)
  * Positive signals (praise, expansion intent, referral mentions)
  * General feedback (anything strategically relevant that doesn't fit above)

TRANSCRIPT:
---
{transcript}
---

Extract all insights now. Return valid JSON only."""


def build_fallback_prompt(transcript, failed_output):
    """
    Simplified extraction prompt used when primary extraction fails.

    Design Decision: Two-stage fallback over hard failure.
    Reason: A single JSON parsing failure should not kill the entire pipeline.
    """
    return f"""Your previous extraction attempt returned output that could not be parsed as valid JSON.

Previous (invalid) output:
{str(failed_output)[:500]}...

Please try again with a SIMPLIFIED extraction. Return ONLY this minimal JSON structure:
{{
  "insights": [
    {{
      "insight_type": "<type>",
      "summary": "<1 sentence summary>",
      "verbatim_quote": null,
      "sentiment": "<positive|neutral|negative|critical>",
      "urgency": "<low|medium|high|critical>",
      "confidence_score": 0.8,
      "competitor_named": null,
      "feature_requested": null,
      "bug_description": null,
      "action_required": false,
      "suggested_action": null
    }}
  ],
  "processing_note": "Fallback extraction — simplified schema"
}}

TRANSCRIPT:
---
{transcript[:2000]}
---

Return valid JSON only. No other text."""


PROMPT_VERSION = "1.0.0"
PROMPT_CHANGELOG = {
    "1.0.0": "Initial extraction prompt — Invoca POC demo version"
}
'@

# ── poc/error_handler.py ──────────────────────────────────────────────────────
Write-Step "6/?" "Creating poc/error_handler.py..."
New-RepoFile "poc/error_handler.py" @'
"""
error_handler.py — Error Handling & Validation
================================================
JTBD Feedback Loop Architect | Invoca Applied AI Analyst POC
Author: Erwin M. McDonald

Handles all failure modes in the extraction pipeline:
    1. JSON parsing failures   — model returned malformed output
    2. Schema validation errors — output parsed but fields are wrong
    3. Confidence filtering     — valid output but below threshold
    4. Empty extraction         — no insights found
    5. API errors               — rate limits, timeouts, network failures

Design Decision: Every failure mode has a named handler, not a generic try/except.
Reason: Being able to say "here is exactly what happens when X fails" is the
        difference between a candidate who built it and one who demoed it.
"""

import json
import logging
from typing import Optional

from schema import (
    ExtractedInsight, ExtractionResult, CallMetadata,
    InsightType, SentimentLabel, RoutingDestination, UrgencyLevel,
    CONFIDENCE_THRESHOLD, ROUTING_RULES
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger("jtbd.error_handler")


class ExtractionValidationError(Exception):
    """Raised when extracted JSON fails schema validation."""
    pass


class ConfidenceBelowThresholdError(Exception):
    """Raised when all extracted insights fall below confidence threshold."""
    pass


def validate_insight_dict(raw: dict, index: int) -> ExtractedInsight:
    """
    Validates a single raw insight dict from the model output.
    Converts to typed ExtractedInsight dataclass.
    Raises ExtractionValidationError with specific field info on failure.
    """
    required_fields = [
        "insight_type", "summary", "sentiment", "urgency",
        "confidence_score", "action_required"
    ]

    for field_name in required_fields:
        if field_name not in raw:
            raise ExtractionValidationError(
                f"Insight[{index}] missing required field: '{field_name}'"
            )

    try:
        insight_type = InsightType(raw["insight_type"])
    except ValueError:
        raise ExtractionValidationError(
            f"Insight[{index}] invalid insight_type: '{raw['insight_type']}'. "
            f"Must be one of: {[e.value for e in InsightType]}"
        )

    try:
        sentiment = SentimentLabel(raw["sentiment"])
    except ValueError:
        raise ExtractionValidationError(
            f"Insight[{index}] invalid sentiment: '{raw['sentiment']}'"
        )

    try:
        urgency = UrgencyLevel(raw["urgency"])
    except ValueError:
        raise ExtractionValidationError(
            f"Insight[{index}] invalid urgency: '{raw['urgency']}'"
        )

    score = raw["confidence_score"]
    if not isinstance(score, (int, float)) or not (0.0 <= score <= 1.0):
        raise ExtractionValidationError(
            f"Insight[{index}] confidence_score must be float 0.0-1.0, got: {score}"
        )

    routing_rules = ROUTING_RULES.get(insight_type, {})
    routing_target = routing_rules.get("primary", RoutingDestination.HUMAN_REVIEW)

    if score < CONFIDENCE_THRESHOLD:
        routing_target = RoutingDestination.HUMAN_REVIEW
        logger.info(
            f"Insight[{index}] routed to Human Review — "
            f"confidence {score:.2f} below threshold {CONFIDENCE_THRESHOLD}"
        )

    return ExtractedInsight(
        insight_type=insight_type,
        summary=raw.get("summary", ""),
        verbatim_quote=raw.get("verbatim_quote"),
        sentiment=sentiment,
        urgency=urgency,
        confidence_score=score,
        routing_target=routing_target,
        competitor_named=raw.get("competitor_named"),
        feature_requested=raw.get("feature_requested"),
        bug_description=raw.get("bug_description"),
        action_required=bool(raw.get("action_required", False)),
        suggested_action=raw.get("suggested_action"),
    )


def parse_and_validate(raw_response: str):
    """
    Full parse + validate pipeline for a raw model response.
    Returns (validated_insights, processing_note).
    Raises json.JSONDecodeError or ExtractionValidationError on failure.
    """
    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.strip()
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3].strip()

    parsed = json.loads(cleaned)

    if "insights" not in parsed:
        raise ExtractionValidationError(
            "Response JSON missing top-level 'insights' array"
        )

    validated = []
    for i, raw_insight in enumerate(parsed["insights"]):
        insight = validate_insight_dict(raw_insight, i)
        validated.append(insight)

    processing_note = parsed.get("processing_note")
    return validated, processing_note


def handle_json_parse_failure(raw_response: str, attempt: int) -> str:
    logger.warning(
        f"JSON parse failure on attempt {attempt}. "
        f"First 200 chars: {raw_response[:200]!r}"
    )
    return raw_response


def handle_validation_failure(error: ExtractionValidationError, attempt: int) -> None:
    logger.warning(f"Schema validation failure on attempt {attempt}: {error}")


def handle_empty_extraction(metadata: CallMetadata) -> ExtractionResult:
    logger.info(
        f"Empty extraction for account '{metadata.account_name}' "
        f"— transcript contained no actionable insights"
    )
    return ExtractionResult(
        metadata=metadata,
        insights=[],
        total_insights=0,
        high_confidence=0,
        routed_to_review=0,
        processing_note="No extractable insights found in this transcript."
    )


def handle_api_error(error: Exception, transcript_id: str) -> None:
    logger.error(
        f"API error for transcript '{transcript_id}': "
        f"{type(error).__name__}: {error}"
    )


def build_extraction_result(metadata, insights, processing_note) -> ExtractionResult:
    high_confidence = sum(
        1 for i in insights
        if i.confidence_score >= CONFIDENCE_THRESHOLD
        and i.routing_target != RoutingDestination.HUMAN_REVIEW
    )
    routed_to_review = sum(
        1 for i in insights
        if i.routing_target == RoutingDestination.HUMAN_REVIEW
    )

    return ExtractionResult(
        metadata=metadata,
        insights=insights,
        total_insights=len(insights),
        high_confidence=high_confidence,
        routed_to_review=routed_to_review,
        processing_note=processing_note
    )
'@

# ── poc/router.py ─────────────────────────────────────────────────────────────
Write-Step "7/?" "Creating poc/router.py..."
New-RepoFile "poc/router.py" @'
"""
router.py — Stakeholder Routing Engine
=======================================
JTBD Feedback Loop Architect | Invoca Applied AI Analyst POC
Author: Erwin M. McDonald

Takes validated, confidence-scored insights and routes them to the correct
stakeholder with a fully structured alert.

Routing Logic:
    1. Insight type → primary destination (from ROUTING_RULES in schema.py)
    2. Confidence score < 0.75 → override to Human Review Queue
    3. Urgency = CRITICAL → collapse SLA to 4 hours
    4. Every alert gets a unique ID for closed-loop confirmation tracking

Design Decision: Routing is data-driven, not conditional branching.
Reason: When routing rules change, you update ROUTING_RULES in schema.py —
        not a chain of if/elif blocks. Auditable and testable independently.
"""

import uuid
import json
import logging
from datetime import datetime

from schema import (
    ExtractedInsight, ExtractionResult, RoutedAlert,
    CallMetadata, RoutingDestination, UrgencyLevel,
    ROUTING_RULES, CONFIDENCE_THRESHOLD, CRITICAL_SLA
)

logger = logging.getLogger("jtbd.router")


def route_insight(insight: ExtractedInsight, metadata: CallMetadata) -> RoutedAlert:
    """Routes a single validated insight to its destination stakeholder."""
    if insight.urgency == UrgencyLevel.CRITICAL:
        sla = CRITICAL_SLA
    else:
        rules = ROUTING_RULES.get(insight.insight_type, {})
        sla = rules.get("sla", "1 week")

    alert_id = f"JTBD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

    routed_alert = RoutedAlert(
        destination=insight.routing_target,
        urgency=insight.urgency,
        insight=insight,
        metadata=metadata,
        alert_id=alert_id,
        requires_response=insight.action_required,
        response_sla=sla
    )

    logger.info(
        f"[{alert_id}] Routed {insight.insight_type.value} → "
        f"{insight.routing_target.value} | "
        f"Confidence: {insight.confidence_score:.2f} | SLA: {sla}"
    )

    return routed_alert


def route_all(result: ExtractionResult) -> list:
    """Routes all insights from an ExtractionResult. Returns sorted by urgency."""
    alerts = [route_insight(insight, result.metadata) for insight in result.insights]

    urgency_order = {
        UrgencyLevel.CRITICAL: 0,
        UrgencyLevel.HIGH:     1,
        UrgencyLevel.MEDIUM:   2,
        UrgencyLevel.LOW:      3
    }
    alerts.sort(key=lambda a: urgency_order.get(a.urgency, 99))
    return alerts


def format_alert_terminal(alert: RoutedAlert) -> str:
    """Formats a RoutedAlert for terminal display."""
    urgency_icons = {
        UrgencyLevel.CRITICAL: "🔴 CRITICAL",
        UrgencyLevel.HIGH:     "🟠 HIGH",
        UrgencyLevel.MEDIUM:   "🟡 MEDIUM",
        UrgencyLevel.LOW:      "🟢 LOW",
    }
    dest_icons = {
        RoutingDestination.PRODUCT_MANAGEMENT:  "📋 Product Management",
        RoutingDestination.ENGINEERING:         "🔧 Engineering",
        RoutingDestination.SALES_LEADERSHIP:    "💼 Sales Leadership",
        RoutingDestination.CUSTOMER_SUCCESS:    "🤝 Customer Success Leadership",
        RoutingDestination.HUMAN_REVIEW:        "👤 Human Review Queue",
    }
    action_flag = "⚡ ACTION REQUIRED" if alert.requires_response else "ℹ️  FYI"

    lines = [
        "",
        "═" * 65,
        f"  ALERT ID:    {alert.alert_id}",
        f"  DESTINATION: {dest_icons.get(alert.destination, alert.destination.value)}",
        f"  URGENCY:     {urgency_icons.get(alert.urgency, alert.urgency.value)}",
        f"  TYPE:        {alert.insight.insight_type.value.upper().replace('_', ' ')}",
        f"  SLA:         Respond within {alert.response_sla}",
        f"  STATUS:      {action_flag}",
        "─" * 65,
        f"  ACCOUNT:     {alert.metadata.account_name}",
        f"  CSM:         {alert.metadata.csm_name}",
        f"  CALL DATE:   {alert.metadata.call_date}",
        "─" * 65,
        f"  SUMMARY:",
        f"  {alert.insight.summary}",
    ]

    if alert.insight.verbatim_quote:
        lines += ["─" * 65, "  VERBATIM QUOTE:", f"  \"{alert.insight.verbatim_quote}\""]
    if alert.insight.competitor_named:
        lines.append(f"  COMPETITOR:  {alert.insight.competitor_named}")
    if alert.insight.feature_requested:
        lines.append(f"  FEATURE:     {alert.insight.feature_requested}")
    if alert.insight.bug_description:
        lines.append(f"  BUG:         {alert.insight.bug_description}")
    if alert.insight.suggested_action:
        lines += ["─" * 65, "  SUGGESTED ACTION:", f"  {alert.insight.suggested_action}"]

    lines += [f"  CONFIDENCE:  {alert.insight.confidence_score:.0%}", "═" * 65]
    return "\n".join(lines)


def format_csm_confirmation(alert: RoutedAlert) -> str:
    """
    The closed-loop confirmation sent back to the CSM.

    Design Decision: CSM confirmation is a first-class output, not an afterthought.
    Reason: If CSMs don't know their input landed, they stop entering it.
            The confirmation is the adoption mechanism.
    """
    return (
        f"\n✅ INSIGHT CONFIRMED — {alert.alert_id}\n"
        f"   Your {alert.insight.insight_type.value.replace('_', ' ')} from "
        f"{alert.metadata.account_name} has been routed to "
        f"{alert.destination.value}.\n"
        f"   Response SLA: {alert.response_sla}\n"
        f"   Confidence: {alert.insight.confidence_score:.0%}\n"
    )


def format_alerts_as_json(alerts: list) -> str:
    """Serializes all routed alerts to JSON for downstream integration."""
    output = []
    for alert in alerts:
        output.append({
            "alert_id":          alert.alert_id,
            "destination":       alert.destination.value,
            "urgency":           alert.urgency.value,
            "response_sla":      alert.response_sla,
            "requires_response": alert.requires_response,
            "insight": {
                "type":              alert.insight.insight_type.value,
                "summary":           alert.insight.summary,
                "verbatim_quote":    alert.insight.verbatim_quote,
                "sentiment":         alert.insight.sentiment.value,
                "confidence_score":  alert.insight.confidence_score,
                "suggested_action":  alert.insight.suggested_action,
                "competitor_named":  alert.insight.competitor_named,
                "feature_requested": alert.insight.feature_requested,
                "bug_description":   alert.insight.bug_description,
            },
            "account": {
                "name":         alert.metadata.account_name,
                "csm":          alert.metadata.csm_name,
                "call_date":    alert.metadata.call_date,
                "arr":          alert.metadata.account_arr,
                "renewal_date": alert.metadata.renewal_date,
            }
        })
    return json.dumps(output, indent=2)


def print_routing_summary(alerts: list) -> None:
    """Prints a high-level routing summary."""
    print("\n" + "═" * 65)
    print("  ROUTING SUMMARY")
    print("═" * 65)

    by_destination = {}
    for alert in alerts:
        dest = alert.destination.value
        if dest not in by_destination:
            by_destination[dest] = []
        by_destination[dest].append(alert)

    for dest, dest_alerts in sorted(by_destination.items()):
        print(f"\n  → {dest} ({len(dest_alerts)} insight{'s' if len(dest_alerts) > 1 else ''})")
        for a in dest_alerts:
            flag = "⚡" if a.requires_response else " "
            print(
                f"     {flag} [{a.urgency.value.upper():8}] "
                f"{a.insight.insight_type.value.replace('_', ' ').title()} "
                f"({a.insight.confidence_score:.0%} confidence)"
            )

    human_review = [a for a in alerts if a.destination == RoutingDestination.HUMAN_REVIEW]
    if human_review:
        print(f"\n  ⚠️  {len(human_review)} insight(s) routed to Human Review")
        print(f"     (confidence below {CONFIDENCE_THRESHOLD:.0%} threshold)")

    print("\n" + "═" * 65 + "\n")
'@

# ── poc/main.py ───────────────────────────────────────────────────────────────
Write-Step "8/?" "Creating poc/main.py..."
New-RepoFile "poc/main.py" @'
"""
main.py — JTBD Feedback Loop Extraction Engine
================================================
JTBD Feedback Loop Architect | Invoca Applied AI Analyst POC
Author: Erwin M. McDonald

Entry point — orchestrates the full pipeline:
    1. Load transcript + metadata
    2. Call Anthropic API with extraction prompt
    3. Parse and validate structured output
    4. Fallback if primary extraction fails
    5. Route insights to stakeholders
    6. Display formatted alerts + CSM confirmations

USAGE:
    python main.py                                # sample transcript, terminal output
    python main.py --mock                         # demo mode — no API key needed
    python main.py --mock --output json           # JSON output
    python main.py --transcript my_call.txt       # custom transcript

REQUIREMENTS:
    pip install anthropic
    export ANTHROPIC_API_KEY=your_key_here
"""

import os
import sys
import json
import argparse
import logging
from datetime import datetime
from pathlib import Path

import anthropic

from schema import CallMetadata, CONFIDENCE_THRESHOLD
from prompts import (
    SYSTEM_PROMPT,
    build_extraction_prompt,
    build_fallback_prompt,
    PROMPT_VERSION
)
from error_handler import (
    parse_and_validate,
    handle_json_parse_failure,
    handle_validation_failure,
    handle_empty_extraction,
    handle_api_error,
    build_extraction_result,
    ExtractionValidationError
)
from router import (
    route_all,
    format_alert_terminal,
    format_csm_confirmation,
    format_alerts_as_json,
    print_routing_summary
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger("jtbd.main")


# ─────────────────────────────────────────────────────────────
# MOCK DATA — used when --mock flag is set (no API key needed)
# ─────────────────────────────────────────────────────────────

MOCK_API_RESPONSE = """{
  "insights": [
    {
      "insight_type": "bug_report",
      "summary": "Call attribution data has been inconsistent for 6 weeks, creating discrepancies between Invoca reporting and Google Ads dashboard. A support ticket has been open for 41 days without resolution, causing the paid search team to distrust attribution numbers.",
      "verbatim_quote": "We've flagged it twice to support and the ticket is still open. It's not a minor thing — we're making media spend decisions based on this data.",
      "sentiment": "critical",
      "urgency": "critical",
      "confidence_score": 0.97,
      "competitor_named": null,
      "feature_requested": null,
      "bug_description": "Call attribution data discrepancy between Invoca and Google Ads dashboard — 41-day open support ticket",
      "action_required": true,
      "suggested_action": "Escalate to Engineering as P1. Assign owner and provide ETA by end of week. CSM to confirm escalation to customer within 24 hours."
    },
    {
      "insight_type": "feature_request",
      "summary": "Customer is expanding into SMS and chat channels and wants unified omnichannel conversation intelligence — intent scoring and attribution across all customer interaction channels.",
      "verbatim_quote": "It would be really valuable if there was some kind of unified view — like, the same kind of intent scoring and attribution you do for calls but across all the channels.",
      "sentiment": "neutral",
      "urgency": "medium",
      "confidence_score": 0.91,
      "competitor_named": null,
      "feature_requested": "Unified omnichannel conversation intelligence — intent scoring and attribution across calls, SMS, and chat",
      "bug_description": null,
      "action_required": false,
      "suggested_action": "Route to Product Management for roadmap consideration."
    },
    {
      "insight_type": "competitor_mention",
      "summary": "Acme Financial had a demo with Marchex last month. Marchex pitched omnichannel conversation intelligence. Customer's leadership is asking about alternatives.",
      "verbatim_quote": "We had a demo with Marchex last month. They were pitching something they called 'omnichannel conversation intelligence.' We're not going anywhere, but I want to be transparent that we're being asked to evaluate alternatives.",
      "sentiment": "negative",
      "urgency": "high",
      "confidence_score": 0.96,
      "competitor_named": "Marchex",
      "feature_requested": null,
      "bug_description": null,
      "action_required": true,
      "suggested_action": "Alert Sales Leadership immediately. Prepare competitive battlecard for Marchex omnichannel claim."
    },
    {
      "insight_type": "pricing_friction",
      "summary": "Customer received an 18% renewal price increase while their own marketing budget was cut 15% this quarter. Cannot get the increase through finance.",
      "verbatim_quote": "The price increase is 18%. I understand costs go up but our marketing budget got cut 15% this quarter. I'm going to have a hard time getting this through finance at that number.",
      "sentiment": "negative",
      "urgency": "high",
      "confidence_score": 0.98,
      "competitor_named": null,
      "feature_requested": null,
      "bug_description": null,
      "action_required": true,
      "suggested_action": "Escalate to Sales Leadership before formal renewal discussions. Request pricing options within 1 week."
    },
    {
      "insight_type": "positive_signal",
      "summary": "Inside sales team attributes a 23% improvement in qualified lead rate this quarter to Invoca call scoring.",
      "verbatim_quote": "Our inside sales team actually credits Invoca with a 23% improvement in qualified lead rate this quarter, which is huge.",
      "sentiment": "positive",
      "urgency": "low",
      "confidence_score": 0.99,
      "competitor_named": null,
      "feature_requested": null,
      "bug_description": null,
      "action_required": false,
      "suggested_action": "Capture as customer success story. Use in renewal conversation to anchor value."
    },
    {
      "insight_type": "churn_signal",
      "summary": "Customer stated that if the attribution bug is not fixed and pricing is not addressed before June renewal, she does not know what the board will say — renewal is at risk.",
      "verbatim_quote": "The bug needs to get fixed and the pricing conversation needs to happen before June. Otherwise honestly I don't know what the board is going to say.",
      "sentiment": "critical",
      "urgency": "critical",
      "confidence_score": 0.93,
      "competitor_named": null,
      "feature_requested": null,
      "bug_description": null,
      "action_required": true,
      "suggested_action": "Flag account as renewal risk. Escalate to CS leadership and Sales VP. Two hard dependencies: (1) attribution bug resolved, (2) pricing options before June renewal."
    }
  ],
  "processing_note": "6 insights extracted. Two CRITICAL urgency items require same-day escalation. Account ARR $84k at risk — renewal June 30."
}"""


# ─────────────────────────────────────────────────────────────
# TRANSCRIPT LOADER
# ─────────────────────────────────────────────────────────────

def load_transcript(path: str):
    """
    Loads a transcript file and extracts metadata from the header block.
    Returns (transcript_text, CallMetadata).
    """
    content = Path(path).read_text(encoding="utf-8")
    lines = content.split("\n")

    meta = {}
    transcript_start = 0
    for i, line in enumerate(lines):
        if line.startswith("---"):
            transcript_start = i + 1
            break
        if ":" in line:
            key, _, value = line.partition(":")
            meta[key.strip().upper()] = value.strip()

    transcript_text = "\n".join(lines[transcript_start:]).strip()

    metadata = CallMetadata(
        csm_name=meta.get("CSM", "Unknown CSM"),
        account_name=meta.get("ACCOUNT", "Unknown Account"),
        account_arr=meta.get("ARR"),
        renewal_date=meta.get("RENEWAL DATE"),
        call_date=meta.get("CALL DATE", datetime.now().strftime("%B %d, %Y")),
        call_duration=meta.get("DURATION"),
        transcript_id=meta.get("TRANSCRIPT ID", f"TXN-{datetime.now().strftime('%Y%m%d')}-UNKNOWN")
    )

    return transcript_text, metadata


# ─────────────────────────────────────────────────────────────
# EXTRACTION ENGINE
# ─────────────────────────────────────────────────────────────

def extract_insights(transcript, metadata, client, mock=False):
    """
    Calls the Anthropic API to extract structured insights.
    Implements two-stage extraction with fallback on failure.
    Returns (validated_insights, processing_note).
    """
    if mock:
        logger.info("MOCK MODE — using pre-loaded response (no API call)")
        raw_response = MOCK_API_RESPONSE
    else:
        prompt = build_extraction_prompt(
            transcript=transcript,
            csm_name=metadata.csm_name,
            account_name=metadata.account_name,
            call_date=metadata.call_date
        )

        logger.info(
            f"Calling Anthropic API | Model: claude-sonnet-4-6 | "
            f"Prompt version: {PROMPT_VERSION}"
        )

        try:
            message = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=4096,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}]
            )
            raw_response = message.content[0].text
            logger.info(
                f"API call successful | "
                f"Input tokens: {message.usage.input_tokens} | "
                f"Output tokens: {message.usage.output_tokens}"
            )
        except Exception as e:
            handle_api_error(e, metadata.transcript_id)
            raise

    # Stage 1: Primary parse + validate
    try:
        insights, processing_note = parse_and_validate(raw_response)
        logger.info(f"Primary extraction succeeded — {len(insights)} insights extracted")
        return insights, processing_note

    except json.JSONDecodeError:
        failed = handle_json_parse_failure(raw_response, attempt=1)
        logger.warning("Primary extraction failed — attempting fallback")

    except ExtractionValidationError as e:
        handle_validation_failure(e, attempt=1)
        failed = raw_response
        logger.warning("Primary validation failed — attempting fallback")

    # Stage 2: Fallback extraction
    fallback_prompt = build_fallback_prompt(transcript, failed)

    if mock:
        logger.info("MOCK MODE — fallback not available, returning empty extraction")
        return [], "Fallback extraction — mock mode returned empty"

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": fallback_prompt}]
        )
        fallback_response = message.content[0].text
        insights, processing_note = parse_and_validate(fallback_response)
        logger.info(f"Fallback extraction succeeded — {len(insights)} insights extracted")
        return insights, f"FALLBACK USED. {processing_note or ''}"

    except Exception as e:
        logger.error(f"Fallback extraction also failed: {e}")
        return [], f"Both extraction attempts failed: {e}"


# ─────────────────────────────────────────────────────────────
# MAIN PIPELINE
# ─────────────────────────────────────────────────────────────

def run_pipeline(transcript_path: str, output_format: str = "terminal", mock: bool = False):
    """Full end-to-end pipeline run."""
    print("\n" + "═" * 65)
    print("  JTBD FEEDBACK LOOP — INSIGHT EXTRACTION ENGINE")
    print("  Invoca Applied AI Analyst POC | Erwin M. McDonald")
    print("═" * 65)

    logger.info(f"Loading transcript: {transcript_path}")
    transcript, metadata = load_transcript(transcript_path)
    print(f"\n  📞 Processing: {metadata.account_name}")
    print(f"  👤 CSM:        {metadata.csm_name}")
    print(f"  📅 Date:       {metadata.call_date}")
    print(f"  🆔 ID:         {metadata.transcript_id}\n")

    if not mock:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            print("\n  ⚠️  ANTHROPIC_API_KEY not set. Run with --mock for demo mode.\n")
            sys.exit(1)
        client = anthropic.Anthropic(api_key=api_key)
    else:
        client = None
        print("  ⚡ Running in MOCK MODE — no API key required\n")

    print("  🔍 Extracting insights from transcript...")
    insights, processing_note = extract_insights(transcript, metadata, client, mock=mock)

    if not insights:
        handle_empty_extraction(metadata)
        print("\n  ℹ️  No extractable insights found in this transcript.")
        return

    result = build_extraction_result(metadata, insights, processing_note)
    print(f"\n  ✅ Extracted {result.total_insights} insights")
    print(f"     Auto-routing:    {result.high_confidence} (confidence ≥ {CONFIDENCE_THRESHOLD:.0%})")
    print(f"     Human review:    {result.routed_to_review} (confidence < {CONFIDENCE_THRESHOLD:.0%})")
    if processing_note:
        print(f"\n  📝 Note: {processing_note}")

    print("\n  🚦 Routing insights to stakeholders...")
    alerts = route_all(result)

    if output_format == "json":
        print("\n" + format_alerts_as_json(alerts))
    else:
        print_routing_summary(alerts)
        print("  FULL ALERT DETAILS\n")
        for alert in alerts:
            print(format_alert_terminal(alert))

        print("\n" + "─" * 65)
        print("  CSM CLOSED-LOOP CONFIRMATIONS")
        print("─" * 65)
        seen_alerts = set()
        for alert in alerts:
            if alert.alert_id not in seen_alerts:
                print(format_csm_confirmation(alert))
                seen_alerts.add(alert.alert_id)

    print("\n  Pipeline complete.\n")


def main():
    parser = argparse.ArgumentParser(description="JTBD Feedback Loop — Insight Extraction Engine")
    parser.add_argument("--transcript", default="sample_transcript.txt",
                        help="Path to transcript file (default: sample_transcript.txt)")
    parser.add_argument("--output", choices=["terminal", "json"], default="terminal",
                        help="Output format (default: terminal)")
    parser.add_argument("--mock", action="store_true",
                        help="Run in mock mode without API key")

    args = parser.parse_args()

    # Resolve transcript path relative to main.py's directory if no path separator given
    transcript_path = args.transcript
    if not os.path.isabs(transcript_path) and not os.sep in transcript_path and not '/' in transcript_path:
        transcript_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), transcript_path)

    run_pipeline(
        transcript_path=transcript_path,
        output_format=args.output,
        mock=args.mock
    )


if __name__ == "__main__":
    main()
'@

# ── poc/README.md ─────────────────────────────────────────────────────────────
Write-Step "9/?" "Creating poc/README.md..."
New-RepoFile "poc/README.md" @"
# 🔬 POC Technical Walkthrough — The Build (Lens 2)

## Why Raw Python + Anthropic API

Three options were available: n8n, Zapier, raw code.

**Zapier** was eliminated immediately — it signals a low technical ceiling.
**n8n** is a legitimate Phase 2 deployment layer for non-technical handoff.
**Raw Python + Anthropic API** was chosen because every architecture decision
is explicit, inspectable, and readable as code — not hidden behind a GUI.

## Running the POC

``````bash
# Demo mode — no API key needed
python main.py --mock

# Live mode
export ANTHROPIC_API_KEY=your_key_here
python main.py

# JSON output for integration testing
python main.py --mock --output json

# Custom transcript
python main.py --transcript /path/to/your_transcript.txt
``````

## File Responsibilities

| File | Responsibility |
|------|----------------|
| \`main.py\` | Pipeline orchestrator — entry point, CLI, full flow |
| \`prompts.py\` | 3-layer prompt engineering strategy (versioned) |
| \`schema.py\` | Typed data contracts, enums, routing rules table |
| \`error_handler.py\` | 2-stage validation + named failure handlers |
| \`router.py\` | Data-driven routing engine + alert formatters |
| \`sample_transcript.txt\` | Realistic demo: Acme Financial QBR |

## Prompt Engineering Strategy

Three versioned layers: System Prompt (persona + output contract),
Extraction Prompt (context injection), Fallback Prompt (simplified schema retry).

Prompts are code. They are versioned in \`PROMPT_VERSION\` and logged with every API call.

## Error Handling

Every failure mode has a named handler:
- \`handle_json_parse_failure()\` → triggers fallback extraction
- \`handle_validation_failure()\` → logs field-level error, triggers fallback
- \`handle_empty_extraction()\` → clean result, not a crash
- \`handle_api_error()\` → logs with transcript ID, re-raises
"@

# ── docs/ files ───────────────────────────────────────────────────────────────
Write-Step "10/?" "Creating docs/jtbd-map.md..."
New-RepoFile "docs/jtbd-map.md" @"
# 📋 Process Design & Strategy — Analyst Lens (Lens 1)
## JTBD Framework + Current State vs. Future State Workflow

---

## The Problem Statement

> *CSMs hear critical feedback about pricing and bugs daily, but manual entry is inconsistent,
> creating an 'insight black hole' for Product leadership.*

The insight is not missing. It exists on every call, every day.
**The system is just not designed to catch it.**

---

## Jobs to Be Done — The Three Humans in This Loop

### Role 1: The CSM
| Dimension | Job |
|-----------|-----|
| **Functional** | Make customers successful. Retain and expand their contracts. |
| **Emotional** | Feel trusted, heard, and strategic — not like a data entry clerk. |
| **Social** | Be seen as the expert who understands the customer better than anyone. |

**Current State Friction:**
- Time Tax — Manual CRM entry competes with prep, follow-up, and the next call.
- Judgment Erasure — Freeform notes lose nuance. The system cannot distinguish urgency.
- Signal Loss — No confirmation the insight was ever read. The loop never closes.

### Role 2: The Product Manager
| Dimension | Job |
|-----------|-----|
| **Functional** | Prioritize roadmap based on real customer signal. |
| **Emotional** | Feel confident the signal is real, not noise or anecdote. |
| **Social** | Be seen as customer-driven and evidence-based. |

**Current State Friction:**
- Trust Deficit — Unstructured notes are not evidence. They are opinion.
- Pattern Blindness — Individual notes never aggregate into trends.
- Accountability Gap — No structured feedback means no accountability for response.

### Role 3: The CS/Sales Leader
| Dimension | Job |
|-----------|-----|
| **Functional** | Protect ARR. Catch churn signals before they become cancellations. |
| **Emotional** | Feel in control of renewal risk — not surprised by it. |
| **Social** | Be seen as proactive, not reactive. |

**Current State Friction:**
- Blind Spots — Churn signals buried in CRM notes, discovered too late.
- No SLA — No structured routing means no accountability for response time.

---

## Current State vs. Future State

### Current State (The Problem)
\`\`\`
CSM finishes 47-minute QBR
    ↓
Has 4 more calls today
    ↓
Writes note at 6pm: "Good call. Follow up on pricing."
    ↓
Insight dies
\`\`\`

### Future State (The Solution)
\`\`\`
CSM finishes 47-minute QBR
    ↓
Transcript processed automatically
    ↓
6 structured insights extracted, confidence-scored, routed
    ↓
Engineering: P1 bug — 4 hour SLA
Sales Leadership: Competitor mention + pricing friction — 48 hour SLA
CS Leadership: Churn signal — 4 hour SLA
Product Management: Feature request — 1 week SLA
    ↓
CSM receives: "Your 6 insights from Acme Financial have been routed."
    ↓
Loop closed
\`\`\`
"@

Write-Step "11/?" "Creating docs/technical-architecture.md..."
New-RepoFile "docs/technical-architecture.md" @"
# 🔧 Technical Architecture — Builder Lens (Lens 2)

## Why Raw Python + Anthropic API

Zapier signals a low technical ceiling — eliminated immediately.
n8n is a viable Phase 2 deployment layer.
Raw Python was chosen because every decision is explicit and inspectable.

## Architecture Decision Record

| Decision | Choice | Reason |
|----------|--------|--------|
| LLM Provider | Anthropic claude-sonnet-4-6 | Best JSON instruction-following |
| Output Format | JSON schema in prompt | No ambiguity, no post-processing |
| Error Strategy | 2-stage fallback | Pipeline never crashes on single failure |
| Routing Logic | Data table, not if/elif | Auditable, testable, maintainable |
| Confidence Gate | 0.75 threshold | Configurable, PM controls it |
| Attribution | Metadata in every alert | CSM is never erased by automation |

## Prompt Engineering Strategy

Three versioned layers in prompts.py:

1. SYSTEM_PROMPT — Persona: senior B2B CSM + output contract (JSON schema)
2. EXTRACTION_PROMPT — Context injection (CSM, account, date) + 7 extraction targets
3. FALLBACK_PROMPT — Simplified schema retry when primary extraction fails

Design principle: Prompts are code. Versioned, documented, logged with every API call.

## Data Flow

transcript.txt → load_transcript() → CallMetadata + transcript text
→ build_extraction_prompt() → Anthropic API → raw JSON response
→ parse_and_validate() → [ExtractedInsight, ...] → route_all()
→ [RoutedAlert, ...] → format_alert_terminal() / format_alerts_as_json()
"@

Write-Step "12/?" "Creating docs/stakeholder-mgmt.md..."
New-RepoFile "docs/stakeholder-mgmt.md" @"
# 🤝 Stakeholder Management — Human Lens (Lens 3)

## The Core Principle

Great tech fails when humans don't adopt it.
The biggest risk is not a bad API call. It is a CSM who stops submitting transcripts.

## Adoption Resistance by Role

| Role | Resistance Pattern | Counter-Strategy |
|------|--------------------|------------------|
| CSM | Fear of job replacement | Position as amplifier: *your insight, our routing* |
| CSM | Extra work / friction | Zero friction — no form, no new tool, just transcript |
| Product Manager | Trust deficit in AI output | Confidence scores + verbatim quotes — PM controls threshold |
| Engineering | Alert fatigue | Routing rules are transparent and configurable |
| CS Leadership | Black box concern | Every alert shows how the confidence score was derived |

## Rollout Sequence

**Phase 0 — Before Launch:**
Co-design the routing rules with each stakeholder group.
The people who receive alerts help define what good looks like.

**Phase 1 — Pilot (Weeks 1–4):**
3 CSMs, volunteer basis. Human review of every alert before delivery.
Build trust before volume.

**Phase 2 — Validation (Weeks 5–8):**
Measure: Did Engineering respond within SLA? Did PM acknowledge feature requests?
Make the feedback loop visible to the CSMs who generated the insights.

**Phase 3 — Scale:**
Expand based on demonstrated value, not mandate.

## Trust Mechanics Built Into the System

- Verbatim quote in every alert — the AI does not summarize without evidence
- CSM attribution in every alert — the human is credited, not erased
- Confidence score visible — PM can raise or lower threshold at any time
- Closed-loop CSM confirmation — CSM knows their insight landed
- Human Review Queue for low-confidence insights — AI does not auto-route uncertainty
"@

Write-Step "13/?" "Creating docs/future-state.md..."
New-RepoFile "docs/future-state.md" @"
# 🔭 The Future — Innovator Lens (Lens 4)

## 18-Month Evolution Roadmap

### Phase 1 — MVP (Now)
- File-based transcript input
- Python POC, single pipeline
- Terminal output + JSON for integration testing

### Phase 2 — Integration (6 months)
- Native Invoca call stream (no file upload — fully automatic)
- Salesforce write-back (insight logged to account record automatically)
- Slack delivery (routed alert appears in the right channel instantly)
- Feedback capture (recipient marks alert as acted on — closes the loop)

### Phase 3 — Multi-Agent (12–18 months)
- Pattern aggregation agent: surface trending issues across accounts
  (e.g., 'Marchex mentioned on 7 calls this week — up from 1 last week')
- Proactive PM digest: weekly structured summary of all product signals
- Cross-account churn signal correlation
- Renewal risk scoring model fed by structured insight history

## What Changes the Economics

Model cost curves (GPT-4 class inference: ~95% cost reduction in 18 months) shift
the decision from 'process flagged calls' to 'process every call.'

The architecture is already designed for this transition.
The confidence threshold, routing rules, and fallback logic work at any scale.

## Multi-Agent Architecture (Phase 3 Preview)

\`\`\`
Individual Call Agents (n parallel)
    ↓
Insight Store (structured, searchable)
    ↓
Pattern Aggregation Agent (weekly digest)
    ↓
Proactive Alert Layer → CS Leadership / Product Leadership
\`\`\`

## The Governance Question

As volume scales, two things become critical:
1. Audit trail — every routing decision logged and reviewable
2. Threshold governance — who owns the confidence threshold, and how is it changed?

Both are architectural decisions made now, not retrofitted later.
The current schema (confidence_score, routing_target, alert_id) supports both.
"@

# ── skill/ ────────────────────────────────────────────────────────────────────
Write-Step "14/?" "Creating skill/jtbd-feedback-loop.skill..."
New-RepoFile "skill/jtbd-feedback-loop.skill" @"
# JTBD Feedback Loop Architect Skill v1.0
# Author: Erwin M. McDonald

## Skill Identity
name: jtbd-feedback-loop
version: 1.0.0
description: >
  Applies the JTBD Feedback Loop framework to diagnose insight capture
  failures in customer-facing workflows and design AI-augmented extraction
  and routing pipelines.

## When to Apply This Skill
triggers:
  - "analyze our CSM feedback workflow"
  - "why is product not hearing from customers"
  - "design an insight extraction pipeline"
  - "apply JTBD to our feedback loop"
  - "our CSM notes are inconsistent"

## Core Framework

### Step 1: Map the Humans
For each role in the loop, apply 3 JTBD dimensions:
- Functional: What task are they trying to complete?
- Emotional: How do they want to feel while doing it?
- Social: How do they want to be seen by others?

### Step 2: Audit the Current State Friction
For each role, identify:
- What is the time tax?
- What judgment is being lost by the current system?
- Where does the signal die?

### Step 3: Design the Future State
Map current friction → design decision:
- Time Tax → Auto-extraction (zero manual entry)
- Judgment Erasure → Verbatim quotes in every alert
- Signal Loss → Closed-loop confirmation to originator
- Trust Deficit → Confidence scores (recipient controls threshold)

### Step 4: Build the Adoption Layer
Adoption is not a launch event. It is a trust-building sequence.
- Co-design routing rules with recipients
- Pilot with volunteers, not mandates
- Make feedback loops visible to the people who generated insights
- Measure SLA compliance, not just adoption rate

## Output Format
Always produce:
1. JTBD Role Map (3 roles × 3 dimensions)
2. Current/Future State workflow comparison
3. Friction → Design Decision mapping table
4. Adoption resistance patterns + counter-strategies
"@

# ── assets/ placeholder ───────────────────────────────────────────────────────
Write-Step "15/?" "Creating assets/README.md..."
New-RepoFile "assets/README.md" @"
# Assets

This directory contains architecture diagrams and visual assets referenced in the documentation.

## Planned Diagrams

- \`pipeline-flow.png\` — Full pipeline architecture diagram
- \`routing-table.png\` — Stakeholder routing rules visualization
- \`current-vs-future.png\` — Current state vs future state workflow comparison

These will be added as the POC evolves into Phase 2.
"@

Write-OK "All project files created"

# =============================================================================
#  STEP 5 — COPY SETUP SCRIPT INTO REPO
# =============================================================================

Write-Banner "STEP 4 — FINALIZING REPO" "Yellow"

# Save the setup script into the repo's setup/ folder
$setupDir = Join-Path (Get-Location) "setup"
if (-not (Test-Path $setupDir)) {
    New-Item -ItemType Directory -Path $setupDir -Force | Out-Null
}

# Copy this script to setup/create-repo.ps1
try {
    Copy-Item $PSCommandPath -Destination (Join-Path $setupDir "create-repo.ps1") -Force
    Write-OK "Setup script saved to setup/create-repo.ps1"
} catch {
    Write-Warn "Could not copy setup script (non-critical): $_"
}

# =============================================================================
#  STEP 6 — INITIAL COMMIT AND PUSH
# =============================================================================

Write-Banner "STEP 5 — COMMITTING AND PUSHING TO GITHUB" "Yellow"

git add .

$commitMessage = @"
Initial commit: JTBD Feedback Loop Architect — Full POC Scaffold

Files created by setup-jtbd-repo.ps1 v2.0:

POC (working pipeline):
  - main.py           Pipeline orchestrator + CLI + mock mode
  - prompts.py        3-layer prompt engineering strategy (versioned)
  - schema.py         Typed data contracts, enums, routing rules table
  - error_handler.py  2-stage validation + named failure handlers
  - router.py         Data-driven routing engine + alert formatters
  - sample_transcript.txt  Acme Financial QBR demo transcript (47min)
  - requirements.txt  Single dependency: anthropic

Docs (all 4 presentation lenses):
  - docs/jtbd-map.md              Lens 1: JTBD + current/future state
  - docs/technical-architecture.md Lens 2: Architecture decisions
  - docs/stakeholder-mgmt.md      Lens 3: Human adoption strategy
  - docs/future-state.md          Lens 4: 18-month vision

Supporting:
  - skill/jtbd-feedback-loop.skill  Installable Claude skill
  - assets/README.md                Asset directory placeholder
  - setup/create-repo.ps1           This setup script

Invoca Applied AI Analyst Final Interview | Option 3: Feedback Loop Architect
Author: Erwin M. McDonald
"@

git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Warn "Commit had issues. Try: git status"
} else {
    Write-OK "Commit created"
}

git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-OK "Pushed to GitHub successfully"
} else {
    Write-Warn "Push may have failed. Try: git push origin main"
}

# =============================================================================
#  STEP 7 — OPEN IN BROWSER
# =============================================================================

Write-Banner "STEP 6 — OPENING YOUR REPO" "Cyan"

$username = gh api user --jq '.login' 2>$null
if ($username) {
    $repoUrl = "https://github.com/$username/$RepoName"
    Write-OK "Your repo is live at: $repoUrl"
    Write-Host ""
    gh repo view --web
} else {
    Write-Warn "Could not determine GitHub username. Check manually on github.com"
}

# =============================================================================
#  DONE
# =============================================================================

Write-Banner "SETUP COMPLETE" "Green"

Write-Host "  Your JTBD Feedback Loop repo is live on GitHub." -ForegroundColor White
Write-Host ""
Write-Host "  NEXT STEPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Navigate into poc/ and run the POC:" -ForegroundColor White
Write-Host "     cd $RepoName\poc" -ForegroundColor Gray
Write-Host "     pip install anthropic" -ForegroundColor Gray
Write-Host "     python main.py --mock" -ForegroundColor Gray
Write-Host ""
Write-Host "  ⚠️  IMPORTANT: Always run from inside poc\\" -ForegroundColor DarkYellow
Write-Host "     main.py needs sample_transcript.txt in the same folder." -ForegroundColor DarkYellow
Write-Host ""
Write-Host "  2. Test with a live API key:" -ForegroundColor White
Write-Host "     `$env:ANTHROPIC_API_KEY = 'your_key_here'" -ForegroundColor Gray
Write-Host "     python main.py" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Copy the master README from the output of this setup and" -ForegroundColor White
Write-Host "     paste it into your README.md on GitHub to activate the" -ForegroundColor White
Write-Host "     full badge display and architecture diagrams." -ForegroundColor White
Write-Host ""
Write-Host ("═" * 70) -ForegroundColor Green
