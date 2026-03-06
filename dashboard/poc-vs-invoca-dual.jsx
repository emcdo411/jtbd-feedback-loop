import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const ROWS = [
  {
    id: "endpoint",
    layer: "API Endpoint",
    icon: "🔌",
    poc: {
      headline: "POST /v1/messages",
      sub: "api.anthropic.com",
      badge: "Anthropic SDK",
      detail:
        "Single endpoint. One POST call extracts ALL insights from a transcript as a typed JSON array — no per-signal calls, no orchestration overhead. The model receives the full transcript and returns every insight simultaneously.",
      code: `client.messages.create(\n  model="claude-sonnet-4-6",\n  system=SYSTEM_PROMPT_v1,\n  messages=[{\"role\":\"user\",\n    \"content\": transcript}]\n)`,
    },
    invoca: {
      headline: "POST /signals",
      sub: "Invoca Platform API",
      badge: "Platform API",
      detail:
        "Signal API handles per-transaction signal responses. Each signal has its own definition and accuracy threshold managed in Signal AI Studio. Purpose-built for marketing attribution, not general-purpose insight extraction.",
      code: `POST /signals\nAuthorization: Bearer {api_key}\n{\n  \"account_id\": \"...\",\n  \"signal_name\": \"PricingObjection\",\n  \"call_id\": \"txn-...\"\n}`,
    },
    verdict: "STRONG ALIGN",
    verdictColor: "#00C4B4",
    note: "Same REST paradigm — both POST structured input, receive structured output. Yours is general-purpose. Theirs is attribution-specific. The architectural concept is identical.",
  },
  {
    id: "model",
    layer: "AI Model",
    icon: "🧠",
    poc: {
      headline: "claude-sonnet-4-6",
      sub: "Anthropic Messages API",
      badge: "You Control It",
      detail:
        "Sonnet-class model: high intelligence, production latency. You specify the exact model string — explicit version control. You own the model choice, the prompt, and the schema. Nothing is abstracted away.",
      code: `model="claude-sonnet-4-6"\n\n# React POC:\nmodel="claude-sonnet-4-20250514"\n\n# Same family. You pick the version.\n# Full control at the call site.`,
    },
    invoca: {
      headline: "Proprietary ML + LLM",
      sub: "Databricks-trained",
      badge: "Managed Black Box",
      detail:
        "Brand-specific supervised ML models trained on Databricks, enhanced with an LLM layer. Model is managed entirely by Invoca — not user-configurable. Accuracy scores are surfaced in the Studio UI but model internals are not exposed.",
      code: `# No model selection available.\n# Invoca trains and manages\n# proprietary models per account.\n\n# You get accuracy scores.\n# You don't get model control.`,
    },
    verdict: "STRONG ALIGN",
    verdictColor: "#00C4B4",
    note: "Both use LLM-class AI for extraction. Critical difference: you control model version and prompt. Invoca's model is managed for you — accessibility over precision. That's intentional on their side.",
  },
  {
    id: "schema",
    layer: "Output Schema",
    icon: "📐",
    poc: {
      headline: "SYSTEM_PROMPT_v1.0.0",
      sub: "Named constant · versioned",
      badge: "Hard Enum Types",
      detail:
        "Schema enforced entirely in the system prompt as a named constant — not an inline string. Seven enumerated InsightType values. The model cannot return a type outside this set. Schema drift is impossible without a version bump. Treated like code, not config.",
      code: `class InsightType(Enum):\n  BUG_REPORT    = "BUG_REPORT"\n  COMPETITOR    = "COMPETITOR_MENTION"\n  FEATURE_REQ   = "FEATURE_REQUEST"\n  PRICING       = "PRICING_FRICTION"\n  CHURN         = "CHURN_SIGNAL"\n  POSITIVE      = "POSITIVE_SIGNAL"\n  FEEDBACK      = "GENERAL_FEEDBACK"`,
    },
    invoca: {
      headline: "Signal AI Studio",
      sub: "No-code signal definitions",
      badge: "Training Examples",
      detail:
        "Non-technical marketers define signals in a no-code Studio UI using name, description, and example phrases — not hard enum constraints. Optimized for accessibility over schema precision. A marketer can build a signal without writing code.",
      code: `# Signal defined in Studio UI:\nName: \"Pricing Objection\"\nDescription: \"Customer mentions\n  price, cost, or budget concerns\"\nExamples: [\n  \"that's too expensive\",\n  \"we can't afford this\"\n]`,
    },
    verdict: "STRONG ALIGN",
    verdictColor: "#00C4B4",
    note: "Yours is the engineer's version of what Signal AI Studio abstracts away. Full schema control + hard enum types vs. no-code accessibility. Different users, same underlying intent.",
  },
  {
    id: "confidence",
    layer: "Confidence Scoring",
    icon: "🎯",
    poc: {
      headline: "confidence_score: float",
      sub: "Required · 0.0–1.0 · Per-call",
      badge: "Runtime · Every Insight",
      detail:
        "confidence_score is a required first-class field — non-nullable in the system prompt. Calibration table baked in: 0.95+ = explicit evidence, 0.85–0.94 = clear signal, 0.75–0.84 = inference, <0.75 = uncertain. Fires on every insight, every call, at inference time.",
      code: `@dataclass\nclass ExtractedInsight:\n  confidence_score: float\n  # Required. Non-nullable.\n  # Schema-enforced at prompt level.\n\n# 0.95+ → explicit evidence\n# 0.75–0.84 → reasonable inference\n# <0.75 → human review`,
    },
    invoca: {
      headline: "Signal Accuracy Scores",
      sub: "Signal AI Studio UI",
      badge: "Deploy Gate · One-Time",
      detail:
        "Accuracy scores shown per signal in the Studio dashboard. Used as a deployment gate — a signal model cannot go live until it clears a minimum accuracy threshold. Not a per-call runtime score on individual insights.",
      code: `# Studio UI shows:\nSignal: \"Pricing Objection\"\nAccuracy: 94%\nStatus: LIVE\n\n# Gate fires at deploy time,\n# not at inference time.\n# No per-call confidence score.`,
    },
    verdict: "EXACT MATCH",
    verdictColor: "#F5C518",
    note: "Philosophically identical — both refuse to be black boxes. Key difference: your score fires per-insight at runtime on every call. Invoca's fires once at model deployment. Runtime quality control vs. launch quality control.",
  },
  {
    id: "gate",
    layer: "Quality Gate",
    icon: "🔀",
    poc: {
      headline: "≥ 0.75 → auto-route",
      sub: "< 0.75 → Human Review Queue",
      badge: "No ML at Gate",
      detail:
        "Single deterministic Python conditional. No ML at the gate layer — pure logic. Same input always produces same output. Configurable per insight_type. Stateless, auditable, fully unit-testable. AI classifies. Deterministic logic routes. Clean separation of concerns.",
      code: `CONFIDENCE_THRESHOLD = 0.75\n\ndef gate(insight: ExtractedInsight):\n  if insight.confidence_score \\\n      >= CONFIDENCE_THRESHOLD:\n    return route(insight)\n  human_review_queue\n    .append(insight)`,
    },
    invoca: {
      headline: "Studio accuracy threshold",
      sub: "Model deployment gate",
      badge: "Launch Gate Only",
      detail:
        "Signal models must clear a minimum accuracy threshold in Signal AI Studio before going live. Once deployed, signals fire based on conversation detection — no per-call runtime gate on individual signal confidence.",
      code: `# In Signal AI Studio:\nMinimum Accuracy: 80%\nStatus: Pending Review\n\n# Once approved → live.\n# No per-call runtime gate\n# on individual insights.`,
    },
    verdict: "STRONG ALIGN",
    verdictColor: "#00C4B4",
    note: "Invoca gates at model deployment. You gate at inference time, per insight, per call. Your gate is continuous runtime quality control. Theirs is a one-time launch gate. More granular.",
  },
  {
    id: "routing",
    layer: "Downstream Routing",
    icon: "🚦",
    poc: {
      headline: "ROUTING_RULES dict",
      sub: "4 internal teams + SLA",
      badge: "CS Accountability",
      detail:
        "Python dict maps InsightType enum → (destination_team, sla_string). SLA assigned deterministically by urgency: CRITICAL→4hr, HIGH→48hr, MEDIUM/LOW→1wk. Version-controlled alongside the schema. Four destinations: Engineering, CS Leadership, Sales Leadership, Product.",
      code: `ROUTING_RULES = {\n  BUG_REPORT:  (\"Engineering\",\n                \"4 hours\"),\n  CHURN_SIGNAL:(\"CS Leadership\",\n                \"4 hours\"),\n  COMPETITOR:  (\"Sales\",\n                \"48 hours\"),\n  FEATURE_REQ: (\"Product\",\n                \"1 week\"),\n}`,
    },
    invoca: {
      headline: "Invoca Exchange",
      sub: "200+ external platforms",
      badge: "Revenue Attribution",
      detail:
        "Invoca Exchange routes signal data to 200+ external platforms: Google Ads, Salesforce, Meta, Adobe, and more. Uses webhooks and native integrations. PreSense routes live callers to agents based on signal predictions before the call connects.",
      code: `# Invoca Exchange destinations:\n→ Google Ads\n→ Salesforce (opportunity stage)\n→ Meta Ads Manager\n→ Adobe Analytics\n→ 200+ more via webhook\n\n# Revenue attribution focus.`,
    },
    verdict: "PARTIAL ALIGN",
    verdictColor: "#F07C3A",
    note: "Same concept — signal fires downstream action. Scale gap is real: 200+ platforms vs. 4 internal teams. Your Phase 2 roadmap (Salesforce + Slack write-back) closes this gap directly. Acknowledge it, then point forward.",
  },
  {
    id: "alert",
    layer: "Alert Structure",
    icon: "📋",
    poc: {
      headline: "RoutedAlert + verbatim",
      sub: "verbatim_quote required",
      badge: "Non-Nullable Evidence",
      detail:
        "RoutedAlert dataclass serialized to JSON. verbatim_quote is non-nullable — the model cannot omit the exact customer words. Hallucination cannot fabricate the evidence trail. Every alert carries proof, not just a summary.",
      code: `{\n  \"alert_id\": \"JTBD-20260306-...\",\n  \"route\": \"Engineering\",\n  \"urgency\": \"CRITICAL\",\n  \"sla\": \"4 hours\",\n  \"verbatim_quote\":\n    \"We're making media spend\n     decisions on bad data.\",\n  \"confidence\": 0.97\n}`,
    },
    invoca: {
      headline: "Smart Alerts + transcripts",
      sub: "AI summaries surfaced",
      badge: "Best-Effort Evidence",
      detail:
        "Smart Alerts notify configured recipients when signal conditions are met. AI-generated summaries and full transcripts are surfaced alongside alerts. verbatim_quote is not a required schema field — transcripts are available but not enforced per-alert object.",
      code: `# Smart Alert payload:\n{\n  \"signal\": \"Pricing Objection\",\n  \"confidence\": 0.94,\n  \"summary\": \"AI summary...\",\n  \"transcript_url\": \"https://...\"\n  # verbatim_quote:\n  # not a required field\n}`,
    },
    verdict: "STRONG ALIGN",
    verdictColor: "#00C4B4",
    note: "Both surface customer words alongside structured output. Yours is architecturally stronger: verbatim_quote is schema-enforced and non-nullable. Invoca surfaces transcripts — but doesn't require the evidence field in every alert.",
  },
  {
    id: "loop",
    layer: "Closed Loop",
    icon: "✅",
    poc: {
      headline: "loop_status: CLOSED",
      sub: "CSM confirmation receipt",
      badge: "★ PRIMARY GAP",
      detail:
        "CSM receives a structured confirmation receipt per insight: alert_id, destination team, SLA deadline (computed from urgency + timestamp), suggested action, and loop_status: CLOSED. Audit trail. Ownership assignment. Deadline enforcement. The loop is accountable.",
      code: `{\n  \"alert_id\": \"JTBD-20260306-...\",\n  \"destination\": \"Engineering\",\n  \"sla_deadline\": \"2026-03-06T16:00\",\n  \"suggested_action\":\n    \"Escalate to P1...\",\n  \"loop_status\": \"CLOSED\"\n  # Proof the loop closed.\n}`,
    },
    invoca: {
      headline: "Revenue attribution",
      sub: "Campaign → call → conversion",
      badge: "Marketing Loop Only",
      detail:
        "Invoca's closed loop connects marketing campaign click → call → offline conversion → ad platform write-back. Pushes revenue data to Google Ads and Salesforce. Answers: did this campaign generate revenue? No internal CS accountability loop exists.",
      code: `# Invoca's closed loop:\ncampaign_click\n  → call_tracked\n    → conversion_confirmed\n      → google_ads.update()\n      → salesforce.update()\n\n# Revenue attribution only.\n# No CS workflow loop.`,
    },
    verdict: "YOU GO FURTHER",
    verdictColor: "#E85454",
    note: "THIS IS THE PRIMARY GAP. Two different loops. Invoca closes marketing attribution. You close CS accountability. Invoca has no confirmation receipt, no ownership assignment, no SLA enforcement, no loop_status in the CS workflow layer. You built that.",
  },
];

