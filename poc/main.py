"""
main.py — JTBD Feedback Loop Extraction Engine
================================================
JTBD Feedback Loop Architect | Invoca Applied AI Analyst POC
Author: Erwin M. McDonald

Entry point for the POC. Orchestrates the full pipeline:
    1. Load transcript + metadata
    2. Call Anthropic API with extraction prompt
    3. Parse and validate structured output
    4. Fallback if primary extraction fails
    5. Route insights to stakeholders
    6. Display formatted alerts + CSM confirmations

USAGE:
    # Run with sample transcript (demo mode)
    python main.py

    # Run with a custom transcript file
    python main.py --transcript path/to/transcript.txt

    # Run in JSON output mode (for integration testing)
    python main.py --output json

    # Run without API key (mock mode for demo)
    python main.py --mock

REQUIREMENTS:
    pip install anthropic
    export ANTHROPIC_API_KEY=your_key_here
"""

import os
import sys
import json
import argparse
import logging
from datetime import datetime
from pathlib import Path

import anthropic

from schema import CallMetadata, CONFIDENCE_THRESHOLD
from prompts import (
    SYSTEM_PROMPT,
    build_extraction_prompt,
    build_fallback_prompt,
    PROMPT_VERSION
)
from error_handler import (
    parse_and_validate,
    handle_json_parse_failure,
    handle_validation_failure,
    handle_empty_extraction,
    handle_api_error,
    build_extraction_result,
    ExtractionValidationError
)
from router import (
    route_all,
    format_alert_terminal,
    format_csm_confirmation,
    format_alerts_as_json,
    print_routing_summary
)

# ─────────────────────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger("jtbd.main")


# ─────────────────────────────────────────────────────────────
# MOCK DATA — used when --mock flag is set (no API key needed)
# ─────────────────────────────────────────────────────────────

MOCK_API_RESPONSE = """{
  "insights": [
    {
      "insight_type": "bug_report",
      "summary": "Call attribution data has been inconsistent for 6 weeks, creating discrepancies between Invoca reporting and Google Ads dashboard. A support ticket has been open for 41 days without resolution, causing the paid search team to distrust attribution numbers.",
      "verbatim_quote": "We've flagged it twice to support and the ticket is still open. It's not a minor thing — we're making media spend decisions based on this data.",
      "sentiment": "critical",
      "urgency": "critical",
      "confidence_score": 0.97,
      "competitor_named": null,
      "feature_requested": null,
      "bug_description": "Call attribution data discrepancy between Invoca and Google Ads dashboard — 41-day open support ticket, paid search team has lost confidence in attribution numbers",
      "action_required": true,
      "suggested_action": "Escalate to Engineering as P1. Assign owner and provide ETA by end of week. CSM to confirm escalation to customer within 24 hours."
    },
    {
      "insight_type": "feature_request",
      "summary": "Customer is expanding into SMS and chat channels and wants unified omnichannel conversation intelligence — the same intent scoring and attribution Invoca provides for calls, extended across all customer interaction channels.",
      "verbatim_quote": "It would be really valuable if there was some kind of unified view — like, the same kind of intent scoring and attribution you do for calls but across all the channels where customers are reaching us.",
      "sentiment": "neutral",
      "urgency": "medium",
      "confidence_score": 0.91,
      "competitor_named": null,
      "feature_requested": "Unified omnichannel conversation intelligence — intent scoring and attribution across calls, SMS, and chat channels",
      "bug_description": null,
      "action_required": false,
      "suggested_action": "Route to Product Management for roadmap consideration. Document as strategic gap — customer has confirmed Marchex is pitching this capability."
    },
    {
      "insight_type": "competitor_mention",
      "summary": "Acme Financial had a demo with Marchex last month. Marchex pitched 'omnichannel conversation intelligence.' Customer's leadership is asking questions about alternatives. Customer stated they are not leaving but are being asked to evaluate.",
      "verbatim_quote": "We had a demo with Marchex last month. They were pitching something they called 'omnichannel conversation intelligence.' We're not going anywhere, but I want to be transparent that we're being asked to evaluate alternatives.",
      "sentiment": "negative",
      "urgency": "high",
      "confidence_score": 0.96,
      "competitor_named": "Marchex",
      "feature_requested": null,
      "bug_description": null,
      "action_required": true,
      "suggested_action": "Alert Sales Leadership immediately. Prepare competitive battlecard for Marchex omnichannel claim. Ensure renewal conversation addresses this directly."
    },
    {
      "insight_type": "pricing_friction",
      "summary": "Customer received an 18% renewal price increase while their own marketing budget was cut 15% this quarter. Customer stated they cannot get the increase through finance and will need pricing options before June renewal.",
      "verbatim_quote": "The price increase is 18%. I understand costs go up but our marketing budget got cut 15% this quarter. I'm going to have a hard time getting this through finance at that number.",
      "sentiment": "negative",
      "urgency": "high",
      "confidence_score": 0.98,
      "competitor_named": null,
      "feature_requested": null,
      "bug_description": null,
      "action_required": true,
      "suggested_action": "Escalate to Sales Leadership before formal renewal discussions. CSM to request pricing options from leadership within 1 week. Renewal at risk if not addressed."
    },
    {
      "insight_type": "positive_signal",
      "summary": "Inside sales team attributes a 23% improvement in qualified lead rate this quarter to Invoca call scoring. Customer VP explicitly credited the platform and described the outcome as 'huge.'",
      "verbatim_quote": "Our inside sales team actually credits Invoca with a 23% improvement in qualified lead rate this quarter, which is huge.",
      "sentiment": "positive",
      "urgency": "low",
      "confidence_score": 0.99,
      "competitor_named": null,
      "feature_requested": null,
      "bug_description": null,
      "action_required": false,
      "suggested_action": "Capture as customer success story. Use in renewal conversation to anchor value. Share with Marketing for case study consideration."
    },
    {
      "insight_type": "churn_signal",
      "summary": "Customer stated that if the attribution bug is not fixed and pricing is not addressed before June renewal, she does not know what the board will say — implying renewal is at risk.",
      "verbatim_quote": "The bug needs to get fixed and the pricing conversation needs to happen before June. Otherwise honestly I don't know what the board is going to say.",
      "sentiment": "critical",
      "urgency": "critical",
      "confidence_score": 0.93,
      "competitor_named": null,
      "feature_requested": null,
      "bug_description": null,
      "action_required": true,
      "suggested_action": "Flag account as renewal risk. Escalate to CS leadership and Sales VP. Two hard dependencies: (1) attribution bug resolved, (2) pricing options delivered before June renewal conversation."
    }
  ],
  "processing_note": "6 insights extracted. High confidence across all. Two CRITICAL urgency items (bug + churn signal) require same-day escalation. Account ARR $84k at risk — renewal June 30."
}"""


