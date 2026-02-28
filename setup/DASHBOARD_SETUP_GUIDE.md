# 🚀 JTBD Feedback Loop — JSX Dashboard Setup Guide
### For Anthropic API Holders & Vibe Coders | Zero Assumptions, Every Step Covered

---

## 📋 What You're Setting Up

You'll be running two things:
1. **The Python POC** — the AI brain that reads call transcripts and extracts insights using your Anthropic API key
2. **The JSX Dashboard** — a React-based visual interface that displays those insights

Both live inside the `jtbd-feedback-loop` repo you cloned.

---

## ✅ Before You Start — What You Need

| Tool | Why You Need It | Check If Installed |
|------|----------------|--------------------|
| **Git** | To clone the repo | `git --version` in terminal |
| **Python 3.11+** | To run the POC pipeline | `python --version` |
| **Node.js 18+** | To run the JSX dashboard | `node --version` |
| **npm** | Comes with Node, manages packages | `npm --version` |
| **Anthropic API Key** | Powers the AI extraction | Get it at [console.anthropic.com](https://console.anthropic.com) |

> **Don't have something?**
> - Git: [git-scm.com/downloads](https://git-scm.com/downloads)
> - Python: [python.org/downloads](https://python.org/downloads) — check "Add to PATH" on install
> - Node.js: [nodejs.org](https://nodejs.org) — download the LTS version

---

## 🔑 Step 0 — Get Your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in with your Anthropic developer account
3. Click **API Keys** in the left sidebar
4. Click **Create Key**, give it a name (e.g. `jtbd-poc`)
5. **Copy it immediately** — you won't see it again
6. Save it somewhere safe (a notes app, password manager, etc.)

---

## 📥 Step 1 — Clone the Repo

Open **PowerShell** (Windows) or **Terminal** (Mac/Linux) and run:

```powershell
git clone https://github.com/emcdo411/jtbd-feedback-loop.git
```

Then navigate into the project:

```powershell
cd jtbd-feedback-loop
```

You should now be inside the project folder. Type `ls` (Mac/Linux) or `dir` (Windows) to confirm you can see folders like `poc/`, `assets/`, `docs/`.

---

## 🐍 Step 2 — Run the Python POC (Option B — Live Mode)

### 2a. Navigate into the `poc/` folder

> ⚠️ **Critical:** You MUST be inside the `poc/` folder before running anything. `main.py` and `sample_transcript.txt` must be in the same directory.

```powershell
cd poc
```

### 2b. Install the Python dependency

```powershell
pip install anthropic
```

> If you get a permissions error on Mac/Linux, try: `pip install anthropic --break-system-packages`

### 2c. Set your Anthropic API key

**Windows PowerShell:**
```powershell
$env:ANTHROPIC_API_KEY = "your_key_here"
```

**Mac/Linux Terminal:**
```bash
export ANTHROPIC_API_KEY="your_key_here"
```

> Replace `your_key_here` with the actual key you copied in Step 0. Keep the quotes.

### 2d. Run the pipeline

**With the included demo transcript:**
```powershell
python main.py
```

**With your own transcript file:**
```powershell
python main.py --transcript C:\path\to\your_transcript.txt
```

> On Mac/Linux, use forward slashes: `python main.py --transcript /path/to/your_transcript.txt`

### 2e. What success looks like

You should see terminal output like this:
```
══════════════════════════════════════════════════
  JTBD FEEDBACK LOOP — INSIGHT EXTRACTION ENGINE
══════════════════════════════════════════════════

  📞 Processing: Acme Financial Services
  ✅ Extracted 6 insights
     Auto-routing: 6 (confidence ≥ 75%)
```

If you see this, your Python pipeline is working. ✅

---

## 💡 Optional: Test Without an API Key First

If you want to verify the setup before using your API key, run **demo/mock mode**:

```powershell
# Make sure you're in the poc/ folder
python main.py --mock

# JSON output version
python main.py --mock --output json
```

This runs the full pipeline with simulated AI responses — no API key needed.

---

## ⚛️ Step 3 — Run the JSX Dashboard

The dashboard is a React app. Here's how to get it running.

### 3a. Navigate to the dashboard folder

From the root of the repo (go back if you're still in `poc/`):

```powershell
# If you're in poc/, go back up first
cd ..

# Then navigate to the dashboard
cd assets
```

> If your dashboard JSX files are in a different folder (e.g. a `dashboard/` subfolder), adjust the path accordingly. Look for a folder containing a `package.json` file — that's your React app root.

### 3b. Install dashboard dependencies

```powershell
npm install
```

> This downloads all the React libraries the dashboard needs. It may take 1–2 minutes. You'll see a `node_modules/` folder appear when it's done.

### 3c. Start the dashboard

```powershell
npm start
```

> This starts a local development server. Your browser should automatically open to `http://localhost:3000`. If it doesn't, open your browser and go there manually.

### 3d. What success looks like

Your browser opens and shows the JTBD Feedback Loop dashboard with insight cards, confidence scores, and routing data. ✅

---

## 🔁 Step 4 — Connect the Pipeline to the Dashboard

The Python POC outputs structured JSON. To feed that output into the dashboard:

**Run the pipeline in JSON mode:**
```powershell
# From inside poc/
python main.py --output json
```

This produces a JSON file the dashboard can consume. Check the `poc/` folder for an output `.json` file after running.

---

## 🛑 Troubleshooting

| Problem | Fix |
|---------|-----|
| `python: command not found` | Use `python3` instead of `python` on Mac/Linux |
| `pip: command not found` | Use `pip3` instead of `pip` on Mac/Linux |
| `ModuleNotFoundError: anthropic` | Run `pip install anthropic` again from inside `poc/` |
| API key error / 401 Unauthorized | Double-check you set the key correctly — no extra spaces |
| `npm: command not found` | Node.js isn't installed — download from [nodejs.org](https://nodejs.org) |
| Port 3000 already in use | Run `npm start` — it will ask if you want to use 3001, hit `y` |
| `node_modules not found` | Run `npm install` first before `npm start` |
| Dashboard shows blank page | Open browser console (F12) and check for errors — usually a missing env variable |

---

## 📁 Repo Structure Reference

```
jtbd-feedback-loop/
│
├── poc/                    ← Python pipeline lives here
│   ├── main.py             ← Run this
│   ├── sample_transcript.txt
│   └── requirements.txt
│
├── assets/                 ← JSX dashboard likely lives here
│   └── (React files)
│
├── docs/                   ← Framework documentation
└── README.md
```

---

## 🆘 Still Stuck?

1. Check the [`poc/README.md`](https://github.com/emcdo411/jtbd-feedback-loop/blob/main/poc/README.md) for technical details
2. Make sure you're always running commands from the **correct folder**
3. The most common issue: running `python main.py` from the wrong directory

---

*Built by Erwin M. McDonald | JTBD Feedback Loop v1.0*
