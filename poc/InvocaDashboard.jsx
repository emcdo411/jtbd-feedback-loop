import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const C = {
  ink:"#0a0e1a", ink2:"#1a2035", ink3:"#2a3050",
  paper:"#f4f1eb", gold:"#c9a84c", teal:"#00c4b4",
  red:"#e85454", orange:"#f07c3a", yellow:"#f5c842",
  green:"#3dbe8a", blue:"#4a8fe8", purple:"#9b72e8",
};

// ─── PIPELINE DATA (exact values from actual pipeline run) ──────────────────
const INSIGHTS = [
  {
    id:"JTBD-20260227-ADD8E43F", type:"bug", urgency:"critical",
    summary:"Call attribution data inconsistent for 6 weeks",
    fullDetail:"Call attribution data has been inconsistent for 6 weeks, creating discrepancies between Invoca reporting and Google Ads dashboard. A support ticket has been open for 41 days without resolution, causing the paid search team to distrust attribution numbers.",
    bugDescription:"Call attribution data discrepancy between Invoca and Google Ads dashboard — 41-day open support ticket, paid search team has lost confidence in attribution numbers",
    sentiment:"critical", confidence:97, sla:"4 hours", urgencyLabel:"CRITICAL",
    route:"Engineering", icon:"🔧",
    action:"P1 Escalation Required",
    transcriptSnippet:"We've flagged it twice to support and the ticket is still open. It's not a minor thing — we're making media spend decisions based on this data.",
    suggestedAction:"Escalate to Engineering as P1. Assign owner and provide ETA by end of week. CSM to confirm escalation to customer within 24 hours.",
    csm:"Jordan Rivera", account:"Acme Financial Services", arr:"$84,000", renewal:"June 30, 2025"
  },
  {
    id:"JTBD-20260227-15CF8965", type:"churn", urgency:"critical",
    summary:"Renewal at risk — board-level scrutiny implied",
    fullDetail:"Customer stated that if the attribution bug is not fixed and pricing is not addressed before June renewal, she does not know what the board will say — implying renewal is at risk.",
    sentiment:"critical", confidence:93, sla:"4 hours", urgencyLabel:"CRITICAL",
    route:"CS Leadership", icon:"🤝",
    action:"Renewal Risk — Flag Immediately",
    transcriptSnippet:"The bug needs to get fixed and the pricing conversation needs to happen before June. Otherwise honestly I don't know what the board is going to say.",
    suggestedAction:"Flag account as renewal risk. Escalate to CS leadership and Sales VP. Two hard dependencies: (1) attribution bug resolved, (2) pricing options delivered before June renewal conversation.",
    csm:"Jordan Rivera", account:"Acme Financial Services", arr:"$84,000", renewal:"June 30, 2025"
  },
  {
    id:"JTBD-20260227-FB0AFF20", type:"competitive", urgency:"high",
    summary:"Marchex demo — omnichannel pitch to customer leadership",
    fullDetail:"Acme Financial had a demo with Marchex last month. Marchex pitched 'omnichannel conversation intelligence.' Customer's leadership is asking questions about alternatives. Customer stated they are not leaving but are being asked to evaluate.",
    competitorNamed:"Marchex",
    sentiment:"negative", confidence:96, sla:"48 hours", urgencyLabel:"HIGH",
    route:"Sales Leadership", icon:"💼",
    action:"Battlecard · Competitor: Marchex",
    transcriptSnippet:"We had a demo with Marchex last month. They were pitching something they called 'omnichannel conversation intelligence.' We're not going anywhere, but I want to be transparent that we're being asked to evaluate alternatives.",
    suggestedAction:"Alert Sales Leadership immediately. Prepare competitive battlecard for Marchex omnichannel claim. Ensure renewal conversation addresses this directly.",
    csm:"Jordan Rivera", account:"Acme Financial Services", arr:"$84,000", renewal:"June 30, 2025"
  },
  {
    id:"JTBD-20260227-241840B7", type:"pricing", urgency:"high",
    summary:"18% increase vs 15% budget cut — cannot get through finance",
    fullDetail:"Customer received an 18% renewal price increase while their own marketing budget was cut 15% this quarter. Customer stated they cannot get the increase through finance and will need pricing options before June renewal.",
    sentiment:"negative", confidence:98, sla:"48 hours", urgencyLabel:"HIGH",
    route:"Sales Leadership", icon:"💼",
    action:"Pricing Options Needed Before June",
    transcriptSnippet:"The price increase is 18%. I understand costs go up but our marketing budget got cut 15% this quarter. I'm going to have a hard time getting this through finance at that number.",
    suggestedAction:"Escalate to Sales Leadership before formal renewal discussions. CSM to request pricing options from leadership within 1 week. Renewal at risk if not addressed.",
    csm:"Jordan Rivera", account:"Acme Financial Services", arr:"$84,000", renewal:"June 30, 2025"
  },
  {
    id:"JTBD-20260227-62EF015C", type:"feature", urgency:"medium",
    summary:"Unified omnichannel intelligence — SMS and chat parity",
    fullDetail:"Customer is expanding into SMS and chat channels and wants unified omnichannel conversation intelligence — the same intent scoring and attribution Invoca provides for calls, extended across all customer interaction channels.",
    featureRequested:"Unified omnichannel conversation intelligence — intent scoring and attribution across calls, SMS, and chat channels",
    sentiment:"neutral", confidence:91, sla:"1 week", urgencyLabel:"MEDIUM",
    route:"Product Management", icon:"📋",
    action:"Roadmap Consideration",
    transcriptSnippet:"It would be really valuable if there was some kind of unified view — like, the same kind of intent scoring and attribution you do for calls but across all the channels where customers are reaching us.",
    suggestedAction:"Route to Product Management for roadmap consideration. Document as strategic gap — customer has confirmed Marchex is pitching this capability.",
    csm:"Jordan Rivera", account:"Acme Financial Services", arr:"$84,000", renewal:"June 30, 2025"
  },
  {
    id:"JTBD-20260227-5236848F", type:"positive", urgency:"low",
    summary:"+23% qualified lead rate — VP credited Invoca call scoring",
    fullDetail:"Inside sales team attributes a 23% improvement in qualified lead rate this quarter to Invoca call scoring. Customer VP explicitly credited the platform and described the outcome as 'huge.'",
    sentiment:"positive", confidence:99, sla:"1 week", urgencyLabel:"LOW",
    route:"Product Management", icon:"📋",
    action:"Capture as Case Study",
    transcriptSnippet:"Our inside sales team actually credits Invoca with a 23% improvement in qualified lead rate this quarter, which is huge.",
    suggestedAction:"Capture as customer success story. Use in renewal conversation to anchor value. Share with Marketing for case study consideration.",
    csm:"Jordan Rivera", account:"Acme Financial Services", arr:"$84,000", renewal:"June 30, 2025"
  }
];

