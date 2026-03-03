# JTBD Feedback Loop — Clone & Run Guide

**Repo:** `https://github.com/emcdo411/jtbd-feedback-loop`

---

## Clone

```bash
git clone https://github.com/emcdo411/jtbd-feedback-loop.git
cd jtbd-feedback-loop
```

---

## Run the Pipeline

### Demo Mode — no API key needed

```bash
cd poc
pip install anthropic
python main.py --mock
```

### JSON output

```bash
python main.py --mock --output json
```

### Live Mode — with Anthropic API key

```bash
# Set key (PowerShell)
$env:ANTHROPIC_API_KEY = "your_key_here"

# Run with included demo transcript
python main.py

# Run with your own transcript
python main.py --transcript C:\path\to\your_transcript.txt
```

> ⚠️ Always `cd` into `poc/` before running. `main.py` and `sample_transcript.txt` must share the same working directory.

---

## Repo Structure

```
jtbd-feedback-loop/
├── poc/                  ← Pipeline entry point (start here)
│   ├── main.py
│   ├── prompts.py
│   ├── schema.py
│   ├── router.py
│   ├── error_handler.py
│   └── sample_transcript.txt
├── docs/                 ← All 4 presentation lenses
├── dashboard/            ← React artifacts (Insight Engine + Dashboard)
├── skill/                ← Installable Claude JTBD skill
└── setup/                ← PowerShell repo scaffold
```

---

## Dashboard Artifacts

| File | Description |
|------|-------------|
| `dashboard/jtbd-feedback-loop.jsx` | Live extraction engine — paste any transcript, run Claude |
| `dashboard/jtbd-dashboard.jsx` | Intelligence dashboard — routing map, risk register, pipeline view |

---

*JTBD Feedback Loop v1.0 · Erwin M. McDonald · Invoca Applied AI Analyst POC*
