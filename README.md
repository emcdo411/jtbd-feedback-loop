<div align="center">

<!-- BANNER -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,50:16213e,100:0f3460&height=200&section=header&text=JTBD%20Feedback%20Loop%20Architect&fontSize=36&fontColor=00d4ff&animation=fadeIn&fontAlignY=38&desc=Invoca%20Applied%20AI%20Analyst%20%7C%20Option%203%20POC&descAlignY=58&descColor=a0aec0" width="100%"/>

<!-- BADGES ROW 1 — STACK -->
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Anthropic](https://img.shields.io/badge/Anthropic-Claude%20Sonnet-D97706?style=for-the-badge&logo=anthropic&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge&logo=opensourceinitiative&logoColor=white)
![Status](https://img.shields.io/badge/Status-POC%20Ready-6366F1?style=for-the-badge&logo=checkmarx&logoColor=white)

<!-- BADGES ROW 2 — META -->
![Framework](https://img.shields.io/badge/Framework-JTBD%20v1.0-C4226F?style=for-the-badge)
![Lenses](https://img.shields.io/badge/Lenses%20Covered-4%20of%204-00C49F?style=for-the-badge)
![Insights](https://img.shields.io/badge/Insight%20Types-7-FF6B6B?style=for-the-badge)
![Routing](https://img.shields.io/badge/Stakeholder%20Routing-Automated-4ECDC4?style=for-the-badge)

<!-- BADGES ROW 3 — QUALITY -->
![Confidence Threshold](https://img.shields.io/badge/Confidence%20Threshold-75%25-yellow?style=for-the-badge&logo=target&logoColor=white)
![Error Handling](https://img.shields.io/badge/Error%20Handling-2--Stage%20Fallback-orange?style=for-the-badge&logo=shield&logoColor=white)
![Prompt Version](https://img.shields.io/badge/Prompt%20Version-v1.0.0-blueviolet?style=for-the-badge&logo=openai&logoColor=white)
![Mock Mode](https://img.shields.io/badge/Demo%20Mode-No%20API%20Key%20Needed-success?style=for-the-badge&logo=play&logoColor=white)

<br/>

**Built by Erwin M. McDonald**
*Applied AI Analyst · Behavioral Intelligence Researcher · Framework Builder*

<br/>

> *"CSMs hear critical feedback about pricing and bugs daily, but manual entry is inconsistent,*
> *creating an 'insight black hole' for Product leadership."*
>
> — Invoca Applied AI Analyst Exercise Brief

</div>

---

## 📌 The Problem

The insight isn't missing. **It exists — on every call, every day.**

A CSM finishes a 47-minute QBR. The customer mentioned a competitor demo, a 41-day open bug, an 18% renewal price increase they can't get through finance, and — almost as an aside — that *the board will be asking questions before June*.

That CSM has 4 more calls today. The Salesforce note they write at 6pm will say:

> *"Good call. Follow up on pricing."*

The insight dies. Not because the CSM failed. **Because the system was never designed to catch it.**

---

## 🚀 The Solution

```
TRANSCRIPT IN → EXTRACT → SCORE → ROUTE → ALERT → CONFIRM → LOOP CLOSED
```

A Python pipeline powered by the Anthropic API that turns raw call transcripts into structured, confidence-scored, stakeholder-routed intelligence — automatically:

| Stage | What Happens |
|-------|-------------|
| **Ingest** | Load raw call transcript from file (native Invoca stream in Phase 2) |
| **Extract** | 3-layer prompt engineering strategy pulls 7 insight types |
| **Score** | Every insight gets a confidence score (0.0–1.0) |
| **Gate** | Below 0.75 → Human Review Queue, not auto-send |
| **Route** | Insight type + urgency → correct stakeholder with SLA |
| **Alert** | Structured alert: account context + verbatim quote + suggested action |
| **Confirm** | CSM notified that their insight landed — the adoption mechanism |

---

## ⚡ Quick Start

### Option A — React UI (No API Key, No Setup)

Both React artifacts run inside Claude.ai — **no API key, no build step, no npm install.**

| Artifact | What It Does | How to Run |
|----------|-------------|------------|
| [`dashboard/jtbd-dashboard.jsx`](dashboard/jtbd-dashboard.jsx) | Static demo dashboard — full 4-lens story, hardcoded Acme Financial mock | Open in Claude.ai, click artifact |
| [`dashboard/jtbd-feedback-loop.jsx`](dashboard/jtbd-feedback-loop.jsx) | Live extraction UI — paste any transcript, watch Claude extract and route in real time | Open in Claude.ai, paste transcript, hit ▶ RUN |

**Demo sequence:** Dashboard first (vision) → Extraction UI (proof) → Python CLI (production)

See [`dashboard/README.md`](dashboard/README.md) for full usage guide.

### Option B — Python CLI Demo Mode (No API Key Required)

> **⚠️ Windows note:** Always `cd` into `poc/` before running Python.
> `main.py` and `sample_transcript.txt` must be in the same working directory.

```powershell
# 1. Clone the repo
git clone https://github.com/emcdo411/jtbd-feedback-loop.git

# 2. Navigate INTO the poc folder — this is critical
cd jtbd-feedback-loop\poc

# 3. Install the one dependency
pip install anthropic

# 4. Run in demo mode — no API key needed
python main.py --mock

# 5. JSON output mode
python main.py --mock --output json
```

### Option C — Python CLI Live Mode (With Anthropic API Key)

```powershell
# Still inside poc/ ...

# Set your API key (Windows PowerShell)
$env:ANTHROPIC_API_KEY = "your_key_here"

# Run with the included demo transcript
python main.py

# Run with your own transcript (use the full path)
python main.py --transcript C:\path\to\your_transcript.txt
```

---

## 📁 Repository Structure

```
jtbd-feedback-loop/
│
├── 📄 README.md                          ← You are here — master overview
│
├── 🔬 poc/                               ← Lens 2: The Build (working POC)
│   ├── main.py                           ← Pipeline orchestrator — entry point
│   ├── prompts.py                        ← 3-layer prompt engineering strategy
│   ├── schema.py                         ← Typed data contracts + routing rules
│   ├── error_handler.py                  ← 2-stage validation + fallback engine
│   ├── router.py                         ← Routing engine + alert formatters
│   ├── sample_transcript.txt             ← Demo: Acme Financial QBR (47 min)
│   ├── requirements.txt                  ← Dependencies (one: anthropic)
│   └── README.md                         ← Technical walkthrough
│
├── 🖥 dashboard/                         ← React UI presentation layer
│   ├── jtbd-dashboard.jsx                ← Static demo dashboard (hardcoded mock)
│   ├── jtbd-feedback-loop.jsx            ← Live extraction UI (Claude API, no key needed)
│   └── README.md                         ← Usage guide + demo sequence
│
├── 📚 docs/                              ← All 4 presentation lenses
│   ├── jtbd-map.md                       ← Lens 1: JTBD framework + workflow maps
│   ├── technical-architecture.md         ← Lens 2: Architecture decisions
│   ├── stakeholder-mgmt.md               ← Lens 3: Human adoption strategy
│   └── future-state.md                   ← Lens 4: 18-month evolution vision
│
├── 🤖 skill/
│   └── jtbd-feedback-loop.skill          ← Installable Claude JTBD skill
│
├── 🛠 setup/
│   └── create-repo.ps1                   ← PowerShell: full repo scaffold + push
│
└── 🖼 assets/                            ← Architecture diagrams + visuals
    └── (diagrams referenced in docs)
```

---

## 🏗 Architecture

### Full Pipeline Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│  INPUT LAYER                                                          │
│                                                                       │
│  call_transcript.txt ──► load_transcript() ──► CallMetadata          │
│                                                (CSM, account, ARR,   │
│                                                 renewal date, ID)     │
└─────────────────────────────────┬────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼────────────────────────────────────┐
│  PROMPT ENGINEERING LAYER (prompts.py)                                │
│                                                                       │
│  Layer 1 — SYSTEM_PROMPT                                              │
│    ├─ Persona: Senior CSM who's been on 10,000 enterprise calls       │
│    ├─ Rules: Extract only what's explicit, score when uncertain       │
│    └─ Output contract: JSON schema enforced at prompt level           │
│                                                                       │
│  Layer 2 — EXTRACTION_PROMPT                                          │
│    ├─ Context injection: CSM name, account, call date                 │
│    ├─ 7 extraction targets explicitly named                           │
│    └─ Optional: pre-call notes / account context                      │
│                                                                       │
│  Layer 3 — FALLBACK_PROMPT                                            │
│    ├─ Triggered on JSON parse failure or validation failure           │
│    ├─ Simplified schema (subset of full schema)                       │
│    └─ Passes failed output back to model with error context           │
└─────────────────────────────────┬────────────────────────────────────┘
                                  │
                      ┌───────────▼───────────┐
                      │  ANTHROPIC API CALL    │
                      │  claude-sonnet-4-6     │
                      │  max_tokens: 4096      │
                      │  temp: default (1.0)   │
                      └───────────┬───────────┘
                                  │
┌─────────────────────────────────▼────────────────────────────────────┐
│  VALIDATION LAYER (error_handler.py)                                  │
│                                                                       │
│  Stage 1 — Primary Parse                                              │
│    ├─ Strip accidental markdown fences                                │
│    ├─ json.loads() parse                                              │
│    ├─ Schema validation: required fields, enum validation             │
│    └─ Confidence score range check (0.0 – 1.0)                       │
│                                                                       │
│  Stage 2 — Fallback (if Stage 1 fails)                                │
│    ├─ handle_json_parse_failure() → sanitize + log                    │
│    ├─ handle_validation_failure() → log specific field error          │
│    ├─ build_fallback_prompt() → simplified schema retry               │
│    └─ Both fail? → handle_empty_extraction() → clean empty result     │
└─────────────────────────────────┬────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼────────────────────────────────────┐
│  ROUTING ENGINE (router.py + schema.py)                               │
│                                                                       │
│  confidence ≥ 0.75 ──► ROUTING_RULES lookup ──► auto-route           │
│  confidence < 0.75 ──► Human Review Queue                             │
│  urgency = CRITICAL ──► SLA override → 4 hours                       │
│                                                                       │
│  ┌──────────────────────┬──────────────────────┬──────────────────┐  │
│  │  Insight Type        │  Primary Destination  │  SLA             │  │
│  ├──────────────────────┼──────────────────────┼──────────────────┤  │
│  │  🐛 Bug Report       │  Engineering          │  24hr / 4hr CRIT │  │
│  │  🏢 Competitor       │  Sales Leadership     │  48 hours        │  │
│  │  🔧 Feature Request  │  Product Management   │  1 week          │  │
│  │  💰 Pricing Friction │  Sales + PM           │  48 hours        │  │
│  │  🚨 Churn Signal     │  CS Leadership        │  4 hours always  │  │
│  │  ✅ Positive Signal  │  Product Management   │  1 week          │  │
│  │  💬 General Feedback │  Product Management   │  1 week          │  │
│  └──────────────────────┴──────────────────────┴──────────────────┘  │
└─────────────────────────────────┬────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼────────────────────────────────────┐
│  OUTPUT LAYER                                                         │
│                                                                       │
│  format_alert_terminal()    → human-readable terminal display         │
│  format_alerts_as_json()    → JSON payload for downstream integration │
│  format_csm_confirmation()  → closed-loop CSM notification            │
│  print_routing_summary()    → high-level stakeholder routing overview │
└──────────────────────────────────────────────────────────────────────┘
```

### Data Model

```
ExtractedInsight
├── insight_type:      InsightType (enum — 7 types)
├── summary:           str (1-2 structured sentences)
├── verbatim_quote:    Optional[str] (exact transcript words)
├── sentiment:         SentimentLabel (positive / neutral / negative / critical)
├── urgency:           UrgencyLevel (low / medium / high / critical)
├── confidence_score:  float (0.0 – 1.0)
├── routing_target:    RoutingDestination (enum — 5 destinations)
├── competitor_named:  Optional[str]
├── feature_requested: Optional[str]
├── bug_description:   Optional[str]
├── action_required:   bool
└── suggested_action:  Optional[str]

CallMetadata  ←  travels with every alert (CSM attribution preserved)
├── csm_name, account_name, account_arr
├── renewal_date, call_date, call_duration
└── transcript_id
```

---

## 🎯 Sample Terminal Output

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

## 🧠 The Four Lenses — Covered

| # | Lens | Document | Core Argument |
|---|------|----------|---------------|
| 1️⃣ | **Analyst** | [`docs/jtbd-map.md`](docs/jtbd-map.md) | Map the human first — 3 roles × 3 JTBD dimensions, friction audit, current/future state |
| 2️⃣ | **Technical** | [`poc/README.md`](poc/README.md) + [`docs/technical-architecture.md`](docs/technical-architecture.md) | Raw Python chosen deliberately — every architecture decision is explicit and inspectable |
| 3️⃣ | **Human** | [`docs/stakeholder-mgmt.md`](docs/stakeholder-mgmt.md) | Adoption resistance patterns by role, phased rollout, closed-loop trust mechanics |
| 4️⃣ | **Innovator** | [`docs/future-state.md`](docs/future-state.md) | 3-phase evolution: file-based → Invoca stream → multi-agent, plus model cost curve impact |

---

## 🔑 Design Principles

**Map the human first. Then build the system. In that order.**

Every friction point in the current state maps directly to a specific design decision in the code:

| Current State Friction | Design Decision | Where in Code |
|----------------------|-----------------|---------------|
| CSM Time Tax | Auto-extraction — zero manual entry | `main.py` pipeline |
| Judgment Erasure | CSM name + verbatim quote in every alert | `schema.py` → CallMetadata |
| Signal Loss | Closed-loop CSM confirmation on routing | `router.py` → `format_csm_confirmation()` |
| PM Trust Deficit | Confidence scores — PM controls threshold | `schema.py` → CONFIDENCE_THRESHOLD |
| Routing Ambiguity | Hard enum types — no free-text classification | `schema.py` → InsightType |
| Recipient Accountability Gap | Structured alert format + SLA attached | `router.py` → RoutedAlert |
| Pipeline Fragility | 2-stage fallback extraction | `error_handler.py` |

---

## 📊 Prompt Engineering Strategy

The `prompts.py` file is the entire prompt architecture made explicit. Three layers, all versioned:

```
Layer 1 — SYSTEM_PROMPT
  Sets the model's working identity as a senior B2B CSM.
  Establishes output contract (JSON schema enforced at prompt level).
  Defines confidence score calibration scale.
  Rule: "When in doubt, score lower."

Layer 2 — EXTRACTION_PROMPT (build_extraction_prompt)
  Context injection: CSM name, account name, call date.
  7 extraction targets explicitly named and described.
  Optional pre-call context parameter.
  Design choice: Context injection over generic extraction.

Layer 3 — FALLBACK_PROMPT (build_fallback_prompt)
  Triggered on JSON parse failure or schema validation failure.
  Passes failed output back with simplified schema.
  Production principle: Single failure should not kill the pipeline.
```

---

## 🛡 Error Handling Strategy

Every failure mode has a named handler — not a generic `try/except`:

| Failure Mode | Handler | Outcome |
|-------------|---------|---------|
| JSON parse failure | `handle_json_parse_failure()` | Log + trigger fallback |
| Schema validation error | `handle_validation_failure()` | Log field error + trigger fallback |
| Both stages fail | Both handlers exhaust | Return empty ExtractionResult (not a crash) |
| Empty extraction | `handle_empty_extraction()` | Clean result with processing note |
| API error | `handle_api_error()` | Log with transcript ID + re-raise |
| Low confidence insight | Routing check in `validate_insight_dict()` | Override destination to Human Review Queue |

---

## 🔭 The 18-Month Vision

| Phase | Horizon | What Changes |
|-------|---------|-------------|
| **Phase 1 — MVP** | Now | File-based transcript input, Python POC, React UI, single pipeline |
| **Phase 2 — Integration** | 6 months | Native Invoca call stream, Salesforce write-back, Slack delivery |
| **Phase 3 — Multi-Agent** | 12–18 months | Pattern aggregation agent, trend surfacing, proactive PM digest, multi-account cross-signal analysis |

Model cost curves (GPT-4 class: ~95% cost reduction in 18 months) change what's economically viable — from processing flagged calls to processing every call. The architecture is already designed for that transition.

---

## 🗂 Framework Credits

| Framework | Author | Role in This Project |
|-----------|--------|---------------------|
| **JTBD Feedback Loop v1.0** | Erwin M. McDonald | Core framework driving the problem decomposition |
| **AI Adoption Architect v2** | Erwin M. McDonald | Lens 3 stakeholder adoption strategy |
| **Anthropic Claude API** | Anthropic | claude-sonnet-4-6 extraction engine |

---

## 👤 Author

**Erwin M. McDonald**
Applied AI Analyst · Behavioral Intelligence Researcher

Framework Builder:
- EBT v1.1 (Evaluative Bias Transference)
- AI Adoption Architect v2
- Snowflake Equation Lab
- JTBD Feedback Loop v1.0

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f3460,50:16213e,100:1a1a2e&height=120&section=footer&text=The%20insight%20was%20always%20there.&fontSize=20&fontColor=00d4ff&animation=fadeIn&fontAlignY=65" width="100%"/>

*Built for the Invoca Applied AI Analyst final interview presentation.*

</div>
