import { useState, useEffect, useRef } from "react";

// ── DATA ───────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    tier: "TOP PICK",
    tierColor: "#00C4B4",
    label: "Where Does Strategy Break?",
    icon: "⚡",
    ask: `"From your perspective, where does strategy most often break down between the insight and the action?"`,
    why: "Strategy leaders constantly live in the gap between insight and execution. This question signals you already understand that — and you've built a system to close it. If he answers honestly, he'll essentially tell you the real problem they need solved.",
    signal: ["Systems Thinking", "Execution Gap Awareness", "Invites Candor"],
    bestFor: "Opening strong — use this as Q1",
    power: 98,
  },
  {
    id: 2,
    tier: "SIGNAL AI TIE-IN",
    tierColor: "#9B72E8",
    label: "Signal vs. Noise",
    icon: "📡",
    ask: `"As Invoca extracts more signals from conversations, how does the organization decide which signals actually drive decisions versus which ones are just interesting data?"`,
    why: "This shows you understand Invoca's core product tension: too much data ≠ better decisions. It also echoes your own pipeline's confidence gate — you built an answer to this problem before they asked the question.",
    signal: ["Platform Depth", "Data Literacy", "Decision-Driven Thinking"],
    bestFor: "Any technical or product-adjacent interviewer",
    power: 91,
  },
  {
    id: 3,
    tier: "IMPACT SIGNAL",
    tierColor: "#C9A84C",
    label: "First 90 Days",
    icon: "🗓",
    ask: `"If someone stepped into this role and had a really strong first 90 days, what would they have accomplished?"`,
    why: "Executives love candidates who think about time-to-value from day one. This question reframes you as someone already planning to deliver — not still figuring out if they want the job.",
    signal: ["Ownership Mindset", "Time-to-Value Thinking", "Confidence"],
    bestFor: "Any interviewer — universally strong",
    power: 94,
  },
  {
    id: 4,
    tier: "STRATEGY OPS",
    tierColor: "#4A8FE8",
    label: "Strategic Leverage",
    icon: "🎯",
    ask: `"Where do you see the biggest leverage opportunity for someone in this role to improve how insights from conversations actually influence product or operational decisions?"`,
    why: "This is a Strategy Ops question, not a candidate question. You're saying: I want to improve how the company learns from customers. That framing positions you as someone who thinks about organizational leverage — not just task completion.",
    signal: ["Director-Level Framing", "Org Design Thinking", "Leverage Awareness"],
    bestFor: "Matt Diederichs specifically — Strategy Ops leader",
    power: 89,
  },
  {
    id: 5,
    tier: "LONG-TERM VISION",
    tierColor: "#3DBE8A",
    label: "Future Direction",
    icon: "🔭",
    ask: `"As AI capabilities evolve, how do you see Invoca's role expanding beyond marketing attribution into broader customer intelligence?"`,
    why: "This shows you're thinking about platform evolution, not just the job spec. It also plants your own thesis — that Invoca's next chapter is customer intelligence at scale, not just attribution. That's the exact gap your pipeline addresses.",
    signal: ["Platform Vision", "Long-Term Thinking", "AI Fluency"],
    bestFor: "Close of interview — signals you're thinking post-hire",
    power: 86,
  },
  {
    id: 6,
    tier: "SECRET WEAPON",
    tierColor: "#E85454",
    label: "The Trust Question",
    icon: "🔐",
    ask: `"When you think about the people who have been most successful working with you, what traits do they tend to have?"`,
    why: "This is the most powerful question in the room — if the conversation is already going well. It tells him you want to succeed specifically in his environment. It's personal, it's strategic, and most candidates would never think to ask it.",
    signal: ["Emotional Intelligence", "Culture Fit Signal", "Relationship-First"],
    bestFor: "Only if the conversation is warm — use at the very end",
    power: 96,
    secret: true,
  },
];

