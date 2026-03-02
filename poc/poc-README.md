# 🔧 The Build — Technical Lens (Lens 2)
## JTBD Feedback Loop | POC Walkthrough

> *"Show, don't just tell."* — Invoca Exercise Brief

---

## What This POC Does

Takes a raw customer call transcript → extracts structured business insights → scores each insight with a confidence value → routes to the correct stakeholder with urgency classification, SLA, and closed-loop CSM confirmation.

**Two delivery modes — same pipeline logic, two entry points:**

| Mode | Entry Point | Data | API Key? | When to Use |
|------|-------------|------|----------|-------------|
| **React UI (static)** | `dashboard/jtbd-dashboard.jsx` | Hardcoded mock (Acme Financial) | ❌ None needed | Demo presentation — shows the full system at scale |
| **React UI (live)** | `dashboard/jtbd-feedback-loop.jsx` | Calls Claude API in real time | ❌ None needed | Proof of intelligence — paste any transcript and watch it run |
| **Python CLI** | `poc/main.py` | Live API or `--mock` | ✅ Required for live · ❌ Not needed for `--mock` | Production-path code — inspectable, testable, deployable |

See [`dashboard/README.md`](../dashboard/README.md) for full React UI usage and demo sequence.

---

## Quick Start — React UI

Both React artifacts run inside Claude.ai — **no API key, no build step, no npm install.**

1. Open Claude.ai
2. Upload or paste the `.jsx` file into the chat
3. Click the rendered artifact to open full screen

The live extraction UI (`jtbd-feedback-loop.jsx`) calls the Anthropic API through Claude.ai's built-in proxy. You never touch a key.

---

## Quick Start — Python CLI

```bash
# 1. Navigate into poc/ — required, main.py reads sample_transcript.txt from CWD
cd poc

# 2. Install the one dependency
pip install anthropic

# 3. Run in mock mode — no API key needed
python main.py --mock

# 4. JSON output mode (for integration testing)
python main.py --mock --output json

# 5. Run with live API
export ANTHROPIC_API_KEY=your_key_here        # Mac/Linux
$env:ANTHROPIC_API_KEY = "your_key_here"     # Windows PowerShell
python main.py

# 6. Run against your own transcript
python main.py --transcript path/to/your/transcript.txt
```

---

## Pipeline Architecture

```
TRANSCRIPT IN → INGEST → EXTRACT → SCORE → GATE → ROUTE → ALERT → CONFIRM → LOOP CLOSED
```

### Full Flow

```
sample_transcript.txt  (or React UI paste)
        │
        ▼
┌─────────────────────┐
│   INGEST            │  Load transcript + parse CallMetadata
│                     │  (CSM name, account, ARR, renewal date, transcript ID)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   EXTRACT           │  3-layer prompt engineering strategy
│   prompts.py        │  Layer 1: System persona + JSON output contract
│                     │  Layer 2: Context-injected extraction (7 insight types)
│                     │  Layer 3: Fallback prompt on parse/validation failure
└──────────┬──────────┘
           │
           ▼  Anthropic API — claude-sonnet-4-6 · max_tokens: 4096
           │
┌─────────────────────┐
│   SCORE + VALIDATE  │  Parse JSON → validate schema → confidence range check
│   error_handler.py  │  2-stage fallback. Pipeline never hard-crashes.
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   GATE              │  Confidence ≥ 0.75 → auto-route
│   schema.py         │  Confidence < 0.75 → Human Review Queue
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   ROUTE             │  ROUTING_RULES table lookup by insight type + urgency
│   router.py         │  Assigns destination + SLA
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   ALERT             │  Structured alert: account context + verbatim quote
│   router.py         │  + suggested action + SLA + alert ID
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   CONFIRM           │  CSM notified that insight landed
│                     │  Closed-loop adoption mechanism — the reason CSMs trust it
└──────────┬──────────┘
           │
           ▼
   Terminal output / JSON payload / React UI cards
```

---

## Repository Files