const VERDICTS = {
  "EXACT MATCH":    { color: "#F5C518", symbol: "=" },
  "STRONG ALIGN":   { color: "#00C4B4", symbol: "≈" },
  "PARTIAL ALIGN":  { color: "#F07C3A", symbol: "~" },
  "YOU GO FURTHER": { color: "#E85454", symbol: "+" },
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&family=Cormorant:ital,wght@0,400;0,600;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg0: #06080F;
    --bg1: #0B0F1A;
    --bg2: #111826;
    --bg3: #182030;
    --teal: #00C4B4;
    --gold: #F5C518;
    --red:  #E85454;
    --amb:  #F07C3A;
    --txt:  #D8E4F0;
    --muted: rgba(216,228,240,0.4);
  }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pop     { 0%{opacity:0;transform:scale(.8)} 65%{transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }
  @keyframes glow    { 0%,100%{opacity:.45} 50%{opacity:1} }
  @keyframes scanY   { from{top:-1px} to{top:100%} }
  @keyframes grain   { 0%,100%{transform:translate(0,0)} 33%{transform:translate(.7%,.4%)} 66%{transform:translate(-.7%,-.4%)} }
  @keyframes connIn  { from{stroke-dashoffset:200} to{stroke-dashoffset:0} }
  @keyframes slideL  { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideR  { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes ripple  { 0%{r:6;opacity:.6} 100%{r:18;opacity:0} }

  .grain-fx {
    position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.02;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    animation: grain .3s steps(1) infinite;
  }
  .scan-fx {
    position:fixed;left:0;right:0;height:1px;pointer-events:none;z-index:2;
    background:linear-gradient(90deg,transparent 0%,rgba(0,196,180,.1) 50%,transparent 100%);
    animation: scanY 10s linear infinite;
  }

  .row-card { cursor:pointer; transition:transform .18s ease; }
  .row-card:hover { transform:translateY(-1px); }

  .verdict-badge {
    display:inline-flex;align-items:center;gap:4px;
    font-family:'Share Tech Mono',monospace;
    font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;
    border-radius:.2rem;padding:.18rem .5rem;
    animation: pop .3s cubic-bezier(.34,1.56,.64,1) both;
  }

  .small-badge {
    display:inline-flex;align-items:center;
    font-family:'Share Tech Mono',monospace;
    font-size:.55rem;letter-spacing:.08em;text-transform:uppercase;
    border-radius:.18rem;padding:.14rem .42rem;
  }

  pre.code { font-family:'Share Tech Mono',monospace; font-size:.68rem; line-height:1.65; white-space:pre; }

  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:rgba(0,196,180,.2); border-radius:2px; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// CONNECTOR NODE
// ─────────────────────────────────────────────────────────────────────────────
function Node({ open, color, symbol }) {
  return (
    <div style={{ width: 60, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={60} height={44} viewBox="0 0 60 44" overflow="visible">
        <line x1="0" y1="22" x2="19" y2="22"
          stroke={open ? color : "rgba(255,255,255,.07)"}
          strokeWidth={open ? 1.5 : 1}
          strokeDasharray={open ? "none" : "4,3"}
          style={{ transition: "stroke .28s,stroke-width .28s" }}
        />
        <line x1="41" y1="22" x2="60" y2="22"
          stroke={open ? color : "rgba(255,255,255,.07)"}
          strokeWidth={open ? 1.5 : 1}
          strokeDasharray={open ? "none" : "4,3"}
          style={{ transition: "stroke .28s,stroke-width .28s" }}
        />
        {open && (
          <circle cx="30" cy="22" r="18" fill="none"
            stroke={color} strokeWidth=".8" opacity="0"
            style={{ animation: "ripple 1.8s ease-out infinite" }}
          />
        )}
        <circle cx="30" cy="22" r={open ? 7 : 4}
          fill={open ? color : "rgba(255,255,255,.09)"}
          style={{ transition: "all .28s ease" }}
        />
        {open && (
          <text x="30" y="26" textAnchor="middle"
            style={{ fontFamily: "'Share Tech Mono'", fontSize: "8px", fill: "#06080F", fontWeight: 700 }}>
            {symbol}
          </text>
        )}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDE CELL
// ─────────────────────────────────────────────────────────────────────────────
function Cell({ d, side, open, verdictColor }) {
  const left = side === "poc";
  const accent = left ? "var(--teal)" : "var(--gold)";
  return (
    <div style={{
      flex: 1, padding: ".8rem .95rem",
      background: open
        ? left ? "rgba(0,196,180,.055)" : "rgba(245,197,24,.035)"
        : "rgba(255,255,255,.018)",
      borderLeft: left  ? `2px solid ${open ? accent : "rgba(0,196,180,.1)"}` : "none",
      borderRight: !left ? `2px solid ${open ? accent : "rgba(245,197,24,.08)"}` : "none",
      transition: "background .25s,border-color .25s",
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: left ? "flex-start" : "flex-end",
        gap: 7, marginBottom: ".22rem",
      }}>
        {!left && (
          <span className="small-badge" style={{ background: `${d.badgeColor || accent}15`, border: `1px solid ${d.badgeColor || accent}30`, color: d.badgeColor || accent }}>
            {d.badge}
          </span>
        )}
        <span style={{
          fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
          fontSize: ".82rem", letterSpacing: ".05em",
          color: open ? accent : "rgba(216,228,240,.65)",
          transition: "color .2s",
        }}>{d.headline}</span>
        {left && (
          <span className="small-badge" style={{ background: `${d.badgeColor || accent}15`, border: `1px solid ${d.badgeColor || accent}30`, color: d.badgeColor || accent }}>
            {d.badge}
          </span>
        )}
      </div>
      <div style={{
        fontFamily: "'Share Tech Mono',monospace", fontSize: ".6rem",
        color: open ? (left ? "rgba(0,196,180,.5)" : "rgba(245,197,24,.45)") : "rgba(216,228,240,.3)",
        textAlign: left ? "left" : "right",
        transition: "color .2s",
      }}>{d.sub}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPAND PANEL
// ─────────────────────────────────────────────────────────────────────────────
function ExpandPanel({ row }) {
  return (
    <div style={{ borderTop: `1px solid ${row.verdictColor}18`, animation: "fadeUp .28s ease both" }}>
      {/* Detail + code */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", background: "rgba(255,255,255,.015)" }}>
        {/* POC detail */}
        <div style={{ padding: "1rem 1.1rem", animation: "slideL .3s ease both" }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: ".57rem", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(0,196,180,.55)", marginBottom: ".45rem" }}>
            // YOUR POC
          </div>
          <p style={{ fontFamily: "'Cormorant',serif", fontSize: ".9rem", color: "rgba(216,228,240,.75)", lineHeight: 1.75, marginBottom: ".8rem" }}>
            {row.poc.detail}
          </p>
          <div style={{ background: "#06080F", border: "1px solid rgba(0,196,180,.14)", borderRadius: ".3rem", padding: ".7rem .85rem" }}>
            <pre className="code" style={{ color: "rgba(0,196,180,.7)" }}>{row.poc.code}</pre>
          </div>
        </div>

        {/* Divider */}
        <div style={{ background: "rgba(255,255,255,.05)" }} />

        {/* Invoca detail */}
        <div style={{ padding: "1rem 1.1rem", animation: "slideR .3s ease both" }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: ".57rem", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(245,197,24,.5)", marginBottom: ".45rem", textAlign: "right" }}>
            // INVOCA SIGNAL AI
          </div>
          <p style={{ fontFamily: "'Cormorant',serif", fontSize: ".9rem", color: "rgba(216,228,240,.75)", lineHeight: 1.75, marginBottom: ".8rem", textAlign: "right" }}>
            {row.invoca.detail}
          </p>
          <div style={{ background: "#06080F", border: "1px solid rgba(245,197,24,.12)", borderRadius: ".3rem", padding: ".7rem .85rem" }}>
            <pre className="code" style={{ color: "rgba(245,197,24,.65)" }}>{row.invoca.code}</pre>
          </div>
        </div>
      </div>

      {/* Analysis note */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        padding: ".8rem 1.1rem",
        background: `${row.verdictColor}08`,
        borderLeft: `3px solid ${row.verdictColor}`,
        animation: "fadeUp .3s ease .1s both",
      }}>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: ".58rem", letterSpacing: ".12em", textTransform: "uppercase", color: row.verdictColor, flexShrink: 0, paddingTop: 1 }}>
          ⬡ ANALYSIS
        </span>
        <p style={{ fontFamily: "'Cormorant',serif", fontSize: ".92rem", color: "rgba(216,228,240,.85)", lineHeight: 1.65 }}>
          {row.note}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI BAR
// ─────────────────────────────────────────────────────────────────────────────
function KpiBar({ activeFilter, onFilter }) {
  const counts = {};
  Object.keys(VERDICTS).forEach(k => { counts[k] = ROWS.filter(r => r.verdict === k).length; });
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {Object.entries(VERDICTS).map(([k, v]) => (
        <button key={k} onClick={() => onFilter(activeFilter === k ? null : k)} style={{
          display: "flex", alignItems: "center", gap: 7,
          background: activeFilter === k ? `${v.color}14` : "transparent",
          border: `1px solid ${activeFilter === k ? v.color : v.color + "30"}`,
          borderRadius: ".25rem", padding: ".28rem .7rem",
          cursor: "pointer", transition: "all .18s ease",
        }}>
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: "1rem", color: v.color }}>
            {counts[k]}
          </span>
          <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: ".55rem", letterSpacing: ".09em", textTransform: "uppercase", color: activeFilter === k ? v.color : `${v.color}70` }}>
            {k}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState(null);

  const toggle = id => setOpenId(openId === id ? null : id);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg0)", color: "var(--txt)", fontFamily: "'Rajdhani',sans-serif" }}>
      <style>{CSS}</style>
      <div className="grain-fx" />
      <div className="scan-fx" />

      {/* ── HEADER ── */}
      <header style={{
        position: "relative", zIndex: 10,
        padding: "1.4rem 2rem 1.1rem",
        borderBottom: "1px solid rgba(255,255,255,.06)",
        background: "linear-gradient(180deg,rgba(0,196,180,.035) 0%,transparent 100%)",
        animation: "fadeUp .5s ease both",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: "1.1rem" }}>
          <div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: ".58rem", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(0,196,180,.6)", marginBottom: ".3rem" }}>
              Tech Stack Duel · Invoca Applied AI Analyst POC · Erwin M. McDonald · March 2026
            </div>
            <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem,4vw,2.6rem)", letterSpacing: ".06em", lineHeight: 1, marginBottom: ".2rem" }}>
              <span style={{ color: "#00C4B4" }}>JTBD FEEDBACK LOOP POC</span>
              <span style={{ color: "rgba(255,255,255,.18)", fontSize: ".6em", margin: "0 .5rem" }}>vs</span>
              <span style={{ color: "#F5C518" }}>INVOCA SIGNAL AI</span>
            </h1>
            <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: ".65rem", color: "rgba(216,228,240,.28)", letterSpacing: ".06em" }}>
              8 layers · click any row to expand · filter by verdict below
            </p>
          </div>
          <KpiBar activeFilter={filter} onFilter={setFilter} />
        </div>

        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr", maxWidth: 920, margin: "0 auto" }}>
          <div style={{ padding: ".5rem .85rem", background: "rgba(0,196,180,.06)", border: "1px solid rgba(0,196,180,.18)", borderRight: "none", borderRadius: ".4rem 0 0 .4rem", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00C4B4", animation: "glow 2s infinite", flexShrink: 0 }} />
            <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: ".88rem", letterSpacing: ".1em", color: "#00C4B4" }}>JTBD FEEDBACK LOOP POC</span>
            <span style={{ marginLeft: "auto", fontFamily: "'Share Tech Mono',monospace", fontSize: ".58rem", color: "rgba(0,196,180,.4)" }}>Anthropic SDK</span>
          </div>
          <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: ".62rem", color: "rgba(255,255,255,.2)" }}>vs</span>
          </div>
          <div style={{ padding: ".5rem .85rem", background: "rgba(245,197,24,.04)", border: "1px solid rgba(245,197,24,.15)", borderLeft: "none", borderRadius: "0 .4rem .4rem 0", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: ".58rem", color: "rgba(245,197,24,.4)" }}>Signal AI</span>
            <span style={{ marginLeft: "auto", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: ".88rem", letterSpacing: ".1em", color: "#F5C518" }}>INVOCA PLATFORM</span>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F5C518", animation: "glow 2.3s infinite", flexShrink: 0 }} />
          </div>
        </div>
      </header>

      {/* ── ROWS ── */}
      <main style={{ position: "relative", zIndex: 1, maxWidth: 980, margin: "0 auto", padding: "1.4rem 2rem 3rem" }}>
        {ROWS.map((row, i) => {
          const isOpen = openId === row.id;
          const filtered = filter && row.verdict !== filter;
          const vm = VERDICTS[row.verdict];

          return (
            <div
              key={row.id}
              className="row-card"
              onClick={() => toggle(row.id)}
              style={{
                marginBottom: ".5rem",
                opacity: filtered ? 0.15 : 1,
                transition: "opacity .22s",
                animation: `fadeUp .4s ease ${i * 48}ms both`,
                border: `1px solid ${isOpen ? row.verdictColor + "28" : "rgba(255,255,255,.05)"}`,
                borderRadius: ".45rem",
                overflow: "hidden",
                transition: "opacity .22s, border-color .22s",
              }}
            >
              {/* Row label bar */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: ".38rem .75rem",
                background: isOpen ? "rgba(255,255,255,.03)" : "transparent",
                borderBottom: isOpen ? `1px solid ${row.verdictColor}18` : "1px solid transparent",
              }}>
                <span style={{ fontSize: ".88rem" }}>{row.icon}</span>
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: ".9rem", letterSpacing: ".08em", color: isOpen ? row.verdictColor : "rgba(216,228,240,.48)", transition: "color .2s" }}>
                  {row.layer}
                </span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    className="verdict-badge"
                    style={{ background: `${vm.color}14`, border: `1px solid ${vm.color}35`, color: vm.color, animationDelay: `${i * 48 + 120}ms` }}
                  >
                    {row.verdict === "YOU GO FURTHER" ? "▲ " : ""}{row.verdict}
                  </span>
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: ".65rem", color: isOpen ? row.verdictColor : "rgba(216,228,240,.2)", transition: "color .2s" }}>
                    {isOpen ? "▼" : "▶"}
                  </span>
                </div>
              </div>

              {/* Split cells row */}
              <div style={{ display: "flex" }}>
                <Cell d={row.poc} side="poc" open={isOpen} verdictColor={row.verdictColor} />
                <Node open={isOpen ? row.verdict : false} color={row.verdictColor} symbol={vm.symbol} />
                <Cell d={row.invoca} side="invoca" open={isOpen} verdictColor={row.verdictColor} />
              </div>

              {/* Expanded */}
              {isOpen && <ExpandPanel row={row} />}
            </div>
          );
        })}

        {/* Gap statement */}
        <div style={{
          marginTop: "2rem",
          background: "linear-gradient(135deg,rgba(0,196,180,.055) 0%,rgba(245,197,24,.03) 100%)",
          border: "1px solid rgba(0,196,180,.2)",
          borderRadius: ".5rem", padding: "1.5rem 1.75rem",
          animation: "fadeUp .5s ease .45s both",
        }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: ".58rem", letterSpacing: ".18em", textTransform: "uppercase", color: "#00C4B4", marginBottom: ".75rem", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 16, height: 1, background: "#00C4B4", display: "inline-block" }} />
            The Gap Statement — Say This in the Room
          </div>
          <p style={{ fontFamily: "'Cormorant',serif", fontStyle: "italic", fontSize: "1.1rem", color: "rgba(216,228,240,.9)", lineHeight: 1.8, maxWidth: 700 }}>
            "Invoca closes the loop between marketing spend and call outcome. My system closes the loop between a call insight and a stakeholder action. Those are two different loops. Right now, Invoca only has one of them."
          </p>
          <div style={{ marginTop: ".75rem", fontFamily: "'Share Tech Mono',monospace", fontSize: ".6rem", color: "rgba(216,228,240,.22)", letterSpacing: ".08em" }}>
            Then stop talking.
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ position: "relative", zIndex: 1, padding: ".8rem 2rem", borderTop: "1px solid rgba(255,255,255,.05)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: ".5rem" }}>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: ".57rem", color: "rgba(216,228,240,.15)" }}>
          JTBD Feedback Loop · Erwin M. McDonald · Invoca Applied AI Analyst POC · March 2026
        </span>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: ".57rem", color: "rgba(0,196,180,.3)" }}>
          8 layers compared · 1 primary gap · 0 apologies
        </span>
      </footer>
    </div>
  );
}
