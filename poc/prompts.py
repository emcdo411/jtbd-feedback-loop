"""
prompts.py — Prompt Engineering Strategy
=========================================
JTBD Feedback Loop Architect | Invoca Applied AI Analyst POC
Author: Erwin M. McDonald

This file is the entire prompt engineering strategy made explicit.
Every design decision is documented inline.

Three prompt layers:
    1. SYSTEM_PROMPT     — Sets the model's persona and constraints
    2. EXTRACTION_PROMPT — Structured entity extraction with JSON schema enforcement
    3. FALLBACK_PROMPT   — Simplified extraction when full schema fails validation

Design Philosophy:
    - Prompts are code. They are versioned, documented, and testable.
    - The extraction schema is embedded in the prompt — not assumed.
    - The model is told what to do when it isn't sure (confidence scoring).
    - Output format is JSON — no prose, no markdown, no ambiguity.
"""


# ─────────────────────────────────────────────────────────────
# LAYER 1 — SYSTEM PROMPT
# Sets persona, constraints, and output contract
# ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are a precision insight extraction engine for a B2B SaaS company.

Your job is to analyze customer call transcripts and extract structured business insights
that help Product, Engineering, and Sales teams make better decisions.

PERSONA:
You think like a senior CSM who has been on thousands of enterprise software calls.
You know the difference between a customer venting and a customer about to churn.
You know the difference between casual competitor name-dropping and a real competitive threat.
You know when a "small bug" is actually blocking a workflow.

CORE RULES:
1. Extract ONLY what is explicitly present in the transcript. Do not infer beyond the evidence.
2. If you are not confident about a classification, lower the confidence_score — do not guess.
3. Every extracted insight must have a verbatim_quote if the transcript supports it.
4. Sentiment must reflect the CUSTOMER's sentiment, not the CSM's tone.
5. Urgency is determined by language signals: "cancel", "considering alternatives",
   "this is blocking us", "every time", "still not fixed" = HIGH or CRITICAL.
6. You must return valid JSON only. No prose. No markdown. No explanation outside the JSON.
7. If the transcript contains no extractable insights, return an empty insights array.

OUTPUT CONTRACT:
You must always return a JSON object matching exactly this structure:
{
  "insights": [
    {
      "insight_type": "<one of: competitor_mention | feature_request | bug_report | pricing_friction | churn_signal | positive_signal | general_feedback>",
      "summary": "<1-2 sentence structured summary of the insight>",
      "verbatim_quote": "<exact words from transcript, or null if not isolatable>",
      "sentiment": "<one of: positive | neutral | negative | critical>",
      "urgency": "<one of: low | medium | high | critical>",
      "confidence_score": <float between 0.0 and 1.0>,
      "competitor_named": "<competitor name if insight_type is competitor_mention, else null>",
      "feature_requested": "<feature description if insight_type is feature_request, else null>",
      "bug_description": "<bug description if insight_type is bug_report, else null>",
      "action_required": <true or false>,
      "suggested_action": "<what the receiving team should do, or null>"
    }
  ],
  "processing_note": "<any anomalies, ambiguities, or extraction edge cases, or null>"
}

CONFIDENCE SCORE CALIBRATION:
0.90 - 1.00 : The transcript explicitly and unambiguously contains this insight
0.75 - 0.89 : High confidence — clear signal with minor interpretive judgment
0.60 - 0.74 : Uncertain — present but could be interpreted differently
0.00 - 0.59 : Low — weak signal, likely noise, should not auto-route

When in doubt, score lower. A 0.65 that routes to human review is better than
a 0.85 that routes incorrectly.
"""


# ─────────────────────────────────────────────────────────────
# LAYER 2 — EXTRACTION PROMPT
# The main extraction call — includes full context injection
# ─────────────────────────────────────────────────────────────

def build_extraction_prompt(
    transcript: str,
    csm_name: str,
    account_name: str,
    call_date: str,
    additional_context: str = ""
) -> str:
    """
    Builds the full extraction prompt with call context injected.

    Design Decision: Context injection over generic extraction.
    Reason: Knowing the account name and CSM lets the model distinguish
            "they mentioned Gong" (competitive intel) from
            "they use Gong internally" (stack context, not competitive threat).

    Parameters:
        transcript         — Full call transcript text
        csm_name           — CSM on the call (for attribution)
        account_name       — Customer account name
        call_date          — Date of call (for time-sensitive urgency signals)
        additional_context — Any pre-call notes or account context (optional)
    """

    context_block = ""
    if additional_context:
        context_block = f"""
ADDITIONAL ACCOUNT CONTEXT (use to inform extraction, do not hallucinate from it):
{additional_context}
"""

    return f"""Analyze the following customer call transcript and extract all structured insights.

CALL CONTEXT:
  CSM: {csm_name}
  Account: {account_name}
  Call Date: {call_date}
{context_block}

EXTRACTION TARGETS — look specifically for:
  • Competitor mentions (named competitors, comparisons, "we looked at X")
  • Feature requests (things the customer wants that don't exist yet)
  • Bug reports (things that are broken, not working, or inconsistent)
  • Pricing friction (cost concerns, ROI questions, pricing model complaints)
  • Churn signals (cancellation language, dissatisfaction, switching intent)
  • Positive signals (praise, expansion intent, referral mentions)
  • General feedback (anything strategically relevant that doesn't fit above)

TRANSCRIPT:
---
{transcript}
---

Extract all insights now. Return valid JSON only."""


# ─────────────────────────────────────────────────────────────
# LAYER 3 — FALLBACK PROMPT
# Used when the primary extraction returns invalid JSON
# or fails schema validation.
# ─────────────────────────────────────────────────────────────

def build_fallback_prompt(transcript: str, failed_output: str) -> str:
    """
    Simplified extraction prompt used as fallback when primary fails.

    Design Decision: Two-stage fallback over hard failure.
    Reason: In a live system, a single JSON parsing failure should not
            kill the entire pipeline. The fallback simplifies the schema
            and asks the model to try again with explicit error context.

    This is the error handling strategy made visible to the panel.
    """
    return f"""Your previous extraction attempt returned output that could not be parsed as valid JSON.

Previous (invalid) output:
{failed_output[:500]}...

Please try again with a SIMPLIFIED extraction. Return ONLY this minimal JSON structure:
{{
  "insights": [
    {{
      "insight_type": "<type>",
      "summary": "<1 sentence summary>",
      "verbatim_quote": null,
      "sentiment": "<positive|neutral|negative|critical>",
      "urgency": "<low|medium|high|critical>",
      "confidence_score": <0.0-1.0>,
      "competitor_named": null,
      "feature_requested": null,
      "bug_description": null,
      "action_required": false,
      "suggested_action": null
    }}
  ],
  "processing_note": "Fallback extraction — simplified schema"
}}

TRANSCRIPT:
---
{transcript[:2000]}
---

Return valid JSON only. No other text."""


# ─────────────────────────────────────────────────────────────
# PROMPT VERSIONING
# Production systems need prompt version tracking.
# When a prompt changes, extraction behavior changes.
# ─────────────────────────────────────────────────────────────

PROMPT_VERSION = "1.0.0"
PROMPT_CHANGELOG = {
    "1.0.0": "Initial extraction prompt — Invoca POC demo version"
}
