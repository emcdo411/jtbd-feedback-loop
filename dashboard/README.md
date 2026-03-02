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

Both artifacts run inside [Claude.ai](https://claude.ai) — no build step, no API key setup, no npm install.

1. Open Claude.ai
2. Upload or paste the .jsx file into the chat
3. Click the rendered artifact to open it full screen

---

## Demo Sequence

1. Dashboard → "Here's what the system produces"
2. Extraction UI → "Here's the engine doing it right now"
3. poc/main.py --mock → "Here's the same pipeline in Python for production"

---

*JTBD Feedback Loop Architect · Invoca Applied AI Analyst POC · Erwin M. McDonald*
