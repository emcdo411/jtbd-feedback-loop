# 📊 Dashboard — React Presentation Layer

## JTBD Feedback Loop | Six Artifacts, One System

> **Invoca Applied AI Analyst POC** · Option 3: Feedback Loop Architect · Erwin M. McDonald

---

## What's In Here

| File | Role | Audience | Data |
| --- | --- | --- | --- |
| `jtbd-feedback-loop.jsx` | **Live extraction UI** — paste any transcript, watch Claude extract and route insights in real time | Technical evaluators, engineers | Dynamic — calls Anthropic API |
| `jtbd-dashboard.jsx` | **Static demo dashboard** — full 4-lens presentation of what the system produces at scale | All stakeholders | Hardcoded mock (Acme Financial QBR) |
| `jtbd-dashboard-explainer.jsx` | **Dashboard explainer** — every panel explained for both technical and non-technical audiences; audience toggle switches between Technical, Executive, and Both views | Mixed rooms, interview panels | Static |
| `jtbd-pipeline-explainer.jsx` | **Pipeline explainer** — all 7 pipeline stages explained side-by-side for engineers and executives; includes code blocks, analogies, whiteboard flow, and per-stage bridge phrases | Mixed rooms, interview panels | Static |
| `jtbdpoc-vs-invoca.jsx` | **POC vs Platform comparison** — your 7-step pipeline mapped against Invoca's actual technology stack (Signal AI, PreSense, Invoca Exchange); click any row to expand the Interview Insight for that stage | Interview prep, technical deep-dives | Static — sourced from Invoca public docs |
| `quick-launch.md` | **Quick launch guide** — step-by-step instructions for running any artifact in Claude.ai | Anyone opening this repo cold | — |

These are not duplicates. Each artifact answers a different question.

---

## The Question Each Artifact Answers

| Artifact | The Question It Answers |
| --- | --- |
| `jtbd-feedback-loop.jsx` | *"Can this actually extract insights from a real call?"* |
| `jtbd-dashboard.jsx` | *"What does the full system output look like at scale?"* |
| `jtbd-dashboard-explainer.jsx` | *"What does each dashboard panel do — in plain English AND technically?"* |
| `jtbd-pipeline-explainer.jsx` | *"How does each of the 7 pipeline stages work — for engineers AND executives?"* |
| `jtbdpoc-vs-invoca.jsx` | *"How does this POC compare to what Invoca already ships?"* |

---

## How to Run

All artifacts run inside [Claude.ai](https://claude.ai) — no build step, no API key setup, no npm install.

1. Open [Claude.ai](https://claude.ai)
2. Upload or paste the `.jsx` file into the chat
3. Claude renders the artifact automatically
4. Click the rendered artifact to open it full screen

> **Note:** `jtbd-feedback-loop.jsx` calls the Anthropic API at runtime. All other artifacts are fully static and render instantly with no API dependency.

---

## Recommended Demo Sequence

Use this order when presenting to a panel or walking a stakeholder through the system:

```
1. jtbd-dashboard.jsx
   → "Here's what the system produces at scale."

2. jtbd-feedback-loop.jsx
   → "Here's the engine doing it live, right now."

3. jtbd-pipeline-explainer.jsx
   → "Here's how each stage works — technically and in plain English."

4. jtbd-dashboard-explainer.jsx
   → "Here's what each dashboard panel means for your team."

5. jtbdpoc-vs-invoca.jsx
   → "Here's how this maps to what Invoca already ships — and where it adds something new."
```

---

## Alignment with Invoca's Stack

The `jtbdpoc-vs-invoca.jsx` artifact maps each of the 7 pipeline stages against Invoca's production technology. Summary:

| Stage | Your POC | Invoca Equivalent | Alignment |
| --- | --- | --- | --- |
| Ingest | File I/O / call stream | Call Ingestion API + Telephony Platform | ✦ Strong Align |
| Extract | Claude API + versioned prompt | Signal AI (patented ML + LLMs) | ✦ Strong Align |
| Score | `confidence_score` (0.0–1.0) | Signal AI Accuracy Scores | ✦ **Exact Match** |
| Gate | 75% threshold → auto-route or human review | Signal Deployment Threshold + Smart Alerts | ✦ Strong Align |
| Route | ROUTING_RULES → 4 destinations | Invoca Exchange (200+ integrations) | ◇ Partial Align |
| Alert | JSON + required `verbatim_quote` | Smart Alerts + Searchable Transcripts | ✦ Strong Align |
| Confirm | CSM closed-loop receipt + SLA | Closed-Loop Revenue Attribution | ▲ **You Go Further** |

> The POC adds the internal accountability layer — confirmed ownership, SLA deadline, loop closure — that Invoca's platform assumes CSMs are handling manually.

---

## Architecture at a Glance

```
📞 Call Transcript
      ↓
🤖 Claude API (claude-sonnet-4-6)
   └── Versioned system prompt (v1.0.0)
   └── Strict JSON schema
   └── Enumerated insight types
   └── confidence_score (required field)
      ↓
🔀 Confidence Gate (≥75% → auto-route / <75% → human review)
      ↓
🚦 ROUTING_RULES → Engineering / CS Leadership / Sales / Product
      ↓
📋 RoutedAlert (JSON) with verbatim_quote + SLA
      ↓
✅ CSM Confirmation → Loop Closed
```

---

## File Reference

```
dashboard/
├── README.md                      ← You are here
├── quick-launch.md                ← How to run any artifact in Claude.ai
├── jtbd-feedback-loop.jsx         ← Live extraction engine (calls Anthropic API)
├── jtbd-dashboard.jsx             ← Static 4-lens demo dashboard
├── jtbd-dashboard-explainer.jsx   ← Dashboard panel explainer (dual audience)
├── jtbd-pipeline-explainer.jsx    ← 7-stage pipeline explainer (dual audience)
└── jtbdpoc-vs-invoca.jsx          ← POC vs Invoca platform comparison
```

---

## Core Positioning

> *"I built a JTBD-driven Customer Intelligence system that converts raw call transcripts into structured, routed, SLA-bound business actions with confidence gating."*

---

*JTBD Feedback Loop Architect · Invoca Applied AI Analyst POC · Erwin M. McDonald · March 2026*
