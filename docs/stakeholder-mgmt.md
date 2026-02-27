# 🤝 Stakeholder Management — Human Lens (Lens 3)
## How Great Tech Still Fails — And How to Prevent It

> *"Great tech fails if humans don't adopt it."*
> — Invoca Exercise Brief

---

## The Core Principle

> **Great AI fails not because the technology is wrong — because the human system was never mapped.**

Most AI rollout failures are not technical failures. They are adoption failures caused by identity threat, status anxiety, and trust deficits that were never diagnosed before deployment.

The JTBD map in Lens 1 is not just a design exercise. It is the adoption strategy.

---

## The Three Resistance Patterns — And How This System Addresses Each

### CSM: "This is going to replace my judgment"

**The fear:** Automation will make the CSM invisible. Their expertise gets absorbed by a system, and they become a data entry endpoint rather than a strategic advisor.

**Why it's predictable:** Any system that extracts and routes what a CSM knows creates an implicit message — "we can get this without you." That message is wrong, but it's what the CSM hears unless the design explicitly contradicts it.

**How this system addresses it:**
- Every routed alert surfaces the CSM's name and verbatim quote. Engineering, Product, and Sales see *Jordan Rivera flagged this* — not "the system detected this."
- The CSM receives a closed-loop confirmation for every insight routed. They know their input landed. They can see it moved.
- The system reduces time on logging, not time on customer relationships. The distinction must be communicated explicitly at rollout.

**Rollout intervention:** Demo the confirmation flow first. Show a CSM their own name appearing in a routed alert to Engineering. That moment — seeing their expertise amplified rather than replaced — is the adoption trigger.

---

### Product Manager: "This is going to flood me with noise"

**The fear:** A new AI system creates a new queue. The PM is already prioritizing across Zendesk, Salesforce, and usage data. Another source of unfiltered input is a liability, not an asset.

**Why it's predictable:** PMs have been burned by "voice of the customer" initiatives that produced anecdotes with no signal-to-noise filtering. The default assumption is that automation makes the noise problem worse, not better.

**How this system addresses it:**
- Confidence scores are visible on every insight. The PM can filter by threshold.
- Below 0.75 confidence routes to the Human Review Queue — the PM controls what auto-routes and what requires their judgment.
- The pattern aggregation layer (Phase 2) surfaces frequency counts, not individual notes. "7 accounts mentioned pricing friction this month" is a prioritization input. "Customer mentioned pricing" is noise.

**Rollout intervention:** Give the PM control over the threshold before launch. A PM who sets their own confidence threshold owns the system. A PM who inherits one resists it. Co-design the routing rules with them — especially the Human Review Queue criteria.

---

### Engineering / Sales: "This is a new accountability I didn't sign up for"

**The fear:** Structured, traceable alerts mean there's a record of what they knew and when. Receiving a routed alert creates implied obligation. The informal Slack ping had deniability. This doesn't.

**Why it's predictable:** Any system that formalizes previously informal communication shifts accountability. The recipient team was accustomed to acting on things when convenient. Structured routing with SLAs changes that contract.

**How this system addresses it:**
- The alert format is designed to minimize friction to triage, not maximize information. The recipient can make a routing decision in 30 seconds from the structured alert alone — without a follow-up Slack to the CSM.
- "Action Required: Yes/No" is explicit in every alert. FYI alerts have no SLA burden.
- The SLA is communicated upfront in the alert itself — no ambiguity about what "respond" means.

**Rollout intervention:** Show the before/after. A Slack ping that says "FYI customer is upset" vs. a structured alert with account name, ARR, renewal date, verbatim quote, suggested action, and a clear Yes/No on whether a response is required. The recipient immediately understands this reduces their cognitive load, not increases it.

---

## The Rollout Sequence

**Phase 0 — Before Any Code Runs (Week 1-2)**
- Interview 2-3 CSMs. Not about the system — about their current workflow. Where does insight die today? What would make their job easier?
- Interview the PM. What does a useful signal look like? What does noise look like?
- Co-design the routing rules table with the PM. They set the threshold.

**Phase 1 — Shadow Mode (Week 3-4)**
- Run the system in parallel with existing process. Outputs are visible to the analyst only.
- Compare extractions against what CSMs actually logged. Calibrate confidence thresholds.
- No behavioral change required from any stakeholder yet.

**Phase 2 — Pilot with 2-3 CSMs (Week 5-8)**
- Enable closed-loop confirmations for pilot CSMs.
- Route only HIGH and CRITICAL urgency insights to recipients in this phase.
- Weekly check-in: what's landing well, what's missing nuance, what needs adjustment.

**Phase 3 — Full Deployment**
- Expand to all CSMs.
- Activate full routing including MEDIUM and LOW.
- PM reviews Human Review Queue weekly and adjusts threshold as signal quality improves.

---

## Building Trust in the System

Three things build trust faster than any accuracy metric:

**1. Transparency about confidence**
When the system says it's 97% confident, show the PM what that means. Show them a case where it scored 0.62 and sent to human review. The system knowing what it doesn't know is more trustworthy than a system that always claims certainty.

**2. Explicit failure mode documentation**
Tell the team: here's what happens when the model returns invalid output. Here's the fallback. Here's the human review queue. A system with documented failure modes is more trustworthy than one that presents itself as infallible.

**3. The CSM as the trust anchor**
CSMs have the highest-trust relationship with the customer. If the CSM trusts the system's extractions — if they look at the verbatim quote and say "yes, that's what she said" — every other stakeholder's confidence follows. The CSM confirmation isn't just an adoption mechanism. It's the quality signal the whole organization uses to trust the output.

---

## The One Line for the Panel

> *"I built the system so that the CSM's judgment is more visible after automation, not less. That's what makes people use it."*

---

*Lens 3: Stakeholder Management | JTBD Feedback Loop Framework v1.0*
*Erwin M. McDonald | Invoca Applied AI Analyst Presentation*
