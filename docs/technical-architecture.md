# 🔧 Technical Architecture — Builder Lens (Lens 2)
## Architecture Decisions, Prompt Engineering & Data Design

> *"Be prepared to discuss your prompt engineering strategy, error handling, and data structure choices."*
> — Invoca Exercise Brief

---

## Why Raw Python + Anthropic API

Three options were available: n8n, Zapier, raw code.

**Zapier** was eliminated immediately. Zapier signals a low technical ceiling — it's a point-and-click integration tool, not an architecture. The prompt asked for someone who can *build*, not configure.

**n8n** is a legitimate choice for agentic workflow visualization and would be the right tool for a production handoff to a non-technical team. It remains a viable Phase 2 deployment layer.

**Raw Python + Anthropic API** was chosen because:
1. It's authentic — it mirrors how I actually build
2. It makes every architectural decision explicit and inspectable
3. The prompt engineering strategy is readable as code, not hidden behind a GUI
4. It demonstrates infrastructure-layer thinking, not just tool integration

---

## Prompt Engineering Strategy

### Architecture: Three Layers

**Layer 1 — System Prompt** (`prompts.py`)
Sets the model's persona as a senior CSM analyst. The persona choice is deliberate — a generic "extract entities" instruction produces generic output. An experienced CSM knows the difference between a customer venting and a churn signal. The system prompt calibrates that judgment.

Key constraints in the system prompt:
- JSON only — no prose, no markdown, no explanation outside the schema
- Extract only what is explicitly present — no inference beyond evidence
- Confidence score calibration defined explicitly (0.90–1.00 / 0.75–0.89 / 0.60–0.74 / below)
- Sentiment reflects the customer's sentiment, not the CSM's tone

**Layer 2 — Extraction Prompt** (`build_extraction_prompt()`)
Injects full call context before extraction: CSM name, account name, call date, optional pre-call notes.

Why context injection matters: without account context, "they mentioned Marchex" could be a casual reference. With it, the model knows this is a QBR call for an $84K account renewing in June — which changes the urgency classification entirely.

**Layer 3 — Fallback Prompt** (`build_fallback_prompt()`)
Activated when primary extraction returns invalid JSON or fails schema validation. Simplifies the output schema to 10 fields (vs. 12 in primary). Shows the model exactly what failed in its previous attempt. Two-stage fallback is better than one attempt and a hard crash.

### Prompt Versioning
Every prompt carries a version string (`PROMPT_VERSION = "1.0.0"`). In production, extraction behavior changes when prompts change. Version tracking is the audit trail.

---

## Data Structure Decisions

### Why Enums Over Strings
```python
InsightType.BUG_REPORT        # not "bug report" or "Bug Report" or "bug_report"
RoutingDestination.ENGINEERING # not "engineering" or "Engineering team"
```
Enums enforce a controlled vocabulary. When the model returns `"bug_report"`, it either matches `InsightType.BUG_REPORT` or raises a `ValueError` — caught and handled. Uncontrolled strings create silent routing mismatches.

### Why Separate CallMetadata from ExtractedInsight
```python
@dataclass
class CallMetadata:
    csm_name: str
    account_name: str
    ...

@dataclass
class ExtractedInsight:
    insight_type: InsightType
    ...
```
Source attribution travels with every routed alert. Engineering, Product, and Sales all see the CSM's name and the verbatim quote. The CSM is more visible through automation, not erased by it. This is the design decision that drives adoption.

### Why a Routing Rules Table
```python
ROUTING_RULES: dict[InsightType, dict] = {
    InsightType.BUG_REPORT: {
        "primary": RoutingDestination.ENGINEERING,
        "sla":     "24 hours",
    },
    ...
}
```
When Invoca adds a new team or changes an SLA, one line changes in `schema.py`. Not a chain of if/elif conditionals scattered across the codebase. Routing logic is auditable, testable, and separated from business logic.

### Why Confidence Scores Are First-Class
The confidence threshold (0.75) is a named constant in `schema.py`:
```python
CONFIDENCE_THRESHOLD = 0.75
```
Below this threshold, routing destination overrides to `RoutingDestination.HUMAN_REVIEW` regardless of insight type. The PM controls this threshold. Giving the PM that control is the adoption mechanism — they trust a system they can tune.

---

## Error Handling Strategy

Five named failure modes. Each has a specific handler. No generic `except Exception: pass`.

```
JSON parse failure      → handle_json_parse_failure() → log → trigger fallback
Schema validation error → handle_validation_failure() → log field name → trigger fallback
Confidence < threshold  → routing override → Human Review Queue
Empty extraction        → handle_empty_extraction() → clean result, no crash
API error               → handle_api_error() → log with transcript ID → raise
```

The two-stage fallback means the pipeline degrades gracefully:
- Stage 1: Full schema extraction (12 fields)
- Stage 2: Simplified schema (10 fields, nulls allowed)
- Stage 3: Empty result with processing note

A production deployment would add: dead letter queue for failed transcripts, retry with exponential backoff on API rate limits, alerting on fallback rate exceeding a threshold.

---

## MVP Scope Decisions

**What's in the MVP:**
- Single transcript ingestion (file-based)
- Six insight types with full routing logic
- Confidence scoring with human review queue
- Structured terminal output + JSON output mode
- Mock mode for demo without API key

**What's explicitly out of MVP (and why):**
- Zendesk / Salesforce write-back: requires OAuth integration — adds 2 weeks, not core to demonstrating the extraction logic
- Pattern aggregation layer: requires database + time-series logic — Phase 2
- Slack/email webhook delivery: 30 lines of code to add, saved for Q&A
- Real-time streaming: batch processing is the right MVP choice — simpler, more debuggable

---

## Production Evolution Path

```
MVP (This POC)              Phase 2                    Phase 3
──────────────────────      ─────────────────────────  ──────────────────────────
File-based ingestion     →  API endpoint              →  Native Invoca stream
Single extraction agent  →  Multi-agent pipeline      →  Specialized sub-agents
Terminal output          →  Slack/email webhooks      →  Embedded in Salesforce
Manual threshold         →  PM-controlled dashboard   →  Self-tuning threshold
Batch processing         →  Real-time                 →  Live call analytics
```

---

*Lens 2: Technical Architecture | JTBD Feedback Loop POC*
*Erwin M. McDonald | Invoca Applied AI Analyst Presentation*