# ─────────────────────────────────────────────────────────────
# TRANSCRIPT LOADER
# ─────────────────────────────────────────────────────────────

def load_transcript(path: str) -> tuple[str, CallMetadata]:
    """
    Loads a transcript file and extracts metadata from the header block.
    Supports the standard transcript format used in sample_transcript.txt.
    """
    content = Path(path).read_text(encoding="utf-8")
    lines = content.split("\n")

    # Parse metadata from header
    meta = {}
    transcript_start = 0
    for i, line in enumerate(lines):
        if line.startswith("---"):
            transcript_start = i + 1
            break
        if ":" in line:
            key, _, value = line.partition(":")
            meta[key.strip().upper()] = value.strip()

    transcript_text = "\n".join(lines[transcript_start:]).strip()

    metadata = CallMetadata(
        csm_name=meta.get("CSM", "Unknown CSM"),
        account_name=meta.get("ACCOUNT", "Unknown Account"),
        account_arr=meta.get("ARR"),
        renewal_date=meta.get("RENEWAL DATE"),
        call_date=meta.get("CALL DATE", datetime.now().strftime("%B %d, %Y")),
        call_duration=meta.get("DURATION"),
        transcript_id=meta.get("TRANSCRIPT ID", f"TXN-{datetime.now().strftime('%Y%m%d')}-UNKNOWN")
    )

    return transcript_text, metadata


# ─────────────────────────────────────────────────────────────
# EXTRACTION ENGINE
# ─────────────────────────────────────────────────────────────

def extract_insights(
    transcript: str,
    metadata: CallMetadata,
    client: anthropic.Anthropic,
    mock: bool = False
) -> tuple[list, str | None]:
    """
    Calls the Anthropic API to extract structured insights from a transcript.
    Implements two-stage extraction with fallback on failure.

    Returns: (validated_insights, processing_note)
    """
    if mock:
        logger.info("MOCK MODE — using pre-loaded response (no API call)")
        raw_response = MOCK_API_RESPONSE
    else:
        prompt = build_extraction_prompt(
            transcript=transcript,
            csm_name=metadata.csm_name,
            account_name=metadata.account_name,
            call_date=metadata.call_date
        )

        logger.info(
            f"Calling Anthropic API | Model: claude-sonnet-4-6 | "
            f"Prompt version: {PROMPT_VERSION}"
        )

        try:
            message = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=4096,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}]
            )
            raw_response = message.content[0].text
            logger.info(
                f"API call successful | "
                f"Input tokens: {message.usage.input_tokens} | "
                f"Output tokens: {message.usage.output_tokens}"
            )
        except Exception as e:
            handle_api_error(e, metadata.transcript_id)
            raise

    # Stage 1: Primary parse + validate
    try:
        insights, processing_note = parse_and_validate(raw_response)
        logger.info(f"Primary extraction succeeded — {len(insights)} insights extracted")
        return insights, processing_note

    except json.JSONDecodeError:
        failed = handle_json_parse_failure(raw_response, attempt=1)
        logger.warning("Primary extraction failed — attempting fallback")

    except ExtractionValidationError as e:
        handle_validation_failure(e, attempt=1)
        failed = raw_response
        logger.warning("Primary validation failed — attempting fallback")

    # Stage 2: Fallback extraction
    fallback_prompt = build_fallback_prompt(transcript, failed)

    if mock:
        # In mock mode, fallback just returns empty
        logger.info("MOCK MODE — fallback not available, returning empty extraction")
        return [], "Fallback extraction — mock mode returned empty"

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": fallback_prompt}]
        )
        fallback_response = message.content[0].text
        insights, processing_note = parse_and_validate(fallback_response)
        logger.info(
            f"Fallback extraction succeeded — {len(insights)} insights extracted"
        )
        return insights, f"FALLBACK USED. {processing_note or ''}"

    except Exception as e:
        logger.error(f"Fallback extraction also failed: {e}")
        return [], f"Both extraction attempts failed: {e}"