const COMBOS = [
  { label: "Best 2-Question Set", qs: [1, 3], note: "Sharp + practical. Shows strategy meets execution." },
  { label: "Best 3-Question Set", qs: [1, 3, 5], note: "Strategic, practical, forward-thinking. The gold standard." },
  { label: "Technical Room", qs: [2, 4, 5], note: "Platform depth + leverage + vision. Impresses engineers." },
  { label: "If It's Going Great", qs: [1, 3, 6], note: "Strategy + impact + relationship. Ends on a personal note." },
];

const WHY_INVOCA = {
  headline: `"Why Invoca?"`,
  body: `"Most companies collect data. Invoca sits at the intersection of where that data actually changes behavior — the live conversation between a customer and a human being. That's the hardest signal to capture and the most valuable one to act on. What I built for this POC isn't just a demo — it's my answer to the question your platform keeps surfacing: what happens after the signal fires? My pipeline closes the loop that Signal AI opens. That's why I want to be here — to work on the part of the intelligence stack that most people haven't solved yet."`,
  why: "Most candidates answer 'Why Invoca?' with company research. This answer positions you as someone who already has a thesis about the product gap — and who has built something to prove it.",
};

// ── STYLES ─────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scan {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(400%); }
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0,196,180,0); }
    50%       { box-shadow: 0 0 24px 4px rgba(0,196,180,0.18); }
  }
  @keyframes barFill {
    from { width: 0%; }
    to   { width: var(--w); }
  }
  @keyframes grain {
    0%,100% { transform: translate(0,0); }
    25%     { transform: translate(1%,.5%); }
    75%     { transform: translate(-1%,.5%); }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .grain-overlay {
    position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: .03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    animation: grain .4s steps(1) infinite;
  }

  .scan-line {
    position: fixed; left: 0; right: 0; height: 2px; pointer-events: none; z-index: 1;
    background: linear-gradient(90deg, transparent 0%, rgba(0,196,180,.12) 50%, transparent 100%);
    animation: scan 6s linear infinite;
  }

  .q-card {
    transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
    cursor: pointer;
  }
  .q-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 36px rgba(0,0,0,.4) !important;
  }

  .chip { display: inline-flex; align-items: center; }
  .tab  { border: none; cursor: pointer; transition: all .18s ease; font-family: 'JetBrains Mono', monospace; }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,196,180,.2); border-radius: 2px; }
