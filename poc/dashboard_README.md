# 📊 Dashboard — React Presentation Layer
## JTBD Feedback Loop | Two Artifacts, Two Roles

---

## What's In Here

| File | Role | Data |
|------|------|------|
| `jtbd-feedback-loop.jsx` | **Live extraction UI** — paste any transcript, watch Claude extract and route insights in real time | Dynamic — calls Anthropic API |
| `jtbd-dashboard.jsx` | **Static demo dashboard** — full 4-lens presentation of what the system produces at scale | Hardcoded mock (Acme Financial QBR) |

These are not duplicates. They answer different questions.

---

## How to Run

Both artifacts run inside [Claude.ai](https://claude.ai) — no build step, no API key setup, no `npm install`.

1. Open Claude.ai
2. Upload or paste the `.jsx` file into the chat
3. Click the rendered artifact to open it full screen

---

## When to Use Which

### Open the Dashboard First
Walk the interviewer through the full story:
- **Current State toggle** — the insight black hole problem
- **Stakeholder Routing Map** — all 6 insights routed to 4 teams
- **Verbatim Evidence panel** — exact transcript quotes behind each insight
- **Confidence bars + Donuts** — scoring and SLA compliance at a glance
- **CSM View** — what the rep sees, priority-ordered, no technical noise
- **Account Risk Register** — simulated portfolio showing scale potential
- **18-Month Roadmap** — file-based POC → Invoca stream → multi-agent intelligence

This answers: *"What does this look like when it's working?"*

### Then Open the Extraction UI
Paste the Acme Financial transcript (or any transcript). Hit **▶ RUN EXTRACTION ENGINE**. Watch the pipeline status bar animate through INGEST → EXTRACT → SCORE → ROUTE → ALERT as Claude processes it live.

This answers: *"Is this actually real?"*

---

## What's Hardcoded vs Live

| | Dashboard | Extraction UI |
|---|---|---|
| Insights | 6 hardcoded (Acme Financial QBR) | Generated live by Claude API |
| Transcript | Embedded in mock data | Paste any transcript |
| Routing | Pre-assigned per insight | Determined by model per run |
| Confidence scores | Fixed values | Scored by model per run |
| API call | None | `claude-sonnet-4-20250514` · `max_tokens: 2000` |

---

## Demo Sequence

```
1. Dashboard  →  "Here's what the system produces"
      ↓
2. Extraction UI  →  "Here's the engine doing it right now"
      ↓
3. poc/main.py --mock  →  "Here's the same pipeline in Python for production"
```

Each layer adds a proof layer. The dashboard shows the vision. The extraction UI proves the intelligence is real. The Python CLI proves it's production-ready.

---

*Part of the JTBD Feedback Loop Architect · Invoca Applied AI Analyst POC · Erwin M. McDonald*
