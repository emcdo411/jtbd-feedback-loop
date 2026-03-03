import { useState, useEffect, useRef } from "react";

const C = {
  ink:"#0a0e1a", ink2:"#1a2035", ink3:"#2a3050",
  paper:"#f4f1eb", gold:"#c9a84c", teal:"#00c4b4",
  red:"#e85454", orange:"#f07c3a", green:"#3dbe8a",
  blue:"#4a8fe8", purple:"#9b72e8", yellow:"#f5c842",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,196,180,.5)}50%{box-shadow:0 0 0 8px rgba(0,196,180,0)}}
  @keyframes grain{0%,100%{transform:translate(0,0)}25%{transform:translate(1%,.5%)}75%{transform:translate(-1%,.5%)}}
  .grain{position:fixed;inset:0;pointer-events:none;opacity:.025;z-index:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    animation:grain .5s steps(1) infinite;}
  .row-hover:hover{background:rgba(255,255,255,.025)!important;}
  .tab{border:none;cursor:pointer;font-family:'DM Mono',monospace;transition:all .2s ease;}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(201,168,76,.25);border-radius:2px}
`;

function useFadeUp(d=0){
  const r=useRef(null);
  useEffect(()=>{
    const el=r.current;if(!el)return;
    el.style.opacity="0";el.style.transform="translateY(18px)";
    const t=setTimeout(()=>{
      el.style.transition="opacity .6s ease,transform .6s ease";
      el.style.opacity="1";el.style.transform="translateY(0)";
    },d);
    return()=>clearTimeout(t);
  },[d]);
  return r;
}

function Tag({text,color}){
  return <span style={{fontFamily:"'DM Mono',monospace",fontSize:".55rem",letterSpacing:".07em",background:`${color}18`,border:`1px solid ${color}40`,color,borderRadius:".25rem",padding:".15rem .45rem"}}>{text}</span>;
}

function AlignBadge({level}){
  const cfg={
    "Exact Match":   {color:C.green,  icon:"✦", bg:"rgba(61,190,138,.1)"},
    "Strong Align":  {color:C.teal,   icon:"◈", bg:"rgba(0,196,180,.1)"},
    "Partial Align": {color:C.gold,   icon:"◇", bg:"rgba(201,168,76,.1)"},
    "You Go Further":{color:C.purple, icon:"▲", bg:"rgba(155,114,232,.1)"},
    "Gap":           {color:C.red,    icon:"✕", bg:"rgba(232,84,84,.1)"},
  }[level]||{color:C.gold,icon:"?",bg:"rgba(201,168,76,.1)"};
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:4,background:cfg.bg,border:`1px solid ${cfg.color}40`,borderRadius:".3rem",padding:".2rem .55rem",fontFamily:"'DM Mono',monospace",fontSize:".57rem",color:cfg.color,whiteSpace:"nowrap"}}>
      {cfg.icon} {level}
    </span>
  );
}

// ── COMPARISON DATA ─────────────────────────────────────────────────────────
const STEPS = [
  {
    step:1, icon:"📞", label:"Ingest",
    yours:{
      title:"Transcript Ingestion",
      what:"Raw .txt file or call stream passed as string input to Python pipeline.",
      api:"File I/O / manual paste — transcript string passed directly to Anthropic SDK",
      security:"No PII redaction at this layer in POC",
      tags:["File I/O","Stream-Ready","Python"],
    },
    invoca:{
      title:"Call Ingestion API + Telephony Platform",
      what:"Calls live-routed through Invoca's telephony infrastructure OR submitted post-call via the Call Ingestion API with a recording URL. Automatically feeds Invoca's transcription engine, Signal AI, and reporting.",
      api:"REST API: POST /call_ingestion — submits call metadata + recording URL. Pre-transfer webhooks fire before caller is connected.",
      security:"Enterprise-grade PCI DSS compliance, PII redaction, encrypted at rest and in transit, HIPAA-ready",
      tags:["Call Ingestion API","Pre-Transfer Webhooks","Telephony Platform","PCI DSS","HIPAA"],
    },
    alignment:"Strong Align",
    insight:"Your pipeline ingests the same artifact — a call transcript — and passes it downstream exactly as Invoca does. Invoca's layer adds real-time telephony routing and compliance redaction before the transcript reaches AI. That's your Phase 2 integration opportunity.",
  },
  {
    step:2, icon:"🤖", label:"Extract",
    yours:{
      title:"Claude API Extraction",
      what:"Python + Anthropic SDK sends full transcript to claude-sonnet-4-6. Strict JSON schema, versioned system prompt (v1.0.0), enumerated insight types, required fields.",
      api:"Anthropic Messages API — POST /v1/messages with system prompt as 'Senior CSM Analyst'",
      security:"Versioned prompt prevents schema drift. Required fields prevent hallucinated output.",
      tags:["claude-sonnet-4-6","Versioned Prompt","Strict JSON","Enumerated Types"],
    },
    invoca:{
      title:"Signal AI — Patented ML + Generative AI (LLMs)",
      what:"Signal AI uses a combination of patented supervised machine learning models trained on brand-specific call data, plus generative AI/LLMs for transcription, summarization, and Signal AI Studio (no-code custom model creation). Models are trained per-brand on Databricks.",
      api:"Signal API — applies named signals to calls. POST signals with transaction IDs. Supports batching multiple signals to one call.",
      security:"Databricks Data Intelligence Platform for unified data governance. Brand-specific models trained exclusively on their own data.",
      tags:["Signal AI","Patented ML","LLM Layer","Signal API","Databricks","Per-Brand Models"],
    },
    alignment:"Strong Align",
    insight:"Both systems use LLMs to extract structured insight from conversational text. Your key differentiator: a strict versioned prompt with a fixed JSON schema. Invoca's Signal AI Studio uses a no-code UI to train custom models — the same idea, but productized for non-technical users. In an interview, say: 'My system is the engineer's version of what Signal AI Studio abstracts for marketers.'",
  },
  {
    step:3, icon:"🎯", label:"Score",
    yours:{
      title:"Confidence Scoring — 0.0–1.0",
      what:"Claude returns a confidence_score per insight as a first-class field in the ExtractedInsight dataclass. Calibration table baked into system prompt maps score ranges to action tiers.",
      api:"Confidence is a required field in the JSON schema — model cannot omit it.",
      security:"Deterministic schema prevents missing scores from passing downstream.",
      tags:["First-Class Score","Calibration Table","Typed Dataclass","Required Field"],
    },
    invoca:{
      title:"Signal AI Accuracy Scores — Real-Time + Post-Deployment",
      what:"Signal AI Studio displays predicted accuracy scores per signal during training and post-deployment. Scores are transparent in the UI — 'not a black box.' Signal AI monitors accuracy continuously and alerts when a signal passes the deployment threshold.",
      api:"Accuracy scores exposed in Signal AI Studio UI and via Signal API transaction responses. Threshold gate before deployment.",
      security:"Transparency by design — accuracy predictions visible to users before and after deployment.",
      tags:["Real-Time Accuracy Scores","Deployment Threshold","Continuous Monitoring","Transparent UI"],
    },
    alignment:"Exact Match",
    insight:"This is your strongest alignment. Both systems treat scoring as a first-class, visible, non-negotiable part of the pipeline — not buried logic. Invoca calls it 'accuracy score,' you call it 'confidence score.' Same concept, same philosophy. Invoca's own documentation says 'not a black box' — use that phrase. You built the same principle independently.",
  },
  {
    step:4, icon:"🔀", label:"Gate",
    yours:{
      title:"75% Confidence Gate",
      what:"Single deterministic rule: ≥75% → auto-route. <75% → Human Review Queue. No ML at the gate layer — pure conditional logic.",
      api:"Python conditional function gate(insight) — one line of logic, fully auditable.",
      security:"Gate is stateless and deterministic — same input always produces same routing decision.",
      tags:["Deterministic","75% Threshold","Human Review Queue","Auditable"],
    },
    invoca:{
      title:"Signal Deployment Threshold + Smart Alerts",
      what:"Signal AI Studio monitors accuracy and tells users when a signal has passed the threshold for deployment — preventing low-confidence signals from auto-firing. Smart Alerts notify teams when specific signal conditions are met on calls.",
      api:"Threshold gate built into Signal AI Studio UI. Smart Alerts configurable per signal type — fire webhooks or Slack notifications when conditions are met.",
      security:"Threshold enforcement prevents premature deployment of under-trained signals.",
      tags:["Deployment Threshold","Smart Alerts","Signal Conditions","Webhook Trigger"],
    },
    alignment:"Strong Align",
    insight:"Invoca's equivalent of your gate is the Signal deployment threshold — low-confidence signals don't go live until they clear accuracy requirements. Your gate runs per-insight at inference time; Invoca's runs at model deployment time. Both protect downstream systems from acting on uncertain data. Your gate is more granular — it fires on every call, not just at deployment.",
  },
  {
    step:5, icon:"🚦", label:"Route",
    yours:{
      title:"ROUTING_RULES Engine — 4 Destinations",
      what:"Python dictionary maps insight_type → (team destination, SLA). Engineering, CS Leadership, Sales Leadership, Product Management. RoutedAlert dataclass created per insight.",
      api:"Internal routing function — no external API at this layer. Output ready for Salesforce/Slack/Jira push.",
      security:"Routing rules are explicit, auditable, version-controlled in code.",
      tags:["Routing Dictionary","4 Destinations","RoutedAlert Object","Version-Controlled"],
    },
    invoca:{
      title:"Invoca Exchange — 200+ Integrations + Intelligent Call Routing",
      what:"Invoca routes call insights automatically to Google Ads, Salesforce, Slack, Meta, Adobe, and 200+ platforms via Invoca Exchange. Intelligent call routing uses PreSense digital journey data to route live callers to the right agent before they speak. Webhooks fire post-call to push signal data to any endpoint.",
      api:"Webhooks (pre-transfer, post-call, corrective), Connect Apps for Google/Facebook/Salesforce, Signal API, custom REST endpoints via Invoca Exchange.",
      security:"Native integrations with full data governance. No third-party middleware required.",
      tags:["Invoca Exchange","200+ Integrations","PreSense Routing","Webhooks","Connect Apps"],
    },
    alignment:"Partial Align",
    insight:"This is where your POC is intentionally simplified vs Invoca's enterprise scale. Your routing is 4 internal teams; Invoca routes to 200+ external platforms including ad networks, CRMs, and data warehouses. The architectural concept — 'insight fires a downstream action' — is identical. Your roadmap Phase 2 (Salesforce/Slack write-back) closes this gap directly.",
  },
  {
    step:6, icon:"📋", label:"Alert",
    yours:{
      title:"Structured Alert Output — JSON + Verbatim Quote",
      what:"RoutedAlert serialized to JSON with full metadata: alert_id, route, urgency, SLA, summary, verbatim_quote, confidence score. verbatim_quote is a required field.",
      api:"Terminal output + dashboard render. Webhook-ready structure (not yet wired in POC).",
      security:"verbatim_quote required field ensures traceability back to source. No summary-only outputs.",
      tags:["JSON Serialization","Verbatim Required","Webhook-Ready","Audit Trail"],
    },
    invoca:{
      title:"Smart Alerts + AI Summaries + Searchable Transcripts",
      what:"Smart Alerts notify teams in real-time when specific signal conditions are met. AI-generated summaries and full transcripts are searchable. Signal AI Autocapture uses NER to extract first-party data entities (names, products, locations) from calls automatically.",
      api:"Smart Alerts via webhook or email. Transcript/summary data accessible via Transactions API and dashboard. NER data auto-enriches customer profiles.",
      security:"All transcript data encrypted. PII redaction available. GDPR/CCPA compliant.",
      tags:["Smart Alerts","AI Summaries","Searchable Transcripts","NER Autocapture","Transactions API"],
    },
    alignment:"Strong Align",
    insight:"Your verbatim_quote requirement directly mirrors Invoca's philosophy of showing the actual transcript evidence alongside structured output. Invoca calls this 'not a black box' — you built the same principle. Your POC goes further by requiring the quote as a schema field (it cannot be null), which is actually a stronger guarantee than Invoca's UI-level display.",
  },
  {
    step:7, icon:"✅", label:"Confirm",
    yours:{
      title:"Closed-Loop Confirmation — CSM Receipt",
      what:"CSM receives a structured confirmation per insight: alert_id, route, SLA deadline, suggested action, loop status CLOSED. Dashboard shows 6/6 confirmed.",
      api:"Confirmation rendered in dashboard. SLA deadline computed from urgency + timestamp.",
      security:"Confirmation layer creates accountability — insight is owned, not just sent.",
      tags:["Confirmation Receipt","SLA Deadline","Loop Closure","Ownership Tracking"],
    },
    invoca:{
      title:"Closed-Loop Attribution — Revenue Tied to Conversation",
      what:"Invoca's closed-loop tracks the full buyer journey: digital click → call → conversion → revenue attribution. AI Messaging Agent extends this to SMS — every message tied back to the originating campaign. QA scorecards confirm agent compliance post-call.",
      api:"Closed-loop attribution via Salesforce opportunity stage push-back, Google Ads offline conversion import, and revenue reporting dashboards.",
      security:"First-party attribution data — no third-party cookies. Privacy-safe closed loop.",
      tags:["Closed-Loop Attribution","Revenue Tracking","QA Scorecards","Campaign Attribution","First-Party Data"],
    },
    alignment:"You Go Further",
    insight:"Invoca's 'closed loop' is about revenue attribution — connecting the call back to the marketing campaign that drove it. Your closed loop is about internal accountability — confirming the insight was received, owned, and actioned. These are complementary, not competing. You're closing the internal workflow loop; Invoca closes the external revenue loop. In an interview: 'My system adds the internal accountability layer that Invoca's platform assumes CSMs are handling manually.'",
  },
];

const VIEWS = ["All Steps","Exact Match","Strong Align","Partial Align","You Go Further","Gap"];

export default function App(){
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState("All Steps");
  const [expandedInsight, setExpandedInsight] = useState(null);
  const headerRef = useFadeUp(0);

  const filtered = STEPS.filter(s => filter === "All Steps" || s.alignment === filter);

  const alignCounts = {
    "Exact Match":    STEPS.filter(s=>s.alignment==="Exact Match").length,
    "Strong Align":   STEPS.filter(s=>s.alignment==="Strong Align").length,
    "Partial Align":  STEPS.filter(s=>s.alignment==="Partial Align").length,
    "You Go Further": STEPS.filter(s=>s.alignment==="You Go Further").length,
    "Gap":            STEPS.filter(s=>s.alignment==="Gap").length,
  };

  return(
    <div style={{minHeight:"100vh",background:C.ink,color:C.paper,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{CSS}</style>
      <div className="grain"/>

      {/* ── HEADER ── */}
      <header ref={headerRef} style={{position:"relative",zIndex:10,padding:"1.6rem 2.5rem 1.3rem",borderBottom:"1px solid rgba(201,168,76,.18)",background:"linear-gradient(180deg,rgba(0,196,180,.055) 0%,transparent 100%)",display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem"}}>
        <div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:".65rem",letterSpacing:".18em",textTransform:"uppercase",color:C.teal,marginBottom:".35rem",display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:22,height:1,background:C.teal,display:"inline-block"}}/>
            Invoca · JTBD Feedback Loop
          </div>
          <h1 style={{fontFamily:"'DM Serif Display'",fontSize:"clamp(1.4rem,2.8vw,2.1rem)",fontWeight:400,lineHeight:1.1}}>
            POC vs Platform — <em style={{fontStyle:"italic",color:C.gold}}>Side-by-Side</em>
          </h1>
          <p style={{fontFamily:"'DM Mono',monospace",fontSize:".68rem",color:"rgba(244,241,235,.35)",marginTop:".35rem"}}>
            Your 7-step pipeline mapped against Invoca's actual technology stack
          </p>
        </div>

        {/* Alignment scorecard */}
        <div style={{display:"flex",gap:".5rem",flexWrap:"wrap",alignSelf:"flex-start"}}>
          {Object.entries(alignCounts).filter(([,v])=>v>0).map(([k,v])=>(
            <div key={k} onClick={()=>setFilter(filter===k?"All Steps":k)} style={{cursor:"pointer",background:filter===k?`rgba(255,255,255,.07)`:"rgba(255,255,255,.03)",border:`1px solid ${filter===k?"rgba(255,255,255,.2)":"rgba(255,255,255,.07)"}`,borderRadius:".5rem",padding:".4rem .75rem",display:"flex",alignItems:"center",gap:6,transition:"all .2s"}}>
              <AlignBadge level={k}/>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:".65rem",color:"rgba(244,241,235,.5)"}}>{v}</span>
            </div>
          ))}
        </div>
      </header>

      {/* ── LEGEND ── */}
      <div style={{position:"relative",zIndex:1,padding:"1rem 2.5rem",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",gap:"1.5rem",flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:".58rem",letterSpacing:".1em",textTransform:"uppercase",color:"rgba(244,241,235,.25)"}}>Alignment Key:</span>
        {[
          ["Exact Match","Same concept, same implementation philosophy"],
          ["Strong Align","Same goal, different implementation details"],
          ["Partial Align","Same direction, Invoca is more scaled"],
          ["You Go Further","Your POC adds something Invoca doesn't have"],
          ["Gap","Invoca has this; your POC doesn't yet"],
        ].map(([k,desc])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:6}}>
            <AlignBadge level={k}/>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:".55rem",color:"rgba(244,241,235,.3)"}}>{desc}</span>
          </div>
        ))}
      </div>

      {/* ── COLUMN HEADERS ── */}
      <div style={{position:"relative",zIndex:1,display:"grid",gridTemplateColumns:"60px 1fr 1fr 130px",gap:0,padding:"0 2.5rem",borderBottom:"1px solid rgba(255,255,255,.06)",background:"rgba(255,255,255,.015)"}}>
        {["","🔬 Your JTBD POC","🏢 Invoca Platform","Alignment"].map((h,i)=>(
          <div key={i} style={{padding:".7rem .75rem",fontFamily:"'DM Mono',monospace",fontSize:".6rem",letterSpacing:".12em",textTransform:"uppercase",color:i===1?C.teal:i===2?C.gold:"rgba(244,241,235,.3)"}}>
            {h}
          </div>
        ))}
      </div>

      {/* ── ROWS ── */}
      <main style={{position:"relative",zIndex:1,padding:"0 2.5rem 3rem"}}>
        {filtered.map((s,i)=>{
          const isOpen = active === s.step;
          const insightOpen = expandedInsight === s.step;
          return(
            <div key={s.step} ref={useFadeUp(i*60)} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>

              {/* Main row */}
              <div className="row-hover" onClick={()=>setActive(isOpen?null:s.step)}
                style={{display:"grid",gridTemplateColumns:"60px 1fr 1fr 130px",gap:0,cursor:"pointer",padding:".1rem 0",transition:"background .15s"}}>

                {/* Step icon */}
                <div style={{padding:"1rem .75rem",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:isOpen?`${C.teal}18`:C.ink3,border:`2px solid ${isOpen?C.teal:"rgba(255,255,255,.1)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",transition:"all .2s"}}>
                    {s.icon}
                  </div>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:".48rem",color:"rgba(244,241,235,.3)",letterSpacing:".08em",textTransform:"uppercase"}}>{s.label}</span>
                </div>

                {/* Your POC */}
                <div style={{padding:"1rem .75rem",borderLeft:"1px solid rgba(0,196,180,.1)"}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:".6rem",color:C.teal,letterSpacing:".08em",marginBottom:4}}>{s.yours.title}</div>
                  <p style={{fontSize:".78rem",color:"rgba(244,241,235,.7)",lineHeight:1.6,marginBottom:6}}>{s.yours.what}</p>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:".58rem",color:"rgba(244,241,235,.3)",marginBottom:6}}>API: <span style={{color:"rgba(244,241,235,.55)"}}>{s.yours.api}</span></div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{s.yours.tags.map(t=><Tag key={t} text={t} color={C.teal}/>)}</div>
                </div>

                {/* Invoca */}
                <div style={{padding:"1rem .75rem",borderLeft:"1px solid rgba(201,168,76,.1)"}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:".6rem",color:C.gold,letterSpacing:".08em",marginBottom:4}}>{s.invoca.title}</div>
                  <p style={{fontSize:".78rem",color:"rgba(244,241,235,.7)",lineHeight:1.6,marginBottom:6}}>{s.invoca.what}</p>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:".58rem",color:"rgba(244,241,235,.3)",marginBottom:6}}>API: <span style={{color:"rgba(244,241,235,.55)"}}>{s.invoca.api}</span></div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{s.invoca.tags.map(t=><Tag key={t} text={t} color={C.gold}/>)}</div>
                </div>

                {/* Alignment */}
                <div style={{padding:"1rem .75rem",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"flex-start",gap:8,borderLeft:"1px solid rgba(255,255,255,.05)"}}>
                  <AlignBadge level={s.alignment}/>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:".52rem",color:"rgba(244,241,235,.25)"}}>
                    {isOpen?"▲ collapse":"▼ insight"}
                  </span>
                </div>
              </div>

              {/* Expanded insight */}
              {isOpen && (
                <div style={{margin:"0 0 .75rem 60px",background:`rgba(255,255,255,.02)`,border:"1px solid rgba(255,255,255,.07)",borderLeft:`3px solid ${C.purple}`,borderRadius:".6rem",padding:"1rem 1.25rem",animation:"fadeIn .25s ease both"}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:".58rem",color:C.purple,letterSpacing:".1em",textTransform:"uppercase",marginBottom:6}}>🔍 Interview Insight — What This Means For Friday</div>
                  <p style={{fontFamily:"'DM Serif Display'",fontStyle:"italic",fontSize:".95rem",color:C.paper,lineHeight:1.65}}>{s.insight}</p>
                  <div style={{marginTop:".85rem",display:"grid",gridTemplateColumns:"1fr 1fr",gap:".75rem"}}>
                    <div style={{background:"rgba(0,196,180,.06)",border:"1px solid rgba(0,196,180,.2)",borderRadius:".5rem",padding:".75rem 1rem"}}>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:".56rem",color:C.teal,letterSpacing:".1em",marginBottom:4}}>YOUR SECURITY / GOVERNANCE LAYER</div>
                      <p style={{fontSize:".75rem",color:"rgba(244,241,235,.7)",lineHeight:1.55}}>{s.yours.security}</p>
                    </div>
                    <div style={{background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.2)",borderRadius:".5rem",padding:".75rem 1rem"}}>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:".56rem",color:C.gold,letterSpacing:".1em",marginBottom:4}}>INVOCA'S SECURITY / GOVERNANCE LAYER</div>
                      <p style={{fontSize:".75rem",color:"rgba(244,241,235,.7)",lineHeight:1.55}}>{s.invoca.security}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── SUMMARY CARD ── */}
        <div ref={useFadeUp(500)} style={{marginTop:"2rem",background:C.ink2,borderRadius:"1rem",border:"1px solid rgba(255,255,255,.07)",overflow:"hidden"}}>
          <div style={{height:3,background:`linear-gradient(90deg,${C.teal},${C.gold})`}}/>
          <div style={{padding:"1.5rem 2rem"}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:".65rem",letterSpacing:".14em",textTransform:"uppercase",color:"rgba(244,241,235,.4)",marginBottom:"1rem"}}>Overall Alignment Summary</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1rem",marginBottom:"1.5rem"}}>
              {[
                {label:"Core Philosophy",val:"Identical",sub:"Both surface AI confidence visibly. Neither is a black box.",color:C.green},
                {label:"API Layer",val:"Parallel",sub:"Your Anthropic API mirrors Invoca's Signal API — same concept, different vendor.",color:C.teal},
                {label:"Your Edge",val:"CSM Loop",sub:"You close the internal accountability loop. Invoca closes the revenue attribution loop.",color:C.purple},
              ].map(k=>(
                <div key={k.label} style={{background:C.ink3,borderRadius:".75rem",padding:"1rem 1.1rem",borderTop:`2px solid ${k.color}`}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:".58rem",color:"rgba(244,241,235,.35)",letterSpacing:".1em",marginBottom:4}}>{k.label}</div>
                  <div style={{fontFamily:"'DM Serif Display'",fontSize:"1.1rem",color:k.color,marginBottom:4}}>{k.val}</div>
                  <p style={{fontSize:".72rem",color:"rgba(244,241,235,.6)",lineHeight:1.5}}>{k.sub}</p>
                </div>
              ))}
            </div>

            {/* What to say Friday */}
            <div style={{background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.22)",borderRadius:".75rem",padding:"1.1rem 1.25rem"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:".6rem",color:C.gold,letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>⚡ What to Say Friday — The Comparative Framing</div>
              <div style={{fontFamily:"'DM Serif Display'",fontStyle:"italic",fontSize:"1rem",color:C.paper,lineHeight:1.65}}>
                "Invoca's Signal AI does what my extraction layer does — at enterprise scale, with no-code tooling for non-technical users. My system is the architect's version of that same pipeline. I built it from scratch using the Anthropic API so I could show you exactly how each layer works, why confidence gating matters, and where your internal CS workflow currently has a gap that neither Signal AI nor PreSense is filling — the closed-loop accountability layer between insight extraction and stakeholder action."
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer style={{position:"relative",zIndex:1,padding:".9rem 2.5rem",borderTop:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:".5rem"}}>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:".6rem",color:"rgba(244,241,235,.2)"}}>JTBD Feedback Loop · POC vs Platform Comparison · Erwin M. McDonald</span>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:".6rem",color:"rgba(201,168,76,.4)"}}>Based on Invoca public documentation · March 2026</span>
      </footer>
    </div>
  );
}
