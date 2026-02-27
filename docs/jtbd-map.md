# 📋 Process Design & Strategy — Analyst Lens (Lens 1)
## JTBD Framework + Current State vs. Future State Workflow

---

## The Problem Statement

> *"CSMs hear critical feedback about pricing and bugs daily, but manual entry is inconsistent, creating an 'insight black hole' for Product leadership."*
> — Invoca Exercise Brief

The insight isn't missing. It exists — on every call, every day.
**The system is just not designed to catch it.**

---

## Jobs to Be Done — The Three Humans in This Loop

### Role 1: The CSM (Jordan Rivera)
*The Insight Generator*

| Dimension | Job |
|-----------|-----|
| **Functional** | Make customers successful. Retain and expand their contracts. |
| **Emotional** | Feel trusted, heard, and strategic — not like a data entry clerk. |
| **Social** | Be seen as the expert who understands the customer better than anyone in the building. |

**Current State Friction:**
- ⚠️ **Time Tax** — Manual CRM entry after calls competes with prep, follow-up, and the next call. Later always loses.
- ⚠️ **Judgment Erasure** — Freeform Salesforce notes lose nuance. The system can't distinguish "frustrated pricing mention" from "casual pricing question."
- ⚠️ **Signal Loss** — CSM enters insight into notes. No confirmation it was ever read by Product. The loop never closes.

---

### Role 2: The Product Manager
*The Insight Processor*

| Dimension | Job |
|-----------|-----|
| **Functional** | Prioritize the product roadmap with defensible, data-backed decisions. |
| **Emotional** | Feel confident in the data — in control of the signal, not flooded by noise. |
| **Social** | Be seen as data-driven and customer-obsessed. Make the right calls. |

**Current State Friction:**
- ⚠️ **Signal Loss** — High-value insights buried in unstructured text with no standardized classification.
- ⚠️ **Trust Deficit** — No way to know if a note reflects one customer's edge case or a systemic pattern across 50 accounts.
- ⚠️ **Accountability Gap** — No SLA on when insights get reviewed or acted on.

---

### Role 3: The Routing Recipient (Engineering / Sales Leadership)
*The Insight Receiver*

| Dimension | Job |
|-----------|-----|
| **Functional** | Act on high-priority signals quickly, with full context, before they become emergencies. |
| **Emotional** | Feel in control of their queue — not surprised by urgent issues they were never properly told about. |
| **Social** | Be seen as responsive and on top of their domain. Not the bottleneck. |

**Current State Friction:**
- ⚠️ **Accountability Gap** — No clear ownership when insight arrives informally. "Is this mine?"
- ⚠️ **Trust Deficit** — Inconsistent format means urgency is unclear. A Slack ping that says "FYI customer is upset" is not actionable.
- ⚠️ **Time Tax** — Has to follow up with CSM to get the full context they needed upfront.

---

## Current State — The Insight Black Hole

```
[CUSTOMER CALL]
      │  Insight is born — competitor mention, bug report,
      │  pricing friction, feature request — all captured in real time
      ▼
[CSM WORKING MEMORY]
      │  ⚠️ Held in memory during the call
      │  Competes with active listening and relationship management
      ▼
[POST-CALL ENTRY]
      │  ⚠️ TIME TAX
      │  Manual CRM entry competes with next call, email, Slack
      │  "Later" almost always loses to "now"
      ▼
[SALESFORCE NOTES — FREEFORM TEXT]
      │  ⚠️ JUDGMENT ERASURE + SIGNAL LOSS
      │  No schema, no urgency signal, no classification
      │  "Customer mentioned pricing" tells PM nothing actionable
      ▼
[NO ROUTING LOGIC]
      │  ❌ ACCOUNTABILITY GAP
      │  Insight sits. No named owner. No SLA. No acknowledgment.
      ▼
[PM MANUAL REVIEW — MAYBE]
      │  ❌ TRUST DEFICIT
      │  Weekly, if remembered, if the right notes surface
      │  Pattern never identified across accounts
      ▼
[INSIGHT DEATH]
         ❌ Wrong thing gets built.
         ❌ Renewal conversation misses the real issue.
         ❌ CSM blamed for a churn they flagged six weeks ago.
```

---

## Future State — The Closed Loop

```
[CUSTOMER CALL]
      │  Insight is born — same as before
      ▼
[TRANSCRIPT INGESTION]
      │  ✅ Automatic — no CSM action required
      │  Supports: call recording export, manual transcript upload,
      │  or direct Invoca conversation intelligence stream (future state)
      ▼
[ENTITY EXTRACTION — AI LAYER]
      │  ✅ Extracts: competitor mentions · feature requests ·
      │     bug reports · pricing friction · churn signals ·
      │     positive signals · general feedback
      │  Source attribution preserved: CSM name + verbatim quote
      ▼
[CONFIDENCE SCORING]
      │  ✅ Every insight scored 0.0 – 1.0
      │     ≥ 0.75 → auto-route
      │     < 0.75 → Human Review Queue (PM triages)
      ▼
[CLASSIFICATION + INTELLIGENT ROUTING]
      │  ✅ Bug Report        → 🔧 Engineering (SLA: 24hrs / 4hrs if CRITICAL)
      │  ✅ Competitor Mention → 💼 Sales Leadership (SLA: 48hrs)
      │  ✅ Feature Request   → 📋 Product Management (SLA: 1 week)
      │  ✅ Pricing Friction  → 💼 Sales Leadership + PM (SLA: 48hrs)
      │  ✅ Churn Signal      → 🤝 CS Leadership (SLA: 4hrs — immediate)
      ▼
[STRUCTURED ALERT DELIVERED]
      │  ✅ Consistent format every time:
      │     TYPE · ACCOUNT · ARR · RENEWAL DATE
      │     SUMMARY (2 sentences) · VERBATIM QUOTE
      │     CONFIDENCE SCORE · ACTION REQUIRED · SUGGESTED ACTION
      ▼
[CSM CLOSED-LOOP CONFIRMATION]
      │  ✅ "Your bug report from Acme Financial routed to Engineering.
      │     SLA: 4 hours. Confidence: 97%."
      │  CSM knows their input landed. Adoption follows confirmation.
      ▼
[PATTERN AGGREGATION — WEEKLY DIGEST]
      │  ✅ "Pricing friction mentioned by 7 accounts in the past 30 days"
      │  Turns one-off signals into defensible roadmap data
      ▼
[LOOP CONFIRMED CLOSED]
         ✅ Recipient acknowledges.
         ✅ CSM sees it.
         ✅ PM acts with data, not anecdotes.
         ✅ The insight that was born on the call
            actually reaches the person who can do something about it.
```

---

## The Design Principle Behind Every Decision

> **Map the human first. Then build the system. In that order.**

Every friction point in the current state maps to a specific design decision in the future state:

| Friction | Design Decision That Resolves It |
|---------|----------------------------------|
| CSM Time Tax | Auto-extraction — no manual entry required |
| Judgment Erasure | Source attribution in every alert — CSM name + verbatim quote |
| Signal Loss (CSM) | Closed-loop confirmation — CSM sees routing status |
| PM Trust Deficit | Confidence scores on every insight — PM controls the threshold |
| PM Accountability Gap | Weekly pattern aggregation digest |
| Recipient Accountability Gap | Structured alert format — consistent every time |
| Recipient Trust Deficit | Action Required flag + suggested next step in every alert |

No orphaned frictions. Every problem has a named solution.

---

*Lens 1: Process Design & Strategy | JTBD Feedback Loop Framework v1.0*
*Erwin M. McDonald | Invoca Applied AI Analyst Presentation*
