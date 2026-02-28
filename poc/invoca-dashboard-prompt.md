# Invoca JTBD Feedback Loop Dashboard — Build Prompt

**Project:** Option 3: The Feedback Loop Architect  
**Author:** Erwin M. McDonald  
**Repo:** [github.com/emcdo411/jtbd-feedback-loop](https://github.com/emcdo411/jtbd-feedback-loop)  
**Model:** claude-sonnet-4-6  
**Prompt Version:** v1.0.0

---

## Role & Context

You are a senior React engineer and data visualization specialist.

I need you to rebuild my existing HTML proof-of-concept dashboard into a single-file React/JSX artifact for my Invoca AI Automation Analyst interview presentation.

This is **Option 3: "The Feedback Loop Architect"** — a JTBD-framed AI workflow that ingests raw CSM call transcripts, extracts structured insights (competitor mentions, feature requests, bugs, pricing feedback), and routes them to the right stakeholder (Product, Engineering, Sales, Leadership).

---

## Design System

Carry over from the existing HTML dashboard.

**Fonts (Google Fonts):**
- `DM Sans` — body text
- `DM Mono` — labels, code, metadata
- `DM Serif Display` — headlines

**Color Tokens:**
```
--ink:    #0a0e1a
--ink-2:  #1a2035
--ink-3:  #2a3050
--paper:  #f4f1eb
--gold:   #c9a84c
--teal:   #00c4b4
--red:    #e85454
--orange: #f07c3a
--green:  #3dbe8a
--blue:   #4a8fe8
--purple: #9b72e8
```

**Aesthetic:** Dark background editorial dashboard. Dense but readable. Grain overlay texture. Animated on mount.

**Required CSS Keyframes:** `fadeUp`, `pulse-green`, `pulse-red`, `node-pulse`, `modal-in`, `flowDash`, `grain`

---

## Required Sections

Build all of the following as React components.

### 1. Header

- Eyebrow: `Invoca · JTBD Feedback Loop`
- H1: `Insight Intelligence Dashboard` — the word *Intelligence* in italic gold
- Live badge: pulsing green dot + `PIPELINE COMPLETE`
- Account metadata line: account name, CSM, ARR, renewal date, transaction ID
- Right side: Current State ↔ Future State toggle, CSM View toggle, author credit

### 2. KPI Row (5 Cards)

Animated number counters on mount. Values from the sample transcript run:

| Label | Value | Accent Color |
|---|---|---|
| Insights Extracted | 6 | Teal |
| Critical Alerts | 2 | Red |
| Avg. Confidence | 95.7% | Gold |
| Insights Routed | 6/6 | Green |
| ARR at Risk | $84K | Orange |

Each card: bottom accent bar, DM Serif Display number, DM Mono sub-label, fade-up animation with staggered delay.

### 3. Routing Map (Core Panel)

Four routing lanes in a horizontal grid:

| Lane | Destination | Insights |
|---|---|---|
| 🔧 | Engineering | 1 (Bug Report · CRITICAL) |
| 🤝 | CS Leadership | 1 (Churn Signal · CRITICAL) |
| 💼 | Sales Leadership | 2 (Competitor + Pricing · HIGH) |
| 📋 | Product Management | 2 (Feature + Positive · MEDIUM/LOW) |

Each insight card:
- Pulsing red dot for CRITICAL
- Insight type label (DM Mono, uppercase)
- SLA badge (red background for critical)
- Summary text
- Animated confidence bar (teal → gold gradient)
- Action flag line (gold, ⚡ prefix) for urgent items
- Left border color-coded by urgency
- Click → opens detail modal

### 4. Modal (Detail View)

Triggered by clicking any insight card. Contains:
- Urgency color stripe at top
- Sticky header: type · route · urgency label
- DM Serif Display title
- Verbatim transcript quote (gold left border, italic serif)
- Structured fields grid (2-column):
  - Full summary
  - `bug_description` (if bug type) — labeled field
  - `feature_requested` (if feature type) — labeled field
  - `competitor_named` (if competitive type) — labeled field
  - Sentiment (colored by value)
  - Urgency · SLA
  - Destination · SLA
  - Account · CSM
  - ARR · Renewal date
  - Call date · Transaction ID
- Animated confidence bar
- Suggested Action box (teal background, ⚡ label)
- Footer: Alert ID + "IDs regenerate each pipeline run" note + confidence score
- Close via: ✕ button, outside click, or Escape key

### 5. Verbatim Evidence Panel

Three pull-quotes from the actual transcript. Large gold opening quotation mark. DM Serif Display italic. Source attribution below each in DM Mono.

Quotes used:
1. *"We've flagged it twice to support and the ticket is still open..."* — Bug Report · 97%
2. *"The bug needs to get fixed and the pricing conversation needs to happen before June..."* — Churn Signal · 93%
3. *"Our inside sales team actually credits Invoca with a 23% improvement..."* — Positive Signal · 99%

### 6. Donut Charts (Three Panels)

All SVG, no chart library. Animated on mount (stroke-dasharray transitions).

**Panel 1 — Insight Type Breakdown:**
- Bug/Churn: 2 (red)
- Pricing: 1 (orange)
- Feature: 1 (yellow)
- Positive: 2 (green)
- Center label: "6 / Insights"

**Panel 2 — Confidence by Insight:**
Horizontal animated bar chart (not donut). One bar per insight, color-coded by urgency. Bars animate from 0 → target width on mount.

**Panel 3 — SLA Compliance:**
- On Track: 83% / 5 of 6 (green)
- At Risk: 17% / 1 of 6 (red)
- Center label: "83% / On Track"

### 7. Pipeline Flow

7-step horizontal pipeline diagram with SVG arrow connectors:

```
📞 Ingest → 🤖 Extract → 🎯 Score → 🔀 Gate → 🚦 Route → 📋 Alert → ✅ Confirm
```

- Steps 1–4: Complete (green border, green arrows)
- Step 5 (Route): Active (teal border, pulsing node-pulse animation)
- Steps 6–7: Complete
- Sub-labels under each node

### 8. Account Risk Register

Full-width table. 5 simulated portfolio accounts:

| Account | ARR | Renewal | Risk Score | Status | Signals |
|---|---|---|---|---|---|
| Acme Financial Services | $84,000 | Jun 30 | 85 | ⚠ At Risk | 6 · 2 CRITICAL |
| Meridian Healthcare | $126,000 | Sep 15 | 52 | ◎ Watch | 3 · 1 HIGH |
| Peak Auto Group | $212,000 | Dec 1 | 22 | ✓ Healthy | 1 · Positive |
| Vantage Retail Corp | $68,000 | Mar 31 | 68 | ◎ Watch | 2 · Feature Gap |
| Suncoast Insurance | $94,000 | Jul 15 | 18 | ✓ Healthy | 2 · All Positive |

Row hover state. Risk scores displayed as mini colored bars + numeric value. Status badges with background tint.

### 9. CSM Closed-Loop Confirmations

Full-width 3-column grid. One card per insight. Mirrors the terminal output section exactly:

```
✅ INSIGHT CONFIRMED
JTBD-YYYYMMDD-XXXXXXXX · {type}
Your {type} from {account} has been routed to {destination}.
SLA: {sla} · Confidence: {confidence}%
```

Green border. Green "Insight Confirmed" label. Teal SLA and confidence values.

### 10. Footer

- Left: "JTBD Feedback Loop Architect · Invoca Applied AI Analyst POC · Option 3 · Erwin M. McDonald"
- Right: `Pipeline: claude-sonnet-4-6` · `Prompt v1.0.0` · Alert ID format note · GitHub link (gold hover)

---

## Four Pillars Integration

The dashboard must visually communicate all four presentation pillars via interactive controls.

### Pillar 1 — Process Design

**Current State ↔ Future State toggle** in the header.

**Current State view** shows a 3-column panel ("The Insight Black Hole"):
- 📋 Manual CRM Entry — CSMs spend 15–20 min/call typing notes. Critical signal buried in free text.
- 🏝️ Siloed Data — Engineering never sees bug patterns. PM never sees feature velocity.
- 🚫 No Routing or SLA — Insights sit in Salesforce for weeks. No closed loop.

Includes a "→ See the Future State" CTA button that flips back to the dashboard.

**Future State** = the full dashboard.

### Pillar 2 — The Build

**Collapsible Architecture Panel** (click to expand). Two-column layout inside:

Left column — Tech Stack:
```
Input:      CSM call transcripts (.txt / stream)
Extraction: Python + Anthropic SDK (claude-sonnet-4-6)
Schema:     Typed dataclasses — ExtractedInsight, RoutedAlert
Routing:    ROUTING_RULES table → 5 destinations + SLA collapse
Gate:       ≥75% confidence auto-route · <75% → Human Review Queue
Output:     Structured JSON + terminal alerts + React dashboard
```

Right column — Extraction Prompt Template (code block, green monospace):
```
SYSTEM: You are a senior CSM analyst.
Extract all insights as a JSON array.
Each insight must include:
  insight_type, summary, verbatim_quote,
  sentiment, urgency, confidence_score,
  routing_target, suggested_action

CONFIDENCE CALIBRATION:
  0.90–1.00 → High, auto-route
  0.75–0.89 → Confident, auto-route
  0.60–0.74 → Uncertain, flag
  0.00–0.59 → Low, human review

PROMPT_VERSION: v1.0.0
```

### Pillar 3 — Stakeholder Management

**CSM View toggle** in the header. When active, replaces the full dashboard with a simplified action-only view:

> "No technical noise. Your actions, priority-ordered."

Shows only:
- 🔴 DO NOW cards (CRITICAL urgency, 4-hour SLA) — red border
- 🟠 DO TODAY cards (HIGH urgency, 48-hour SLA) — orange border

Each card shows: urgency label, SLA, action title, full suggested action text, alert ID. No charts, no architecture, no jargon.

### Pillar 4 — The Future

**18-Month Intelligence Roadmap** panel at the bottom of the dashboard. Horizontal timeline with milestone nodes connected by a gradient line (green → gold).

| Phase | Label | Items |
|---|---|---|
| Now | MVP POC | File-based input, Python pipeline, This dashboard |
| 3 mo | Integration | Native Invoca stream, Salesforce write-back |
| 6 mo | Scale | Slack alerts, Multi-CSM rollout, SLA tracking |
| 12 mo | Intelligence | Pattern aggregation, Auto PM digest, Cross-account signals |
| 18 mo | Prediction | Predictive churn signals, Auto-Jira tickets, Renewal risk scoring |

Each milestone: colored node with phase label, milestone title, bullet list of items in a tinted card.

---

## Data

Use these exact values from the actual pipeline run. All data is faithful to the pipeline JSON output — nothing fabricated.

```javascript
const INSIGHTS = [
  {
    id: "JTBD-20260227-ADD8E43F",
    type: "bug",
    urgency: "critical",
    summary: "Call attribution data inconsistent for 6 weeks",
    fullDetail: "Call attribution data has been inconsistent for 6 weeks, creating discrepancies between Invoca reporting and Google Ads dashboard. A support ticket has been open for 41 days without resolution, causing the paid search team to distrust attribution numbers.",
    bugDescription: "Call attribution data discrepancy between Invoca and Google Ads dashboard — 41-day open support ticket, paid search team has lost confidence in attribution numbers",
    sentiment: "critical",
    confidence: 97,
    sla: "4 hours",
    urgencyLabel: "CRITICAL",
    route: "Engineering",
    icon: "🔧",
    action: "P1 Escalation Required",
    transcriptSnippet: "We've flagged it twice to support and the ticket is still open. It's not a minor thing — we're making media spend decisions based on this data.",
    suggestedAction: "Escalate to Engineering as P1. Assign owner and provide ETA by end of week. CSM to confirm escalation to customer within 24 hours.",
    csm: "Jordan Rivera",
    account: "Acme Financial Services",
    arr: "$84,000",
    renewal: "June 30, 2025"
  },
  {
    id: "JTBD-20260227-15CF8965",
    type: "churn",
    urgency: "critical",
    summary: "Renewal at risk — board-level scrutiny implied",
    fullDetail: "Customer stated that if the attribution bug is not fixed and pricing is not addressed before June renewal, she does not know what the board will say — implying renewal is at risk.",
    sentiment: "critical",
    confidence: 93,
    sla: "4 hours",
    urgencyLabel: "CRITICAL",
    route: "CS Leadership",
    icon: "🤝",
    action: "Renewal Risk — Flag Immediately",
    transcriptSnippet: "The bug needs to get fixed and the pricing conversation needs to happen before June. Otherwise honestly I don't know what the board is going to say.",
    suggestedAction: "Flag account as renewal risk. Escalate to CS leadership and Sales VP. Two hard dependencies: (1) attribution bug resolved, (2) pricing options delivered before June renewal conversation.",
    csm: "Jordan Rivera",
    account: "Acme Financial Services",
    arr: "$84,000",
    renewal: "June 30, 2025"
  },
  {
    id: "JTBD-20260227-FB0AFF20",
    type: "competitive",
    urgency: "high",
    summary: "Marchex demo — omnichannel pitch to customer leadership",
    fullDetail: "Acme Financial had a demo with Marchex last month. Marchex pitched 'omnichannel conversation intelligence.' Customer's leadership is asking questions about alternatives. Customer stated they are not leaving but are being asked to evaluate.",
    competitorNamed: "Marchex",
    sentiment: "negative",
    confidence: 96,
    sla: "48 hours",
    urgencyLabel: "HIGH",
    route: "Sales Leadership",
    icon: "💼",
    action: "Battlecard · Competitor: Marchex",
    transcriptSnippet: "We had a demo with Marchex last month. They were pitching something they called 'omnichannel conversation intelligence.' We're not going anywhere, but I want to be transparent that we're being asked to evaluate alternatives.",
    suggestedAction: "Alert Sales Leadership immediately. Prepare competitive battlecard for Marchex omnichannel claim. Ensure renewal conversation addresses this directly.",
    csm: "Jordan Rivera",
    account: "Acme Financial Services",
    arr: "$84,000",
    renewal: "June 30, 2025"
  },
  {
    id: "JTBD-20260227-241840B7",
    type: "pricing",
    urgency: "high",
    summary: "18% increase vs 15% budget cut — cannot get through finance",
    fullDetail: "Customer received an 18% renewal price increase while their own marketing budget was cut 15% this quarter. Customer stated they cannot get the increase through finance and will need pricing options before June renewal.",
    sentiment: "negative",
    confidence: 98,
    sla: "48 hours",
    urgencyLabel: "HIGH",
    route: "Sales Leadership",
    icon: "💼",
    action: "Pricing Options Needed Before June",
    transcriptSnippet: "The price increase is 18%. I understand costs go up but our marketing budget got cut 15% this quarter. I'm going to have a hard time getting this through finance at that number.",
    suggestedAction: "Escalate to Sales Leadership before formal renewal discussions. CSM to request pricing options from leadership within 1 week. Renewal at risk if not addressed.",
    csm: "Jordan Rivera",
    account: "Acme Financial Services",
    arr: "$84,000",
    renewal: "June 30, 2025"
  },
  {
    id: "JTBD-20260227-62EF015C",
    type: "feature",
    urgency: "medium",
    summary: "Unified omnichannel intelligence — SMS and chat parity",
    fullDetail: "Customer is expanding into SMS and chat channels and wants unified omnichannel conversation intelligence — the same intent scoring and attribution Invoca provides for calls, extended across all customer interaction channels.",
    featureRequested: "Unified omnichannel conversation intelligence — intent scoring and attribution across calls, SMS, and chat channels",
    sentiment: "neutral",
    confidence: 91,
    sla: "1 week",
    urgencyLabel: "MEDIUM",
    route: "Product Management",
    icon: "📋",
    action: "Roadmap Consideration",
    transcriptSnippet: "It would be really valuable if there was some kind of unified view — like, the same kind of intent scoring and attribution you do for calls but across all the channels where customers are reaching us.",
    suggestedAction: "Route to Product Management for roadmap consideration. Document as strategic gap — customer has confirmed Marchex is pitching this capability.",
    csm: "Jordan Rivera",
    account: "Acme Financial Services",
    arr: "$84,000",
    renewal: "June 30, 2025"
  },
  {
    id: "JTBD-20260227-5236848F",
    type: "positive",
    urgency: "low",
    summary: "+23% qualified lead rate — VP credited Invoca call scoring",
    fullDetail: "Inside sales team attributes a 23% improvement in qualified lead rate this quarter to Invoca call scoring. Customer VP explicitly credited the platform and described the outcome as 'huge.'",
    sentiment: "positive",
    confidence: 99,
    sla: "1 week",
    urgencyLabel: "LOW",
    route: "Product Management",
    icon: "📋",
    action: "Capture as Case Study",
    transcriptSnippet: "Our inside sales team actually credits Invoca with a 23% improvement in qualified lead rate this quarter, which is huge.",
    suggestedAction: "Capture as customer success story. Use in renewal conversation to anchor value. Share with Marketing for case study consideration.",
    csm: "Jordan Rivera",
    account: "Acme Financial Services",
    arr: "$84,000",
    renewal: "June 30, 2025"
  }
]
```

> **Data fidelity note:** All values above are exact matches to the actual `python main.py --mock` pipeline output. Verbatim quotes match the JSON `verbatim_quote` field. Suggested actions are unchanged from the pipeline. Alert IDs are from a sample run and are noted as regenerating on each execution.

---

## Technical Requirements

- Single `.jsx` file, self-contained
- React hooks: `useState`, `useEffect`, `useRef`
- All animations via CSS keyframes injected in a `<style>` tag inside the component
- All SVG charts built from scratch — no recharts, no d3, no external chart library
- Modal system using React state only — no localStorage, no sessionStorage
- Smooth CSS transitions on all interactive elements (hover, click, open/close)
- Animated confidence bars: width transitions from 0 → target on mount (600ms delay, 1.3s cubic-bezier)
- Animated number counters on KPI cards: count up from 0 → target on mount
- Animated donut charts: stroke-dasharray from 0 → target on mount (500ms delay)
- Grain overlay texture: fixed position, pointer-events none, CSS animation
- Mobile-responsive: flex/grid layouts that collapse gracefully
- Font loading: Google Fonts @import inside the injected style tag
- No Tailwind dependency — use inline styles with design token variables

---

## Output Requirements

Produce a complete, fully-styled, interactive React component. Presentation-ready for a 40-minute walkthrough with a panel of Invoca executives on a laptop in fullscreen browser.

Do not abbreviate or truncate any section. Build everything listed above.

---

## Presentation Flow Notes

The intended demo sequence is:

1. **Open dashboard** → walk the KPI row (shows extraction happened, confidence, routing completeness)
2. **Current State toggle** → show the "before" — manual entry, siloed data, no routing
3. **Flip to Future State** → reveal the full dashboard as the solution
4. **Routing Map** → click a CRITICAL card → open modal → show verbatim quote, structured fields, suggested action
5. **CSM View toggle** → show how this simplifies to actionable output for non-technical users
6. **Architecture Panel** → expand, walk the tech stack and prompt template
7. **Pipeline Flow** → explain the 7-step journey from transcript to confirmation
8. **Closed-Loop Confirmations** → show the CSM feedback loop closure
9. **Roadmap** → close with the 18-month vision

---

*Generated for the Invoca Applied AI Automation Analyst interview · Option 3: The Feedback Loop Architect*
