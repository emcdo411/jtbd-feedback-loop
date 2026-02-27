"""
router.py — Stakeholder Routing Engine
=======================================
JTBD Feedback Loop Architect | Invoca Applied AI Analyst POC
Author: Erwin M. McDonald

Takes validated, confidence-scored insights and routes them to the
correct stakeholder with a fully structured alert.

Routing Logic:
    1. Insight type → primary destination (from ROUTING_RULES in schema.py)
    2. Confidence score < 0.75 → override to Human Review Queue
    3. Urgency = CRITICAL → collapse SLA to 4 hours regardless of type
    4. Every alert gets a unique ID for closed-loop confirmation tracking

Design Decision: Routing is data-driven, not conditional branching.
Reason: When routing rules change (new team, new SLA), you update
        ROUTING_RULES in schema.py — not a chain of if/elif blocks.
        This makes the routing logic auditable and testable independently.
"""

import uuid
import json
import logging
from datetime import datetime
from typing import Optional

from schema import (
    ExtractedInsight, ExtractionResult, RoutedAlert,
    CallMetadata, RoutingDestination, UrgencyLevel,
    ROUTING_RULES, CONFIDENCE_THRESHOLD, CRITICAL_SLA
)

logger = logging.getLogger("jtbd.router")


# ─────────────────────────────────────────────────────────────
# CORE ROUTING FUNCTION
# ─────────────────────────────────────────────────────────────

def route_insight(
    insight: ExtractedInsight,
    metadata: CallMetadata
) -> RoutedAlert:
    """
    Routes a single validated insight to its destination stakeholder.
    Returns a fully populated RoutedAlert ready for delivery.
    """
    # Determine SLA
    if insight.urgency == UrgencyLevel.CRITICAL:
        sla = CRITICAL_SLA
        logger.info(
            f"CRITICAL urgency detected for '{insight.insight_type.value}' — "
            f"SLA collapsed to {CRITICAL_SLA}"
        )
    else:
        rules = ROUTING_RULES.get(insight.insight_type, {})
        sla = rules.get("sla", "1 week")

    # Generate unique alert ID for closed-loop tracking
    alert_id = f"JTBD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

    routed_alert = RoutedAlert(
        destination=insight.routing_target,
        urgency=insight.urgency,
        insight=insight,
        metadata=metadata,
        alert_id=alert_id,
        requires_response=insight.action_required,
        response_sla=sla
    )

    logger.info(
        f"[{alert_id}] Routed {insight.insight_type.value} → "
        f"{insight.routing_target.value} | "
        f"Confidence: {insight.confidence_score:.2f} | "
        f"Urgency: {insight.urgency.value} | "
        f"SLA: {sla}"
    )

    return routed_alert


def route_all(result: ExtractionResult) -> list[RoutedAlert]:
    """
    Routes all insights from an ExtractionResult.
    Returns list of RoutedAlerts sorted by urgency (CRITICAL first).
    """
    alerts = []
    for insight in result.insights:
        alert = route_insight(insight, result.metadata)
        alerts.append(alert)

    # Sort: CRITICAL → HIGH → MEDIUM → LOW
    urgency_order = {
        UrgencyLevel.CRITICAL: 0,
        UrgencyLevel.HIGH:     1,
        UrgencyLevel.MEDIUM:   2,
        UrgencyLevel.LOW:      3
    }
    alerts.sort(key=lambda a: urgency_order.get(a.urgency, 99))

    return alerts


# ─────────────────────────────────────────────────────────────
# ALERT FORMATTERS
# ─────────────────────────────────────────────────────────────