`;

// ── POWER BAR ──────────────────────────────────────────────────────────────
function PowerBar({ value, color }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.setProperty("--w", value + "%");
      ref.current.style.animation = "none";
      void ref.current.offsetHeight;
      ref.current.style.animation = "barFill .9s cubic-bezier(.4,0,.2,1) both .15s";
    }
  }, [value]);
  return (
    <div style={{ height: 4, background: "rgba(255,255,255,.07)", borderRadius: 2, overflow: "hidden", width: "100%" }}>
      <div ref={ref} style={{ height: "100%", background: color, borderRadius: 2, width: 0 }} />
    </div>
  );
}

// ── QUESTION CARD (sidebar) ────────────────────────────────────────────────
function QCard({ q, isActive, onClick, idx }) {
  return (
    <div className="q-card" onClick={onClick} style={{
      background: isActive ? `${q.tierColor}12` : "rgba(255,255,255,.03)",
      border: `1px solid ${isActive ? q.tierColor : "rgba(255,255,255,.07)"}`,
      borderLeft: `3px solid ${isActive ? q.tierColor : "rgba(255,255,255,.1)"}`,
      borderRadius: ".6rem", padding: ".75rem 1rem",
      boxShadow: isActive ? `0 0 28px ${q.tierColor}18` : "none",
      animation: `slideRight .4s ease ${idx * 60}ms both`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "1rem" }}>{q.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: ".55rem", letterSpacing: ".1em", textTransform: "uppercase", color: isActive ? q.tierColor : "rgba(255,255,255,.3)", marginBottom: 2 }}>
            {q.secret ? "🔐 Secret" : `Q${q.id}`}
          </div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: ".75rem", fontWeight: 600, color: isActive ? "#f4f1eb" : "rgba(244,241,235,.55)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {q.label}
          </div>
        </div>
        {isActive && <div style={{ width: 6, height: 6, borderRadius: "50%", background: q.tierColor, flexShrink: 0, animation: "pulseGlow 2s infinite" }} />}
      </div>
      <div style={{ marginTop: ".5rem" }}>
        <PowerBar value={q.power} color={q.tierColor} />
      </div>
    </div>
  );
}

// ── SIGNAL CHIP ────────────────────────────────────────────────────────────
function SignalChip({ text, color }) {
  return (
    <span className="chip" style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: ".58rem",
      letterSpacing: ".07em", textTransform: "uppercase",
      background: `${color}14`, border: `1px solid ${color}33`,
      color, borderRadius: ".25rem", padding: ".2rem .55rem",
    }}>{text}</span>
  );
}

// ── DETAIL PANEL ───────────────────────────────────────────────────────────
function DetailPanel({ q }) {
  const [revealed, setRevealed] = useState(false);
  const [practiced, setPracticed] = useState(false);

  useEffect(() => { setRevealed(false); setPracticed(false); }, [q.id]);

  return (
    <div style={{ animation: "fadeUp .35s ease both" }} key={q.id}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: "1.5rem" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${q.tierColor}14`, border: `2px solid ${q.tierColor}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
          {q.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: ".6rem", letterSpacing: ".14em", textTransform: "uppercase", color: q.tierColor, marginBottom: 4 }}>
            {q.tier}  ·  Relevance Score: {q.power}%
          </div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "#f4f1eb", lineHeight: 1.1 }}>
            {q.label}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: ".62rem", color: "rgba(244,241,235,.35)", marginTop: 4 }}>
            Best for: {q.bestFor}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <PowerBar value={q.power} color={q.tierColor} />
        </div>
      </div>

      {/* The actual question */}
      <div style={{
        background: `${q.tierColor}08`, border: `1px solid ${q.tierColor}25`,
        borderLeft: `4px solid ${q.tierColor}`,
        borderRadius: ".75rem", padding: "1.25rem 1.5rem",
        marginBottom: "1.25rem",
      }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: ".58rem", letterSpacing: ".12em", textTransform: "uppercase", color: q.tierColor, marginBottom: ".6rem" }}>
          Ask This
        </div>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.15rem", color: "#f4f1eb", lineHeight: 1.6 }}>
          {q.ask}
        </div>
      </div>

      {/* Why it works — hidden by default */}
      <div style={{ marginBottom: "1.25rem" }}>
        <button onClick={() => setRevealed(r => !r)} className="tab" style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%",
          background: revealed ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.03)",
          border: `1px solid ${revealed ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.07)"}`,
          borderRadius: ".5rem", padding: ".75rem 1rem", color: "rgba(244,241,235,.7)",
          fontSize: ".7rem", letterSpacing: ".06em",
        }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: ".1em", fontSize: ".6rem" }}>
            {revealed ? "▼  Why This Works" : "▶  Reveal: Why This Works"}
          </span>
        </button>
        {revealed && (
          <div style={{
            background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)",
            borderTop: "none", borderRadius: "0 0 .5rem .5rem",
            padding: "1rem 1.25rem",
            animation: "fadeUp .25s ease both",
          }}>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: ".82rem", color: "rgba(244,241,235,.78)", lineHeight: 1.75 }}>
              {q.why}
            </p>
          </div>
        )}
      </div>

      {/* Signal chips */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: ".58rem", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(244,241,235,.3)", marginBottom: ".5rem" }}>
          What This Signals to Matt
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {q.signal.map(s => <SignalChip key={s} text={s} color={q.tierColor} />)}
        </div>
      </div>

      {/* Practice toggle */}
      <div style={{
        background: practiced ? `${q.tierColor}0e` : "rgba(255,255,255,.02)",
        border: `1px solid ${practiced ? q.tierColor + "33" : "rgba(255,255,255,.07)"}`,
        borderRadius: ".6rem", padding: ".85rem 1rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "all .25s ease",
      }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: ".62rem", color: practiced ? q.tierColor : "rgba(244,241,235,.35)", letterSpacing: ".08em", textTransform: "uppercase" }}>
          {practiced ? "✓ Marked as Practiced" : "Mark as Practiced"}
        </span>
        <button onClick={() => setPracticed(p => !p)} className="tab" style={{
          padding: ".3rem .8rem", borderRadius: ".3rem", fontSize: ".62rem",
          background: practiced ? q.tierColor : "rgba(255,255,255,.07)",
          color: practiced ? "#0a0e1a" : "rgba(244,241,235,.5)",
          border: `1px solid ${practiced ? q.tierColor : "rgba(255,255,255,.1)"}`,
          letterSpacing: ".06em",
        }}>
          {practiced ? "Undo" : "Done"}
        </button>
      </div>
    </div>
  );
}

