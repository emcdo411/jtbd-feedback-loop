# 🔧 The Build — Technical Lens (Lens 2)
## JTBD Feedback Loop | POC Walkthrough

> *"Show, don't just tell."* — Invoca Exercise Brief

---

## What This POC Does

Takes a raw customer call transcript → extracts structured business insights → routes each insight to the correct stakeholder with confidence scoring, urgency classification, and closed-loop CSM confirmation.

**Two delivery modes:**

| Mode | How to Run |
|------|-----------|
| **React UI** | Open `jtbd-feedback-loop.jsx` in Claude.ai — paste transcript, hit ▶ RUN |
| **Python CLI** | `python main.py` or `python main.py --mock` |

---

## Quick Start — CLI

```bash
# Install dependency
pip install anthropic

# Set your API key
export ANTHROPIC_API_KEY=your_key_here

# Run with sample transcript (live API)
python main.py

# Run in mock mode — no API key needed (demo safe)
python main.py --mock

# JSON output for integration testing
python main.py --mock --output json

# Run against your own transcript
python main.py --transcript path/to/your/transcript.txt
```

---

## Quick Start — React UI

The React UI (`jtbd-feedback-loop.jsx`) runs inside Claude.ai and calls the Anthropic API directly. No build step, no API key setup required.

**Features:**
- Paste any transcript or load the built-in Acme Financial demo
- Live pipeline status bar: INGEST → EXTRACT → SCORE → ROUTE → ALERT
- Insight cards sorted by urgency, each with confidence bar, verbatim quote, routing destination, and suggested action
- Stakeholder routing summary with ⚡ escalation flags for CRITICAL items
- Stats dashboard: total insights, auto-routed count, human review queue, avg confidence

---

## Pipeline Architecture

```
TRANSCRIPT IN → INGEST → EXTRACT → SCORE → ROUTE → ALERT → CONFIRM → LOOP CLOSED
```

### Full Flow

```
sample_transcript.txt (or UI paste)
        │
        ▼
┌───────────────────┐
│   INGEST          │  ← Load transcript + parse CallMetadata
│                   │    (CSM name, account, ARR, renewal date, call ID)
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│   EXTRACT         │  ← 3-layer prompt engineering strategy
│   prompts.py      │    Layer 1: System persona + JSON contract
│                   │    Layer 2: Context-injected extraction (7 insight types)
│                   │    Layer 3: Fallback on parse failure
└────────┬──────────┘
         │
         ▼ (Anthropic API — claude-sonnet-4-6)
         │
┌───────────────────┐
│   SCORE           │  ← Parse JSON → validate schema → confidence check
│   error_handler.py│    2-stage fallback. Never hard-crashes.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│   ROUTE           │  ← Routing rules table lookup by insight type + urgency
│   schema.py       │    Confidence ≥ 0.75 → auto-route
│   router.py       │    Confidence < 0.75 → Human Review Queue
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│   ALERT           │  ← Structured alert: account context + verbatim quote
│   router.py       │    + suggested action + SLA attached
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│   CONFIRM         │  ← CSM notified that insight landed
│                   │    Closed-loop adoption mechanism
└────────┬──────────┘
         │
         ▼
  React UI cards / Terminal output / JSON payload
```

---

## Repository Files

| File | Purpose |
|------|---------|
| `jtbd-feedback-loop.jsx` | React UI — paste transcript, run live extraction, view routed insights |
| `main.py` | Python CLI pipeline orchestrator — entry point |
| `prompts.py` | All prompts versioned and documented |
| `schema.py` | Data structures, enums, routing rules, confidence thresholds |
| `error_handler.py` | Validation, fallback, failure handling |
| `router.py` | Routing engine + alert formatters |
| `sample_transcript.txt` | Realistic demo transcript (Acme Financial Services QBR) |
| `requirements.txt` | `anthropic>=0.40.0` |

---

## The 7 Insight Types

| Type | Icon | Routes To | SLA |
|------|------|-----------|-----|
| `BUG_REPORT` | 🐛 | Engineering | 24hr / 4hr CRITICAL |
| `COMPETITOR_MENTION` | 🏢 | Sales Leadership | 48 hours |
| `FEATURE_REQUEST` | 🔧 | Product Management | 1 week |
| `PRICING_FRICTION` | 💰 | Sales + PM | 48 hours |
| `CHURN_SIGNAL` | 🚨 | CS Leadership | 4 hours always |
| `POSITIVE_SIGNAL` | ✅ | Product Management | 1 week |
| `GENERAL_FEEDBACK` | 💬 | Product Management | 1 week |

