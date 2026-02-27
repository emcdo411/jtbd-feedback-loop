"""
schema.py — Data Structure Definitions
=======================================
JTBD Feedback Loop Architect | Invoca Applied AI Analyst POC
Author: Erwin M. McDonald

Every insight extracted from a call transcript conforms to this schema.
The schema is the contract between the extraction engine and the routing layer.
Strict typing enforces consistency across all stakeholder outputs.

Design Decision: Pydantic-style dataclasses over raw dicts.
Reason: Makes prompt output validation explicit and self-documenting.
        When the model returns unexpected structure, we catch it here —
        not silently downstream.
"""

from dataclasses import dataclass, field
from typing import Optional
from enum import Enum


# ─────────────────────────────────────────────────────────────
# ENUMS — Controlled Vocabularies
# ─────────────────────────────────────────────────────────────

class InsightType(str, Enum):
    """
    The classification taxonomy for extracted insights.
    Every insight must be one of these types — no free-text classification.

    Design Decision: Hard enum over open string.
    Reason: Prevents routing ambiguity. "pricing issue" vs "Pricing Friction"
            are the same thing but route differently if uncontrolled.
    """
    COMPETITOR_MENTION  = "competitor_mention"
    FEATURE_REQUEST     = "feature_request"
    BUG_REPORT          = "bug_report"
    PRICING_FRICTION    = "pricing_friction"
    CHURN_SIGNAL        = "churn_signal"
    POSITIVE_SIGNAL     = "positive_signal"
    GENERAL_FEEDBACK    = "general_feedback"


class SentimentLabel(str, Enum):
    POSITIVE = "positive"
    NEUTRAL  = "neutral"
    NEGATIVE = "negative"
    CRITICAL = "critical"    # Negative + urgency signal present


class RoutingDestination(str, Enum):
    """
    Named stakeholder routing targets.
    Each maps to a real team at Invoca.
    """
    PRODUCT_MANAGEMENT  = "Product Management"
    ENGINEERING         = "Engineering"
    SALES_LEADERSHIP    = "Sales Leadership"
    CUSTOMER_SUCCESS    = "Customer Success Leadership"
    HUMAN_REVIEW        = "Human Review Queue"      # Low confidence → human triage


class UrgencyLevel(str, Enum):
    LOW      = "low"
    MEDIUM   = "medium"
    HIGH     = "high"
    CRITICAL = "critical"    # Churn signal present → immediate escalation


# ─────────────────────────────────────────────────────────────
# CORE DATA STRUCTURES
# ─────────────────────────────────────────────────────────────

@dataclass
class ExtractedInsight:
    """
    A single structured insight extracted from a call transcript.

    Every field is required except verbatim_quote (may not always be isolatable).
    confidence_score is the most important field for routing decisions.

    Confidence Score Scale:
        0.90 - 1.00 : High — auto-route, no human review
        0.75 - 0.89 : Confident — auto-route with flag
        0.60 - 0.74 : Uncertain — route to Human Review Queue
        0.00 - 0.59 : Low — discard or flag for CSM follow-up
    """
    insight_type:       InsightType
    summary:            str             # 1-2 sentence structured summary
    verbatim_quote:     Optional[str]   # Exact words from transcript if isolatable
    sentiment:          SentimentLabel
    urgency:            UrgencyLevel
    confidence_score:   float           # 0.0 - 1.0
    routing_target:     RoutingDestination
    competitor_named:   Optional[str]   # Populated only for COMPETITOR_MENTION
    feature_requested:  Optional[str]   # Populated only for FEATURE_REQUEST
    bug_description:    Optional[str]   # Populated only for BUG_REPORT
    action_required:    bool            # True = recipient must respond
    suggested_action:   Optional[str]   # What the recipient should do


@dataclass
class CallMetadata:
    """
    Context envelope around the transcript.
    Source attribution — ensures CSM credit is preserved.

    Design Decision: Metadata is separate from insights.
    Reason: The metadata travels with every routed insight, ensuring
            the CSM is visible as the source — not erased by automation.
    """
    csm_name:       str
    account_name:   str
    account_arr:    Optional[str]       # Annual Recurring Revenue if known
    renewal_date:   Optional[str]       # Renewal date if known
    call_date:      str
    call_duration:  Optional[str]
    transcript_id:  str


@dataclass
class ExtractionResult:
    """
    The full output of one transcript processing run.
    Contains metadata + all extracted insights + processing diagnostics.
    """
    metadata:           CallMetadata
    insights:           list[ExtractedInsight]
    total_insights:     int
    high_confidence:    int             # Count of insights >= 0.75
    routed_to_review:   int             # Count of insights < 0.75
    processing_note:    Optional[str]   # Any anomalies or edge cases flagged


@dataclass
class RoutedAlert:
    """
    The final structured alert delivered to a stakeholder.
    This is what Engineering, Product, and Sales Leadership actually receive.

    Design Decision: RoutedAlert wraps ExtractedInsight + CallMetadata.
    Reason: Recipient should never need to look up context.
            Everything needed to act is in the alert itself.
    """
    destination:        RoutingDestination
    urgency:            UrgencyLevel
    insight:            ExtractedInsight
    metadata:           CallMetadata
    alert_id:           str             # Unique ID for closed-loop confirmation
    requires_response:  bool
    response_sla:       str             # e.g., "24 hours", "48 hours", "1 week"


# ─────────────────────────────────────────────────────────────
# ROUTING RULES TABLE
# Maps InsightType → RoutingDestination + SLA
# ─────────────────────────────────────────────────────────────

ROUTING_RULES: dict[InsightType, dict] = {
    InsightType.COMPETITOR_MENTION: {
        "primary":   RoutingDestination.SALES_LEADERSHIP,
        "secondary": RoutingDestination.PRODUCT_MANAGEMENT,
        "sla":       "48 hours",
    },
    InsightType.FEATURE_REQUEST: {
        "primary":   RoutingDestination.PRODUCT_MANAGEMENT,
        "secondary": None,
        "sla":       "1 week",
    },
    InsightType.BUG_REPORT: {
        "primary":   RoutingDestination.ENGINEERING,
        "secondary": RoutingDestination.PRODUCT_MANAGEMENT,
        "sla":       "24 hours",
    },
    InsightType.PRICING_FRICTION: {
        "primary":   RoutingDestination.SALES_LEADERSHIP,
        "secondary": RoutingDestination.PRODUCT_MANAGEMENT,
        "sla":       "48 hours",
    },
    InsightType.CHURN_SIGNAL: {
        "primary":   RoutingDestination.CUSTOMER_SUCCESS,
        "secondary": RoutingDestination.SALES_LEADERSHIP,
        "sla":       "24 hours",      # Escalate immediately
    },
    InsightType.POSITIVE_SIGNAL: {
        "primary":   RoutingDestination.PRODUCT_MANAGEMENT,
        "secondary": None,
        "sla":       "1 week",
    },
    InsightType.GENERAL_FEEDBACK: {
        "primary":   RoutingDestination.PRODUCT_MANAGEMENT,
        "secondary": None,
        "sla":       "1 week",
    },
}

# Urgency override: if urgency is CRITICAL, SLA collapses to 4 hours
CRITICAL_SLA = "4 hours"

# Confidence threshold for auto-routing vs human review
CONFIDENCE_THRESHOLD = 0.75