| File | Location | Purpose |
|------|----------|---------|
| `main.py` | `poc/` | Pipeline orchestrator — entry point |
| `prompts.py` | `poc/` | All prompts versioned and documented |
| `schema.py` | `poc/` | Data structures, enums, routing rules, confidence threshold |
| `error_handler.py` | `poc/` | Validation, 2-stage fallback, named failure handlers |
| `router.py` | `poc/` | Routing engine + alert formatters |
| `sample_transcript.txt` | `poc/` | Demo transcript — Acme Financial Services QBR (47 min) |
| `requirements.txt` | `poc/` | `anthropic>=0.40.0` |
| `jtbd-dashboard.jsx` | `dashboard/` | Static demo dashboard — hardcoded mock, full 4-lens story |
| `jtbd-feedback-loop.jsx` | `dashboard/` | Live extraction UI — runs in Claude.ai, no API key needed |

---

## The 7 Insight Types

| Type | Icon | Routes To | SLA | SLA (CRITICAL) |
|------|------|-----------|-----|----------------|
| `BUG_REPORT` | 🐛 | Engineering | 24 hours | 4 hours |
| `COMPETITOR_MENTION` | 🏢 | Sales Leadership | 48 hours | 48 hours |
| `FEATURE_REQUEST` | 🔧 | Product Management | 1 week | 1 week |
| `PRICING_FRICTION` | 💰 | Sales Leadership + PM | 48 hours | 48 hours |
| `CHURN_SIGNAL` | 🚨 | CS Leadership | 4 hours | 4 hours always |
| `POSITIVE_SIGNAL` | ✅ | Product Management | 1 week | 1 week |
| `GENERAL_FEEDBACK` | 💬 | Product Management | 1 week | 1 week |

Confidence < 0.75 on any type → **Human Review Queue** regardless of insight type or urgency.

---

## Prompt Engineering Strategy

**Three-layer architecture — all versioned in `prompts.py`:**

**Layer 1 — System Prompt** sets the model's working identity as a senior CSM analyst who has been on 10,000 enterprise calls and knows the difference between a customer venting and a genuine churn signal. Constrains output to JSON only. Defines confidence calibration explicitly so the model scores conservatively rather than confidently.

**Layer 2 — Extraction Prompt** injects full call context (CSM name, account name, call date) before extraction begins. This is a deliberate design choice: knowing the account name and CSM lets the model distinguish strategic competitive intelligence from a casual mention, and ensures source attribution travels with every extracted insight.

**Layer 3 — Fallback Prompt** activates only when primary extraction fails JSON validation. Simplifies the schema to a required-fields subset and retries. The model is told explicitly what failed — not asked to try again generically. Production principle: a single failure should never kill the pipeline.

**Confidence calibration scale:**

| Score | Meaning | Action |
|-------|---------|--------|
| 0.95–1.00 | Explicit and unambiguous in transcript | Auto-route |
| 0.85–0.94 | Clear statement, minor inference | Auto-route |
| 0.75–0.84 | Reasonably certain, some interpretation | Auto-route |
| 0.60–0.74 | Uncertain — customer implied but didn't state | Human Review Queue |
| 0.00–0.59 | Low signal — could be misread | Human Review Queue |

Rule: *"When in doubt, score lower."* The PM would rather review a 0.68 than act on a misrouted 0.80.

---

## Error Handling Strategy

Every failure mode has a named handler — not a generic `try/except` block:

| Failure Mode | Handler | Behavior |
|---|---|---|
| JSON parse failure | `handle_json_parse_failure()` | Sanitize + log + trigger fallback |
| Schema validation error | `handle_validation_failure()` | Log specific field error + trigger fallback |
| Confidence below threshold | Routing gate in `validate_insight_dict()` | Override destination → Human Review Queue |
| Empty extraction | `handle_empty_extraction()` | Return clean empty result, no crash |
| API error | `handle_api_error()` | Log with transcript ID, re-raise with context |
| Both stages fail | Graceful degradation | Return empty `ExtractionResult` with error note |
| Response truncation (React UI) | `max_tokens: 2000` | Sufficient for 6–8 full insight objects |

---

## Data Structure Decisions

**Why enums over strings?**
`InsightType.BUG_REPORT` not `"bug_report"`. Prevents routing ambiguity when field names drift across model runs, and makes validation explicit — an unknown string fails loudly at parse time rather than silently routing to the wrong team.