Confidence < 0.75 on any type → **Human Review Queue** regardless of insight type.

---

## Prompt Engineering Strategy

**Three-layer prompt architecture:**

**Layer 1 — System Prompt** sets the model's persona as a senior CSM analyst who knows the difference between venting and churn signals. Constrains output to JSON only. Defines confidence score calibration explicitly.

**Layer 2 — Extraction Prompt** injects full call context (CSM name, account, date) before extraction. Context injection is a deliberate design choice — knowing the account name lets the model distinguish competitive intelligence from casual mentions.

**Layer 3 — Fallback Prompt** activates when primary extraction fails JSON validation. Simplifies the schema and retries. The model is told explicitly what failed — not asked to try generically.

**Confidence calibration scale:**

| Score | Meaning | Action |
|-------|---------|--------|
| 0.95+ | Explicit and unambiguous | Auto-route |
| 0.85–0.94 | Clear but inferred | Auto-route |
| 0.75–0.84 | Reasonably certain | Auto-route |
| < 0.75 | Uncertain | Human Review Queue |

---

## Error Handling Strategy

| Failure Mode | Handler | Behavior |
|---|---|---|
| JSON parse failure | `handle_json_parse_failure()` | Log + trigger fallback |
| Schema validation error | `handle_validation_failure()` | Log specific field + trigger fallback |
| Confidence below threshold | Routing override | Auto-route to Human Review Queue |
| Empty extraction | `handle_empty_extraction()` | Clean result, no crash |
| API error | `handle_api_error()` | Log with full context, raise |
| Both stages fail | Graceful degradation | Return empty with error note |
| Response truncation (UI) | `max_tokens: 2000` | Sufficient for 6–8 full insight objects |

---

## Data Structure Decisions

**Why enums over strings?**
`InsightType.BUG_REPORT` not `"bug report"`. Prevents routing ambiguity when field names drift across model runs.

**Why confidence scores on every insight?**
The PM told us directly: they need to know how sure the system is. A 0.65 that routes to human review is better than a 0.90 that routes incorrectly. The threshold (0.75) is configurable in `schema.py`.

**Why separate `CallMetadata` from `ExtractedInsight`?**
Source attribution travels with every routed alert. The CSM's name appears in every alert that reaches Engineering, Product, and Sales. They are more visible, not erased.

**Why a routing rules table over if/elif?**
When Invoca adds a new team or changes an SLA, you update `ROUTING_RULES` in `schema.py` — one line. Not a chain of conditionals.

---

## Sample UI Output

```
═════════════════════════════════════════════════════════════════
  JTBD FEEDBACK LOOP — INSIGHT EXTRACTION ENGINE
  Invoca Applied AI Analyst POC | Erwin M. McDonald
═════════════════════════════════════════════════════════════════

  📞 Acme Financial Services   👤 Jordan Rivera   📅 March 12, 2025
  💵 $284,000 ARR              🔁 Renewal: June 30, 2025

  TOTAL INSIGHTS: 6   AUTO-ROUTED: 6   HUMAN REVIEW: 0   AVG CONFIDENCE: 96%

  STAKEHOLDER ROUTING SUMMARY
  ─────────────────────────────────────────────────────────────────
  ⚙️  Engineering              ⚡ CRITICAL   1 insight
  🎯  CS Leadership            ⚡ CRITICAL   1 insight
  📈  Sales Leadership                       2 insights
  🗺️  Product Management                     2 insights

  EXTRACTED INSIGHTS — SORTED BY URGENCY
  ─────────────────────────────────────────────────────────────────
  🐛 Bug Report               ● CRITICAL   Confidence: 97%
  Call attribution data has been inconsistent for 6 weeks.
  "We're making media spend decisions based on this data."
  → Engineering | Escalate to P1. Owner + ETA by end of week.

  🚨 Churn Signal             ● CRITICAL   Confidence: 93%
  ...
```

---

## Framework Credits

| Framework | Author | Role |
|-----------|--------|------|
| **JTBD Feedback Loop v1.0** | Erwin M. McDonald | Core problem decomposition |
| **AI Adoption Architect v2** | Erwin M. McDonald | Lens 3 stakeholder adoption strategy |
| **Anthropic Claude API** | Anthropic | claude-sonnet-4-6 extraction engine |

---

*Built for the Invoca Applied AI Analyst final interview presentation.*
