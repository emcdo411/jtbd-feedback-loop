# 🚀 Quick Launch — React UI

> No API key. No build step. No npm install.
> All artifacts run entirely inside Claude.ai.

---

## How to Launch

1. Open [claude.ai](https://claude.ai) in your browser
2. Start a new conversation
3. Copy the **entire command block** for the artifact you want (below)
4. Paste it into the chat and hit Enter
5. Claude fetches the file and renders the interactive dashboard instantly

---

## The Five Artifacts

---

### 1 — Static Demo Dashboard

**Use this first.** Shows the full system output — all 6 insights routed, KPI cards, routing map, verbatim evidence, confidence visualization, 18-month roadmap. Hardcoded mock data from the Acme Financial QBR. No waiting, no API call, loads instantly.

```
Fetch the React component from this URL: https://raw.githubusercontent.com/emcdo411/jtbd-feedback-loop/main/dashboard/jtbd-dashboard.jsx

Read the full file contents, then render it as an interactive React artifact in this conversation.
```

---

### 2 — Live Extraction UI

**Use this second.** Paste any call transcript, hit RUN, and watch Claude extract insights, score confidence, and route stakeholders in real time. Calls the Anthropic API through Claude.ai's built-in proxy — no key needed.

```
Fetch the React component from this URL: https://raw.githubusercontent.com/emcdo411/jtbd-feedback-loop/main/dashboard/jtbd-feedback-loop.jsx

Read the full file contents, then render it as an interactive React artifact in this conversation.
```

---

### 3 — Dashboard Explainer

**Use this in mixed rooms.** Every dashboard panel explained for both technical and non-technical audiences. Toggle between 🔧 Technical, 💼 Executive, and ⚡ Both views. Includes a per-panel bridge phrase that works in any room. Click the left nav to jump between the 8 panels.

```
Fetch the React component from this URL: https://raw.githubusercontent.com/emcdo411/jtbd-feedback-loop/main/dashboard/jtbd-dashboard-explainer.jsx

Read the full file contents, then render it as an interactive React artifact in this conversation.
```

---

### 4 — Pipeline Explainer

**Use this to walk any audience through the 7 stages.** Technical view shows architecture, code blocks, and schema tags. Executive view shows plain-English analogies, the "why it matters" stakes, and a whiteboard flow with clickable steps. Bridge phrase at the bottom of every stage works in any room.

```
Fetch the React component from this URL: https://raw.githubusercontent.com/emcdo411/jtbd-feedback-loop/main/dashboard/jtbd-pipeline-explainer.jsx

Read the full file contents, then render it as an interactive React artifact in this conversation.
```

---

### 5 — POC vs Invoca Tech Stack Duel

**Use this for technical deep-dives.** 8 layers of your pipeline compared side-by-side against Invoca's actual technology stack — Signal AI, Invoca Exchange, Smart Alerts. Click any row to expand a full split panel with code blocks (your POC in teal, Invoca in gold) plus an analysis note with the interview angle for that layer. Filter by verdict using the KPI strip. The `YOU GO FURTHER ▲` row on the Closed Loop layer is your primary differentiator — that's the one to expand in the room.

```
Fetch the React component from this URL: https://raw.githubusercontent.com/emcdo411/jtbd-feedback-loop/main/dashboard/poc-vs-invoca-duel.jsx

Read the full file contents, then render it as an interactive React artifact in this conversation.
```

---

## Recommended Demo Sequence

```
Step 1 → jtbd-dashboard.jsx            "Here's what the system produces at scale"
              ↓
Step 2 → jtbd-feedback-loop.jsx        "Here's the engine doing it live, right now"
              ↓
Step 3 → jtbd-pipeline-explainer.jsx   "Here's how each stage works — for any audience"
              ↓
Step 4 → jtbd-dashboard-explainer.jsx  "Here's what each panel means for your team"
              ↓
Step 5 → poc-vs-invoca-duel.jsx        "Here's how this maps to what Invoca ships — and where it goes further"
              ↓
Step 6 → poc/main.py --mock            "Here's the production-path Python code"
```

---

## Tips

- **Bookmark it.** After Claude renders an artifact, bookmark that conversation. Your next launch is one click — no command needed.
- **Full screen.** Click the expand icon on the rendered artifact for the best view.
- **Demo transcript.** The live extraction UI (`jtbd-feedback-loop.jsx`) has a built-in "Load Demo Transcript" button — use it if you don't have a transcript handy.
- **Audience toggle.** Both explainer artifacts have a toggle in the top-right corner — switch between Technical, Executive, and Both views without reloading.
- **Filter by verdict.** In `poc-vs-invoca-duel.jsx`, click any verdict badge (EXACT MATCH, STRONG ALIGN, PARTIAL ALIGN, YOU GO FURTHER) in the KPI strip to filter the comparison to just those rows.
- **Expand the Closed Loop row.** That's the `YOU GO FURTHER ▲` row — the primary gap. Click it to surface the full analysis.
- **Escape to close** any modal in the static dashboard.

---

## Raw File URLs (GitHub)

| Artifact | Raw URL |
|----------|---------|
| Static Dashboard | `https://raw.githubusercontent.com/emcdo411/jtbd-feedback-loop/main/dashboard/jtbd-dashboard.jsx` |
| Live Extraction UI | `https://raw.githubusercontent.com/emcdo411/jtbd-feedback-loop/main/dashboard/jtbd-feedback-loop.jsx` |
| Dashboard Explainer | `https://raw.githubusercontent.com/emcdo411/jtbd-feedback-loop/main/dashboard/jtbd-dashboard-explainer.jsx` |
| Pipeline Explainer | `https://raw.githubusercontent.com/emcdo411/jtbd-feedback-loop/main/dashboard/jtbd-pipeline-explainer.jsx` |
| POC vs Invoca Duel | `https://raw.githubusercontent.com/emcdo411/jtbd-feedback-loop/main/dashboard/poc-vs-invoca-duel.jsx` |

---

*JTBD Feedback Loop Architect · Invoca Applied AI Analyst POC · Erwin M. McDonald*
