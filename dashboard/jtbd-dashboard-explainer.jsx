import { useState, useEffect, useRef } from "react";

const C = {
  ink:    "#0a0e1a",
  ink2:   "#1a2035",
  ink3:   "#2a3050",
  paper:  "#f4f1eb",
  gold:   "#c9a84c",
  teal:   "#00c4b4",
  red:    "#e85454",
  orange: "#f07c3a",
  yellow: "#f5c842",
  green:  "#3dbe8a",
  blue:   "#4a8fe8",
  purple: "#9b72e8",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes pulseDot { 0%,100%{box-shadow:0 0 0 0 rgba(0,196,180,.5)} 50%{box-shadow:0 0 0 8px rgba(0,196,180,0)} }
  @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes drawLine { from{stroke-dashoffset:300} to{stroke-dashoffset:0} }
  @keyframes popIn    { 0%{opacity:0;transform:scale(.85)} 60%{transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }
  @keyframes grain    { 0%,100%{transform:translate(0,0)} 25%{transform:translate(1%,.5%)} 75%{transform:translate(-1%,.5%)} }
  .grain { position:fixed;inset:0;pointer-events:none;opacity:.025;z-index:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    animation:grain .5s steps(1) infinite; }
  .au-card { transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease; cursor:pointer; }
  .au-card:hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(0,0,0,.4)!important; }
  .tab-btn { transition:all .2s ease; border:none; cursor:pointer; font-family:'DM Mono',monospace; }
  ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(201,168,76,.25);border-radius:2px}
