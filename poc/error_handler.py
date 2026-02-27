"""
error_handler.py — Error Handling & Validation
================================================
JTBD Feedback Loop Architect | Invoca Applied AI Analyst POC
Author: Erwin M. McDonald

Handles all failure modes in the extraction pipeline:
    1. JSON parsing failures   — model returned malformed output
    2. Schema validation errors — output parsed but fields are wrong
    3. Confidence filtering     — valid output but below threshold
    4. Empty extraction         — no insights found (not an error, but needs handling)
    5. API errors               — rate limits, timeouts, network failures

Design Decision: Every failure mode has a named handler, not a generic try/except.
Reason: During the Q&A, being able to say "here's exactly what happens when X fails"
        is the difference between a candidate who built it and one who demoed it.
"""

import json
import logging
from dataclasses import asdict
from typing import Optional

from schema import (
    ExtractedInsight, ExtractionResult, CallMetadata,
    InsightType, SentimentLabel, RoutingDestination, UrgencyLevel,
    CONFIDENCE_THRESHOLD
)

# ─────────────────────────────────────────────────────────────
# LOGGING SETUP
# ─────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger("jtbd.error_handler")


# ─────────────────────────────────────────────────────────────
# VALIDATION
# ─────────────────────────────────────────────────────────────

class ExtractionValidationError(Exception):
    """Raised when extracted JSON fails schema validation."""
    pass


class ConfidenceBelowThresholdError(Exception):
    """Raised when all extracted insights fall below confidence threshold."""
    pass


def validate_insight_dict(raw: dict, index: int) -> ExtractedInsight:
    """
    Validates a single raw insight dict from the model output.
    Converts to typed ExtractedInsight dataclass.
    Raises ExtractionValidationError with specific field info on failure.
    """
    required_fields = [
        "insight_type", "summary", "sentiment", "urgency",
        "confidence_score", "action_required"
    ]

    for field in required_fields:
        if field not in raw:
            raise ExtractionValidationError(
                f"Insight[{index}] missing required field: '{field}'"
            )

    # Validate enum values
    try:
        insight_type = InsightType(raw["insight_type"])
    except ValueError:
        raise ExtractionValidationError(
            f"Insight[{index}] invalid insight_type: '{raw['insight_type']}'. "
            f"Must be one of: {[e.value for e in InsightType]}"
        )

    try:
        sentiment = SentimentLabel(raw["sentiment"])
    except ValueError:
        raise ExtractionValidationError(
            f"Insight[{index}] invalid sentiment: '{raw['sentiment']}'"
        )

    try:
        urgency = UrgencyLevel(raw["urgency"])
    except ValueError:
        raise ExtractionValidationError(
            f"Insight[{index}] invalid urgency: '{raw['urgency']}'"
        )

    # Validate confidence score range
    score = raw["confidence_score"]
    if not isinstance(score, (int, float)) or not (0.0 <= score <= 1.0):
        raise ExtractionValidationError(
            f"Insight[{index}] confidence_score must be float 0.0-1.0, got: {score}"
        )

    # Determine routing target from insight type
    from schema import ROUTING_RULES
    routing_rules = ROUTING_RULES.get(insight_type, {})
    routing_target = routing_rules.get("primary", RoutingDestination.HUMAN_REVIEW)

    # Override to human review if below confidence threshold
    if score < CONFIDENCE_THRESHOLD:
        routing_target = RoutingDestination.HUMAN_REVIEW
        logger.info(
            f"Insight[{index}] routed to Human Review — "
            f"confidence {score:.2f} below threshold {CONFIDENCE_THRESHOLD}"
        )

    return ExtractedInsight(
        insight_type=insight_type,
        summary=raw.get("summary", ""),
        verbatim_quote=raw.get("verbatim_quote"),
        sentiment=sentiment,
        urgency=urgency,
        confidence_score=score,
        routing_target=routing_target,
        competitor_named=raw.get("competitor_named"),
        feature_requested=raw.get("feature_requested"),
        bug_description=raw.get("bug_description"),
        action_required=bool(raw.get("action_required", False)),
        suggested_action=raw.get("suggested_action"),
    )


def parse_and_validate(raw_response: str) -> tuple[list[ExtractedInsight], Optional[str]]:
    """
    Full parse + validate pipeline for a raw model response.

    Returns:
        (validated_insights, processing_note)

    Raises:
        json.JSONDecodeError  — if response is not valid JSON
        ExtractionValidationError — if JSON is valid but schema is wrong
    """
    # Strip any accidental markdown fences
    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.strip()
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3].strip()

    parsed = json.loads(cleaned)

    if "insights" not in parsed:
        raise ExtractionValidationError(
            "Response JSON missing top-level 'insights' array"
        )

    validated = []
    for i, raw_insight in enumerate(parsed["insights"]):
        insight = validate_insight_dict(raw_insight, i)
        validated.append(insight)

    processing_note = parsed.get("processing_note")
    return validated, processing_note


# ─────────────────────────────────────────────────────────────
# FAILURE HANDLERS
# ─────────────────────────────────────────────────────────────

def handle_json_parse_failure(raw_response: str, attempt: int) -> str:
    """
    Called when raw model output cannot be parsed as JSON.
    Logs the failure and returns a sanitized snippet for the fallback prompt.
    """
    logger.warning(
        f"JSON parse failure on attempt {attempt}. "
        f"First 200 chars of response: {raw_response[:200]!r}"
    )
    return raw_response


def handle_validation_failure(error: ExtractionValidationError, attempt: int) -> None:
    """
    Called when JSON is valid but fails schema validation.
    """
    logger.warning(
        f"Schema validation failure on attempt {attempt}: {error}"
    )


def handle_empty_extraction(metadata: CallMetadata) -> ExtractionResult:
    """
    Called when the model returns a valid response with an empty insights array.
    This is NOT an error — it means the transcript had no extractable insights.
    Returns a clean ExtractionResult with empty insights and a note.
    """
    logger.info(
        f"Empty extraction for account '{metadata.account_name}' "
        f"— transcript contained no actionable insights"
    )
    return ExtractionResult(
        metadata=metadata,
        insights=[],
        total_insights=0,
        high_confidence=0,
        routed_to_review=0,
        processing_note="No extractable insights found in this transcript."
    )


def handle_api_error(error: Exception, transcript_id: str) -> None:
    """
    Called when the Anthropic API returns an error.
    Logs with full context for debugging.
    """
    logger.error(
        f"API error for transcript '{transcript_id}': "
        f"{type(error).__name__}: {error}"
    )


def build_extraction_result(
    metadata: CallMetadata,
    insights: list[ExtractedInsight],
    processing_note: Optional[str]
) -> ExtractionResult:
    """
    Assembles the final ExtractionResult with diagnostic counts.
    """
    high_confidence = sum(
        1 for i in insights
        if i.confidence_score >= CONFIDENCE_THRESHOLD
        and i.routing_target != RoutingDestination.HUMAN_REVIEW
    )
    routed_to_review = sum(
        1 for i in insights
        if i.routing_target == RoutingDestination.HUMAN_REVIEW
    )

    return ExtractionResult(
        metadata=metadata,
        insights=insights,
        total_insights=len(insights),
        high_confidence=high_confidence,
        routed_to_review=routed_to_review,
        processing_note=processing_note
    )