**Why confidence scores on every insight?**
The PM told us directly: they need to know how sure the system is. A 0.68 routed to human review is more useful than a 0.90 that routes incorrectly. The threshold (0.75) is a named constant in `schema.py` — one line to change across the entire pipeline.

**Why separate `CallMetadata` from `ExtractedInsight`?**
Source attribution travels with every routed alert. The CSM's name and account appear in every alert that reaches Engineering, Product, and Sales. The CSM is more visible in the system, not erased by it. This is the closed-loop adoption mechanism — CSMs get confirmation that their insight landed, which is why they keep participating.

**Why a routing rules table over if/elif?**
When Invoca adds a new stakeholder team or changes an SLA, you update `ROUTING_RULES` in `schema.py` — one dictionary entry, not a chain of conditionals spread across the codebase.

**Why raw Python over a framework?**
Every architecture decision is visible and inspectable. There is no abstraction layer between the prompt engineering strategy and the output. Anyone can read `main.py` top to bottom and understand exactly what the system does and why.

---

## Sample Terminal Output

```
═══════════════════════════════════════════════════════════════════════
  JTBD FEEDBACK LOOP — INSIGHT EXTRACTION ENGINE
  Invoca Applied AI Analyst POC | Erwin M. McDonald
═══════════════════════════════════════════════════════════════════════

  📞 Processing: Acme Financial Services
  👤 CSM:        Jordan Rivera
  📅 Date:       March 12, 2025
  🆔 ID:         TXN-2025-0312-ACM

  ✅ Extracted 6 insights
     Auto-routing:    6 (confidence ≥ 75%)
     Human review:    0 (confidence < 75%)

═══════════════════════════════════════════════════════════════════════
  ROUTING SUMMARY
═══════════════════════════════════════════════════════════════════════

  → Customer Success Leadership (1 insight)
     ⚡ [CRITICAL ] Churn Signal           (93% confidence)

  → Engineering (1 insight)
     ⚡ [CRITICAL ] Bug Report             (97% confidence)

  → Sales Leadership (2 insights)
     ⚡ [HIGH     ] Competitor Mention     (96% confidence)
     ⚡ [HIGH     ] Pricing Friction       (98% confidence)

  → Product Management (2 insights)
       [MEDIUM   ] Feature Request        (91% confidence)
       [LOW      ] Positive Signal        (99% confidence)

═══════════════════════════════════════════════════════════════════════

  ALERT ID:    JTBD-20250312-C1306232
  DESTINATION: 🔧 Engineering
  URGENCY:     🔴 CRITICAL — SLA: 4 hours
  TYPE:        BUG REPORT
  ACCOUNT:     Acme Financial Services  |  CSM: Jordan Rivera

  SUMMARY:
  Call attribution data has been inconsistent for 6 weeks.
  Support ticket open 41 days. Paid search team has stopped
  trusting numbers — making media spend decisions on bad data.

  VERBATIM: "We're making media spend decisions based on this data."

  SUGGESTED ACTION:
  Escalate to Engineering P1. Assign owner and provide ETA by
  end of week. CSM to confirm escalation to customer within 24hr.

  CONFIDENCE: 97%

═══════════════════════════════════════════════════════════════════════

✅ INSIGHT CONFIRMED — JTBD-20250312-C1306232
   Your bug report from Acme Financial routed to Engineering.
   Response SLA: 4 hours  |  Confidence: 97%
```

---

## Demo Sequence

```
1. dashboard/jtbd-dashboard.jsx      →  "Here's what the system produces"
         ↓
2. dashboard/jtbd-feedback-loop.jsx  →  "Here's the engine doing it live"
         ↓
3. poc/main.py --mock                →  "Here's the production-path code"
```

See [`dashboard/README.md`](../dashboard/README.md) for full React UI demo guidance.

---

## Framework Credits

| Framework | Author | Role |
|-----------|--------|------|
| **JTBD Feedback Loop v1.0** | Erwin M. McDonald | Core problem decomposition |
| **AI Adoption Architect v2** | Erwin M. McDonald | Lens 3 stakeholder adoption strategy |
| **Anthropic Claude API** | Anthropic | claude-sonnet-4-6 extraction engine |

---

*Built for the Invoca Applied AI Analyst final interview presentation.*