// ── COMBOS TAB ─────────────────────────────────────────────────────────────
function CombosPanel() {
  return (
    <div style={{ animation: "fadeUp .35s ease both" }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "#f4f1eb", marginBottom: ".5rem" }}>
        Recommended Combos
      </div>
      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: ".82rem", color: "rgba(244,241,235,.5)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
        Don't ask all five. Ask 2–3 max. These combinations are pre-built for maximum impact.
      </p>
      <div style={{ display: "grid", gap: "1rem" }}>
        {COMBOS.map((c, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)",
            borderLeft: "3px solid #00C4B4",
            borderRadius: ".75rem", padding: "1.1rem 1.25rem",
            animation: `fadeUp .4s ease ${i * 80}ms both`,
          }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: ".9rem", fontWeight: 700, color: "#f4f1eb", marginBottom: ".35rem" }}>
              {c.label}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: ".6rem", flexWrap: "wrap" }}>
              {c.qs.map(n => {
                const q = QUESTIONS.find(q => q.id === n);
                return (
                  <span key={n} style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: ".6rem",
                    background: `${q.tierColor}14`, border: `1px solid ${q.tierColor}33`,
                    color: q.tierColor, borderRadius: ".25rem", padding: ".2rem .55rem",
                  }}>
                    Q{n}: {q.label}
                  </span>
                );
              })}
            </div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: ".78rem", color: "rgba(244,241,235,.5)", lineHeight: 1.5 }}>
              {c.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── WHY INVOCA TAB ─────────────────────────────────────────────────────────
function WhyInvocaPanel() {
  const [shown, setShown] = useState(false);
  return (
    <div style={{ animation: "fadeUp .35s ease both" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: ".5rem" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: ".6rem", letterSpacing: ".14em", textTransform: "uppercase", color: "#C9A84C" }}>
          Bonus Round
        </span>
      </div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "#f4f1eb", marginBottom: ".5rem" }}>
        If He Asks: "Why Invoca?"
      </div>
      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: ".82rem", color: "rgba(244,241,235,.5)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
        Most candidates answer this question with company research. That's the wrong move. Here's the right one.
      </p>

      <button onClick={() => setShown(s => !s)} className="tab" style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%",
        background: shown ? "rgba(201,168,76,.08)" : "rgba(201,168,76,.04)",
        border: `1px solid ${shown ? "rgba(201,168,76,.3)" : "rgba(201,168,76,.15)"}`,
        borderRadius: ".6rem", padding: ".85rem 1rem",
        color: "#C9A84C", fontSize: ".65rem", letterSpacing: ".08em",
        textTransform: "uppercase", marginBottom: shown ? 0 : "1.5rem",
      }}>
        {shown ? "▼  Your Answer" : "▶  Reveal the Answer That Wins This Question"}
      </button>

      {shown && (
        <div style={{
          background: "rgba(201,168,76,.05)", border: "1px solid rgba(201,168,76,.2)",
          borderTop: "none", borderRadius: "0 0 .6rem .6rem",
          padding: "1.25rem 1.5rem", marginBottom: "1.25rem",
          animation: "fadeUp .3s ease both",
        }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.1rem", color: "#f4f1eb", lineHeight: 1.7, marginBottom: "1rem" }}>
            {WHY_INVOCA.body}
          </div>
        </div>
      )}

      {shown && (
        <div style={{
          background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)",
          borderLeft: "3px solid #C9A84C",
          borderRadius: ".6rem", padding: "1rem 1.25rem",
          animation: "fadeUp .4s ease .1s both",
        }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: ".58rem", letterSpacing: ".1em", textTransform: "uppercase", color: "#C9A84C", marginBottom: ".4rem" }}>
            Why This Wins
          </div>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: ".82rem", color: "rgba(244,241,235,.7)", lineHeight: 1.7 }}>
            {WHY_INVOCA.why}
          </p>
        </div>
      )}
    </div>
  );
}

