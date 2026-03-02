import { useState, useEffect, useRef } from "react";

const SAMPLE_TRANSCRIPT = `CSM: Jordan Rivera | Account: Acme Financial Services | Date: March 12, 2025 | ARR: $284,000 | Renewal: June 30, 2025

Jordan: Thanks for making time today, Marcus. I wanted to check in before the quarter closes.

Marcus: Honestly, Jordan, we need to talk. The call attribution data has been off for six weeks. My paid search team has completely stopped trusting the numbers. We're making media spend decisions based on this data — that's not a small thing.

Jordan: I hear you. Is this tied to the support ticket from February?

Marcus: Yes, ticket's been open 41 days. I escalated twice. Nothing.

Jordan: That's unacceptable and I own that. I'll make sure engineering has a P1 on this by end of week.

Marcus: I appreciate that. The other thing — and I'll be direct — we got a demo from Invoca's competitor last week. Demandbase. They're pitching hard on the attribution piece specifically. The demo was impressive.

Jordan: I understand. What would it take to keep you?

Marcus: Two things: fix the bug, and we need better conversation intelligence. We're doing manual QA on 3% of calls. That's not scalable. If we could get AI-powered scoring across 100% of calls, that changes the math for us completely.

Jordan: That's exactly the roadmap we're on. I can get you in front of the product team next month.

Marcus: One more thing. The renewal — we got the 18% increase notice. I can't get that through finance without showing them ROI. The board is going to ask questions before June.

Jordan: Let me pull together an ROI model this week. I want to make sure you have everything you need for that conversation.

Marcus: That would help. Overall the platform does what we need — but right now the trust is shaken.`;

const SYSTEM_PROMPT = `You are a senior B2B Customer Success intelligence analyst. Extract structured insights from call transcripts.

Return ONLY a valid JSON object with this exact structure — no markdown, no commentary, just raw JSON:
{
  "call_metadata": {
    "csm_name": "string",
    "account_name": "string",
    "account_arr": "string",
    "renewal_date": "string",
    "call_date": "string"
  },
  "insights": [
    {
      "insight_type": "BUG_REPORT",
      "summary": "1-2 sentence structured summary",
      "verbatim_quote": "exact words from transcript or null",
      "sentiment": "negative",
      "urgency": "critical",
      "confidence_score": 0.97,
      "routing_target": "Engineering",
      "suggested_action": "specific next step"
    }
  ]
}

insight_type must be one of: BUG_REPORT, COMPETITOR_MENTION, FEATURE_REQUEST, PRICING_FRICTION, CHURN_SIGNAL, POSITIVE_SIGNAL, GENERAL_FEEDBACK
sentiment must be one of: positive, neutral, negative, critical
urgency must be one of: low, medium, high, critical
routing_target must be one of: Engineering, Sales Leadership, Product Management, Customer Success Leadership, Human Review Queue

Confidence: 0.95+ explicit, 0.85-0.94 clear, 0.75-0.84 reasonable, below 0.75 send to Human Review Queue.
Extract ALL insight types present. Return ONLY the JSON object, nothing else.`;