const UC = { critical:C.red, high:C.orange, medium:C.yellow, low:C.green };
const SC = { critical:C.red, negative:C.orange, neutral:"rgba(244,241,235,0.5)", positive:C.green };

// ─── GLOBAL CSS ──────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:${C.ink}; color:${C.paper}; font-family:'DM Sans',sans-serif; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes pgDot  { 0%,100%{opacity:1;transform:scale(1);box-shadow:0 0 0 0 rgba(61,190,138,.4)} 50%{opacity:.5;transform:scale(1.2);box-shadow:0 0 0 8px rgba(61,190,138,0)} }
  @keyframes prDot  { 0%,100%{box-shadow:0 0 4px ${C.red}} 50%{box-shadow:0 0 14px ${C.red},0 0 28px ${C.red}44} }
  @keyframes nodePls { 0%,100%{box-shadow:0 0 10px rgba(0,196,180,.2)} 50%{box-shadow:0 0 26px rgba(0,196,180,.5)} }
  @keyframes modalIn { from{opacity:0;transform:scale(.93) translateY(22px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes flowArrow { 0%{stroke-dashoffset:40} 100%{stroke-dashoffset:0} }
  @keyframes grain { 0%,100%{transform:translate(0,0)} 20%{transform:translate(1%,1%)} 40%{transform:translate(-1%,1%)} 60%{transform:translate(1%,-1%)} 80%{transform:translate(-1%,-1%)} }
  @keyframes shimBar { from{width:0} to{width:var(--w)} }

  .grain { position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.03;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    animation:grain .4s steps(1) infinite; }

  .ch:hover { transform:translateY(-2px) translateX(2px)!important; box-shadow:0 10px 36px rgba(0,0,0,.38)!important; }
  .ch { transition:transform .18s ease,box-shadow .18s ease,background .18s ease; }

  ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(201,168,76,.3);border-radius:2px}

  .btn-base { border:none;cursor:pointer;font-family:'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;transition:all .2s ease; }
`;

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useCountUp(target, ms=1400, delay=0) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const s = performance.now();
      const tick = (now) => {
        const p = Math.min((now-s)/ms, 1);
        const e = 1-Math.pow(1-p,3);
        setV(Math.round(e*target));
        if(p<1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [target,ms,delay]);
  return v;
}

function useFadeUp(delay=0) {
  const r = useRef(null);
  useEffect(() => {
    const el = r.current; if(!el) return;
    el.style.cssText += ";opacity:0;transform:translateY(18px)";
    const t = setTimeout(() => {
      el.style.transition = "opacity .6s ease,transform .6s ease";
      el.style.opacity = "1"; el.style.transform = "translateY(0)";
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);
  return r;
}

// ─── ANIMATED CONFIDENCE BAR ─────────────────────────────────────────────────
function ConfBar({ pct }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t=setTimeout(()=>setW(pct),600); return()=>clearTimeout(t); }, [pct]);
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,height:3,borderRadius:2,background:"rgba(255,255,255,.08)",overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${C.teal},${C.gold})`,width:`${w}%`,transition:"width 1.3s cubic-bezier(.22,1,.36,1)"}}/>
      </div>
      <span style={{fontFamily:"'DM Mono'",fontSize:".6rem",color:C.teal,whiteSpace:"nowrap"}}>{pct}%</span>
    </div>
  );
}

// ─── SVG DONUT ───────────────────────────────────────────────────────────────
function Donut({ segs, size=130, sw=13, label, sub }) {
  const r=(size-sw)/2, circ=2*Math.PI*r;
  const [go, setGo] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setGo(true),500);return()=>clearTimeout(t);},[]);
  let off=0;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth={sw}/>
        {segs.map((s,i)=>{
          const dash=go?(s.p/100)*circ:0, gap=circ-dash;
          const el=(<circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.c} strokeWidth={sw}
            strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-off*circ/100}
            style={{transition:`stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1) ${i*.12}s`}}/>);
          off+=s.p; return el;
        })}
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontFamily:"'DM Serif Display'",fontSize:"1.5rem",color:C.paper}}>{label}</span>
        {sub&&<span style={{fontFamily:"'DM Mono'",fontSize:".5rem",color:"rgba(244,241,235,.4)",letterSpacing:".1em",textTransform:"uppercase",marginTop:2}}>{sub}</span>}
      </div>
    </div>
  );
}

// ─── KPI CARD ────────────────────────────────────────────────────────────────
function Kpi({ label, value, suffix="", prefix="", sub, color, delay }) {
  const r = useFadeUp(delay);
  const n = useCountUp(typeof value==="number"?Math.round(value):0, 1400, delay);
  return (
    <div ref={r} style={{background:C.ink2,borderRadius:"1.25rem",padding:"1.25rem 1.5rem",position:"relative",overflow:"hidden",border:"1px solid rgba(255,255,255,.07)",flex:1,minWidth:0}}>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:color,borderRadius:"0 0 1.25rem 1.25rem"}}/>
      <div style={{fontFamily:"'DM Mono'",fontSize:".64rem",letterSpacing:".12em",textTransform:"uppercase",color:"rgba(244,241,235,.45)",marginBottom:".6rem"}}>{label}</div>
      <div style={{fontFamily:"'DM Serif Display'",fontSize:"2.4rem",lineHeight:1,color}}>
        {prefix}{typeof value==="number"?n:value}{suffix}
      </div>
      {sub&&<div style={{fontFamily:"'DM Mono'",fontSize:".68rem",color:"rgba(244,241,235,.4)",marginTop:4}}>{sub}</div>}
    </div>
  );
}