// ── CLOSING LINE ───────────────────────────────────────────────────────────
function ClosingPanel() {
  return (
    <div style={{ animation: "fadeUp .35s ease both" }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "#f4f1eb", marginBottom: ".5rem" }}>
        Your Positioning in One Line
      </div>
      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: ".82rem", color: "rgba(244,241,235,.5)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
        This is how Matt should remember you when the interview ends.
      </p>
      <div style={{
        background: "linear-gradient(135deg, rgba(0,196,180,.08) 0%, rgba(201,168,76,.06) 100%)",
        border: "1px solid rgba(0,196,180,.2)",
        borderRadius: "1rem", padding: "2rem",
        textAlign: "center", marginBottom: "1.5rem",
      }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: ".6rem", letterSpacing: ".18em", textTransform: "uppercase", color: "#00C4B4", marginBottom: "1rem" }}>
          The One Thing They Remember
        </div>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.35rem", color: "#f4f1eb", lineHeight: 1.6, maxWidth: 540, margin: "0 auto 1rem" }}>
          "You are not just someone who analyzes data. You are someone who turns conversations into decisions."
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: ".6rem", color: "rgba(244,241,235,.25)", letterSpacing: ".1em" }}>
          This framing fits Invoca's entire business model.
        </div>
      </div>

      {[
        { label: "You Built the Other Loop", body: "Invoca closes the loop between marketing spend and call outcome. You close the loop between call insight and stakeholder action. Two different loops. They only have one. You built the other one.", color: "#00C4B4" },
        { label: "You're Already Inside Their Problem", body: "Don't describe the JTBD pipeline as a demo. Describe it as the answer to a question Invoca's own platform keeps surfacing: what happens after the signal fires?", color: "#9B72E8" },
        { label: "You Think at the Layer Above the Job", body: "Every question you ask should signal Director-level thinking — systems, leverage, org learning — not task-level thinking. The job is the floor, not the ceiling.", color: "#C9A84C" },
      ].map((tip, i) => (
        <div key={i} style={{
          background: "rgba(255,255,255,.03)",
          border: `1px solid rgba(255,255,255,.07)`,
          borderLeft: `3px solid ${tip.color}`,
          borderRadius: ".6rem", padding: "1rem 1.25rem",
          marginBottom: ".75rem",
          animation: `fadeUp .4s ease ${i * 80 + 100}ms both`,
        }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: ".82rem", fontWeight: 700, color: tip.color, marginBottom: ".35rem" }}>
            {tip.label}
          </div>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: ".78rem", color: "rgba(244,241,235,.65)", lineHeight: 1.65 }}>
            {tip.body}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [activeQ, setActiveQ] = useState(0);
  const [tab, setTab] = useState("questions"); // questions | combos | whyinvoca | closing

  const TABS = [
    { id: "questions",  label: "Questions", icon: "❓" },
    { id: "combos",     label: "Combos",    icon: "⚡" },
    { id: "whyinvoca",  label: "Why Invoca",icon: "🎯" },
    { id: "closing",    label: "Positioning",icon: "🏁" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#080B14", color: "#f4f1eb", fontFamily: "'Syne', sans-serif" }}>
      <style>{CSS}</style>
      <div className="grain-overlay" />
      <div className="scan-line" />

      {/* ── HEADER ── */}
      <header style={{
        position: "relative", zIndex: 10,
        padding: "1.25rem 2rem",
        borderBottom: "1px solid rgba(0,196,180,.12)",
        background: "linear-gradient(180deg, rgba(0,196,180,.04) 0%, transparent 100%)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "1rem",
        animation: "fadeUp .5s ease both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: ".5rem",
            background: "linear-gradient(135deg, #00C4B4, #0A8A82)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem", flexShrink: 0,
          }}>🎤</div>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: ".58rem", letterSpacing: ".18em", textTransform: "uppercase", color: "#00C4B4", marginBottom: 2 }}>
              Interview War Room
            </div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1rem", color: "#f4f1eb" }}>
              Invoca  ·  Matt Diederichs  ·  Applied AI Analyst
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div style={{ display: "flex", background: "rgba(255,255,255,.04)", borderRadius: ".5rem", padding: 3, border: "1px solid rgba(255,255,255,.07)", gap: 2 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="tab" style={{
              padding: ".32rem .9rem", borderRadius: ".32rem",
              fontSize: ".62rem", letterSpacing: ".06em",
              background: tab === t.id ? "#00C4B4" : "transparent",
              color: tab === t.id ? "#080B14" : "rgba(244,241,235,.45)",
              fontWeight: tab === t.id ? 700 : 400,
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", maxWidth: 1160, margin: "0 auto", padding: "1.75rem 2rem 3rem", gap: "1.5rem" }}>

        {/* Left sidebar — always visible */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: ".55rem", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(244,241,235,.2)", marginBottom: ".75rem" }}>
            5 Questions + 1 Secret
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: ".45rem" }}>
            {QUESTIONS.map((q, i) => (
              <QCard
                key={q.id}
                q={q}
                isActive={tab === "questions" && activeQ === i}
                onClick={() => { setTab("questions"); setActiveQ(i); }}
                idx={i}
              />
            ))}
          </div>

          {/* Quick stats */}
          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: ".6rem" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: ".55rem", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(244,241,235,.2)", marginBottom: ".75rem" }}>
              Max Ask: 2–3 Questions
            </div>
            {[
              { label: "Questions to prep", val: "6", color: "#00C4B4" },
              { label: "Ideal combo size", val: "2–3", color: "#C9A84C" },
              { label: "Secret question", val: "1", color: "#E85454" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".5rem" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: ".6rem", color: "rgba(244,241,235,.4)" }}>{s.label}</span>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: ".9rem", color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {tab === "questions" && <DetailPanel q={QUESTIONS[activeQ]} />}
          {tab === "combos"    && <CombosPanel />}
          {tab === "whyinvoca" && <WhyInvocaPanel />}
          {tab === "closing"   && <ClosingPanel />}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        position: "relative", zIndex: 1,
        padding: ".85rem 2rem",
        borderTop: "1px solid rgba(255,255,255,.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: ".5rem",
      }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: ".58rem", color: "rgba(244,241,235,.18)" }}>
          Interview War Room  ·  Erwin M. McDonald  ·  Invoca Applied AI Analyst POC
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: ".58rem", color: "rgba(0,196,180,.35)" }}>
          "The insight was always in the conversation."
        </span>
      </footer>
    </div>
  );
}