const INSIGHT_CONFIG = {
  BUG_REPORT: { icon: "🐛", color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Bug Report" },
  COMPETITOR_MENTION: { icon: "🏢", color: "#f97316", bg: "rgba(249,115,22,0.1)", label: "Competitor" },
  FEATURE_REQUEST: { icon: "🔧", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", label: "Feature Request" },
  PRICING_FRICTION: { icon: "💰", color: "#eab308", bg: "rgba(234,179,8,0.1)", label: "Pricing Friction" },
  CHURN_SIGNAL: { icon: "🚨", color: "#dc2626", bg: "rgba(220,38,38,0.15)", label: "Churn Signal" },
  POSITIVE_SIGNAL: { icon: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.1)", label: "Positive Signal" },
  GENERAL_FEEDBACK: { icon: "💬", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", label: "Feedback" },
};

const URGENCY_CONFIG = {
  critical: { color: "#ef4444", label: "CRITICAL" },
  high: { color: "#f97316", label: "HIGH" },
  medium: { color: "#eab308", label: "MEDIUM" },
  low: { color: "#6b7280", label: "LOW" },
};

const ROUTING_CONFIG = {
  "Engineering": { icon: "⚙️", color: "#60a5fa" },
  "Sales Leadership": { icon: "📈", color: "#f97316" },
  "Product Management": { icon: "🗺️", color: "#8b5cf6" },
  "Customer Success Leadership": { icon: "🎯", color: "#ef4444" },
  "Human Review Queue": { icon: "👁️", color: "#6b7280" },
};

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  textarea:focus { outline: none; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulseDot { 0%,100% { box-shadow:0 0 6px #22c55e; } 50% { box-shadow:0 0 16px #22c55e; } }
  .card-anim { animation: fadeUp 0.45s ease forwards; opacity: 0; }
`;

function ConfidenceBar({ score }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.9 ? "#22c55e" : score >= 0.75 ? "#eab308" : "#ef4444";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
      <div style={{ flex:1, height:"5px", background:"rgba(255,255,255,0.07)", borderRadius:"3px", overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:"3px", boxShadow:`0 0 8px ${color}55`, transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
      <span style={{ fontSize:"11px", color, fontFamily:"'DM Mono',monospace", minWidth:"32px", fontWeight:"500" }}>{pct}%</span>
    </div>
  );
}

function InsightCard({ insight, index }) {
  const cfg = INSIGHT_CONFIG[insight.insight_type] || INSIGHT_CONFIG.GENERAL_FEEDBACK;
  const urg = URGENCY_CONFIG[insight.urgency] || URGENCY_CONFIG.medium;
  const rte = ROUTING_CONFIG[insight.routing_target] || { icon:"📌", color:"#6b7280" };
  return (
    <div className="card-anim" style={{ animationDelay:`${index*90}ms`, background:"rgba(255,255,255,0.025)", border:`1px solid ${cfg.color}22`, borderLeft:`3px solid ${cfg.color}`, borderRadius:"8px", padding:"18px 20px", marginBottom:"10px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"11px", gap:"10px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"7px", flexWrap:"wrap" }}>
          <span style={{ background:cfg.bg, border:`1px solid ${cfg.color}33`, borderRadius:"5px", padding:"3px 9px", fontSize:"10px", color:cfg.color, fontFamily:"'DM Mono',monospace", letterSpacing:"0.06em" }}>
            {cfg.icon} {cfg.label}
          </span>
          {insight.confidence_score < 0.75 && (
            <span style={{ background:"rgba(107,114,128,0.12)", border:"1px solid rgba(107,114,128,0.22)", borderRadius:"5px", padding:"3px 9px", fontSize:"10px", color:"#9ca3af", fontFamily:"'DM Mono',monospace" }}>
              👁 HUMAN REVIEW
            </span>
          )}
        </div>
        <span style={{ fontSize:"10px", fontWeight:"700", color:urg.color, fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>
          <span style={{ fontSize:"7px" }}>● </span>{urg.label}
        </span>
      </div>
      <p style={{ fontSize:"14px", color:"#dde6f0", lineHeight:"1.65", margin:"0 0 11px 0", fontFamily:"'Instrument Serif',Georgia,serif" }}>{insight.summary}</p>
      {insight.verbatim_quote && (
        <blockquote style={{ borderLeft:`2px solid ${cfg.color}38`, margin:"0 0 13px 0", paddingLeft:"12px", color:"#8895a7", fontSize:"13px", fontStyle:"italic", fontFamily:"'Instrument Serif',Georgia,serif", lineHeight:"1.6" }}>
          "{insight.verbatim_quote}"
        </blockquote>
      )}
      <div style={{ marginBottom:"13px" }}>
        <div style={{ fontSize:"9px", color:"#4b5563", fontFamily:"'DM Mono',monospace", marginBottom:"5px", letterSpacing:"0.1em" }}>CONFIDENCE SCORE</div>
        <ConfidenceBar score={insight.confidence_score} />
      </div>
      <div style={{ display:"flex", alignItems:"flex-start", gap:"10px", flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"6px", background:"rgba(255,255,255,0.03)", borderRadius:"5px", padding:"5px 11px", border:"1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ fontSize:"12px" }}>{rte.icon}</span>
          <span style={{ fontSize:"11px", color:rte.color, fontFamily:"'DM Mono',monospace", fontWeight:"500" }}>{insight.routing_target}</span>
        </div>
        {insight.suggested_action && (
          <p style={{ fontSize:"11px", color:"#6b7280", margin:0, flex:1, lineHeight:"1.5", fontFamily:"'DM Mono',monospace" }}>→ {insight.suggested_action}</p>
        )}
      </div>
    </div>
  );
}

function RoutingSummary({ insights }) {
  const byTarget = {};
  insights.forEach(i => { if (!byTarget[i.routing_target]) byTarget[i.routing_target] = []; byTarget[i.routing_target].push(i); });
  return (
    <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px", padding:"18px 20px", marginBottom:"22px" }}>
      <div style={{ fontSize:"9px", letterSpacing:"0.12em", color:"#4b5563", fontFamily:"'DM Mono',monospace", marginBottom:"14px" }}>STAKEHOLDER ROUTING SUMMARY</div>
      <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
        {Object.entries(byTarget).map(([target, items]) => {
          const cfg = ROUTING_CONFIG[target] || { icon:"📌", color:"#6b7280" };
          const hasCritical = items.some(i => i.urgency === "critical");
          return (
            <div key={target} style={{ background:`${cfg.color}0d`, border:`1px solid ${cfg.color}22`, borderRadius:"8px", padding:"11px 14px", minWidth:"140px", flex:"1" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"5px" }}>
                <span style={{ fontSize:"13px" }}>{cfg.icon}</span>
                {hasCritical && <span style={{ fontSize:"9px", color:"#ef4444", fontFamily:"'DM Mono',monospace" }}>⚡ CRITICAL</span>}
              </div>
              <div style={{ fontSize:"11px", color:cfg.color, fontFamily:"'DM Mono',monospace", fontWeight:"500", marginBottom:"2px" }}>{target}</div>
              <div style={{ fontSize:"10px", color:"#4b5563", fontFamily:"'DM Mono',monospace" }}>{items.length} insight{items.length!==1?"s":""}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PipelineStatus({ stage }) {
  const stages = ["INGEST","EXTRACT","SCORE","ROUTE","ALERT"];
  const activeIdx = stages.indexOf(stage);
  const isDone = stage === "COMPLETE";
  return (
    <div style={{ display:"flex", alignItems:"center", background:"rgba(0,0,0,0.25)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"8px", padding:"10px 14px", marginBottom:"18px", overflowX:"auto" }}>
      {stages.map((s, i) => {
        const isActive = !isDone && i === activeIdx;
        const isPast = isDone || i < activeIdx;
        return (
          <div key={s} style={{ display:"flex", alignItems:"center" }}>
            <div style={{ fontSize:"10px", fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em", padding:"4px 10px", borderRadius:"4px", whiteSpace:"nowrap", color: isPast?"#22c55e":isActive?"#93c5fd":"#374151", background:isActive?"rgba(99,179,237,0.1)":"transparent", border:isActive?"1px solid rgba(99,179,237,0.22)":"1px solid transparent" }}>
              {isPast?"✓ ":isActive?"⟳ ":""}{s}
            </div>
            {i < stages.length-1 && <div style={{ width:"18px", height:"1px", background:isPast?"#22c55e28":"rgba(255,255,255,0.06)" }} />}
          </div>
        );
      })}
    </div>
  );
}

export default function JTBDApp() {
  const [transcript, setTranscript] = useState(SAMPLE_TRANSCRIPT);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pipelineStage, setPipelineStage] = useState(null);
  const [mounted, setMounted] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  async function runExtraction() {
    if (!transcript.trim() || loading) return;
    setLoading(true); setError(null); setResult(null);
    const stages = ["INGEST","EXTRACT","SCORE","ROUTE","ALERT"];
    let idx = 0;
    const next = async () => { setPipelineStage(stages[idx++]); await new Promise(r=>setTimeout(r,380)); };
    try {
      await next(); // INGEST
      await next(); // EXTRACT
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:2000,
          system:SYSTEM_PROMPT,
          messages:[{role:"user",content:`Extract all insights from this call transcript:\n\n${transcript}`}]
        })
      });
      await next(); // SCORE
      if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e?.error?.message||`HTTP ${res.status}`); }
      const data = await res.json();
      const text = (data.content||[]).map(b=>b.text||"").join("");
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Model did not return valid JSON.");
      const parsed = JSON.parse(match[0]);
      await next(); // ROUTE
      await next(); // ALERT
      setPipelineStage("COMPLETE");
      setResult(parsed);
      setTimeout(() => resultsRef.current?.scrollIntoView({behavior:"smooth",block:"start"}), 200);
    } catch(err) {
      setError(err.message||"Unknown error.");
      setPipelineStage(null);
    } finally { setLoading(false); }
  }

  const insights = result?.insights || [];
  const autoRouted = insights.filter(i=>i.confidence_score>=0.75);
  const humanReview = insights.filter(i=>i.confidence_score<0.75);
  const avgConf = insights.length ? Math.round(insights.reduce((a,i)=>a+i.confidence_score,0)/insights.length*100) : null;

  return (
    <div style={{ minHeight:"100vh", background:"#080c14", backgroundImage:"radial-gradient(ellipse 80% 50% at 50% -10%,rgba(15,52,96,0.45) 0%,transparent 65%),radial-gradient(ellipse 40% 30% at 90% 95%,rgba(25,15,55,0.35) 0%,transparent 50%)", fontFamily:"'DM Mono','Fira Code',monospace", color:"#e2e8f0" }}>
      <style>{GLOBAL_STYLES}</style>

      {/* Header */}
      <div style={{ borderBottom:"1px solid rgba(255,255,255,0.05)", padding:"17px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(0,0,0,0.4)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"13px" }}>
          <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#22c55e", animation:"pulseDot 2s ease-in-out infinite" }} />
          <div>
            <div style={{ fontSize:"12px", letterSpacing:"0.15em", color:"#e2e8f0", fontWeight:"500" }}>JTBD FEEDBACK LOOP</div>
            <div style={{ fontSize:"9px", color:"#2d3a4a", letterSpacing:"0.08em", marginTop:"1px" }}>INSIGHT EXTRACTION ENGINE · INVOCA POC</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:"16px", fontSize:"9px", color:"#2d3a4a", letterSpacing:"0.08em" }}>
          <span>CLAUDE SONNET</span><span>·</span><span>7 INSIGHT TYPES</span><span>·</span><span>AUTO-ROUTING</span>
        </div>
      </div>

      <div style={{ maxWidth:"860px", margin:"0 auto", padding:"40px 24px 60px" }}>
        {/* Hero */}
        <div style={{ opacity:mounted?1:0, transform:mounted?"none":"translateY(10px)", transition:"opacity 0.6s ease, transform 0.6s ease", marginBottom:"34px" }}>
          <h1 style={{ fontSize:"clamp(24px,4.5vw,38px)", fontFamily:"'Instrument Serif',Georgia,serif", fontWeight:"400", lineHeight:"1.25", color:"#f0f6ff", marginBottom:"10px" }}>
            The insight was always there.<br/><span style={{ color:"#243040" }}>The system just wasn't catching it.</span>
          </h1>
          <p style={{ fontSize:"12px", color:"#3a4d60", letterSpacing:"0.04em", lineHeight:"1.7" }}>
            Paste a call transcript → Claude extracts, scores, and routes every insight to the right stakeholder automatically.
          </p>
        </div>

        {/* Transcript */}
        <div style={{ opacity:mounted?1:0, transition:"opacity 0.6s ease 0.1s", marginBottom:"14px" }}>
          <div style={{ fontSize:"9px", color:"#2d3a4a", letterSpacing:"0.12em", marginBottom:"7px", display:"flex", justifyContent:"space-between" }}>
            <span>CALL TRANSCRIPT INPUT</span>
            <button onClick={()=>setTranscript(SAMPLE_TRANSCRIPT)} style={{ background:"none", border:"1px solid rgba(255,255,255,0.07)", color:"#374151", cursor:"pointer", fontSize:"9px", padding:"4px 10px", borderRadius:"4px", letterSpacing:"0.08em" }}>
              LOAD DEMO
            </button>
          </div>
          <textarea value={transcript} onChange={e=>setTranscript(e.target.value)} rows={10} placeholder="Paste call transcript here..."
            style={{ width:"100%", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px", padding:"16px 18px", color:"#8895a7", fontSize:"12px", lineHeight:"1.75", resize:"vertical", fontFamily:"'DM Mono',monospace" }} />
        </div>

        {/* Button */}
        <button onClick={runExtraction} disabled={loading||!transcript.trim()}
          style={{ width:"100%", padding:"14px", background:loading?"rgba(99,179,237,0.04)":"rgba(99,179,237,0.09)", border:`1px solid ${loading?"rgba(99,179,237,0.14)":"rgba(99,179,237,0.32)"}`, borderRadius:"9px", color:loading?"#2d3a4a":"#7cb9f0", fontSize:"11px", letterSpacing:"0.14em", cursor:loading?"not-allowed":"pointer", marginBottom:"26px" }}>
          {loading ? "⟳  EXTRACTING INSIGHTS..." : "▶  RUN EXTRACTION ENGINE"}
        </button>

        {pipelineStage && <PipelineStatus stage={pipelineStage} />}

        {error && (
          <div style={{ background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.18)", borderRadius:"8px", padding:"13px 16px", marginBottom:"18px", fontSize:"11px", color:"#fca5a5", lineHeight:"1.6" }}>
            ⚠ {error}
          </div>
        )}

        {result && (
          <div ref={resultsRef}>
            {result.call_metadata && (
              <div style={{ display:"flex", gap:"18px", flexWrap:"wrap", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"9px", padding:"13px 17px", marginBottom:"16px", fontSize:"10px", color:"#6b7280" }}>
                {[["📞",result.call_metadata.account_name],["👤",result.call_metadata.csm_name],["📅",result.call_metadata.call_date],["💵",result.call_metadata.account_arr],["🔁",result.call_metadata.renewal_date]]
                  .filter(([,v])=>v).map(([icon,val])=>(
                    <span key={icon} style={{ display:"flex", alignItems:"center", gap:"5px" }}><span>{icon}</span><span style={{ color:"#94a3b8" }}>{val}</span></span>
                  ))}
              </div>
            )}

            <div style={{ display:"flex", gap:"10px", marginBottom:"16px", flexWrap:"wrap" }}>
              {[{label:"TOTAL INSIGHTS",value:insights.length,color:"#60a5fa"},{label:"AUTO-ROUTED",value:autoRouted.length,color:"#22c55e"},{label:"HUMAN REVIEW",value:humanReview.length,color:"#6b7280"},{label:"AVG CONFIDENCE",value:avgConf?`${avgConf}%`:"—",color:"#eab308"}]
                .map(s=>(
                  <div key={s.label} style={{ flex:"1", minWidth:"110px", background:"rgba(255,255,255,0.02)", border:`1px solid ${s.color}16`, borderRadius:"8px", padding:"13px 15px" }}>
                    <div style={{ fontSize:"9px", color:"#2d3a4a", letterSpacing:"0.1em", marginBottom:"5px" }}>{s.label}</div>
                    <div style={{ fontSize:"20px", fontWeight:"700", color:s.color, fontFamily:"'DM Mono',monospace" }}>{s.value}</div>
                  </div>
                ))}
            </div>

            {insights.length > 0 && <RoutingSummary insights={insights} />}

            <div style={{ fontSize:"9px", color:"#2d3a4a", letterSpacing:"0.12em", marginBottom:"11px" }}>EXTRACTED INSIGHTS — SORTED BY URGENCY</div>

            {[...insights].sort((a,b)=>({critical:0,high:1,medium:2,low:3}[a.urgency]??2)-({critical:0,high:1,medium:2,low:3}[b.urgency]??2))
              .map((insight,i)=><InsightCard key={i} insight={insight} index={i} />)}

            <div style={{ marginTop:"28px", paddingTop:"18px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", fontSize:"9px", color:"#1a2535", letterSpacing:"0.08em" }}>
              <span>JTBD FEEDBACK LOOP v1.0 · ERWIN M. McDONALD</span>
              <span>INVOCA APPLIED AI ANALYST POC</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
