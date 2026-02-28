# JTBD Feedback Loop — PowerShell Repo Setup Script Build Prompt

**Project:** Option 3: The Feedback Loop Architect  
**Author:** Erwin M. McDonald  
**Script Output:** `setup-jtbd-repo.ps1` / `create-repo.ps1`  
**Script Version:** 2.0 — Full Scaffold  
**Repo:** [github.com/emcdo411/jtbd-feedback-loop](https://github.com/emcdo411/jtbd-feedback-loop)

---

## Role & Context

You are a senior DevOps engineer and PowerShell specialist.

I need a single PowerShell script that builds a complete GitHub repository from scratch — no manual steps, no file creation after the fact. This is the setup automation for my **JTBD Feedback Loop Architect** POC, built for my Invoca Applied AI Automation Analyst final interview.

The script must be paste-and-run. A non-technical person should be able to open PowerShell, paste the script, press Enter, and have a fully populated, committed, and pushed GitHub repo open in their browser within 3 minutes.

---

## What the Script Must Do (Step by Step)

The script must execute these steps in order with clear terminal feedback at every stage:

1. **Pre-flight checks** — Verify Git and GitHub CLI are installed and authenticated. If either is missing, print exact install URLs and exit gracefully with instructions. Never crash silently.
2. **Create the GitHub repository** — Use `gh repo create` with name, description, and visibility. If the repo already exists, offer to re-scaffold it rather than failing.
3. **Clone the repository** — Clone to the current directory. Move into it automatically.
4. **Create every file with full contents** — Not just folders. Every file must be written with its complete, production-ready content embedded in the script as a here-string. No placeholder files, no TODOs.
5. **Copy the setup script into the repo** — Save itself to `setup/create-repo.ps1` for documentation purposes.
6. **Initial commit and push** — Stage all files, commit with a detailed multi-line commit message listing every file created, and push to `main`.
7. **Open the repo in the browser** — Use `gh repo view --web` to open the live repo automatically.

---

## Script Architecture Requirements

### Parameters (configurable at top of script)

```powershell
$RepoName   = "jtbd-feedback-loop"
$RepoDesc   = "JTBD Feedback Loop Architect — Invoca Applied AI Analyst POC. Insight extraction, confidence scoring, and intelligent stakeholder routing from call transcripts."
$Visibility = "public"
```

### Helper Functions

Define these as named functions at the top — not inline Write-Host calls scattered throughout:

```powershell
Write-Banner  # Prints a full-width ═══ banner with color parameter
Write-Step    # [Step] Message format in Yellow
Write-OK      # ✅ Message in Green
Write-Fail    # ❌ Message in Red
Write-Warn    # ⚠️  Message in DarkYellow
Write-Info    # ℹ️  Message in Gray
New-RepoFile  # Creates file at relative path, creates parent dirs, writes UTF-8 content
```

`New-RepoFile` must:
- Accept `[string]$RelPath` and `[string]$Content`
- Resolve the full path using `Join-Path (Get-Location) $RelPath`
- Create parent directories if they don't exist
- Write using `[System.IO.File]::WriteAllText()` with UTF-8 encoding
- Print `ℹ️  Created: {RelPath}` for each file

### Step Banners

Every major step gets a full-width `═══` banner with step number and description in Yellow:
```
══════════════════════════════════════════════════════════════════════
  STEP 2 — CREATING GITHUB REPOSITORY
══════════════════════════════════════════════════════════════════════
```

### Error Handling

- Every `$LASTEXITCODE` check after git/gh commands
- Graceful exits with `exit 1` on critical failures
- `Write-Fail` + exact instructions for every failure path
- Never use bare `try/catch` without logging

---

## Files to Create (with Full Contents Embedded)

All content is embedded as PowerShell here-strings. No file reads from disk. No downloads.

### Repository Root

**`.gitignore`** — Standard Python `.gitignore` covering:
- `__pycache__/`, `*.pyc`, `*.pyo`
- Virtual environments: `venv/`, `.venv/`, `env/`
- `.env` files (with comment: NEVER commit API keys)
- `.vscode/`, `.idea/`
- `.DS_Store`, `Thumbs.db`
- `*.log`, `logs/`
- `test_outputs/`

---

### `poc/` Directory — The Working Pipeline

**`poc/requirements.txt`**
```
# JTBD Feedback Loop — Python Dependencies
# Install with: pip install -r requirements.txt

anthropic>=0.25.0
```

**`poc/sample_transcript.txt`**  
A realistic 47-minute enterprise QBR transcript for **Acme Financial Services** with CSM Jordan Rivera. The transcript must contain all of these extractable signals (used to validate the pipeline and populate the dashboard):

- Bug Report (CRITICAL): Call attribution data inconsistent for 6 weeks. Support ticket open 41 days. Paid search team has lost confidence in attribution numbers.
  - Verbatim: *"We've flagged it twice to support and the ticket is still open. It's not a minor thing — we're making media spend decisions based on this data."*
- Feature Request (MEDIUM): Unified omnichannel intelligence — intent scoring and attribution across calls, SMS, and chat.
  - Verbatim: *"It would be really valuable if there was some kind of unified view..."*
- Competitor Mention (HIGH): Marchex demo last month, pitched "omnichannel conversation intelligence." Customer says they're being asked to evaluate alternatives.
  - Verbatim: *"We had a demo with Marchex last month...We're not going anywhere, but I want to be transparent that we're being asked to evaluate alternatives."*
- Pricing Friction (HIGH): 18% renewal increase vs 15% budget cut. Cannot get through finance.
  - Verbatim: *"The price increase is 18%...I'm going to have a hard time getting this through finance at that number."*
- Positive Signal (LOW): 23% improvement in qualified lead rate attributed to Invoca call scoring.
  - Verbatim: *"Our inside sales team actually credits Invoca with a 23% improvement in qualified lead rate this quarter, which is huge."*
- Churn Signal (CRITICAL): If bug and pricing not resolved before June renewal, board involvement implied.
  - Verbatim: *"The bug needs to get fixed and the pricing conversation needs to happen before June. Otherwise honestly I don't know what the board is going to say."*

Transcript header block must include:
```
TRANSCRIPT ID: TXN-2025-0312-ACM
ACCOUNT: Acme Financial Services
CSM: Jordan Rivera
CALL DATE: March 12, 2025
CALL TYPE: Quarterly Business Review
DURATION: 47 minutes
ARR: $84,000
RENEWAL DATE: June 30, 2025
```

---

**`poc/schema.py`** — Typed data structure definitions  

Module docstring must explain:
- The schema is the contract between extraction and routing
- Why typed dataclasses over raw dicts (explicit validation, self-documenting)

Must define:

*Enums (hard enums, not open strings — explain why in docstrings):*
- `InsightType`: competitor_mention, feature_request, bug_report, pricing_friction, churn_signal, positive_signal, general_feedback
- `SentimentLabel`: positive, neutral, negative, critical
- `RoutingDestination`: Product Management, Engineering, Sales Leadership, Customer Success Leadership, Human Review Queue
- `UrgencyLevel`: low, medium, high, critical

*Dataclasses:*
- `ExtractedInsight` — all fields from the JSON extraction schema, including optional typed fields: `competitor_named`, `feature_requested`, `bug_description`, `suggested_action`
- `CallMetadata` — csm_name, account_name, account_arr, renewal_date, call_date, call_duration, transcript_id. Include docstring: "Metadata is separate from insights — CSM attribution travels with every alert and is never erased by automation."
- `ExtractionResult` — wraps metadata + insights list + counters
- `RoutedAlert` — wraps ExtractedInsight + CallMetadata + alert_id + sla. Include docstring: "RoutedAlert wraps both — recipient never needs to look up context. Everything needed to act is in the alert itself."

*Routing Rules Table (data-driven, not if/elif):*
```python
ROUTING_RULES = {
    InsightType.COMPETITOR_MENTION:  {"primary": Sales Leadership, "secondary": Product Management, "sla": "48 hours"},
    InsightType.FEATURE_REQUEST:     {"primary": Product Management, "secondary": None, "sla": "1 week"},
    InsightType.BUG_REPORT:          {"primary": Engineering, "secondary": Product Management, "sla": "24 hours"},
    InsightType.PRICING_FRICTION:    {"primary": Sales Leadership, "secondary": Product Management, "sla": "48 hours"},
    InsightType.CHURN_SIGNAL:        {"primary": Customer Success, "secondary": Sales Leadership, "sla": "24 hours"},
    InsightType.POSITIVE_SIGNAL:     {"primary": Product Management, "secondary": None, "sla": "1 week"},
    InsightType.GENERAL_FEEDBACK:    {"primary": Product Management, "secondary": None, "sla": "1 week"},
}

CRITICAL_SLA         = "4 hours"
CONFIDENCE_THRESHOLD = 0.75
```

---

**`poc/prompts.py`** — Prompt engineering strategy  

Module docstring must explain the three-layer architecture and the philosophy: *"Prompts are code. They are versioned, documented, and testable."*

Must contain:

**`SYSTEM_PROMPT`** — Full system prompt string:
- Persona: "precision insight extraction engine for a B2B SaaS company. You think like a senior CSM who has been on thousands of enterprise software calls."
- 7 core rules (numbered): extract only what's explicit, score uncertain signals lower, verbatim quote required, sentiment reflects the customer not the CSM, urgency signals defined (cancel / considering alternatives / still not fixed = HIGH or CRITICAL), JSON only output, empty array if no insights
- Complete JSON output contract with all fields typed and documented
- Confidence score calibration table: 0.90–1.00 / 0.75–0.89 / 0.60–0.74 / 0.00–0.59 with routing implications

**`build_extraction_prompt(transcript, csm_name, account_name, call_date, additional_context="")`**  
Function docstring explaining context injection over generic extraction and why (account name lets model distinguish competitive mentions from stack references). Builds prompt with: call context block, optional additional_context block, 7 extraction targets listed explicitly, transcript with `---` delimiters, final instruction "Return valid JSON only."

**`build_fallback_prompt(transcript, failed_output)`**  
Used when primary extraction fails. Shows the failed output (first 500 chars). Uses a simplified minimal schema. Explains design decision in docstring: "Two-stage fallback over hard failure — a single JSON parsing failure should not kill the pipeline."

**`PROMPT_VERSION = "1.0.0"`** and `PROMPT_CHANGELOG` dict.

---

**`poc/error_handler.py`** — Error handling and validation  

Module docstring lists all 5 failure modes with named handlers. Includes design principle: *"Every failure mode has a named handler, not a generic try/except. Being able to say exactly what happens when X fails is the difference between a candidate who built it and one who demoed it."*

Must define:

*Custom exceptions:*
- `ExtractionValidationError` — raised when extracted JSON fails schema validation
- `ConfidenceBelowThresholdError` — raised when all insights below threshold

*Functions:*

**`validate_insight_dict(raw: dict, index: int) -> ExtractedInsight`**
- Checks all required fields present
- Validates each enum field with explicit error message showing valid values
- Validates confidence_score is float 0.0–1.0
- Looks up routing target from ROUTING_RULES
- Overrides routing to HUMAN_REVIEW if score below CONFIDENCE_THRESHOLD
- Logs the override with confidence score + threshold

**`parse_and_validate(raw_response: str)`**
- Strips markdown code fences (```json ... ```) before parsing
- Parses JSON
- Checks top-level `insights` array exists
- Calls `validate_insight_dict` for each insight
- Returns `(validated_insights, processing_note)`

**`handle_json_parse_failure(raw_response, attempt)`** — logs warning with first 200 chars  
**`handle_validation_failure(error, attempt)`** — logs warning with error detail  
**`handle_empty_extraction(metadata)`** — logs info, returns clean ExtractionResult  
**`handle_api_error(error, transcript_id)`** — logs error with type and message  
**`build_extraction_result(metadata, insights, processing_note)`** — calculates high_confidence and routed_to_review counters, returns ExtractionResult

---

**`poc/router.py`** — Stakeholder routing engine  

Module docstring explains: routing is data-driven, not conditional branching. When routing rules change, update ROUTING_RULES in schema.py — not a chain of if/elif blocks.

Must define:

**`route_insight(insight, metadata) -> RoutedAlert`**
- CRITICAL urgency → collapses SLA to CRITICAL_SLA (4 hours), overrides rule SLA
- All others → looks up SLA from ROUTING_RULES
- Generates alert_id: `JTBD-{YYYYMMDD}-{UUID[:8].upper()}`
- Logs: `[{alert_id}] Routed {type} → {destination} | Confidence: {score:.2f} | SLA: {sla}`

**`route_all(result) -> list`**
- Routes all insights from ExtractionResult
- Sorts by urgency (CRITICAL=0, HIGH=1, MEDIUM=2, LOW=3)
- Returns sorted list

**`format_alert_terminal(alert) -> str`**  
Full terminal display block with `═` borders. Must include:
```
═══════════════════════════════════════════════════════════════════
  ALERT ID:    JTBD-YYYYMMDD-XXXXXXXX
  DESTINATION: 🔧 Engineering
  URGENCY:     🔴 CRITICAL
  TYPE:        BUG REPORT
  SLA:         Respond within 4 hours
  STATUS:      ⚡ ACTION REQUIRED
─────────────────────────────────────────────────────────────────
  ACCOUNT:     Acme Financial Services
  CSM:         Jordan Rivera
  CALL DATE:   March 12, 2025
─────────────────────────────────────────────────────────────────
  SUMMARY:
  {summary text}
─────────────────────────────────────────────────────────────────
  VERBATIM QUOTE:
  "{verbatim_quote}"
  BUG:         {bug_description if present}
─────────────────────────────────────────────────────────────────
  SUGGESTED ACTION:
  {suggested_action}
  CONFIDENCE:  97%
═══════════════════════════════════════════════════════════════════
```

**`format_csm_confirmation(alert) -> str`**  
The closed-loop confirmation sent back to the CSM. Include docstring: *"The closed-loop confirmation is a first-class output, not an afterthought. If CSMs don't know their input landed, they stop entering it. The confirmation is the adoption mechanism."*

Format:
```
✅ INSIGHT CONFIRMED — JTBD-YYYYMMDD-XXXXXXXX
   Your {insight_type} from {account_name} has been routed to {destination}.
   Response SLA: {sla}
   Confidence: {score:.0%}
```

**`format_alerts_as_json(alerts) -> str`**  
Serializes all alerts to pretty-printed JSON for downstream integration.

**`print_routing_summary(alerts)`**  
Groups alerts by destination, prints summary table. Shows human review queue warning if any insights routed there with threshold displayed.

---

**`poc/main.py`** — Pipeline orchestrator  

Module docstring shows full CLI usage:
```
python main.py                          # sample transcript, terminal output
python main.py --mock                   # demo mode — no API key needed
python main.py --mock --output json     # JSON output
python main.py --transcript my_call.txt # custom transcript
```

**`MOCK_API_RESPONSE`** — complete pre-loaded JSON string containing all 6 insights from the sample transcript at exact confidence scores: bug_report (0.97), feature_request (0.91), competitor_mention (0.96), pricing_friction (0.98), positive_signal (0.99), churn_signal (0.93). All verbatim quotes exact. This enables `--mock` mode with zero API calls.

**`load_transcript(path)`** — reads transcript file, parses header block (key: value lines before first `---`), returns `(transcript_text, CallMetadata)`

**`extract_insights(transcript, metadata, client, mock=False)`**  
Two-stage extraction with fallback:
1. If mock=True, use MOCK_API_RESPONSE directly
2. Otherwise call Anthropic API with `claude-sonnet-4-6`, max_tokens=4096, SYSTEM_PROMPT + extraction prompt
3. Log API call with model name and prompt version
4. Log token usage on success
5. Attempt `parse_and_validate()`
6. On JSONDecodeError → call `handle_json_parse_failure()`, attempt fallback
7. On ExtractionValidationError → call `handle_validation_failure()`, attempt fallback
8. Fallback uses `build_fallback_prompt()`, retries with max_tokens=2048

**`run_pipeline(transcript_path, output_format, mock)`**  
Full pipeline orchestration. Terminal output includes:
- Opening banner: "JTBD FEEDBACK LOOP — INSIGHT EXTRACTION ENGINE / Invoca Applied AI Analyst POC"
- Account, CSM, date, transcript ID
- Mock mode indicator
- "🔍 Extracting insights from transcript..."
- Extraction result summary: total insights, auto-routing count, human review count
- Processing note if present
- "🚦 Routing insights to stakeholders..."
- Either full terminal alerts OR JSON depending on output_format
- CSM closed-loop confirmations section
- "Pipeline complete."

**`main()`**  
argparse CLI:
- `--transcript` (default: `sample_transcript.txt`)
- `--output` choices: terminal | json (default: terminal)
- `--mock` flag

Transcript path resolution: if no path separator in the argument, resolve relative to `__file__` directory (not CWD) — this ensures `python main.py --mock` works from any working directory.

---

**`poc/README.md`** — Technical walkthrough (Lens 2)

Must explain:
- Why raw Python over Zapier (low technical ceiling) and n8n (Phase 2 deployment layer, not a POC signal)
- Running commands (mock, live, JSON, custom transcript) in a bash code block
- File responsibilities table (all 5 Python files with one-line descriptions)
- Prompt engineering strategy summary
- Error handling summary: 2-stage validation, named handlers

---

### `docs/` Directory — Four Presentation Lenses

**`docs/jtbd-map.md`** — Lens 1: Process Design & JTBD Framework  

The problem statement as a blockquote. Then:

*Three JTBD Role Maps* (table format: Dimension | Job):
- The CSM: Functional (make customers successful) / Emotional (feel trusted, strategic) / Social (be seen as the expert)
- The Product Manager: Functional (prioritize roadmap on real signal) / Emotional (confident signal is real) / Social (be seen as customer-driven)
- The CS/Sales Leader: Functional (protect ARR, catch churn early) / Emotional (feel in control, not surprised) / Social (be seen as proactive)

*Current State Friction* for each role (Time Tax / Judgment Erasure / Signal Loss / Trust Deficit patterns)

*Current State vs. Future State* as ASCII workflow diagrams:

Current:
```
CSM finishes 47-minute QBR → Has 4 more calls → Writes note at 6pm: "Good call. Follow up on pricing." → Insight dies
```

Future:
```
CSM finishes 47-minute QBR → Transcript processed automatically → 6 structured insights extracted, confidence-scored, routed → [4 routing lanes with SLAs] → CSM receives confirmation → Loop closed
```

**`docs/technical-architecture.md`** — Lens 2: Architecture decisions  

Architecture Decision Record table (7 rows): Decision | Choice | Reason  
Covers: LLM Provider, Output Format, Error Strategy, Routing Logic, Confidence Gate, Attribution, Prompt Versioning

Data flow as linear diagram: `transcript.txt → load_transcript() → ... → format_alert_terminal()`

**`docs/stakeholder-mgmt.md`** — Lens 3: Human adoption strategy  

Core principle blockquote. Adoption resistance table (Role | Resistance Pattern | Counter-Strategy) covering CSM fear of replacement, CSM friction, PM trust deficit, Engineering alert fatigue, Leadership black box concern.

4-phase rollout sequence: Phase 0 (co-design), Phase 1 Pilot (3 CSMs, volunteer, human review all alerts), Phase 2 Validation (SLA compliance measurement), Phase 3 Scale (evidence-based, not mandate).

Trust mechanics: 5 specific features in the current build that address trust.

**`docs/future-state.md`** — Lens 4: The 18-month roadmap  

3-phase roadmap: MVP (Now) / Integration (6 months) / Multi-Agent (12–18 months)

What changes the economics: model cost curve note (GPT-4 class inference ~95% cost reduction in 18 months) shifts from "process flagged calls" to "process every call."

Multi-agent Phase 3 ASCII architecture diagram.

Governance section: audit trail + threshold governance as architectural decisions made now.

---

### Supporting Files

**`skill/jtbd-feedback-loop.skill`**  
YAML-format installable Claude skill definition:
- name, version, description
- `triggers` list (5–6 natural language phrases that activate the skill)
- Core Framework section: 4 steps (Map the Humans, Audit Current State Friction, Design Future State, Build the Adoption Layer)
- Output Format: always produce 4 artifacts (JTBD Role Map, Current/Future State comparison, Friction → Design Decision table, Adoption resistance patterns)

**`assets/README.md`**  
Placeholder explaining the directory and listing 3 planned diagram files with descriptions.

---

## Commit Message Requirements

The commit message must be multi-line and list every file created, organized by directory. Format:

```
Initial commit: JTBD Feedback Loop Architect — Full POC Scaffold

Files created by setup-jtbd-repo.ps1 v2.0:

POC (working pipeline):
  - main.py            Pipeline orchestrator + CLI + mock mode
  - prompts.py         3-layer prompt engineering strategy (versioned)
  - schema.py          Typed data contracts, enums, routing rules table
  - error_handler.py   2-stage validation + named failure handlers
  - router.py          Data-driven routing engine + alert formatters
  - sample_transcript.txt  Acme Financial QBR demo transcript (47min)
  - requirements.txt   Single dependency: anthropic

Docs (all 4 presentation lenses):
  ...

Supporting:
  ...

Invoca Applied AI Analyst Final Interview | Option 3: Feedback Loop Architect
Author: Erwin M. McDonald
```

---

## Completion Block

After pushing and opening the browser, print a final `SETUP COMPLETE` banner (green) followed by:

```
  Your JTBD Feedback Loop repo is live on GitHub.

  NEXT STEPS:

  1. Navigate into poc/ and run the POC:
     cd jtbd-feedback-loop\poc
     pip install anthropic
     python main.py --mock

  ⚠️  IMPORTANT: Always run from inside poc\
     main.py needs sample_transcript.txt in the same folder.

  2. Test with a live API key:
     $env:ANTHROPIC_API_KEY = 'your_key_here'
     python main.py

  3. Copy the master README from the output of this setup and
     paste it into your README.md on GitHub to activate the
     full badge display and architecture diagrams.
```

---

## Script Header (Comment Block at Top)

The script must open with a full comment block containing:

```powershell
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
#     [exact prompts walkthrough]
#
#  ▶️  HOW TO RUN:
#     [3-step instructions — open PowerShell, paste, press Enter]
#
#  ⚠️  Set-ExecutionPolicy note for first-time users
# =============================================================================
```

---

## Technical Constraints

- Single `.ps1` file — no external dependencies, no imports, no network fetches for content
- All Python file contents embedded as here-strings using `@' ... '@` (single-quoted, for files containing `$` variables) or `@" ... "@` (double-quoted, for files with no PowerShell variable expansion needed)
- Use `@' ... '@` (single-quoted) for all Python files — they contain `$variable` syntax that must NOT be expanded by PowerShell
- Use `@" ... "@` (double-quoted) only for files that intentionally need PowerShell string interpolation (e.g., the `.gitignore` where `$84,000` would be an issue — escape with backtick or use single-quoted here-string)
- File writes use `[System.IO.File]::WriteAllText()` with explicit UTF-8 encoding — not `Set-Content` (handles special characters reliably)
- Script works on Windows PowerShell 5.1+ and PowerShell 7+
- No `Invoke-WebRequest`, no `Invoke-RestMethod`, no `curl` — everything is self-contained
- `gh` CLI used for repo creation, auth check, and browser open — not raw API calls

---

## Known Edge Cases to Handle

| Edge Case | Required Behavior |
|-----------|-------------------|
| Repo already exists on GitHub | Prompt user: re-scaffold? (y/n) — don't hard fail |
| Git not installed | Print exact URL, explain "close and reopen PowerShell", exit cleanly |
| GitHub CLI not installed | Print exact URL + `gh auth login` instruction, exit cleanly |
| Not authenticated with GitHub CLI | Print step-by-step `gh auth login` walkthrough (GitHub.com → HTTPS → browser), exit cleanly |
| `git push` fails | `Write-Warn` (not fail), print manual recovery command |
| Can't determine GitHub username | `Write-Warn`, tell user to check github.com manually |
| `Copy-Item` of script file fails | `Write-Warn` (non-critical), continue pipeline |
| `Set-ExecutionPolicy` blocked | Instruction in header comment block — not handled at runtime |

---

*Generated for the Invoca Applied AI Automation Analyst interview · Option 3: The Feedback Loop Architect*  
*Script v2.0 — Full Scaffold: creates every file, not just folder structure*
