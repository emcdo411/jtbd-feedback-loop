# 🔧 The Build — Technical Lens (Lens 2)
## JTBD Feedback Loop | POC Walkthrough

> *"Show, don't just tell."* — Invoca Exercise Brief

---

## What This POC Does

Takes a raw customer call transcript → extracts structured business insights → routes each insight to the correct stakeholder with confidence scoring, urgency classification, and closed-loop CSM confirmation.

**One command. Live output. No dashboard required.**

---

## Quick Start

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

## Architecture

```
sample_transcript.txt
        │
        ▼
┌───────────────────┐
│   main.py         │  ← Orchestrator. Loads transcript, calls API,
│   (pipeline)      │    coordinates all modules.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│   prompts.py      │  ← Prompt engineering layer.
│   (extraction)    │    System prompt + extraction prompt + fallback prompt.
└────────┬──────────┘
         │
         ▼ (Anthropic API call)
         │
┌───────────────────┐
│   error_handler.py│  ← Parse JSON → validate schema → handle failures.
│   (validation)    │    Two-stage fallback. Never hard-crashes.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│   schema.py       │  ← Typed data contracts. Enums for all classifications.
│   (data layer)    │    Routing rules table. Confidence thresholds.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│   router.py       │  ← Routes each insight → stakeholder destination.
│   (routing)       │    Formats alerts. Generates CSM confirmations.
└────────┬──────────┘
         │
         ▼
  Terminal Output / JSON
```

---

## Files

| File | Purpose |
|------|---------|
| `main.py` | Pipeline orchestrator — entry point |
| `prompts.py` | All prompts versioned and documented |
| `schema.py` | Data structures, enums, routing rules |
| `error_handler.py` | Validation, fallback, failure handling |
| `router.py` | Routing engine + alert formatters |
| `sample_transcript.txt` | Realistic demo transcript (Acme Financial Services QBR) |
| `requirements.txt` | `anthropic>=0.40.0` |

---

## Prompt Engineering Strategy

**Three-layer prompt architecture:**

**Layer 1 — System Prompt** sets the model's persona as a senior CSM analyst who knows the difference between venting and churn signals. Constrains output to JSON only. Defines confidence score calibration explicitly.

**Layer 2 — Extraction Prompt** injects full call context (CSM name, account, date) before extraction. Context injection is a deliberate design choice — knowing the account name lets the model distinguish competitive intelligence from casual mentions.

**Layer 3 — Fallback Prompt** activates when primary extraction fails JSON validation. Simplifies the schema and retries. The model is told explicitly what failed — not asked to try generically.

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

## Sample Output (Mock Mode)

```
═════════════════════════════════════════════════════════════════
  JTBD FEEDBACK LOOP — INSIGHT EXTRACTION ENGINE
  Invoca Applied AI Analyst POC | Erwin M. McDonald
═════════════════════════════════════════════════════════════════

  📞 Processing: Acme Financial Services
  👤 CSM:        Jordan Rivera
  📅 Date:       March 12, 2025

  ✅ Extracted 6 insights
     Auto-routing:    6 (confidence ≥ 75%)
     Human review:    0 (confidence < 75%)

ROUTING SUMMARY
  → Customer Success Leadership  🔴 CRITICAL  Churn Signal      (93%)
  → Engineering                  🔴 CRITICAL  Bug Report        (97%)
  → Sales Leadership             🟠 HIGH      Competitor Mention (96%)
  → Sales Leadership             🟠 HIGH      Pricing Friction  (98%)
  → Product Management           🟡 MEDIUM    Feature Request   (91%)
  → Product Management           🟢 LOW       Positive Signal   (99%)
```

---

*JTBD Feedback Loop POC | Erwin M. McDonald | Invoca Applied AI Analyst Presentation*