def format_alert_terminal(alert: RoutedAlert) -> str:
    """
    Formats a RoutedAlert for terminal display during the live demo.
    Designed to be readable at a glance by a non-technical panel member.
    """
    urgency_icons = {
        UrgencyLevel.CRITICAL: "🔴 CRITICAL",
        UrgencyLevel.HIGH:     "🟠 HIGH",
        UrgencyLevel.MEDIUM:   "🟡 MEDIUM",
        UrgencyLevel.LOW:      "🟢 LOW",
    }

    dest_icons = {
        RoutingDestination.PRODUCT_MANAGEMENT:  "📋 Product Management",
        RoutingDestination.ENGINEERING:         "🔧 Engineering",
        RoutingDestination.SALES_LEADERSHIP:    "💼 Sales Leadership",
        RoutingDestination.CUSTOMER_SUCCESS:    "🤝 Customer Success Leadership",
        RoutingDestination.HUMAN_REVIEW:        "👤 Human Review Queue",
    }

    action_flag = "⚡ ACTION REQUIRED" if alert.requires_response else "ℹ️  FYI"

    lines = [
        "",
        "═" * 65,
        f"  ALERT ID:    {alert.alert_id}",
        f"  DESTINATION: {dest_icons.get(alert.destination, alert.destination.value)}",
        f"  URGENCY:     {urgency_icons.get(alert.urgency, alert.urgency.value)}",
        f"  TYPE:        {alert.insight.insight_type.value.upper().replace('_', ' ')}",
        f"  SLA:         Respond within {alert.response_sla}",
        f"  STATUS:      {action_flag}",
        "─" * 65,
        f"  ACCOUNT:     {alert.metadata.account_name}",
        f"  CSM:         {alert.metadata.csm_name}",
        f"  CALL DATE:   {alert.metadata.call_date}",
        "─" * 65,
        f"  SUMMARY:",
        f"  {alert.insight.summary}",
    ]

    if alert.insight.verbatim_quote:
        lines += [
            "─" * 65,
            f"  VERBATIM QUOTE:",
            f"  \"{alert.insight.verbatim_quote}\"",
        ]

    if alert.insight.competitor_named:
        lines.append(f"  COMPETITOR:  {alert.insight.competitor_named}")

    if alert.insight.feature_requested:
        lines.append(f"  FEATURE:     {alert.insight.feature_requested}")

    if alert.insight.bug_description:
        lines.append(f"  BUG:         {alert.insight.bug_description}")

    if alert.insight.suggested_action:
        lines += [
            "─" * 65,
            f"  SUGGESTED ACTION:",
            f"  {alert.insight.suggested_action}",
        ]

    lines += [
        f"  CONFIDENCE:  {alert.insight.confidence_score:.0%}",
        "═" * 65,
    ]

    return "\n".join(lines)


def format_csm_confirmation(alert: RoutedAlert) -> str:
    """
    The closed-loop confirmation sent back to the CSM.
    This is the 'your insight was heard' signal that drives adoption.

    Design Decision: CSM confirmation is a first-class output, not an afterthought.
    Reason: If CSMs don't know their input landed, they stop entering it.
            The confirmation is the adoption mechanism.
    """
    return (
        f"\n✅ INSIGHT CONFIRMED — {alert.alert_id}\n"
        f"   Your {alert.insight.insight_type.value.replace('_', ' ')} from "
        f"{alert.metadata.account_name} has been routed to "
        f"{alert.destination.value}.\n"
        f"   Response SLA: {alert.response_sla}\n"
        f"   Confidence: {alert.insight.confidence_score:.0%}\n"
    )


def format_alerts_as_json(alerts: list[RoutedAlert]) -> str:
    """
    Serializes all routed alerts to JSON for downstream system integration.
    Production use: post to Slack webhook, write to database, trigger email.
    """
    output = []
    for alert in alerts:
        output.append({
            "alert_id":         alert.alert_id,
            "destination":      alert.destination.value,
            "urgency":          alert.urgency.value,
            "response_sla":     alert.response_sla,
            "requires_response": alert.requires_response,
            "insight": {
                "type":             alert.insight.insight_type.value,
                "summary":          alert.insight.summary,
                "verbatim_quote":   alert.insight.verbatim_quote,
                "sentiment":        alert.insight.sentiment.value,
                "confidence_score": alert.insight.confidence_score,
                "suggested_action": alert.insight.suggested_action,
                "competitor_named":  alert.insight.competitor_named,
                "feature_requested": alert.insight.feature_requested,
                "bug_description":   alert.insight.bug_description,
            },
            "account": {
                "name":         alert.metadata.account_name,
                "csm":          alert.metadata.csm_name,
                "call_date":    alert.metadata.call_date,
                "arr":          alert.metadata.account_arr,
                "renewal_date": alert.metadata.renewal_date,
            }
        })
    return json.dumps(output, indent=2)


# ─────────────────────────────────────────────────────────────
# ROUTING SUMMARY
# ─────────────────────────────────────────────────────────────

def print_routing_summary(alerts: list[RoutedAlert]) -> None:
    """
    Prints a high-level routing summary for the demo.
    Shows the panel exactly where each insight went and why.
    """
    print("\n" + "═" * 65)
    print("  ROUTING SUMMARY")
    print("═" * 65)

    by_destination: dict[str, list] = {}
    for alert in alerts:
        dest = alert.destination.value
        if dest not in by_destination:
            by_destination[dest] = []
        by_destination[dest].append(alert)

    for dest, dest_alerts in sorted(by_destination.items()):
        print(f"\n  → {dest} ({len(dest_alerts)} insight{'s' if len(dest_alerts) > 1 else ''})")
        for a in dest_alerts:
            flag = "⚡" if a.requires_response else " "
            print(
                f"     {flag} [{a.urgency.value.upper():8}] "
                f"{a.insight.insight_type.value.replace('_', ' ').title()} "
                f"({a.insight.confidence_score:.0%} confidence)"
            )

    human_review = [a for a in alerts if a.destination == RoutingDestination.HUMAN_REVIEW]
    if human_review:
        print(f"\n  ⚠️  {len(human_review)} insight(s) routed to Human Review")
        print(f"     (confidence below {CONFIDENCE_THRESHOLD:.0%} threshold)")

    print("\n" + "═" * 65 + "\n")
