import { useState, useEffect, useRef } from "react";

const C = {
  ink:    "#0a0e1a", ink2: "#1a2035", ink3: "#2a3050",
  paper:  "#f4f1eb", gold: "#c9a84c", teal: "#00c4b4",
  red:    "#e85454", orange: "#f07c3a", yellow: "#f5c842",
  green:  "#3dbe8a", blue: "#4a8fe8", purple: "#9b72e8",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,196,180,.5)}50%{box-shadow:0 0 0 10px rgba(0,196,180,0)}}
  @keyframes pulseRed{0%,100%{box-shadow:0 0 4px #e85454}50%{box-shadow:0 0 18px #e85454,0 0 32px #e8545444}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes grain{0%,100%{transform:translate(0,0)}25%{transform:translate(1%,.5%)}75%{transform:translate(-1%,.5%)}}
  @keyframes drawPath{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
  @keyframes glow{0%,100%{opacity:.4}50%{opacity:1}}
  @keyframes slideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
  .grain{position:fixed;inset:0;pointer-events:none;opacity:.025;z-index:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    animation:grain .5s steps(1) infinite;}
  .step-node{transition:all .25s ease;cursor:pointer;}
  .step-node:hover{transform:scale(1.06);}
  .tab{border:none;cursor:pointer;font-family:'DM Mono',monospace;transition:all .2s ease;}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(201,168,76,.25);border-radius:2px}
`;

// ── PIPELINE STEPS ─────────────────────────────────────────────────────────
const STEPS = [
  {
    id: "ingest",
    icon: "📞",
    label: "Ingest",
    color: C.teal,
    tech: {
      title: "Transcript Ingestion",
      what: "Raw .txt file or streaming call data passed as string input to the Python pipeline.",
      how: "File I/O or API stream handler reads transcript. No preprocessing — raw text is passed directly to the extraction layer.",
      code: `transcript = open("call.txt").read()\n# or: transcript = invoca_stream.get_transcript(call_id)`,
      tags: ["File I/O", "Stream-Ready", "No Preprocessing"],
    },
    plain: {
      title: "The Call Ends",
      what: "A CSM finishes a customer call. The recording or transcript gets handed to the system.",
      analogy: "Think of it like dropping a letter in a mailbox — the moment you drop it, the system takes over.",
      stakes: "Without this step, insights stay locked in someone's head or a voice recording nobody re-listens to.",
    },
  },
  {
    id: "extract",
    icon: "🤖",
    label: "Extract",
    color: C.purple,
    tech: {
      title: "Claude API Extraction",
      what: "Python + Anthropic SDK sends transcript to claude-sonnet-4-6 with a versioned system prompt.",
      how: "System role: 'Senior CSM Analyst'. Strict JSON schema with enumerated insight_type values, required fields, and a confidence calibration table baked into the prompt.",
      code: `response = client.messages.create(\n  model="claude-sonnet-4-6",\n  system=SYSTEM_PROMPT_v1,\n  messages=[{"role":"user","content":transcript}]\n)`,
      tags: ["claude-sonnet-4-6", "Versioned Prompt", "Strict JSON Schema", "Enumerated Types"],
    },
    plain: {
      title: "AI Reads Every Word",
      what: "Claude reads the entire transcript and pulls out every signal that matters — bugs mentioned, competitors named, pricing friction, churn risk, feature requests, positive wins.",
      analogy: "Like having your sharpest analyst on every single call, never tired, never missing a thing — and always writing it up the same way.",
      stakes: "A human CSM catches maybe 60% of signals in their notes. Claude catches 100%, every time, in a consistent format.",
    },
  },
  {
    id: "score",
    icon: "🎯",
    label: "Score",
    color: C.gold,
    tech: {
      title: "Confidence Scoring",
      what: "Each ExtractedInsight object includes a confidence_score (0.0–1.0) returned by the model alongside the structured fields.",
      how: "Confidence calibration table in the system prompt maps score ranges to action tiers. Score is a first-class field in the dataclass — not inferred post-hoc.",
      code: `@dataclass\nclass ExtractedInsight:\n  insight_type: InsightType\n  summary: str\n  verbatim_quote: str\n  confidence_score: float  # 0.0–1.0\n  urgency: UrgencyLevel`,
      tags: ["Typed Dataclass", "First-Class Score", "Calibration Table", "0.0–1.0 Range"],
    },
    plain: {
      title: "How Sure Is It?",
      what: "Every insight gets a confidence score — like a percentage. 97% means the system is nearly certain. 60% means it's unsure and a human should check.",
      analogy: "Like a weather forecast: '95% chance of rain' means bring an umbrella. '55% chance' means check again before you leave.",
      stakes: "Without confidence scoring, you'd have to trust every AI output equally. With it, uncertainty becomes visible — and safe.",
    },
  },
  {
    id: "gate",
    icon: "🔀",
    label: "Gate",
    color: C.orange,
    tech: {
      title: "Confidence Gate — 75% Threshold",
      what: "A deterministic rule: confidence_score ≥ 0.75 → auto-route. < 0.75 → Human Review Queue.",
      how: "Single conditional in the routing engine. No ML. No ambiguity. The threshold is configurable per insight_type if needed.",
      code: `def gate(insight: ExtractedInsight) -> str:\n  if insight.confidence_score >= 0.75:\n    return route(insight)  # auto-route\n  return "HUMAN_REVIEW_QUEUE"`,
      tags: ["Deterministic Rule", "Configurable Threshold", "No ML at Gate", "Human Review Queue"],
    },
    plain: {
      title: "The Quality Check",
      what: "Before anything gets sent to anyone, the system asks: 'Are we sure enough?' Above 75%, it acts automatically. Below 75%, a human reviews it first.",
      analogy: "Like a spell-checker that flags uncertain words instead of silently guessing — it shows its work so you stay in control.",
      stakes: "This is what separates a system people trust from one they ignore. Uncertainty isn't hidden. It's surfaced.",
    },
  },
  {
    id: "route",
    icon: "🚦",
    label: "Route",
    color: C.blue,
    tech: {
      title: "ROUTING_RULES Engine",
      what: "A dictionary maps insight_type → (destination, SLA). Creates a RoutedAlert dataclass for each insight.",
      how: "Four destinations: Engineering, CS Leadership, Sales Leadership, Product Management. SLA assigned deterministically by urgency: CRITICAL→4hr, HIGH→48hr, MEDIUM/LOW→1wk.",
      code: `ROUTING_RULES = {\n  InsightType.BUG_REPORT:       ("Engineering",    "4 hours"),\n  InsightType.CHURN_SIGNAL:     ("CS Leadership",  "4 hours"),\n  InsightType.COMPETITOR:       ("Sales Leadership","48 hours"),\n  InsightType.FEATURE_REQUEST:  ("Product Mgmt",   "1 week"),\n}`,
      tags: ["Routing Dictionary", "4 Destinations", "Deterministic SLA", "RoutedAlert Object"],
    },
    plain: {
      title: "It Goes to the Right Desk",
      what: "Once the system is confident, it automatically sends each insight to the right team — with a deadline attached. Engineering gets bugs. Sales gets competitor flags. Product gets feature requests.",
      analogy: "Like a smart receptionist who reads every message, knows exactly who handles it, and puts it in their inbox with a due date — before anyone asks.",
      stakes: "Without routing, someone has to read everything and decide who owns what. That's where insights die.",
    },
  },
  {
    id: "alert",
    icon: "📋",
    label: "Alert",
    color: C.red,
    tech: {
      title: "Structured Alert Output",
      what: "RoutedAlert objects serialized to JSON. Each alert contains full structured metadata plus the verbatim_quote from the transcript.",
      how: "Output layer renders to terminal, dashboard, and is push-ready to Salesforce/Slack/Jira via webhook. verbatim_quote is a required field — cannot be null.",
      code: `{\n  "alert_id": "JTBD-20260227-ADD8E43F",\n  "route": "Engineering",\n  "urgency": "CRITICAL",\n  "sla": "4 hours",\n  "summary": "Attribution bug — 41 days open",\n  "verbatim_quote": "We're making spend decisions...",\n  "confidence": 0.97\n}`,
      tags: ["JSON Serialization", "Verbatim Required", "Webhook-Ready", "Salesforce/Slack/Jira"],
    },
    plain: {
      title: "The Alert Lands — With Proof",
      what: "The right team gets a structured message: what the customer said, why it matters, and exactly when they need to respond. Not a vague note — a complete brief with the customer's own words attached.",
      analogy: "Like getting a case file instead of a sticky note — everything you need to act, in one place, with a deadline.",
      stakes: "Most escalations fail because the recipient doesn't have enough context. This alert is the full context.",
    },
  },
  {
    id: "confirm",
    icon: "✅",
    label: "Confirm",
    color: C.green,
    tech: {
      title: "Closed-Loop Confirmation",
      what: "CSM receives a structured confirmation receipt per insight: alert_id, route, SLA, confidence score, and suggested action.",
      how: "Confirmation layer closes the feedback loop — CSM knows exactly what was extracted, where it went, and what needs to happen. Enables SLA compliance tracking downstream.",
      code: `# CSM confirmation receipt\n{\n  "status": "ROUTED",\n  "destination": "Engineering",\n  "sla_deadline": "2025-03-13T17:00:00",\n  "suggested_action": "Escalate as P1...",\n  "loop": "CLOSED"\n}`,
      tags: ["Confirmation Receipt", "SLA Tracking", "Loop Closure", "Audit Trail"],
    },
    plain: {
      title: "Nothing Falls Through the Cracks",
      what: "The CSM gets a confirmation: 'Here's what we found, here's where it went, here's what needs to happen by when.' The loop is officially closed. No guessing. No following up.",
      analogy: "Like a read-receipt on a critical email — you know it was delivered, you know who has it, you know the deadline.",
      stakes: "Without confirmation, the CSM is left wondering: 'Did that escalate? Did anyone see it?' That uncertainty is the black hole this system eliminates.",
    },
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function useFadeUp(delay = 0) {
  const r = useRef(null);
  useEffect(() => {
    const el = r.current; if (!el) return;
    el.style.opacity = "0"; el.style.transform = "translateY(22px)";
    const t = setTimeout(() => {
      el.style.transition = "opacity .6s ease, transform .6s ease";
      el.style.opacity = "1"; el.style.transform = "translateY(0)";
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);
  return r;
}

function Tag({ text, color }) {
  return (
    <span style={{
      fontFamily: "'DM Mono',monospace", fontSize: ".56rem", letterSpacing: ".07em",
      background: `${color}18`, border: `1px solid ${color}40`,
      color, borderRadius: ".25rem", padding: ".18rem .5rem",
    }}>{text}</span>
  );
}

function CodeBlock({ code }) {
  return (
    <div style={{
      background: "#060a14", border: "1px solid rgba(255,255,255,.08)",
      borderRadius: ".5rem", padding: ".9rem 1rem", marginTop: ".75rem",
      fontFamily: "'DM Mono',monospace", fontSize: ".68rem",
      color: C.green, lineHeight: 1.75, overflowX: "auto",
      whiteSpace: "pre",
    }}>{code}</div>
  );
}

// ── TECHNICAL VISUALIZATION ───────────────────────────────────────────────────
function TechView({ active, setActive }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 300); }, []);

  const step = STEPS[active];

  return (
    <div>
      {/* Pipeline flow */}
      <div style={{
        background: C.ink2, border: "1px solid rgba(255,255,255,.07)",
        borderRadius: "1rem", padding: "1.5rem 1.25rem 1.25rem",
        marginBottom: "1.25rem", overflowX: "auto",
      }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".6rem", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(244,241,235,.3)", marginBottom: "1.25rem" }}>
          Pipeline Architecture — Click any stage
        </div>
        <div style={{ display: "flex", alignItems: "center", minWidth: 600 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div className="step-node" onClick={() => setActive(i)} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                opacity: mounted ? 1 : 0,
                transition: `opacity .5s ease ${i * 70}ms`,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: active === i ? `${s.color}20` : C.ink3,
                  border: `2px solid ${active === i ? s.color : "rgba(255,255,255,.1)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.15rem", marginBottom: 6,
                  boxShadow: active === i ? `0 0 22px ${s.color}44` : "none",
                  animation: active === i && s.id === "alert" ? "pulseRed 1.5s infinite" : "none",
                }}>{s.icon}</div>
                <div style={{
                  fontFamily: "'DM Mono',monospace", fontSize: ".55rem",
                  letterSpacing: ".08em", textTransform: "uppercase",
                  color: active === i ? s.color : "rgba(244,241,235,.35)",
                  textAlign: "center",
                }}>{s.label}</div>
                {active === i && (
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: s.color, marginTop: 5, animation: "pulse 1.5s infinite" }} />
                )}
              </div>
              {i < STEPS.length - 1 && (
                <svg width={24} height={12} viewBox="0 0 24 12" style={{ flexShrink: 0, marginBottom: 18 }}>
                  <line x1={0} y1={6} x2={18} y2={6}
                    stroke={i < active ? C.green : "rgba(255,255,255,.12)"}
                    strokeWidth={1.5} />
                  <polygon points="16,2 24,6 16,10"
                    fill={i < active ? C.green : "rgba(255,255,255,.15)"} />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step detail */}
      <div style={{
        background: C.ink2, border: `1px solid ${step.color}30`,
        borderTop: `3px solid ${step.color}`,
        borderRadius: "1rem", padding: "1.5rem",
        animation: "slideIn .3s ease both",
      }} key={step.id}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            background: `${step.color}18`, border: `2px solid ${step.color}44`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
          }}>{step.icon}</div>
          <div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".6rem", letterSpacing: ".12em", textTransform: "uppercase", color: step.color, marginBottom: 4 }}>
              Stage {active + 1} of {STEPS.length} · {step.label}
            </div>
            <div style={{ fontFamily: "'DM Serif Display'", fontSize: "1.1rem", color: C.paper }}>{step.tech.title}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".57rem", color: "rgba(244,241,235,.3)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 5 }}>What</div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".8rem", color: "rgba(244,241,235,.75)", lineHeight: 1.65 }}>{step.tech.what}</p>
          </div>
          <div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".57rem", color: "rgba(244,241,235,.3)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 5 }}>How</div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".8rem", color: "rgba(244,241,235,.75)", lineHeight: 1.65 }}>{step.tech.how}</p>
          </div>
        </div>

        <div style={{ marginBottom: ".9rem" }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".57rem", color: "rgba(244,241,235,.3)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 5 }}>Code</div>
          <CodeBlock code={step.tech.code} />
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {step.tech.tags.map(t => <Tag key={t} text={t} color={step.color} />)}
        </div>
      </div>
    </div>
  );
}

// ── NON-TECHNICAL VISUALIZATION ───────────────────────────────────────────────
function PlainView({ active, setActive }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 300); }, []);

  const step = STEPS[active];

  // Routing destinations visual
  const destinations = [
    { icon: "⚙️", label: "Engineering", color: C.blue,   types: ["Bug Reports"] },
    { icon: "🤝", label: "CS Leadership", color: C.red,  types: ["Churn Signals"] },
    { icon: "💼", label: "Sales",         color: C.orange, types: ["Competitors", "Pricing"] },
    { icon: "📋", label: "Product",       color: C.purple, types: ["Feature Requests"] },
  ];

  return (
    <div>
      {/* Story flow — horizontal cards */}
      <div style={{
        background: C.ink2, border: "1px solid rgba(255,255,255,.07)",
        borderRadius: "1rem", padding: "1.5rem 1.25rem 1.25rem",
        marginBottom: "1.25rem", overflowX: "auto",
      }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".6rem", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(244,241,235,.3)", marginBottom: "1.25rem" }}>
          How It Works — Plain English
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: ".5rem", minWidth: 620 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div onClick={() => setActive(i)} style={{
                flex: 1, background: active === i ? `${s.color}14` : C.ink3,
                border: `1px solid ${active === i ? s.color : "rgba(255,255,255,.06)"}`,
                borderRadius: ".6rem", padding: ".65rem .5rem",
                cursor: "pointer", textAlign: "center",
                transition: "all .2s ease",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "none" : "translateY(10px)",
                boxShadow: active === i ? `0 8px 24px ${s.color}22` : "none",
              }}>
                <div style={{ fontSize: "1.3rem", marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".52rem", letterSpacing: ".06em", textTransform: "uppercase", color: active === i ? s.color : "rgba(244,241,235,.35)", lineHeight: 1.3 }}>{s.label}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ color: i < active ? C.green : "rgba(255,255,255,.15)", fontSize: ".7rem", flexShrink: 0, padding: "0 .1rem", marginBottom: 10 }}>›</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Plain step detail */}
      <div style={{
        background: C.ink2, borderRadius: "1rem",
        border: `1px solid ${step.color}30`,
        overflow: "hidden", animation: "slideIn .3s ease both",
      }} key={`plain-${step.id}`}>
        {/* Color bar */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${step.color}, ${step.color}44)` }} />

        <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          {/* What */}
          <div style={{ gridColumn: "1/-1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: ".85rem" }}>
              <span style={{ fontSize: "1.6rem" }}>{step.icon}</span>
              <div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".58rem", color: step.color, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 2 }}>
                  Step {active + 1} · {step.label}
                </div>
                <div style={{ fontFamily: "'DM Serif Display'", fontSize: "1.15rem", color: C.paper }}>{step.plain.title}</div>
              </div>
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: ".88rem", color: "rgba(244,241,235,.8)", lineHeight: 1.7 }}>{step.plain.what}</p>
          </div>

          {/* Analogy */}
          <div style={{
            background: `${step.color}0c`, border: `1px solid ${step.color}28`,
            borderLeft: `3px solid ${step.color}`, borderRadius: ".6rem", padding: "1rem 1.1rem",
          }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".57rem", color: step.color, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>The Analogy</div>
            <p style={{ fontFamily: "'DM Serif Display'", fontStyle: "italic", fontSize: ".9rem", color: C.paper, lineHeight: 1.6 }}>{step.plain.analogy}</p>
          </div>

          {/* Stakes */}
          <div style={{
            background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)",
            borderLeft: "3px solid rgba(255,255,255,.15)", borderRadius: ".6rem", padding: "1rem 1.1rem",
          }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".57rem", color: "rgba(244,241,235,.35)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>Why It Matters</div>
            <p style={{ fontFamily: "'DM Serif Display'", fontStyle: "italic", fontSize: ".9rem", color: "rgba(244,241,235,.7)", lineHeight: 1.6 }}>{step.plain.stakes}</p>
          </div>
        </div>

        {/* Routing visual — only show on route step */}
        {step.id === "route" && (
          <div style={{ padding: "0 1.5rem 1.5rem" }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".58rem", color: "rgba(244,241,235,.3)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: ".75rem" }}>Where Each Insight Goes</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: ".6rem" }}>
              {destinations.map(d => (
                <div key={d.label} style={{
                  background: `${d.color}0e`, border: `1px solid ${d.color}28`,
                  borderRadius: ".6rem", padding: ".75rem",
                  display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 5,
                }}>
                  <span style={{ fontSize: "1.2rem" }}>{d.icon}</span>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: ".58rem", color: d.color, letterSpacing: ".06em" }}>{d.label}</span>
                  {d.types.map(t => (
                    <span key={t} style={{ fontFamily: "'DM Mono',monospace", fontSize: ".5rem", color: "rgba(244,241,235,.35)", padding: ".1rem .35rem", background: "rgba(255,255,255,.04)", borderRadius: ".2rem" }}>{t}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gate visual — only show on gate step */}
        {step.id === "gate" && (
          <div style={{ padding: "0 1.5rem 1.5rem" }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".58rem", color: "rgba(244,241,235,.3)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: ".75rem" }}>The 75% Rule</div>
            <div style={{ display: "flex", gap: "1rem" }}>
              {[
                { label: "≥ 75% Confidence", sub: "Auto-routes immediately", color: C.green, icon: "⚡" },
                { label: "< 75% Confidence", sub: "Goes to Human Review first", color: C.red, icon: "👁" },
              ].map(g => (
                <div key={g.label} style={{
                  flex: 1, background: `${g.color}0e`, border: `1px solid ${g.color}30`,
                  borderRadius: ".6rem", padding: ".9rem 1rem",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: "1.3rem" }}>{g.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".65rem", color: g.color, marginBottom: 3 }}>{g.label}</div>
                    <div style={{ fontSize: ".72rem", color: "rgba(244,241,235,.6)" }}>{g.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState("both");
  const [activeStep, setActiveStep] = useState(0);
  const headerRef = useFadeUp(0);

  const step = STEPS[activeStep];

  return (
    <div style={{ minHeight: "100vh", background: C.ink, color: C.paper, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{CSS}</style>
      <div className="grain" />

      {/* ── HEADER ── */}
      <header ref={headerRef} style={{
        position: "relative", zIndex: 10,
        padding: "1.6rem 2.5rem 1.3rem",
        borderBottom: "1px solid rgba(201,168,76,.18)",
        background: "linear-gradient(180deg,rgba(0,196,180,.055) 0%,transparent 100%)",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        flexWrap: "wrap", gap: "1rem",
      }}>
        <div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".65rem", letterSpacing: ".18em", textTransform: "uppercase", color: C.teal, marginBottom: ".35rem", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 22, height: 1, background: C.teal, display: "inline-block" }} />
            Invoca · JTBD Feedback Loop
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display'", fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 400, lineHeight: 1.1 }}>
            Pipeline <em style={{ fontStyle: "italic", color: C.gold }}>Explainer</em>
          </h1>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".68rem", color: "rgba(244,241,235,.35)", marginTop: ".35rem" }}>
            7 stages · Every audience · One system
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: ".6rem" }}>
          {/* Mode toggle */}
          <div style={{ display: "flex", background: C.ink3, borderRadius: ".5rem", padding: 3, border: "1px solid rgba(255,255,255,.07)", gap: 0 }}>
            {[
              { v: "tech",  l: "🔧 Technical" },
              { v: "both",  l: "⚡ Both" },
              { v: "plain", l: "💼 Executive" },
            ].map(o => (
              <button key={o.v} onClick={() => setMode(o.v)} className="tab"
                style={{
                  padding: ".32rem .9rem", borderRadius: ".32rem", fontSize: ".62rem",
                  background: mode === o.v ? C.teal : "transparent",
                  color: mode === o.v ? C.ink : "rgba(244,241,235,.5)",
                  letterSpacing: ".06em",
                }}>{o.l}</button>
            ))}
          </div>

          {/* Step nav */}
          <div style={{ display: "flex", gap: ".4rem" }}>
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => setActiveStep(i)} className="tab"
                style={{
                  width: 28, height: 28, borderRadius: "50%", padding: 0,
                  background: activeStep === i ? s.color : C.ink3,
                  border: `1px solid ${activeStep === i ? s.color : "rgba(255,255,255,.1)"}`,
                  color: activeStep === i ? C.ink : "rgba(244,241,235,.4)",
                  fontSize: ".9rem",
                }}>{s.icon}</button>
            ))}
          </div>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main style={{ position: "relative", zIndex: 1, padding: "1.75rem 2.5rem 3rem", maxWidth: 1200, margin: "0 auto" }}>

        {/* Step breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1.25rem", animation: "fadeIn .3s ease both" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${step.color}18`, border: `2px solid ${step.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{step.icon}</div>
          <div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".58rem", color: step.color, letterSpacing: ".1em", textTransform: "uppercase" }}>Stage {activeStep + 1} of {STEPS.length}</div>
            <div style={{ fontFamily: "'DM Serif Display'", fontSize: "1.05rem", color: C.paper }}>
              {mode === "tech" ? step.tech.title : mode === "plain" ? step.plain.title : `${step.tech.title} · ${step.plain.title}`}
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: ".5rem" }}>
            {activeStep > 0 && (
              <button onClick={() => setActiveStep(s => s - 1)} className="tab"
                style={{ padding: ".3rem .8rem", borderRadius: ".3rem", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(244,241,235,.5)", fontSize: ".65rem" }}>
                ← Prev
              </button>
            )}
            {activeStep < STEPS.length - 1 && (
              <button onClick={() => setActiveStep(s => s + 1)} className="tab"
                style={{ padding: ".3rem .8rem", borderRadius: ".3rem", background: `${step.color}18`, border: `1px solid ${step.color}44`, color: step.color, fontSize: ".65rem" }}>
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Views */}
        {mode === "both" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".6rem", letterSpacing: ".12em", textTransform: "uppercase", color: C.blue, marginBottom: ".7rem", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 16, height: 1, background: C.blue, display: "inline-block" }} /> Technical View
              </div>
              <TechView active={activeStep} setActive={setActiveStep} />
            </div>
            <div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".6rem", letterSpacing: ".12em", textTransform: "uppercase", color: C.gold, marginBottom: ".7rem", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 16, height: 1, background: C.gold, display: "inline-block" }} /> Executive View
              </div>
              <PlainView active={activeStep} setActive={setActiveStep} />
            </div>
          </div>
        ) : mode === "tech" ? (
          <TechView active={activeStep} setActive={setActiveStep} />
        ) : (
          <PlainView active={activeStep} setActive={setActiveStep} />
        )}

        {/* ── BRIDGE PHRASE ── */}
        <div style={{
          marginTop: "1.5rem",
          background: `${step.color}09`, border: `1px solid ${step.color}25`,
          borderLeft: `3px solid ${step.color}`,
          borderRadius: ".75rem", padding: "1rem 1.25rem",
          display: "flex", alignItems: "center", gap: "1rem",
          animation: "fadeIn .4s ease both",
        }} key={`bridge-${step.id}`}>
          <span style={{ fontSize: "1rem", flexShrink: 0 }}>🌉</span>
          <div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".56rem", color: step.color, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>Bridge Phrase — Any Room</div>
            <div style={{ fontFamily: "'DM Serif Display'", fontStyle: "italic", fontSize: ".92rem", color: C.paper, lineHeight: 1.45 }}>
              {[
                `"The transcript is the raw material. Everything downstream depends on capturing it completely — nothing summarized, nothing filtered, just the full conversation."`,
                `"The extraction layer isn't summarizing. It's classifying — turning free text into structured objects that can be routed, tracked, and acted on."`,
                `"The confidence score is how the system stays honest. It doesn't guess and hope — it scores and declares."`,
                `"The gate is where we chose trust over speed. A system that routes bad data fast isn't useful — it's dangerous."`,
                `"Routing is where AI stops and humans start. The system decides who. The human decides what to do about it."`,
                `"The alert isn't a notification. It's a complete brief — everything the recipient needs to act, including the customer's own words."`,
                `"The loop isn't closed when the alert is sent. It's closed when the CSM knows it was received, routed, and owned."`,
              ][activeStep]}
            </div>
          </div>
        </div>

        {/* ── CLOSING LINE ── */}
        <div style={{
          marginTop: "1.5rem", textAlign: "center",
          background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.2)",
          borderRadius: "1rem", padding: "1.5rem 2rem",
        }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".58rem", color: C.gold, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: ".75rem" }}>Your Closing Line</div>
          <div style={{ fontFamily: "'DM Serif Display'", fontStyle: "italic", fontSize: "1.15rem", color: C.paper, lineHeight: 1.5, maxWidth: 640, margin: "0 auto" }}>
            "The insight was always in the conversation. The problem wasn't data — it was workflow. I built a system that turns conversations into structured, accountable action."
          </div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".6rem", color: "rgba(244,241,235,.25)", marginTop: ".75rem" }}>Then stop talking.</div>
        </div>
      </main>

      <footer style={{
        position: "relative", zIndex: 1, padding: ".9rem 2.5rem",
        borderTop: "1px solid rgba(255,255,255,.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: ".5rem",
      }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: ".6rem", color: "rgba(244,241,235,.2)" }}>
          JTBD Feedback Loop · Pipeline Explainer · Erwin M. McDonald
        </span>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: ".6rem", color: "rgba(201,168,76,.4)" }}>
          Invoca Applied AI Analyst POC
        </span>
      </footer>
    </div>
  );
}