`;

function useFadeUp(delay = 0) {
  const r = useRef(null);
  useEffect(() => {
    const el = r.current; if (!el) return;
    el.style.opacity = "0"; el.style.transform = "translateY(20px)";
    const t = setTimeout(() => {
      el.style.transition = "opacity .55s ease, transform .55s ease";
      el.style.opacity = "1"; el.style.transform = "translateY(0)";
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);
  return r;
}

// ── PANEL DEFINITIONS ─────────────────────────────────────────────────────────
const PANELS = [
  {
    id: "kpi",
    icon: "📊",
    label: "Executive KPIs",
    color: C.teal,
    tech: {
      title: "Aggregated Pipeline Metrics — Real-Time State Snapshot",
      body: "Five KPI cards render derived state from the INSIGHTS array: total count, urgency-filtered criticals, weighted average confidence score, routing success rate, and ARR at risk. Each card uses a cubic-bezier count-up animation driven by requestAnimationFrame. The bottom accent bar is dynamically colored by the metric's semantic status. All values are computed client-side from the structured ExtractedInsight objects — no separate API call needed.",
      tags: ["Derived State", "Count-Up Animation", "Semantic Coloring", "No Extra API"],
    },
    nontec: {
      title: "The Scoreboard — What's Happening Right Now",
      body: "Think of this row as the scoreboard at the top of a game. At a glance, executives can see how many insights were found, how many are on fire, how confident the system is, and exactly how much revenue is at risk — all before reading a single card. It answers the question every VP asks first: 'How bad is it?'",
      analogy: "📺 Like a news ticker — the most important numbers, always visible, always current.",
    },
  },
  {
    id: "routing",
    icon: "🔀",
    label: "Stakeholder Routing Map",
    color: C.gold,
    tech: {
      title: "Four-Column Kanban Layout — ROUTING_RULES Materialized in UI",
      body: "The routing map materializes the ROUTING_RULES dictionary as a visual kanban. Insights are grouped using Array.filter() against each route destination, then rendered in priority-sorted columns. Each InsightCard is clickable, opening a Modal with full JSON detail. The column layout mirrors the Python routing logic exactly — Engineering, CS Leadership, Sales Leadership, Product Management — so the UI serves as live documentation of the backend rules.",
      tags: ["Kanban Pattern", "ROUTING_RULES Mirror", "Modal Detail View", "Priority Sort"],
    },
    nontec: {
      title: "The Mail Room — Every Signal Goes to the Right Desk",
      body: "Instead of one pile of notes that nobody owns, this panel sorts every insight into the inbox of the team that needs to act on it. Engineering gets bugs. Sales gets competitor flags. CS Leadership gets churn risks. Product gets feature requests. Each card shows exactly what the customer said and what needs to happen — with a deadline attached.",
      analogy: "📬 Like a smart mail sorter — every message routed to the right person automatically.",
    },
  },
  {
    id: "verbatim",
    icon: "💬",
    label: "Verbatim Evidence Panel",
    color: C.purple,
    tech: {
      title: "Trust Layer — Exact Transcript Quotes Alongside Structured Extraction",
      body: "Every insight card surfaces verbatim_quote directly from the ExtractedInsight schema alongside the structured summary. This is architecturally intentional: it allows human reviewers to audit the extraction without re-reading the full transcript. The quote is stored as a required field in the JSON schema — the model cannot omit it. This design choice eliminates hallucination anxiety and gives CSMs one-click evidence for escalation conversations.",
      tags: ["Hallucination Mitigation", "Required Schema Field", "Audit Trail", "One-Click Evidence"],
    },
    nontec: {
      title: "Show Your Work — The Customer's Exact Words, Always Visible",
      body: "Every time the system flags something, it shows you the exact sentence the customer said — word for word. So when you take this to a VP and say 'the customer mentioned Marchex,' you have the receipt right there. You're not paraphrasing an AI summary. You're quoting the customer directly. That's the difference between a system people trust and one they ignore.",
      analogy: "🔍 Like a highlighter on the transcript — the system shows you exactly why it flagged something.",
    },
  },
  {
    id: "confidence",
    icon: "🎯",
    label: "Confidence Visualization",
    color: C.orange,
    tech: {
      title: "Threshold Transparency — Model Uncertainty Surfaced, Not Hidden",
      body: "Confidence scores are rendered as animated horizontal bars using CSS width transitions with cubic-bezier easing. The donut chart uses SVG stroke-dasharray math to animate arc segments. The 75% gate threshold is explicitly labeled as a visual reference line. Scores below 75% trigger a secondary 'HUMAN REVIEW' badge rendered in the InsightCard. This makes the gating logic visible and auditable — not buried in backend logic.",
      tags: ["SVG Donut Chart", "Animated Bars", "Threshold Line", "Human Review Badge"],
    },
    nontec: {
      title: "The Confidence Meter — How Sure Is the System?",
      body: "Every insight has a score from 0–100% showing how confident the AI is. If it's above 75%, the system acts automatically. Below that, a human gets to review it first. The bar charts and donuts aren't decorative — they're a promise: 'We will never silently guess. We will always show you when we're uncertain.' That's what builds trust with a team that's never used AI before.",
      analogy: "🌡️ Like a weather forecast confidence — 95% chance of rain means act. 55% means wait for a human call.",
    },
  },
  {
    id: "sla",
    icon: "⏱",
    label: "SLA Compliance",
    color: C.red,
    tech: {
      title: "Time-Bound Routing — Urgency → SLA Mapping Enforced at Schema Level",
      body: "SLA values are assigned deterministically in the Python ROUTING_RULES table based on urgency level: CRITICAL → 4 hours, HIGH → 48 hours, MEDIUM → 1 week, LOW → 1 week. The dashboard renders SLA compliance as a donut chart tracking on-track vs at-risk ratios. Because SLA is a field on the RoutedAlert dataclass, it can be pushed downstream to Salesforce task due dates or Slack reminders automatically.",
      tags: ["Deterministic SLA", "Urgency Mapping", "Downstream Push-Ready", "Compliance Tracking"],
    },
    nontec: {
      title: "The Deadline System — Every Insight Has a Timer",
      body: "Saying 'this is urgent' isn't enough. This panel attaches an actual deadline to every insight automatically — critical bugs get 4 hours, competitive threats get 48 hours, feature requests get a week. The donut shows at a glance whether teams are on track. It transforms 'someone should look at this' into 'Engineering must respond by 2pm Thursday.'",
      analogy: "⏰ Like a ticket system with automatic due dates — no more 'I didn't know it was urgent.'",
    },
  },
  {
    id: "csm",
    icon: "👤",
    label: "CSM View Toggle",
    color: C.blue,
    tech: {
      title: "Role-Based View — Filtered Render of Priority-Ordered Action Items",
      body: "The CSM View is a conditional render branch triggered by a viewMode state toggle. It filters INSIGHTS to critical and high urgency only, strips all technical metadata, and renders a pure action-list UI with color-coded urgency banners. No new data is fetched — it's the same insight array re-presented for a different consumer. This is the UI equivalent of a role-based access pattern: same source of truth, audience-appropriate presentation.",
      tags: ["Role-Based Rendering", "State Toggle", "Same Data Source", "Audience-Appropriate UI"],
    },
    nontec: {
      title: "The CSM's Personal To-Do List — No Technical Noise",
      body: "Most dashboards show everything to everyone and let people figure out what's theirs. This one has a toggle. When a CSM hits it, all the charts and routing maps disappear — replaced by a clean list: 'Do this now. Do this today.' No confidence scores. No JSON. No architecture diagrams. Just the two or three things the CSM needs to do before end of day, in plain English.",
      analogy: "📋 Like a manager handing you a sticky note with your three priorities — everything else filtered out.",
    },
  },
  {
    id: "arch",
    icon: "⚙️",
    label: "Architecture Panel",
    color: C.green,
    tech: {
      title: "Expandable Governance Layer — Prompt Template + Stack Exposed in UI",
      body: "The Architecture Panel is a collapsible accordion component that exposes the full tech stack, prompt template, confidence calibration table, and routing rules directly in the dashboard UI. This is intentional governance design: instead of burying system config in a separate doc, it lives alongside the output it produces. Useful for prompt versioning audits, onboarding new engineers, and demonstrating maintainability to technical evaluators.",
      tags: ["Accordion Pattern", "Prompt Transparency", "Governance Design", "Onboarding Aid"],
    },
    nontec: {
      title: "The Hood — Click to See How It Works",
      body: "Most AI tools are black boxes. You ask, it answers, you hope it's right. This panel flips that. Any stakeholder can click 'Architecture' and see exactly what instructions the AI was given, how it scores confidence, and which rules determine where insights go. It's the system showing its homework. That's how you get a skeptical VP to trust it — not by telling them to trust it, but by showing them there's nothing to hide.",
      analogy: "🔧 Like a glass-front engine on a showroom car — you can see every part, which is exactly the point.",
    },
  },
  {
    id: "roadmap",
    icon: "🗺️",
    label: "18-Month Roadmap",
    color: C.yellow,
    tech: {
      title: "Temporal Capability Arc — MVP to Predictive Intelligence",
      body: "The roadmap renders five milestone nodes connected by an SVG gradient line, each backed by a capability cluster. Phases: (1) File-based MVP, (2) Salesforce/Slack/webhook integration, (3) multi-CSM scale + SLA tracking, (4) cross-account pattern aggregation + multi-agent architecture, (5) predictive churn scoring + auto Jira. This isn't aspirational — each phase maps to a concrete architectural change: stream input, CRM write-back, embedding layer, agentic validator loop.",
      tags: ["Milestone Architecture", "Multi-Agent Phase", "Embedding Layer", "Predictive Scoring"],
    },
    nontec: {
      title: "Where This Goes — From Pilot to Company Intelligence",
      body: "This isn't a one-time demo. The roadmap shows exactly how this grows from a single-account POC into the intelligence layer for the entire CS organization. Today it reads transcripts. In 6 months it writes back to Salesforce automatically. In 18 months it predicts which accounts are going to churn before the CSM even gets on the call. Each step is shown, not promised.",
      analogy: "🚀 Like a product roadmap you'd show a board — not a wish list, but a sequenced build plan.",
    },
  },
];

// ── WHITEBOARD STEPS ─────────────────────────────────────────────────────────
const WB_STEPS = [
  { icon: "👤", label: "Customer Talks", color: C.teal,   desc: "CSM finishes a call" },
  { icon: "📄", label: "Transcript",     color: C.blue,   desc: "Raw text captured" },
  { icon: "🤖", label: "AI Reads It",    color: C.purple, desc: "Claude extracts every signal" },
  { icon: "🔀", label: "Quality Check",  color: C.gold,   desc: "≥75%? Auto-route. <75%? Human reviews first" },
  { icon: "📬", label: "Right Inbox",    color: C.green,  desc: "Engineering, Sales, CS, Product" },
  { icon: "⏱",  label: "Deadline Set",   color: C.orange, desc: "4 hrs · 48 hrs · 1 week" },
  { icon: "✅",  label: "CSM Confirms",  color: C.green,  desc: "Loop closed. Nothing lost." },
];

// ── COMPONENTS ────────────────────────────────────────────────────────────────
function Tag({ text, color }) {
  return (
    <span style={{
      fontFamily: "'DM Mono',monospace", fontSize: ".58rem", letterSpacing: ".08em",
      background: `${color}18`, border: `1px solid ${color}44`,
      color, borderRadius: ".25rem", padding: ".18rem .5rem",
    }}>{text}</span>
  );
}

function PanelCard({ panel, isActive, onClick, delay }) {
  const r = useFadeUp(delay);
  return (
    <div ref={r} className="au-card" onClick={onClick} style={{
      background: isActive ? `${panel.color}14` : C.ink2,
      border: `1px solid ${isActive ? panel.color : "rgba(255,255,255,.07)"}`,
      borderLeft: `3px solid ${isActive ? panel.color : "rgba(255,255,255,.12)"}`,
      borderRadius: ".75rem", padding: ".85rem 1rem",
      boxShadow: isActive ? `0 0 24px ${panel.color}22` : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "1.1rem" }}>{panel.icon}</span>
        <span style={{
          fontFamily: "'DM Mono',monospace", fontSize: ".65rem",
          letterSpacing: ".08em", textTransform: "uppercase",
          color: isActive ? panel.color : "rgba(244,241,235,.55)",
        }}>{panel.label}</span>
        {isActive && (
          <span style={{
            marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
            background: panel.color, animation: "pulseDot 1.8s infinite",
          }} />
        )}
      </div>
    </div>
  );
}

function AudiencePane({ data, audience, color }) {
  const r = useFadeUp(80);
  const isTech = audience === "tech";
  return (
    <div ref={r} style={{
      background: C.ink2, border: `1px solid ${color}33`,
      borderTop: `3px solid ${color}`,
      borderRadius: ".75rem", padding: "1.5rem",
      flex: 1, minWidth: 0,
    }}>
      <div style={{
        fontFamily: "'DM Mono',monospace", fontSize: ".6rem",
        letterSpacing: ".14em", textTransform: "uppercase",
        color, marginBottom: ".6rem",
      }}>
        {isTech ? "🔧 Technical Stakeholder" : "💼 Non-Technical Stakeholder"}
      </div>
      <div style={{
        fontFamily: "'DM Serif Display'", fontSize: "1.05rem",
        color: C.paper, marginBottom: ".85rem", lineHeight: 1.3,
      }}>{data.title}</div>
      <p style={{
        fontFamily: "'DM Sans',sans-serif", fontSize: ".82rem",
        color: "rgba(244,241,235,.75)", lineHeight: 1.7, marginBottom: "1rem",
      }}>{data.body}</p>

      {isTech && data.tags && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {data.tags.map(t => <Tag key={t} text={t} color={color} />)}
        </div>
      )}
      {!isTech && data.analogy && (
        <div style={{
          background: `${color}10`, border: `1px solid ${color}30`,
          borderLeft: `3px solid ${color}`,
          borderRadius: ".5rem", padding: ".75rem 1rem",
          fontFamily: "'DM Serif Display'", fontStyle: "italic",
          fontSize: ".85rem", color: C.paper, lineHeight: 1.5,
        }}>{data.analogy}</div>
      )}
    </div>
  );
}

function WhiteboardFlow() {
  const [active, setActive] = useState(null);
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 400); }, []);

  return (
    <div style={{
      background: C.ink2, border: `1px solid rgba(255,255,255,.07)`,
      borderRadius: "1rem", overflow: "hidden",
    }}>
      <div style={{
        padding: "1.1rem 1.5rem .8rem",
        borderBottom: "1px solid rgba(255,255,255,.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: ".67rem", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(244,241,235,.5)" }}>
          Whiteboard Version — Non-Technical Walk-Through
        </span>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: ".58rem", padding: ".2rem .55rem", borderRadius: ".25rem", background: "rgba(201,168,76,.12)", color: C.gold }}>
          Click any step
        </span>
      </div>

      <div style={{ padding: "2rem 1.5rem 1.5rem" }}>
        {/* Flow nodes */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0, overflowX: "auto", paddingBottom: "1rem" }}>
          {WB_STEPS.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
              <div
                onClick={() => setActive(active === i ? null : i)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  flex: 1, cursor: "pointer",
                  opacity: animated ? 1 : 0,
                  transform: animated ? "none" : "translateY(14px)",
                  transition: `opacity .5s ease ${i * 80}ms, transform .5s ease ${i * 80}ms`,
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: active === i ? `${step.color}20` : C.ink3,
                  border: `2px solid ${active === i ? step.color : "rgba(255,255,255,.12)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.3rem", marginBottom: 8,
                  boxShadow: active === i ? `0 0 20px ${step.color}44` : "none",
                  transition: "all .25s ease",
                }}>{step.icon}</div>
                <div style={{
                  fontFamily: "'DM Mono',monospace", fontSize: ".58rem",
                  letterSpacing: ".07em", textTransform: "uppercase",
                  color: active === i ? step.color : "rgba(244,241,235,.45)",
                  textAlign: "center", lineHeight: 1.3,
                  transition: "color .2s",
                }}>{step.label}</div>
              </div>
              {i < WB_STEPS.length - 1 && (
                <svg width={28} height={14} viewBox="0 0 28 14" style={{ flexShrink: 0, marginBottom: 24 }}>
                  <line x1={0} y1={7} x2={22} y2={7}
                    stroke={animated && i < (active ?? -1) ? C.green : "rgba(255,255,255,.15)"}
                    strokeWidth={2}
                    style={{ transition: "stroke .3s ease" }}
                  />
                  <polygon points="20,3 28,7 20,11"
                    fill={animated && i < (active ?? -1) ? C.green : "rgba(255,255,255,.2)"}
                    style={{ transition: "fill .3s ease" }}
                  />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Step detail */}
        <div style={{
          minHeight: 72,
          background: active !== null ? `${WB_STEPS[active].color}0e` : "rgba(255,255,255,.02)",
          border: `1px solid ${active !== null ? WB_STEPS[active].color + "33" : "rgba(255,255,255,.06)"}`,
          borderRadius: ".75rem", padding: "1rem 1.25rem",
          transition: "all .3s ease",
          display: "flex", alignItems: "center", gap: "1rem",
        }}>
          {active !== null ? (
            <>
              <span style={{ fontSize: "1.8rem", flexShrink: 0 }}>{WB_STEPS[active].icon}</span>
              <div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".62rem", color: WB_STEPS[active].color, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>
                  Step {active + 1} · {WB_STEPS[active].label}
                </div>
                <div style={{ fontFamily: "'DM Serif Display'", fontSize: "1rem", color: C.paper, lineHeight: 1.4 }}>
                  {WB_STEPS[active].desc}
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".62rem", color: "rgba(244,241,235,.2)", letterSpacing: ".08em" }}>
              Click a step above to see what it means in plain English
            </div>
          )}
        </div>

        {/* Plain-English summary */}
        <div style={{ marginTop: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
          {[
            { title: "What the system does", body: "Listens to every customer call and automatically finds what matters — bugs, risks, opportunities, competitive threats — before anyone has to read a single note.", color: C.teal },
            { title: "Why it matters", body: "Right now insights die in CRM notes. This system makes sure the right person gets the right signal with a deadline — every single time, automatically.", color: C.gold },
          ].map((item, i) => (
            <div key={i} style={{
              background: C.ink3, borderLeft: `3px solid ${item.color}`,
              borderRadius: ".5rem", padding: ".9rem 1rem",
            }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".58rem", color: item.color, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 5 }}>{item.title}</div>
              <div style={{ fontFamily: "'DM Serif Display'", fontStyle: "italic", fontSize: ".85rem", color: "rgba(244,241,235,.8)", lineHeight: 1.55 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activePanel, setActivePanel] = useState(0);
  const [audience, setAudience] = useState("both");

  const panel = PANELS[activePanel];

  return (
    <div style={{ minHeight: "100vh", background: C.ink, color: C.paper, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{CSS}</style>
      <div className="grain" />

      {/* Header */}
      <header style={{
        position: "relative", zIndex: 10,
        padding: "1.5rem 2.5rem 1.25rem",
        borderBottom: "1px solid rgba(201,168,76,.18)",
        background: "linear-gradient(180deg,rgba(0,196,180,.05) 0%,transparent 100%)",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        flexWrap: "wrap", gap: "1rem",
        animation: "fadeUp .5s ease both",
      }}>
        <div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".65rem", letterSpacing: ".18em", textTransform: "uppercase", color: C.teal, marginBottom: ".35rem", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 22, height: 1, background: C.teal, display: "inline-block" }} />
            Invoca · JTBD Feedback Loop
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display'", fontSize: "clamp(1.4rem,2.8vw,2.1rem)", fontWeight: 400, lineHeight: 1.1 }}>
            Dashboard <em style={{ fontStyle: "italic", color: C.gold }}>Explainer</em>
          </h1>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".68rem", color: "rgba(244,241,235,.35)", marginTop: ".4rem" }}>
            Every panel explained for every audience — technical & non-technical
          </div>
        </div>

        {/* Audience toggle */}
        <div style={{ display: "flex", background: C.ink3, borderRadius: ".5rem", padding: 3, border: "1px solid rgba(255,255,255,.07)", gap: 0, alignSelf: "flex-start" }}>
          {[{ v: "tech", l: "🔧 Technical" }, { v: "both", l: "⚡ Both" }, { v: "nontec", l: "💼 Executive" }].map(o => (
            <button key={o.v} onClick={() => setAudience(o.v)} className="tab-btn"
              style={{
                padding: ".32rem .9rem", borderRadius: ".32rem", fontSize: ".62rem",
                background: audience === o.v ? C.teal : "transparent",
                color: audience === o.v ? C.ink : "rgba(244,241,235,.5)",
                letterSpacing: ".06em",
              }}>{o.l}</button>
          ))}
        </div>
      </header>

      <div style={{ position: "relative", zIndex: 1, padding: "1.75rem 2.5rem 3rem", display: "grid", gridTemplateColumns: "220px 1fr", gap: "1.5rem", maxWidth: 1200, margin: "0 auto" }}>

        {/* Left nav */}
        <div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".58rem", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(244,241,235,.25)", marginBottom: ".75rem" }}>
            Dashboard Panels
          </div>
          {PANELS.map((p, i) => (
            <div key={p.id} style={{ marginBottom: ".45rem" }}>
              <PanelCard panel={p} isActive={activePanel === i} onClick={() => setActivePanel(i)} delay={i * 50} />
            </div>
          ))}
        </div>

        {/* Right content */}
        <div style={{ minWidth: 0 }}>

          {/* Panel header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem", animation: "fadeIn .3s ease both" }} key={panel.id}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${panel.color}18`, border: `2px solid ${panel.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
              {panel.icon}
            </div>
            <div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".6rem", letterSpacing: ".12em", textTransform: "uppercase", color: panel.color, marginBottom: 3 }}>Panel {activePanel + 1} of {PANELS.length}</div>
              <div style={{ fontFamily: "'DM Serif Display'", fontSize: "1.2rem", color: C.paper }}>{panel.label}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: ".5rem" }}>
              {activePanel > 0 && (
                <button onClick={() => setActivePanel(a => a - 1)} className="tab-btn"
                  style={{ padding: ".3rem .75rem", borderRadius: ".3rem", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(244,241,235,.5)", fontSize: ".65rem" }}>
                  ← Prev
                </button>
              )}
              {activePanel < PANELS.length - 1 && (
                <button onClick={() => setActivePanel(a => a + 1)} className="tab-btn"
                  style={{ padding: ".3rem .75rem", borderRadius: ".3rem", background: `${panel.color}18`, border: `1px solid ${panel.color}44`, color: panel.color, fontSize: ".65rem" }}>
                  Next →
                </button>
              )}
            </div>
          </div>

          {/* Audience panes */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", animation: "fadeIn .35s ease both" }} key={`panes-${panel.id}`}>
            {(audience === "tech" || audience === "both") && (
              <AudiencePane data={panel.tech} audience="tech" color={panel.color} />
            )}
            {(audience === "nontec" || audience === "both") && (
              <AudiencePane data={panel.nontec} audience="nontec" color={panel.color} />
            )}
          </div>

          {/* Bridge phrase */}
          <div style={{
            background: `${panel.color}0a`, border: `1px solid ${panel.color}22`,
            borderLeft: `3px solid ${panel.color}`,
            borderRadius: ".75rem", padding: ".9rem 1.1rem",
            display: "flex", alignItems: "center", gap: "1rem",
            marginBottom: "1.5rem", animation: "fadeIn .4s ease both",
          }} key={`bridge-${panel.id}`}>
            <span style={{ fontSize: "1rem", flexShrink: 0 }}>🌉</span>
            <div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".57rem", color: panel.color, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 3 }}>Bridge Phrase — Works in Any Room</div>
              <div style={{ fontFamily: "'DM Serif Display'", fontStyle: "italic", fontSize: ".9rem", color: C.paper, lineHeight: 1.45 }}>
                {[
                  `"The KPIs give every executive immediate context — financials first, signals second."`,
                  `"The routing map is where AI hands off to humans — it respects org structure, not just urgency."`,
                  `"The verbatim panel means you're never presenting an AI interpretation. You're presenting the customer's own words."`,
                  `"The confidence visualization isn't decoration — it's the system being honest about what it knows."`,
                  `"SLA assignment turns insight into obligation. It closes the gap between knowing and acting."`,
                  `"The CSM View toggle proves the system was designed for adoption — not just built to impress engineers."`,
                  `"The architecture panel shows there's nothing to hide — which is exactly how you build trust with skeptics."`,
                  `"The roadmap shows this isn't a demo. It's the first phase of a company-wide intelligence layer."`,
                ][activePanel]}
              </div>
            </div>
          </div>

          {/* Whiteboard section */}
          <WhiteboardFlow />

        </div>
      </div>

      <footer style={{
        position: "relative", zIndex: 1, padding: ".9rem 2.5rem",
        borderTop: "1px solid rgba(255,255,255,.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: ".5rem",
      }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: ".6rem", color: "rgba(244,241,235,.2)" }}>
          JTBD Feedback Loop · Dashboard Explainer · Erwin M. McDonald
        </span>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: ".6rem", color: "rgba(201,168,76,.4)" }}>
          {PANELS.length} panels · 2 audiences · 1 system
        </span>
      </footer>
    </div>
  );
}