// ─── INSIGHT CARD ────────────────────────────────────────────────────────────
function InsCard({ ins, onOpen, delay=0 }) {
  const r = useFadeUp(delay);
  const col = UC[ins.urgency];
  return (
    <div ref={r} className="ch" onClick={()=>onOpen(ins)}
      style={{background:C.ink3,borderRadius:".75rem",padding:".85rem",marginBottom:".65rem",borderLeft:`3px solid ${col}`,cursor:"pointer",position:"relative",overflow:"hidden"}}>
      {ins.urgency==="critical"&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${col}66,${col})`}}/>}
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:col,flexShrink:0,animation:ins.urgency==="critical"?"prDot 1.5s infinite":"none"}}/>
        <span style={{fontFamily:"'DM Mono'",fontSize:".56rem",letterSpacing:".1em",textTransform:"uppercase",color:"rgba(244,241,235,.45)"}}>{ins.type}</span>
        <span style={{marginLeft:"auto",fontFamily:"'DM Mono'",fontSize:".54rem",padding:".1rem .4rem",borderRadius:".2rem",background:ins.urgency==="critical"?"rgba(232,84,84,.15)":"rgba(255,255,255,.06)",color:ins.urgency==="critical"?C.red:"rgba(244,241,235,.4)"}}>
          {ins.sla} · {ins.urgencyLabel}
        </span>
      </div>
      <div style={{fontSize:".73rem",lineHeight:1.5,color:"rgba(244,241,235,.8)",marginBottom:7}}>{ins.summary}</div>
      <ConfBar pct={ins.confidence}/>
      {(ins.urgency==="critical"||ins.urgency==="high")&&(
        <div style={{marginTop:6,fontFamily:"'DM Mono'",fontSize:".54rem",color:C.gold,display:"flex",alignItems:"center",gap:4}}>
          <span>⚡</span>{ins.action}
        </div>
      )}
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
function Modal({ ins, onClose }) {
  useEffect(()=>{
    const h=(e)=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",h);
    return()=>document.removeEventListener("keydown",h);
  },[onClose]);
  const col=UC[ins.urgency];
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(10,14,26,.9)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem",animation:"fadeIn .2s ease both"}}>
      <div style={{background:C.ink2,borderRadius:"1.25rem",width:"100%",maxWidth:640,border:"1px solid rgba(255,255,255,.1)",animation:"modalIn .25s ease both",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{height:3,background:col,borderRadius:"1.25rem 1.25rem 0 0"}}/>
        {/* Head */}
        <div style={{padding:"1.25rem 1.5rem",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"sticky",top:0,background:C.ink2,zIndex:1}}>
          <div>
            <div style={{fontFamily:"'DM Mono'",fontSize:".58rem",letterSpacing:".12em",textTransform:"uppercase",color:"rgba(244,241,235,.4)",marginBottom:4}}>
              {ins.icon} {ins.type} · {ins.route} · {ins.urgencyLabel}
            </div>
            <div style={{fontFamily:"'DM Serif Display'",fontSize:"1.2rem"}}>{ins.summary}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:"1.2rem",color:"rgba(244,241,235,.4)",lineHeight:1,flexShrink:0,padding:".1rem",transition:"color .2s"}}
            onMouseOver={e=>e.target.style.color=C.paper} onMouseOut={e=>e.target.style.color="rgba(244,241,235,.4)"}>✕</button>
        </div>
        {/* Body */}
        <div style={{padding:"1.25rem 1.5rem"}}>
          <div style={{fontFamily:"'DM Serif Display'",fontStyle:"italic",fontSize:".95rem",lineHeight:1.6,borderLeft:`3px solid ${C.gold}`,paddingLeft:"1rem",marginBottom:"1.25rem"}}>{ins.transcriptSnippet}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".75rem",marginBottom:"1rem"}}>
            <MF label="Summary" value={ins.fullDetail} full/>
            {ins.bugDescription&&<MF label="Bug Description" value={ins.bugDescription} full/>}
            {ins.featureRequested&&<MF label="Feature Requested" value={ins.featureRequested} full/>}
            {ins.competitorNamed&&<MF label="Competitor Named" value={ins.competitorNamed}/>}
            <MF label="Sentiment" value={ins.sentiment} color={SC[ins.sentiment]} mono/>
            <MF label="Urgency · SLA" value={`${ins.urgencyLabel} · ${ins.sla}`} color={col} mono/>
            <MF label="Destination · SLA" value={`${ins.route} · ${ins.sla}`}/>
            <MF label="Account · CSM" value={`${ins.account} · ${ins.csm}`}/>
            <MF label="ARR · Renewal" value={`${ins.arr} · ${ins.renewal}`}/>
          </div>
          <div style={{marginBottom:".75rem"}}>
            <div style={{fontFamily:"'DM Mono'",fontSize:".58rem",letterSpacing:".12em",textTransform:"uppercase",color:"rgba(244,241,235,.35)",marginBottom:6}}>Routing Confidence</div>
            <ConfBar pct={ins.confidence}/>
          </div>
          <div style={{background:"rgba(0,196,180,.08)",border:"1px solid rgba(0,196,180,.22)",borderRadius:".75rem",padding:".85rem 1rem"}}>
            <div style={{fontFamily:"'DM Mono'",fontSize:".58rem",letterSpacing:".12em",textTransform:"uppercase",color:C.teal,marginBottom:5}}>⚡ Suggested Action</div>
            <div style={{fontSize:".78rem",color:"rgba(244,241,235,.85)",lineHeight:1.5}}>{ins.suggestedAction}</div>
          </div>
        </div>
        <div style={{padding:".9rem 1.5rem",borderTop:"1px solid rgba(255,255,255,.06)",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,.02)"}}>
          <div>
            <div style={{fontFamily:"'DM Mono'",fontSize:".6rem",color:"rgba(244,241,235,.25)"}}>Alert ID: {ins.id}</div>
            <div style={{fontFamily:"'DM Mono'",fontSize:".53rem",color:"rgba(244,241,235,.18)",fontStyle:"italic"}}>IDs regenerate each pipeline run</div>
          </div>
          <span style={{fontFamily:"'DM Mono'",fontSize:".68rem",color:C.teal}}>Confidence: {ins.confidence}%</span>
        </div>
      </div>
    </div>
  );
}

function MF({ label, value, full, color, mono }) {
  return (
    <div style={{gridColumn:full?"1/-1":undefined}}>
      <div style={{fontFamily:"'DM Mono'",fontSize:".57rem",letterSpacing:".12em",textTransform:"uppercase",color:"rgba(244,241,235,.35)",marginBottom:4}}>{label}</div>
      <div style={{fontSize:".77rem",color:color||"rgba(244,241,235,.8)",lineHeight:1.45,fontFamily:mono?"'DM Mono'":undefined}}>{value}</div>
    </div>
  );
}

// ─── PANEL WRAPPER ────────────────────────────────────────────────────────────
function Panel({ title, badge, children, delay=0, fullWidth=false, accentGrad }) {
  const r=useFadeUp(delay);
  return (
    <div ref={r} style={{background:C.ink2,borderRadius:"1.25rem",border:"1px solid rgba(255,255,255,.07)",overflow:"hidden",gridColumn:fullWidth?"1/-1":undefined,position:"relative"}}>
      {accentGrad&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:accentGrad}}/>}
      <div style={{padding:"1.1rem 1.5rem .8rem",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontFamily:"'DM Mono'",fontSize:".67rem",letterSpacing:".14em",textTransform:"uppercase",color:"rgba(244,241,235,.5)"}}>{title}</span>
        {badge&&<span style={{fontFamily:"'DM Mono'",fontSize:".58rem",padding:".2rem .55rem",borderRadius:".25rem",background:"rgba(201,168,76,.12)",color:C.gold}}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── PIPELINE FLOW ────────────────────────────────────────────────────────────
function PipeFlow() {
  const steps=[
    {e:"📞",l:"Ingest",s:"Transcript loaded",st:"done"},
    {e:"🤖",l:"Extract",s:"Claude API · 3-layer prompt",st:"done"},
    {e:"🎯",l:"Score",s:"Confidence 0.0–1.0",st:"done"},
    {e:"🔀",l:"Gate",s:"≥75% auto-route",st:"done"},
    {e:"🚦",l:"Route",s:"4 teams · SLA assigned",st:"active"},
    {e:"📋",l:"Alert",s:"Structured + verbatim",st:"done"},
    {e:"✅",l:"Confirm",s:"CSM loop closed · 6/6",st:"done"},
  ];
  return (
    <div style={{display:"flex",alignItems:"center",padding:"1.25rem 1.5rem",overflowX:"auto"}}>
      {steps.map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",flex:1,minWidth:0}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",flex:1}}>
            <div style={{width:46,height:46,borderRadius:"50%",background:s.st==="done"?"rgba(61,190,138,.12)":C.ink3,border:`2px solid ${s.st==="done"?C.green:s.st==="active"?C.teal:"rgba(255,255,255,.1)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",marginBottom:5,animation:s.st==="active"?"nodePls 2s ease-in-out infinite":"none",boxShadow:s.st==="active"?`0 0 14px ${C.teal}44`:"none"}}>
              {s.e}
            </div>
            <div style={{fontFamily:"'DM Mono'",fontSize:".58rem",letterSpacing:".08em",textTransform:"uppercase",color:s.st==="done"?C.green:s.st==="active"?C.teal:"rgba(244,241,235,.4)"}}>{s.l}</div>
            <div style={{fontFamily:"'DM Mono'",fontSize:".5rem",color:"rgba(244,241,235,.25)",marginTop:2}}>{s.s}</div>
          </div>
          {i<steps.length-1&&(
            <svg width={28} height={14} viewBox="0 0 28 14" style={{flexShrink:0,marginBottom:18}}>
              <line x1={0} y1={7} x2={24} y2={7} stroke={i<4?C.green:"rgba(0,196,180,.3)"} strokeWidth={2} strokeDasharray={i===4?"4 3":"none"} style={{animation:i===4?"flowArrow 1s linear infinite":"none"}}/>
              <polygon points="22,3 28,7 22,11" fill={i<4?C.green:C.teal}/>
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── CURRENT STATE VIEW ───────────────────────────────────────────────────────
function CurrentState({ onFlip }) {
  return (
    <div style={{padding:"2rem 3rem",animation:"fadeUp .4s ease both",position:"relative",zIndex:1}}>
      <div style={{background:C.ink2,borderRadius:"1.25rem",padding:"2.5rem",border:"1px solid rgba(232,84,84,.3)",maxWidth:960,margin:"0 auto"}}>
        <div style={{fontFamily:"'DM Mono'",fontSize:".65rem",letterSpacing:".12em",textTransform:"uppercase",color:C.red,marginBottom:"1.25rem"}}>⚠ Current State — The Insight Black Hole</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1.5rem",marginBottom:"2rem"}}>
          {[
            {icon:"📋",title:"Manual CRM Entry",pain:"CSMs spend 15–20 min per call typing notes. Inconsistent fields. No structure. Critical signal buried in free text that no one reads."},
            {icon:"🏝️",title:"Siloed Data",pain:"Engineering never sees bug patterns. PM never sees feature velocity. Sales never sees churn signals — until it's too late to act."},
            {icon:"🚫",title:"No Routing or SLA",pain:"Critical insights sit in Salesforce for weeks. No SLA. No confirmation. No closed loop. Stakeholders fly blind at renewal time."},
          ].map(item=>(
            <div key={item.title} style={{background:C.ink3,borderRadius:".75rem",padding:"1.5rem"}}>
              <div style={{fontSize:"1.8rem",marginBottom:10}}>{item.icon}</div>
              <div style={{fontFamily:"'DM Mono'",fontSize:".65rem",color:C.red,letterSpacing:".08em",marginBottom:8}}>{item.title}</div>
              <div style={{fontSize:".75rem",color:"rgba(244,241,235,.65)",lineHeight:1.6}}>{item.pain}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center"}}>
          <button onClick={onFlip} className="btn-base" style={{background:`linear-gradient(135deg,${C.teal},${C.green})`,borderRadius:".5rem",padding:".75rem 2.5rem",fontSize:".7rem",color:C.ink,fontWeight:600,letterSpacing:".12em"}}>
            → See the Future State
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CSM VIEW ─────────────────────────────────────────────────────────────────
function CsmView() {
  const critical=INSIGHTS.filter(i=>i.urgency==="critical");
  const high=INSIGHTS.filter(i=>i.urgency==="high");
  return (
    <div style={{padding:"1.5rem 3rem",animation:"fadeUp .4s ease both",position:"relative",zIndex:1}}>
      <Panel title="👤 CSM View — Here's What YOU Need to Do Right Now" badge="Pillar 3 · Stakeholder Mgmt" delay={50}>
        <div style={{padding:"1.25rem 1.5rem"}}>
          <div style={{fontFamily:"'DM Mono'",fontSize:".65rem",color:C.teal,letterSpacing:".1em",marginBottom:"1rem"}}>No technical noise. Just your actions, priority-ordered.</div>
          {critical.map(ins=>(
            <div key={ins.id} style={{background:"rgba(232,84,84,.07)",border:"1px solid rgba(232,84,84,.25)",borderRadius:".75rem",padding:"1rem 1.25rem",marginBottom:".75rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontFamily:"'DM Mono'",fontSize:".6rem",color:C.red,letterSpacing:".1em"}}>🔴 DO THIS NOW — SLA: {ins.sla}</span>
                <span style={{fontFamily:"'DM Mono'",fontSize:".58rem",color:"rgba(244,241,235,.3)"}}>{ins.id}</span>
              </div>
              <div style={{fontSize:".88rem",fontWeight:600,marginBottom:6}}>{ins.action}</div>
              <div style={{fontSize:".75rem",color:"rgba(244,241,235,.7)",lineHeight:1.5}}>{ins.suggestedAction}</div>
            </div>
          ))}
          {high.map(ins=>(
            <div key={ins.id} style={{background:"rgba(240,124,58,.07)",border:"1px solid rgba(240,124,58,.22)",borderRadius:".75rem",padding:"1rem 1.25rem",marginBottom:".75rem"}}>
              <div style={{fontFamily:"'DM Mono'",fontSize:".6rem",color:C.orange,letterSpacing:".1em",marginBottom:6}}>🟠 DO TODAY — SLA: {ins.sla}</div>
              <div style={{fontSize:".88rem",fontWeight:600,marginBottom:6}}>{ins.action}</div>
              <div style={{fontSize:".75rem",color:"rgba(244,241,235,.7)",lineHeight:1.5}}>{ins.suggestedAction}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ─── ARCH PANEL ───────────────────────────────────────────────────────────────
function ArchPanel() {
  const [open,setOpen]=useState(false);
  return (
    <div style={{background:C.ink2,borderRadius:"1.25rem",border:"1px solid rgba(255,255,255,.07)",overflow:"hidden",gridColumn:"1/-1"}}>
      <button onClick={()=>setOpen(!open)} className="btn-base" style={{width:"100%",padding:"1rem 1.5rem",background:"none",display:"flex",alignItems:"center",justifyContent:"space-between",color:C.paper}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:"'DM Mono'",fontSize:".68rem",letterSpacing:".14em",color:"rgba(244,241,235,.5)"}}>⚙ Architecture Panel</span>
          <span style={{fontFamily:"'DM Mono'",fontSize:".58rem",padding:".2rem .5rem",borderRadius:".2rem",background:"rgba(201,168,76,.12)",color:C.gold}}>Pillar 2 · The Build</span>
        </div>
        <span style={{color:C.teal,fontSize:".8rem",transform:open?"rotate(180deg)":"none",transition:"transform .2s"}}>▼</span>
      </button>
      {open&&(
        <div style={{padding:"0 1.5rem 1.5rem",animation:"fadeUp .3s ease both"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem"}}>
            <div>
              <div style={{fontFamily:"'DM Mono'",fontSize:".6rem",letterSpacing:".1em",textTransform:"uppercase",color:C.teal,marginBottom:10}}>Tech Stack</div>
              {[
                ["Input","CSM call transcripts (.txt / stream)"],
                ["Extraction","Python + Anthropic SDK (claude-sonnet-4-6)"],
                ["Schema","Typed dataclasses — ExtractedInsight, RoutedAlert"],
                ["Routing","ROUTING_RULES table → 5 destinations + SLA"],
                ["Gate","≥75% confidence auto-route · <75% → Human Queue"],
                ["Output","Structured JSON + terminal alerts + React dashboard"],
              ].map(([k,v])=>(
                <div key={k} style={{display:"flex",gap:8,marginBottom:7}}>
                  <span style={{fontFamily:"'DM Mono'",fontSize:".6rem",color:C.gold,whiteSpace:"nowrap",minWidth:80}}>{k}:</span>
                  <span style={{fontSize:".72rem",color:"rgba(244,241,235,.7)"}}>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontFamily:"'DM Mono'",fontSize:".6rem",letterSpacing:".1em",textTransform:"uppercase",color:C.teal,marginBottom:10}}>Extraction Prompt Template</div>
              <div style={{background:C.ink,borderRadius:".5rem",padding:".9rem 1rem",fontFamily:"'DM Mono'",fontSize:".6rem",color:C.green,lineHeight:1.7,border:"1px solid rgba(255,255,255,.05)"}}>
                <span style={{color:C.purple}}>SYSTEM</span>: You are a senior CSM analyst.<br/>
                Extract all insights as a JSON array.<br/>
                Each insight must include:<br/>
                &nbsp;insight_type, summary, verbatim_quote,<br/>
                &nbsp;sentiment, urgency, confidence_score,<br/>
                &nbsp;routing_target, suggested_action<br/><br/>
                <span style={{color:C.purple}}>CONFIDENCE CALIBRATION</span>:<br/>
                &nbsp;0.90–1.00 → High, auto-route<br/>
                &nbsp;0.75–0.89 → Confident, auto-route<br/>
                &nbsp;0.60–0.74 → Uncertain, flag<br/>
                &nbsp;0.00–0.59 → Low, human review<br/><br/>
                <span style={{color:C.gold}}>PROMPT_VERSION</span>: v1.0.0
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROADMAP ──────────────────────────────────────────────────────────────────
function Roadmap() {
  const ms=[
    {ph:"Now",label:"MVP POC",items:["File-based transcript input","Python + Claude pipeline","This dashboard"],col:C.green},
    {ph:"3 mo",label:"Integration",items:["Native Invoca call stream","Salesforce write-back","Webhook delivery"],col:C.teal},
    {ph:"6 mo",label:"Scale",items:["Slack alert delivery","Multi-CSM rollout","SLA compliance tracking"],col:C.blue},
    {ph:"12 mo",label:"Intelligence",items:["Pattern aggregation agent","Auto-PM digest","Cross-account signals"],col:C.purple},
    {ph:"18 mo",label:"Prediction",items:["Predictive churn signals","Auto-Jira tickets","Renewal risk scoring"],col:C.gold},
  ];
  return (
    <div style={{padding:"1.25rem 1.5rem",overflowX:"auto"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:0,minWidth:640,position:"relative"}}>
        <div style={{position:"absolute",top:20,left:"5%",right:"5%",height:2,background:`linear-gradient(90deg,${C.green},${C.gold})`,zIndex:0}}/>
        {ms.map((m,i)=>(
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",position:"relative",zIndex:1}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:C.ink2,border:`2px solid ${m.col}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8,boxShadow:`0 0 14px ${m.col}44`}}>
              <span style={{fontFamily:"'DM Mono'",fontSize:".52rem",color:m.col,fontWeight:600}}>{m.ph}</span>
            </div>
            <div style={{fontFamily:"'DM Mono'",fontSize:".62rem",color:m.col,letterSpacing:".06em",marginBottom:6,textAlign:"center"}}>{m.label}</div>
            <div style={{background:C.ink3,borderRadius:".5rem",padding:".6rem .75rem",border:`1px solid ${m.col}33`,width:"90%"}}>
              {m.items.map((it,j)=>(
                <div key={j} style={{fontSize:".63rem",color:"rgba(244,241,235,.65)",lineHeight:1.55,paddingLeft:8,position:"relative"}}>
                  <span style={{position:"absolute",left:0,color:m.col}}>·</span>{it}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CONFIRMATIONS ────────────────────────────────────────────────────────────
function Confirms() {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:".75rem",padding:"1.25rem 1.5rem"}}>
      {INSIGHTS.map(ins=>(
        <div key={ins.id} style={{background:C.ink3,borderRadius:".75rem",padding:".85rem 1rem",border:"1px solid rgba(61,190,138,.18)",display:"flex",gap:".7rem"}}>
          <span style={{fontSize:"1rem",flexShrink:0,marginTop:2}}>✅</span>
          <div>
            <div style={{fontFamily:"'DM Mono'",fontSize:".58rem",letterSpacing:".1em",textTransform:"uppercase",color:C.green,marginBottom:3}}>Insight Confirmed</div>
            <div style={{fontFamily:"'DM Mono'",fontSize:".56rem",color:"rgba(244,241,235,.28)",marginBottom:4}}>{ins.id} · {ins.type}</div>
            <div style={{fontSize:".68rem",color:"rgba(244,241,235,.72)",lineHeight:1.4}}>Your {ins.type} from {ins.account} has been routed to {ins.route}.</div>
            <div style={{fontFamily:"'DM Mono'",fontSize:".58rem",color:"rgba(244,241,235,.33)",marginTop:4}}>SLA: <span style={{color:C.teal}}>{ins.sla}</span> · Confidence: <span style={{color:C.teal}}>{ins.confidence}%</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── TOGGLE ───────────────────────────────────────────────────────────────────
function Toggle({ opts, val, set }) {
  return (
    <div style={{display:"flex",background:C.ink3,borderRadius:".5rem",padding:3,border:"1px solid rgba(255,255,255,.07)",gap:0}}>
      {opts.map(o=>(
        <button key={o.v} onClick={()=>set(o.v)} className="btn-base"
          style={{padding:".32rem .8rem",borderRadius:".32rem",fontSize:".62rem",background:val===o.v?C.teal:"transparent",color:val===o.v?C.ink:"rgba(244,241,235,.5)"}}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function App() {
  const [modal, setModal] = useState(null);
  const [viewMode, setViewMode] = useState("future"); // future | current | csm
  const byRoute = {
    Engineering: INSIGHTS.filter(i=>i.route==="Engineering"),
    "CS Leadership": INSIGHTS.filter(i=>i.route==="CS Leadership"),
    "Sales Leadership": INSIGHTS.filter(i=>i.route==="Sales Leadership"),
    "Product Management": INSIGHTS.filter(i=>i.route==="Product Management"),
  };

  return (
    <div style={{minHeight:"100vh",background:C.ink,color:C.paper,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{CSS}</style>
      <div className="grain"/>

      {/* ═══ HEADER ═══════════════════════════════════════════════════════════ */}
      <header style={{position:"relative",zIndex:10,padding:"1.75rem 3rem 1.5rem",borderBottom:"1px solid rgba(201,168,76,.2)",background:"linear-gradient(180deg,rgba(0,196,180,.055) 0%,transparent 100%)",display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem",animation:"fadeUp .5s ease both"}}>
        <div>
          <div style={{fontFamily:"'DM Mono'",fontSize:".68rem",fontWeight:500,letterSpacing:".18em",textTransform:"uppercase",color:C.teal,marginBottom:".4rem",display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:24,height:1,background:C.teal,display:"inline-block"}}/>
            Invoca · JTBD Feedback Loop
          </div>
          <h1 style={{fontFamily:"'DM Serif Display'",fontSize:"clamp(1.6rem,3vw,2.4rem)",fontWeight:400,lineHeight:1.1}}>
            Insight <em style={{fontStyle:"italic",color:C.gold}}>Intelligence</em> Dashboard
          </h1>
          <div style={{fontFamily:"'DM Mono'",fontSize:".72rem",color:"rgba(244,241,235,.45)",marginTop:".5rem"}}>
            ACCOUNT: Acme Financial Services &nbsp;·&nbsp; CSM: Jordan Rivera &nbsp;·&nbsp; ARR: $84,000 &nbsp;·&nbsp; Renewal: June 30, 2025
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:".65rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:".65rem",flexWrap:"wrap"}}>
            {/* Live badge */}
            <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(61,190,138,.12)",border:"1px solid rgba(61,190,138,.3)",borderRadius:"2rem",padding:".3rem .85rem",fontFamily:"'DM Mono'",fontSize:".68rem",color:C.green,letterSpacing:".1em"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:C.green,animation:"pgDot 1.8s ease-in-out infinite"}}/>
              PIPELINE COMPLETE
            </div>
            {/* Pillar 1 — Process Design toggle */}
            <Toggle
              opts={[{v:"current",l:"Current State"},{v:"future",l:"Future State →"}]}
              val={viewMode==="csm"?"future":viewMode}
              set={v=>{if(viewMode!=="csm")setViewMode(v); else setViewMode(v);}}
            />
            {/* Pillar 3 — CSM View toggle */}
            <button onClick={()=>setViewMode(m=>m==="csm"?"future":"csm")} className="btn-base"
              style={{padding:".32rem .8rem",borderRadius:".32rem",fontSize:".62rem",background:viewMode==="csm"?"rgba(74,143,232,.2)":"rgba(255,255,255,.05)",border:`1px solid ${viewMode==="csm"?C.blue:"rgba(255,255,255,.1)"}`,color:viewMode==="csm"?C.blue:"rgba(244,241,235,.5)"}}>
              {viewMode==="csm"?"← Full View":"👤 CSM View"}
            </button>
          </div>
          <div style={{display:"flex",gap:"1rem",alignItems:"center"}}>
            <span style={{fontFamily:"'DM Mono'",fontSize:".68rem",color:"rgba(244,241,235,.4)"}}>TXN-2025-0312-ACM · 6 insights · 0 to human review</span>
            <span style={{fontFamily:"'DM Mono'",fontSize:".65rem",color:"rgba(201,168,76,.6)",display:"flex",alignItems:"center",gap:4}}>◈ Erwin M. McDonald</span>
          </div>
        </div>
      </header>

      {/* ═══ CONDITIONAL VIEWS ═══════════════════════════════════════════════ */}
      {viewMode==="current"
        ? <CurrentState onFlip={()=>setViewMode("future")}/>
        : viewMode==="csm"
        ? <CsmView/>
        : (
        <main style={{position:"relative",zIndex:1,padding:"2rem 3rem 4rem",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1.25rem"}}>

          {/* ── KPI ROW ───────────────────────────────────────────────────── */}
          <div style={{gridColumn:"1/-1",display:"flex",gap:"1rem"}}>
            <Kpi label="Insights Extracted" value={6} color={C.teal} sub="Auto-routing: 6 · Human review: 0" delay={50}/>
            <Kpi label="Critical Alerts" value={2} color={C.red} sub="Bug Report + Churn Signal · 4-hr SLA" delay={100}/>
            <Kpi label="Avg. Confidence" value={95.7} suffix="%" color={C.gold} sub="All above 75% threshold" delay={150}/>
            <Kpi label="Insights Routed" value={6} suffix="/6" color={C.green} sub="0 to Human Review Queue" delay={200}/>
            <Kpi label="ARR at Risk" prefix="$" value={84} suffix="K" color={C.orange} sub="Renewal June 30, 2025" delay={250}/>
          </div>

          {/* ── ROUTING MAP ───────────────────────────────────────────────── */}
          <Panel title="Stakeholder Routing Map" badge="All 6 routed · 0 to queue" fullWidth delay={150} accentGrad={`linear-gradient(90deg,${C.teal},${C.gold})`}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",padding:"1.25rem 1.5rem"}}>
              {[
                {dest:"Engineering",icon:"🔧",ins:byRoute["Engineering"]},
                {dest:"CS Leadership",icon:"🤝",ins:byRoute["CS Leadership"]},
                {dest:"Sales Leadership",icon:"💼",ins:byRoute["Sales Leadership"]},
                {dest:"Product Management",icon:"📋",ins:byRoute["Product Management"]},
              ].map(({dest,icon,ins},li)=>(
                <div key={dest} style={{padding:"0 1rem",borderRight:li<3?"1px solid rgba(255,255,255,.05)":"none",paddingLeft:li===0?0:undefined}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:".9rem",paddingBottom:".7rem",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                    <span style={{fontSize:".9rem"}}>{icon}</span>
                    <span style={{fontSize:".72rem",fontWeight:600,color:"rgba(244,241,235,.85)"}}>{dest}</span>
                    <span style={{marginLeft:"auto",fontFamily:"'DM Mono'",fontSize:".6rem",color:"rgba(244,241,235,.35)"}}>{ins.length}</span>
                  </div>
                  {ins.map((i,idx)=><InsCard key={i.id} ins={i} onOpen={setModal} delay={200+li*40+idx*40}/>)}
                </div>
              ))}
            </div>
          </Panel>

          {/* ── VERBATIM QUOTES ───────────────────────────────────────────── */}
          <Panel title="Verbatim Evidence" badge="Exact from transcript" delay={200}>
            <div style={{padding:"1rem 1.5rem 1.25rem"}}>
              {[
                {q:"We've flagged it twice to support and the ticket is still open. It's not a minor thing — we're making media spend decisions based on this data.",meta:"Bug Report · 97% confidence"},
                {q:"The bug needs to get fixed and the pricing conversation needs to happen before June. Otherwise honestly I don't know what the board is going to say.",meta:"Churn Signal · 93% confidence"},
                {q:"Our inside sales team actually credits Invoca with a 23% improvement in qualified lead rate this quarter, which is huge.",meta:"Positive Signal · 99% confidence"},
              ].map((q,i)=>(
                <div key={i} style={{padding:".9rem 0",borderBottom:i<2?"1px solid rgba(255,255,255,.05)":"none"}}>
                  <div style={{fontFamily:"'DM Serif Display'",fontStyle:"italic",fontSize:".85rem",lineHeight:1.55,position:"relative",paddingLeft:"1rem",marginBottom:5}}>
                    <span style={{position:"absolute",left:0,top:"-.1rem",fontSize:"1.4rem",color:C.gold,lineHeight:1}}>"</span>
                    {q.q}
                  </div>
                  <div style={{fontFamily:"'DM Mono'",fontSize:".6rem",color:"rgba(244,241,235,.35)",paddingLeft:"1rem"}}>
                    Acme Financial Services · {q.meta}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* ── DONUT CHARTS ──────────────────────────────────────────────── */}
          <Panel title="Insight Type Breakdown" badge="6 total" delay={230}>
            <div style={{padding:"1.25rem 1.5rem",display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem"}}>
              <Donut size={130} sw={13} label="6" sub="Insights" segs={[{p:33,c:C.red},{p:17,c:C.orange},{p:17,c:C.yellow},{p:33,c:C.green}]}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".4rem .9rem",width:"100%"}}>
                {[[C.red,"Bug/Churn","2"],[C.orange,"Pricing","1"],[C.yellow,"Feature","1"],[C.green,"Positive","2"]].map(([col,lab,cnt])=>(
                  <div key={lab} style={{display:"flex",alignItems:"center",gap:6,fontSize:".68rem",color:"rgba(244,241,235,.65)"}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:col,flexShrink:0}}/>
                    {lab}<span style={{marginLeft:"auto",fontFamily:"'DM Mono'",fontSize:".65rem",color:"rgba(244,241,235,.4)"}}>{cnt}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* ── CONFIDENCE BAR CHART ──────────────────────────────────────── */}
          <Panel title="Confidence by Insight" badge="All ≥ 75%" delay={260}>
            <div style={{padding:"1.25rem 1.5rem",display:"flex",flexDirection:"column",gap:".65rem"}}>
              {INSIGHTS.map(ins=>(
                <BarRow key={ins.id} label={ins.type} pct={ins.confidence} color={UC[ins.urgency]}/>
              ))}
            </div>
          </Panel>

          {/* ── SLA DONUT ─────────────────────────────────────────────────── */}
          <Panel title="SLA Compliance" badge="On Track: 83%" delay={290}>
            <div style={{padding:"1.25rem 1.5rem",display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem"}}>
              <Donut size={130} sw={13} label="83%" sub="On Track" segs={[{p:83,c:C.green},{p:17,c:C.red}]}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".4rem .9rem",width:"100%"}}>
                {[[C.green,"On Track","5/6"],[C.red,"At Risk","1/6"]].map(([col,lab,cnt])=>(
                  <div key={lab} style={{display:"flex",alignItems:"center",gap:6,fontSize:".68rem",color:"rgba(244,241,235,.65)"}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:col,flexShrink:0}}/>
                    {lab}<span style={{marginLeft:"auto",fontFamily:"'DM Mono'",fontSize:".65rem",color:"rgba(244,241,235,.4)"}}>{cnt}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* ── ARCHITECTURE PANEL — Pillar 2 ──────────────────────────── */}
          <ArchPanel/>

          {/* ── ACCOUNT RISK REGISTER ─────────────────────────────────────── */}
          <Panel title="Account Risk Register" badge="Simulated portfolio · 5 accounts" fullWidth delay={340}>
            <div>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",padding:".65rem 1.5rem",background:"rgba(255,255,255,.03)"}}>
                {["Account","ARR","Renewal","Risk Score","Status","Signals"].map(h=>(
                  <div key={h} style={{fontFamily:"'DM Mono'",fontSize:".6rem",letterSpacing:".12em",textTransform:"uppercase",color:"rgba(244,241,235,.3)"}}>{h}</div>
                ))}
              </div>
              {[
                {init:"A",name:"Acme Financial Services",csm:"Jordan Rivera",arr:"$84,000",renew:"Jun 30, 2025",score:85,sc:C.red,status:"⚠ At Risk",sc2:C.red,sig:"6 · 2 CRITICAL",sg:C.red,bg:`linear-gradient(135deg,${C.teal},${C.blue})`},
                {init:"M",name:"Meridian Healthcare",csm:"Taylor Chen",arr:"$126,000",renew:"Sep 15, 2025",score:52,sc:C.orange,status:"◎ Watch",sc2:C.orange,sig:"3 · 1 HIGH",sg:C.orange,bg:`linear-gradient(135deg,${C.orange},${C.gold})`},
                {init:"P",name:"Peak Auto Group",csm:"Marcus Webb",arr:"$212,000",renew:"Dec 1, 2025",score:22,sc:C.green,status:"✓ Healthy",sc2:C.green,sig:"1 · Positive",sg:C.green,bg:`linear-gradient(135deg,${C.green},${C.teal})`},
                {init:"V",name:"Vantage Retail Corp",csm:"Jordan Rivera",arr:"$68,000",renew:"Mar 31, 2025",score:68,sc:C.orange,status:"◎ Watch",sc2:C.orange,sig:"2 · Feature Gap",sg:C.orange,bg:`linear-gradient(135deg,${C.purple},${C.blue})`},
                {init:"S",name:"Suncoast Insurance",csm:"Taylor Chen",arr:"$94,000",renew:"Jul 15, 2025",score:18,sc:C.green,status:"✓ Healthy",sc2:C.green,sig:"2 · All Positive",sg:C.green,bg:`linear-gradient(135deg,${C.teal},${C.green})`},
              ].map(a=>(
                <div key={a.name} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",padding:".9rem 1.5rem",borderBottom:"1px solid rgba(255,255,255,.04)",alignItems:"center",transition:"background .15s"}}
                  onMouseOver={e=>e.currentTarget.style.background="rgba(255,255,255,.025)"}
                  onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:30,height:30,borderRadius:"50%",background:a.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Serif Display'",fontSize:".85rem",color:C.ink,flexShrink:0}}>{a.init}</div>
                    <div>
                      <div style={{fontSize:".8rem",fontWeight:500}}>{a.name}</div>
                      <div style={{fontSize:".65rem",color:"rgba(244,241,235,.4)"}}>CSM: {a.csm}</div>
                    </div>
                  </div>
                  <div style={{fontFamily:"'DM Mono'",fontSize:".75rem",color:"rgba(244,241,235,.7)"}}>{a.arr}</div>
                  <div style={{fontFamily:"'DM Mono'",fontSize:".75rem",color:"rgba(244,241,235,.7)"}}>{a.renew}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:44,height:4,borderRadius:2,background:"rgba(255,255,255,.08)",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${a.score}%`,background:a.sc,borderRadius:2}}/>
                    </div>
                    <span style={{fontFamily:"'DM Mono'",fontSize:".65rem",color:a.sc}}>{a.score}</span>
                  </div>
                  <span style={{fontFamily:"'DM Mono'",fontSize:".62rem",padding:".2rem .45rem",borderRadius:".2rem",background:`${a.sc2}22`,color:a.sc2}}>{a.status}</span>
                  <div style={{fontFamily:"'DM Mono'",fontSize:".7rem",color:a.sg}}>{a.sig}</div>
                </div>
              ))}
            </div>
          </Panel>

          {/* ── CSM CLOSED-LOOP CONFIRMATIONS ─────────────────────────────── */}
          <Panel title="CSM Closed-Loop Confirmations" badge="6 / 6 confirmed" fullWidth delay={390} accentGrad={`linear-gradient(90deg,${C.green},${C.teal})`}>
            <Confirms/>
          </Panel>

          {/* ── PIPELINE FLOW ─────────────────────────────────────────────── */}
          <Panel title="Pipeline Architecture" badge="JTBD Feedback Loop v1.0" fullWidth delay={430}>
            <PipeFlow/>
          </Panel>

          {/* ── ROADMAP — Pillar 4 ────────────────────────────────────────── */}
          <Panel title="18-Month Intelligence Roadmap" badge="Pillar 4 · The Future" fullWidth delay={470} accentGrad={`linear-gradient(90deg,${C.purple},${C.gold})`}>
            <Roadmap/>
          </Panel>

        </main>
      )}

      {/* ═══ FOOTER ════════════════════════════════════════════════════════════ */}
      <footer style={{position:"relative",zIndex:1,padding:"1rem 3rem",borderTop:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:".5rem"}}>
        <div style={{fontFamily:"'DM Mono'",fontSize:".62rem",color:"rgba(244,241,235,.25)"}}>
          JTBD Feedback Loop Architect · Invoca Applied AI Analyst POC · Option 3 · Erwin M. McDonald
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"1.5rem",fontFamily:"'DM Mono'",fontSize:".62rem",color:"rgba(244,241,235,.25)"}}>
          <span>Pipeline: claude-sonnet-4-6</span>
          <span>Prompt v1.0.0</span>
          <span>Alert IDs from sample run — format: JTBD-YYYYMMDD-XXXXXXXX</span>
          <a href="https://github.com/emcdo411/jtbd-feedback-loop" target="_blank" rel="noreferrer"
            style={{color:"rgba(201,168,76,.6)",textDecoration:"none",transition:"color .2s"}}
            onMouseOver={e=>e.target.style.color=C.gold} onMouseOut={e=>e.target.style.color="rgba(201,168,76,.6)"}>
            github.com/emcdo411/jtbd-feedback-loop
          </a>
        </div>
      </footer>

      {/* ═══ MODAL ════════════════════════════════════════════════════════════ */}
      {modal&&<Modal ins={modal} onClose={()=>setModal(null)}/>}
    </div>
  );
}

// ─── BAR ROW ─────────────────────────────────────────────────────────────────
function BarRow({ label, pct, color }) {
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(pct),700);return()=>clearTimeout(t);},[pct]);
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontFamily:"'DM Mono'",fontSize:".6rem",color:"rgba(244,241,235,.5)",width:70,flexShrink:0,textAlign:"right",textTransform:"capitalize"}}>{label}</span>
      <div style={{flex:1,height:20,borderRadius:3,background:"rgba(255,255,255,.05)",overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${color}cc,${color}88)`,width:`${w}%`,transition:"width 1.4s cubic-bezier(.22,1,.36,1)",display:"flex",alignItems:"center",paddingLeft:6,fontFamily:"'DM Mono'",fontSize:".58rem",color:"rgba(10,14,26,.85)",fontWeight:500}}>
          {w>15?`${pct}%`:""}
        </div>
      </div>
    </div>
  );
}