# ─────────────────────────────────────────────────────────────
# MAIN PIPELINE
# ─────────────────────────────────────────────────────────────

def run_pipeline(
    transcript_path: str,
    output_format: str = "terminal",
    mock: bool = False
) -> None:
    """
    Full end-to-end pipeline run.
    """
    print("\n" + "═" * 65)
    print("  JTBD FEEDBACK LOOP — INSIGHT EXTRACTION ENGINE")
    print("  Invoca Applied AI Analyst POC | Erwin M. McDonald")
    print("═" * 65)

    # 1. Load transcript
    logger.info(f"Loading transcript: {transcript_path}")
    transcript, metadata = load_transcript(transcript_path)
    print(f"\n  📞 Processing: {metadata.account_name}")
    print(f"  👤 CSM:        {metadata.csm_name}")
    print(f"  📅 Date:       {metadata.call_date}")
    print(f"  🆔 ID:         {metadata.transcript_id}\n")

    # 2. Initialize Anthropic client
    if not mock:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            print("\n  ⚠️  ANTHROPIC_API_KEY not set. Run with --mock for demo mode.\n")
            sys.exit(1)
        client = anthropic.Anthropic(api_key=api_key)
    else:
        client = None
        print("  ⚡ Running in MOCK MODE — no API key required\n")

    # 3. Extract insights
    print("  🔍 Extracting insights from transcript...")
    insights, processing_note = extract_insights(
        transcript, metadata, client, mock=mock
    )

    # 4. Handle empty extraction
    if not insights:
        result = handle_empty_extraction(metadata)
        print("\n  ℹ️  No extractable insights found in this transcript.")
        return

    # 5. Build extraction result
    result = build_extraction_result(metadata, insights, processing_note)
    print(f"\n  ✅ Extracted {result.total_insights} insights")
    print(f"     Auto-routing:    {result.high_confidence} (confidence ≥ {CONFIDENCE_THRESHOLD:.0%})")
    print(f"     Human review:    {result.routed_to_review} (confidence < {CONFIDENCE_THRESHOLD:.0%})")
    if processing_note:
        print(f"\n  📝 Note: {processing_note}")

    # 6. Route insights
    print("\n  🚦 Routing insights to stakeholders...")
    alerts = route_all(result)

    # 7. Output
    if output_format == "json":
        print("\n" + format_alerts_as_json(alerts))
    else:
        # Terminal display
        print_routing_summary(alerts)

        print("  FULL ALERT DETAILS\n")
        for alert in alerts:
            print(format_alert_terminal(alert))

        # CSM confirmations
        print("\n" + "─" * 65)
        print("  CSM CLOSED-LOOP CONFIRMATIONS")
        print("─" * 65)
        seen_alerts: set[str] = set()
        for alert in alerts:
            if alert.alert_id not in seen_alerts:
                print(format_csm_confirmation(alert))
                seen_alerts.add(alert.alert_id)

    print("\n  Pipeline complete.\n")


# ─────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="JTBD Feedback Loop — Insight Extraction Engine"
    )
    parser.add_argument(
        "--transcript",
        default="sample_transcript.txt",
        help="Path to transcript file (default: sample_transcript.txt)"
    )
    parser.add_argument(
        "--output",
        choices=["terminal", "json"],
        default="terminal",
        help="Output format (default: terminal)"
    )
    parser.add_argument(
        "--mock",
        action="store_true",
        help="Run in mock mode without API key (uses pre-loaded response)"
    )

    args = parser.parse_args()
    run_pipeline(
        transcript_path=args.transcript,
        output_format=args.output,
        mock=args.mock
    )


if __name__ == "__main__":
    main()
