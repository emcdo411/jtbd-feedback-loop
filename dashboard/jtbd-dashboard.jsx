import { useState, useEffect, useRef } from "react";

const C = {
  ink:"#0a0e1a",ink2:"#1a2035",ink3:"#2a3050",
  paper:"#f4f1eb",gold:"#c9a84c",teal:"#00c4b4",
  red:"#e85454",orange:"#f07c3a",yellow:"#f5c842",
  green:"#3dbe8a",blue:"#4a8fe8",purple:"#9b72e8",
};

const INSIGHTS = [
  {id:"JTBD-20260227-ADD8E43F",type:"bug",urgency:"critical",summary:"Call attribution data inconsistent for 6 weeks",fullDetail:"Call attribution data has been inconsistent for 6 weeks, creating discrepancies between Invoca reporting and Google Ads dashboard. A support ticket has been open for 41 days without resolution, causing the paid search team to distrust attribution numbers.",bugDescription:"Call attribution data discrepancy between Invoca and Google Ads dashboard — 41-day open support ticket, paid search team has lost confidence in attribution numbers",sentiment:"critical",confidence:97,sla:"4 hours",urgencyLabel:"CRITICAL",route:"Engineering",icon:"🔧",action:"P1 Escalation Required",transcriptSnippet:"We've flagged it twice to support and the ticket is still open. It's not a minor thing — we're making media spend decisions based on this data.",suggestedAction:"Escalate to Engineering as P1. Assign owner and provide ETA by end of week. CSM to confirm escalation to customer within 24 hours.",csm:"Jordan Rivera",account:"Acme Financial Services",arr:"$84,000",renewal:"June 30, 2025"},
  {id:"JTBD-20260227-15CF8965",type:"churn",urgency:"critical",summary:"Renewal at risk — board-level scrutiny implied",fullDetail:"Customer stated that if the attribution bug is not fixed and pricing is not addressed before June renewal, she does not know what the board will say — implying renewal is at risk.",sentiment:"critical",confidence:93,sla:"4 hours",urgencyLabel:"CRITICAL",route:"CS Leadership",icon:"🤝",action:"Renewal Risk — Flag Immediately",transcriptSnippet:"The bug needs to get fixed and the pricing conversation needs to happen before June. Otherwise honestly I don't know what the board is going to say.",suggestedAction:"Flag account as renewal risk. Escalate to CS leadership and Sales VP. Two hard dependencies: (1) attribution bug resolved, (2) pricing options delivered before June renewal conversation.",csm:"Jordan Rivera",account:"Acme Financial Services",arr:"$84,000",renewal:"June 30, 2025"},
  {id:"JTBD-20260227-FB0AFF20",type:"competitive",urgency:"high",summary:"Marchex demo — omnichannel pitch to customer leadership",fullDetail:"Acme Financial had a demo with Marchex last month. Marchex pitched 'omnichannel conversation intelligence.' Customer's leadership is asking questions about alternatives.",competitorNamed:"Marchex",sentiment:"negative",confidence:96,sla:"48 hours",urgencyLabel:"HIGH",route:"Sales Leadership",icon:"💼",action:"Battlecard · Competitor: Marchex",transcriptSnippet:"We had a demo with Marchex last month. They were pitching something they called 'omnichannel conversation intelligence.' We're not going anywhere, but I want to be transparent that we're being asked to evaluate alternatives.",suggestedAction:"Alert Sales Leadership immediately. Prepare competitive battlecard for Marchex omnichannel claim. Ensure renewal conversation addresses this directly.",csm:"Jordan Rivera",account:"Acme Financial Services",arr:"$84,000",renewal:"June 30, 2025"},
  {id:"JTBD-20260227-241840B7",type:"pricing",urgency:"high",summary:"18% increase vs 15% budget cut — cannot get through finance",fullDetail:"Customer received an 18% renewal price increase while their own marketing budget was cut 15% this quarter.",sentiment:"negative",confidence:98,sla:"48 hours",urgencyLabel:"HIGH",route:"Sales Leadership",icon:"💼",action:"Pricing Options Needed Before June",transcriptSnippet:"The price increase is 18%. I understand costs go up but our marketing budget got cut 15% this quarter. I'm going to have a hard time getting this through finance at that number.",suggestedAction:"Escalate to Sales Leadership before formal renewal discussions. CSM to request pricing options from leadership within 1 week. Renewal at risk if not addressed.",csm:"Jordan Rivera",account:"Acme Financial Services",arr:"$84,000",renewal:"June 30, 2025"},
  {id:"JTBD-20260227-62EF015C",type:"feature",urgency:"medium",summary:"Unified omnichannel intelligence — SMS and chat parity",fullDetail:"Customer is expanding into SMS and chat channels and wants unified omnichannel conversation intelligence.",featureRequested:"Unified omnichannel conversation intelligence — intent scoring and attribution across calls, SMS, and chat channels",sentiment:"neutral",confidence:91,sla:"1 week",urgencyLabel:"MEDIUM",route:"Product Management",icon:"📋",action:"Roadmap Consideration",transcriptSnippet:"It would be really valuable if there was some kind of unified view — like, the same kind of intent scoring and attribution you do for calls but across all the channels.",suggestedAction:"Route to Product Management for roadmap consideration. Document as strategic gap — customer has confirmed Marchex is pitching this capability.",csm:"Jordan Rivera",account:"Acme Financial Services",arr:"$84,000",renewal:"June 30, 2025"},
  {id:"JTBD-20260227-5236848F",type:"positive",urgency:"low",summary:"+23% qualified lead rate — VP credited Invoca call scoring",fullDetail:"Inside sales team attributes a 23% improvement in qualified lead rate this quarter to Invoca call scoring.",sentiment:"positive",confidence:99,sla:"1 week",urgencyLabel:"LOW",route:"Product Management",icon:"📋",action:"Capture as Case Study",transcriptSnippet:"Our inside sales team actually credits Invoca with a 23% improvement in qualified lead rate this quarter, which is huge.",suggestedAction:"Capture as customer success story. Use in renewal conversation to anchor value. Share with Marketing for case study consideration.",csm:"Jordan Rivera",account:"Acme Financial Services",arr:"$84,000",renewal:"June 30, 2025"},
];

const UC={critical:C.red,high:C.orange,medium:C.yellow,low:C.green};
const SC={critical:C.red,negative:C.orange,neutral:"rgba(244,241,235,.5)",positive:C.green};

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pgDot{0%,100%{opacity:1;transform:scale(1);box-shadow:0 0 0 0 rgba(61,190,138,.5)}50%{opacity:.5;transform:scale(1.3);box-shadow:0 0 0 8px rgba(61,190,138,0)}}
@keyframes prDot{0%,100%{box-shadow:0 0 4px #e85454}50%{box-shadow:0 0 14px #e85454,0 0 28px #e8545444}}
@keyframes nodePls{0%,100%{box-shadow:0 0 10px rgba(0,196,180,.2)}50%{box-shadow:0 0 26px rgba(0,196,180,.55)}}
@keyframes modalIn{from{opacity:0;transform:scale(.93) translateY(22px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes grain{0%,100%{transform:translate(0,0)}20%{transform:translate(1%,1%)}40%{transform:translate(-1%,1%)}60%{transform:translate(1%,-1%)}80%{transform:translate(-1%,-1%)}}
.ch{transition:transform .18s ease,box-shadow .18s ease,background .18s ease}
.ch:hover{transform:translateY(-2px) translateX(2px)!important;box-shadow:0 10px 36px rgba(0,0,0,.4)!important}
.btn{border:none;cursor:pointer;font-family:'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;transition:all .2s ease}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(201,168,76,.3);border-radius:2px}
`;

function useCountUp(t,ms=1400,d=0){
  const[v,sV]=useState(0);
  useEffect(()=>{
    const to=setTimeout(()=>{
      const s=performance.now();
      const tick=(n)=>{const p=Math.min((n-s)/ms,1),e=1-Math.pow(1-p,3);sV(Math.round(e*t));if(p<1)requestAnimationFrame(tick);};
      requestAnimationFrame(tick);
    },d);
    return()=>clearTimeout(to);
  },[t,ms,d]);
  return v;
}

function useFade(d=0){
  const r=useRef(null);
  useEffect(()=>{
    const el=r.current;if(!el)return;
    el.style.cssText+=";opacity:0;transform:translateY(16px)";
    const t=setTimeout(()=>{el.style.transition="opacity .6s ease,transform .6s ease";el.style.opacity="1";el.style.transform="translateY(0)";},d);
    return()=>clearTimeout(t);
  },[d]);
  return r;
}

function ConfBar({pct}){
  const[w,sW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>sW(pct),600);return()=>clearTimeout(t);},[pct]);
  return(
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,height:3,borderRadius:2,background:"rgba(255,255,255,.08)",overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${C.teal},${C.gold})`,width:`${w}%`,transition:"width 1.3s cubic-bezier(.22,1,.36,1)"}}/>
      </div>
      <span style={{fontFamily:"'DM Mono'",fontSize:".6rem",color:C.teal,whiteSpace:"nowrap"}}>{pct}%</span>
    </div>
  );
}

function Donut({segs,size=128,sw=13,label,sub}){
  const r=(size-sw)/2,circ=2*Math.PI*r;
  const[go,sG]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>sG(true),500);return()=>clearTimeout(t);},[]);
  let off=0;
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth={sw}/>
        {segs.map((s,i)=>{
          const dash=go?(s.p/100)*circ:0,gap=circ-dash;
          const el=<circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.c} strokeWidth={sw} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-off*circ/100} style={{transition:`stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1) ${i*.12}s`}}/>;
          off+=s.p;return el;
        })}
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontFamily:"'DM Serif Display'",fontSize:"1.4rem",color:C.paper}}>{label}</span>
        {sub&&<span style={{fontFamily:"'DM Mono'",fontSize:".5rem",color:"rgba(244,241,235,.4)",letterSpacing:".1em",textTransform:"uppercase",marginTop:2}}>{sub}</span>}
      </div>
    </div>
  );
}

function Kpi({label,value,suffix="",prefix="",sub,color,delay}){
  const r=useFade(delay),n=useCountUp(typeof value==="number"?Math.round(value):0,1400,delay);
  return(
    <div ref={r} style={{background:C.ink2,borderRadius:"1.25rem",padding:"1.25rem 1.5rem",position:"relative",overflow:"hidden",border:"1px solid rgba(255,255,255,.07)",flex:1,minWidth:0}}>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:color,borderRadius:"0 0 1.25rem 1.25rem"}}/>
      <div style={{fontFamily:"'DM Mono'",fontSize:".63rem",letterSpacing:".12em",textTransform:"uppercase",color:"rgba(244,241,235,.45)",marginBottom:".6rem"}}>{label}</div>
      <div style={{fontFamily:"'DM Serif Display'",fontSize:"2.4rem",lineHeight:1,color}}>{prefix}{typeof value==="number"?n:value}{suffix}</div>
      {sub&&<div style={{fontFamily:"'DM Mono'",fontSize:".67rem",color:"rgba(244,241,235,.4)",marginTop:4}}>{sub}</div>}
    </div>
  );
}

function InsCard({ins,onOpen,delay=0}){
  const r=useFade(delay),col=UC[ins.urgency];
  return(
    <div ref={r} className="ch" onClick={()=>onOpen(ins)} style={{background:C.ink3,borderRadius:".75rem",padding:".85rem",marginBottom:".65rem",borderLeft:`3px solid ${col}`,cursor:"pointer",position:"relative",overflow:"hidden"}}>
      {ins.urgency==="critical"&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${col}55,${col})`}}/>}
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:col,flexShrink:0,animation:ins.urgency==="critical"?"prDot 1.5s infinite":"none"}}/>
        <span style={{fontFamily:"'DM Mono'",fontSize:".56rem",letterSpacing:".1em",textTransform:"uppercase",color:"rgba(244,241,235,.45)"}}>{ins.type}</span>
        <span style={{marginLeft:"auto",fontFamily:"'DM Mono'",fontSize:".54rem",padding:".1rem .4rem",borderRadius:".2rem",background:ins.urgency==="critical"?"rgba(232,84,84,.15)":"rgba(255,255,255,.06)",color:ins.urgency==="critical"?C.red:"rgba(244,241,235,.4)"}}>
          {ins.sla}·{ins.urgencyLabel}
        </span>
      </div>
      <div style={{fontSize:".73rem",lineHeight:1.5,color:"rgba(244,241,235,.82)",marginBottom:7}}>{ins.summary}</div>
      <ConfBar pct={ins.confidence}/>
      {(ins.urgency==="critical"||ins.urgency==="high")&&<div style={{marginTop:6,fontFamily:"'DM Mono'",fontSize:".54rem",color:C.gold,display:"flex",alignItems:"center",gap:4}}><span>⚡</span>{ins.action}</div>}
    </div>
  );
}

function Modal({ins,onClose}){
  useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};document.addEventListener("keydown",h);return()=>document.removeEventListener("keydown",h);},[onClose]);
  const col=UC[ins.urgency];
  return(
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(10,14,26,.9)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem",animation:"fadeIn .2s ease both"}}>
      <div style={{background:C.ink2,borderRadius:"1.25rem",width:"100%",maxWidth:640,border:"1px solid rgba(255,255,255,.1)",animation:"modalIn .25s ease both",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{height:3,background:col,borderRadius:"1.25rem 1.25rem 0 0"}}/>
        <div style={{padding:"1.25rem 1.5rem",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"sticky",top:0,background:C.ink2,zIndex:1}}>
          <div>
            <div style={{fontFamily:"'DM Mono'",fontSize:".58rem",letterSpacing:".12em",textTransform:"uppercase",color:"rgba(244,241,235,.4)",marginBottom:4}}>{ins.icon} {ins.type} · {ins.route} · {ins.urgencyLabel}</div>
            <div style={{fontFamily:"'DM Serif Display'",fontSize:"1.2rem"}}>{ins.summary}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:"1.2rem",color:"rgba(244,241,235,.4)",lineHeight:1,flexShrink:0,transition:"color .2s"}} onMouseOver={e=>e.target.style.color=C.paper} onMouseOut={e=>e.target.style.color="rgba(244,241,235,.4)"}>✕</button>
        </div>
        <div style={{padding:"1.25rem 1.5rem"}}>
          <div style={{fontFamily:"'DM Serif Display'",fontStyle:"italic",fontSize:".95rem",lineHeight:1.6,borderLeft:`3px solid ${C.gold}`,paddingLeft:"1rem",marginBottom:"1.25rem"}}>{ins.transcriptSnippet}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".75rem",marginBottom:"1rem"}}>
            <MF label="Summary" v={ins.fullDetail} full/>
            {ins.bugDescription&&<MF label="Bug Description" v={ins.bugDescription} full/>}
            {ins.featureRequested&&<MF label="Feature Requested" v={ins.featureRequested} full/>}
            {ins.competitorNamed&&<MF label="Competitor Named" v={ins.competitorNamed}/>}
            <MF label="Sentiment" v={ins.sentiment} color={SC[ins.sentiment]} mono/>
            <MF label="Urgency · SLA" v={`${ins.urgencyLabel} · ${ins.sla}`} color={col} mono/>
            <MF label="Destination · SLA" v={`${ins.route} · ${ins.sla}`}/>
            <MF label="Account · CSM" v={`${ins.account} · ${ins.csm}`}/>
            <MF label="ARR · Renewal" v={`${ins.arr} · ${ins.renewal}`}/>
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
            <div style={{fontFamily:"'DM Mono'",fontSize:".52rem",color:"rgba(244,241,235,.18)",fontStyle:"italic"}}>IDs regenerate each pipeline run</div>
          </div>
          <span style={{fontFamily:"'DM Mono'",fontSize:".68rem",color:C.teal}}>Confidence: {ins.confidence}%</span>
        </div>
      </div>
    </div>
  );
}

function MF({label,v,full,color,mono}){
  return(
    <div style={{gridColumn:full?"1/-1":undefined}}>
      <div style={{fontFamily:"'DM Mono'",fontSize:".57rem",letterSpacing:".12em",textTransform:"uppercase",color:"rgba(244,241,235,.35)",marginBottom:4}}>{label}</div>
      <div style={{fontSize:".77rem",color:color||"rgba(244,241,235,.8)",lineHeight:1.45,fontFamily:mono?"'DM Mono'":undefined}}>{v}</div>
    </div>
  );
}

function Panel({title,badge,children,delay=0,fullWidth=false,ag}){
  const r=useFade(delay);
  return(
    <div ref={r} style={{background:C.ink2,borderRadius:"1.25rem",border:"1px solid rgba(255,255,255,.07)",overflow:"hidden",gridColumn:fullWidth?"1/-1":undefined,position:"relative"}}>
      {ag&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:ag}}/>}
      <div style={{padding:"1.1rem 1.5rem .8rem",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontFamily:"'DM Mono'",fontSize:".67rem",letterSpacing:".14em",textTransform:"uppercase",color:"rgba(244,241,235,.5)"}}>{title}</span>
        {badge&&<span style={{fontFamily:"'DM Mono'",fontSize:".58rem",padding:".2rem .55rem",borderRadius:".25rem",background:"rgba(201,168,76,.12)",color:C.gold}}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function PipeFlow(){
  const steps=[{e:"📞",l:"Ingest",s:"Transcript loaded",st:"done"},{e:"🤖",l:"Extract",s:"Claude API",st:"done"},{e:"🎯",l:"Score",s:"0.0–1.0",st:"done"},{e:"🔀",l:"Gate",s:"≥75% auto",st:"done"},{e:"🚦",l:"Route",s:"4 teams",st:"active"},{e:"📋",l:"Alert",s:"Structured",st:"done"},{e:"✅",l:"Confirm",s:"6/6 closed",st:"done"}];
  return(
    <div style={{display:"flex",alignItems:"center",padding:"1.25rem 1.5rem",overflowX:"auto"}}>
      {steps.map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",flex:1,minWidth:0}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",flex:1}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:s.st==="done"?"rgba(61,190,138,.12)":C.ink3,border:`2px solid ${s.st==="done"?C.green:s.st==="active"?C.teal:"rgba(255,255,255,.1)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",marginBottom:5,animation:s.st==="active"?"nodePls 2s ease-in-out infinite":"none",boxShadow:s.st==="active"?`0 0 14px ${C.teal}44`:"none"}}>{s.e}</div>
            <div style={{fontFamily:"'DM Mono'",fontSize:".57rem",letterSpacing:".08em",textTransform:"uppercase",color:s.st==="done"?C.green:s.st==="active"?C.teal:"rgba(244,241,235,.4)"}}>{s.l}</div>
            <div style={{fontFamily:"'DM Mono'",fontSize:".5rem",color:"rgba(244,241,235,.25)",marginTop:2}}>{s.s}</div>
          </div>
          {i<steps.length-1&&(
            <svg width={26} height={12} viewBox="0 0 26 12" style={{flexShrink:0,marginBottom:18}}>
              <line x1={0} y1={6} x2={22} y2={6} stroke={i<4?C.green:"rgba(0,196,180,.3)"} strokeWidth={2}/>
              <polygon points="20,2 26,6 20,10" fill={i<4?C.green:C.teal}/>
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

function Toggle({opts,val,set}){
  return(
    <div style={{display:"flex",background:C.ink3,borderRadius:".5rem",padding:3,border:"1px solid rgba(255,255,255,.07)"}}>
      {opts.map(o=>(
        <button key={o.v} onClick={()=>set(o.v)} className="btn" style={{padding:".3rem .75rem",borderRadius:".3rem",fontSize:".6rem",background:val===o.v?C.teal:"transparent",color:val===o.v?C.ink:"rgba(244,241,235,.5)",border:"none",cursor:"pointer",fontFamily:"'DM Mono'",letterSpacing:".08em",textTransform:"uppercase",transition:"all .2s"}}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

function BarRow({label,pct,color}){
  const[w,sW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>sW(pct),700);return()=>clearTimeout(t);},[pct]);
  return(
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontFamily:"'DM Mono'",fontSize:".58rem",color:"rgba(244,241,235,.5)",width:68,flexShrink:0,textAlign:"right",textTransform:"capitalize"}}>{label}</span>
      <div style={{flex:1,height:20,borderRadius:3,background:"rgba(255,255,255,.05)",overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${color}cc,${color}88)`,width:`${w}%`,transition:"width 1.4s cubic-bezier(.22,1,.36,1)",display:"flex",alignItems:"center",paddingLeft:6,fontFamily:"'DM Mono'",fontSize:".58rem",color:"rgba(10,14,26,.85)",fontWeight:500}}>
          {w>15?`${pct}%`:""}
        </div>
      </div>
    </div>
  );
}

function CurrentState({onFlip}){
  return(
    <div style={{padding:"2rem",animation:"fadeUp .4s ease both"}}>
      <div style={{background:C.ink2,borderRadius:"1.25rem",padding:"2rem",border:"1px solid rgba(232,84,84,.3)"}}>
        <div style={{fontFamily:"'DM Mono'",fontSize:".65rem",letterSpacing:".12em",textTransform:"uppercase",color:C.red,marginBottom:"1rem"}}>⚠ Current State — The Insight Black Hole</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1.25rem",marginBottom:"1.5rem"}}>
          {[{icon:"📋",title:"Manual CRM Entry",pain:"CSMs spend 15–20 min/call typing notes. Critical signal buried in free text. No structure, no routing."},
            {icon:"🏝️",title:"Siloed Data",pain:"Engineering never sees bug patterns. PM never sees feature velocity. Churn signals invisible until renewal fails."},
            {icon:"🚫",title:"No Routing or SLA",pain:"Critical insights sit in Salesforce for weeks. No SLA, no closed loop. Stakeholders fly blind."}
          ].map(item=>(
            <div key={item.title} style={{background:C.ink3,borderRadius:".75rem",padding:"1.25rem"}}>
              <div style={{fontSize:"1.6rem",marginBottom:8}}>{item.icon}</div>
              <div style={{fontFamily:"'DM Mono'",fontSize:".63rem",color:C.red,letterSpacing:".08em",marginBottom:6}}>{item.title}</div>
              <div style={{fontSize:".73rem",color:"rgba(244,241,235,.65)",lineHeight:1.55}}>{item.pain}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center"}}>
          <button onClick={onFlip} style={{background:`linear-gradient(135deg,${C.teal},${C.green})`,border:"none",borderRadius:".5rem",padding:".7rem 2rem",cursor:"pointer",fontFamily:"'DM Mono'",fontSize:".68rem",letterSpacing:".12em",color:C.ink,fontWeight:600}}>→ See the Future State</button>
        </div>
      </div>
    </div>
  );
}

function CsmView(){
  return(
    <div style={{padding:"1.5rem",animation:"fadeUp .4s ease both"}}>
      <Panel title="👤 CSM View — What YOU Need to Do Right Now" badge="Pillar 3 · Stakeholder Mgmt" delay={50}>
        <div style={{padding:"1rem 1.25rem"}}>
          <div style={{fontFamily:"'DM Mono'",fontSize:".62rem",color:C.teal,marginBottom:"1rem",letterSpacing:".08em"}}>No technical noise. Your actions, priority-ordered.</div>
          {INSIGHTS.filter(i=>i.urgency==="critical").map(ins=>(
            <div key={ins.id} style={{background:"rgba(232,84,84,.07)",border:"1px solid rgba(232,84,84,.25)",borderRadius:".75rem",padding:"1rem",marginBottom:".75rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontFamily:"'DM Mono'",fontSize:".6rem",color:C.red,letterSpacing:".1em"}}>🔴 DO NOW · SLA: {ins.sla}</span>
                <span style={{fontFamily:"'DM Mono'",fontSize:".56rem",color:"rgba(244,241,235,.3)"}}>{ins.id}</span>
              </div>
              <div style={{fontSize:".85rem",fontWeight:600,marginBottom:5}}>{ins.action}</div>
              <div style={{fontSize:".73rem",color:"rgba(244,241,235,.7)",lineHeight:1.5}}>{ins.suggestedAction}</div>
            </div>
          ))}
          {INSIGHTS.filter(i=>i.urgency==="high").map(ins=>(
            <div key={ins.id} style={{background:"rgba(240,124,58,.07)",border:"1px solid rgba(240,124,58,.22)",borderRadius:".75rem",padding:"1rem",marginBottom:".75rem"}}>
              <div style={{fontFamily:"'DM Mono'",fontSize:".6rem",color:C.orange,letterSpacing:".1em",marginBottom:5}}>🟠 DO TODAY · SLA: {ins.sla}</div>
              <div style={{fontSize:".85rem",fontWeight:600,marginBottom:5}}>{ins.action}</div>
              <div style={{fontSize:".73rem",color:"rgba(244,241,235,.7)",lineHeight:1.5}}>{ins.suggestedAction}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function ArchPanel(){
  const[open,sO]=useState(false);
  return(
    <div style={{background:C.ink2,borderRadius:"1.25rem",border:"1px solid rgba(255,255,255,.07)",overflow:"hidden",gridColumn:"1/-1"}}>
      <button onClick={()=>sO(!open)} style={{width:"100%",padding:"1rem 1.5rem",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",color:C.paper,fontFamily:"'DM Mono'"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:".68rem",letterSpacing:".14em",color:"rgba(244,241,235,.5)"}}>⚙ Architecture Panel</span>
          <span style={{fontSize:".58rem",padding:".2rem .5rem",borderRadius:".2rem",background:"rgba(201,168,76,.12)",color:C.gold}}>Pillar 2 · The Build</span>
        </div>
        <span style={{color:C.teal,fontSize:".8rem",transform:open?"rotate(180deg)":"none",transition:"transform .2s"}}>▼</span>
      </button>
      {open&&(
        <div style={{padding:"0 1.5rem 1.5rem",animation:"fadeUp .3s ease both"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem"}}>
            <div>
              <div style={{fontFamily:"'DM Mono'",fontSize:".6rem",letterSpacing:".1em",textTransform:"uppercase",color:C.teal,marginBottom:10}}>Tech Stack</div>
              {[["Input","CSM call transcripts (.txt / stream)"],["Extraction","Python + Anthropic SDK (claude-sonnet-4-6)"],["Schema","Typed dataclasses — ExtractedInsight, RoutedAlert"],["Routing","ROUTING_RULES → 5 destinations + SLA collapse"],["Gate","≥75% auto-route · <75% → Human Review Queue"],["Output","JSON + terminal alerts + this React dashboard"]].map(([k,v])=>(
                <div key={k} style={{display:"flex",gap:8,marginBottom:7}}>
                  <span style={{fontFamily:"'DM Mono'",fontSize:".6rem",color:C.gold,whiteSpace:"nowrap",minWidth:76}}>{k}:</span>
                  <span style={{fontSize:".72rem",color:"rgba(244,241,235,.7)"}}>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontFamily:"'DM Mono'",fontSize:".6rem",letterSpacing:".1em",textTransform:"uppercase",color:C.teal,marginBottom:10}}>Extraction Prompt Template</div>
              <div style={{background:C.ink,borderRadius:".5rem",padding:".9rem 1rem",fontFamily:"'DM Mono'",fontSize:".59rem",color:C.green,lineHeight:1.7,border:"1px solid rgba(255,255,255,.05)"}}>
                <span style={{color:C.purple}}>SYSTEM</span>: Senior CSM analyst.<br/>
                Extract insights as JSON array.<br/>
                Each insight includes:<br/>
                &nbsp;insight_type, summary, verbatim_quote,<br/>
                &nbsp;sentiment, urgency, confidence_score,<br/>
                &nbsp;routing_target, suggested_action<br/><br/>
                <span style={{color:C.purple}}>CONFIDENCE CALIBRATION</span>:<br/>
                &nbsp;0.90–1.00 → High, auto-route<br/>
                &nbsp;0.75–0.89 → Confident, auto-route<br/>
                &nbsp;0.60–0.74 → Uncertain, flag<br/>
                &nbsp;0.00–0.59 → Human review<br/><br/>
                <span style={{color:C.gold}}>PROMPT_VERSION</span>: v1.0.0
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Roadmap(){
  const ms=[{ph:"Now",label:"MVP POC",items:["File-based input","Python pipeline","This dashboard"],col:C.green},{ph:"3 mo",label:"Integration",items:["Native Invoca stream","Salesforce write-back"],col:C.teal},{ph:"6 mo",label:"Scale",items:["Slack alerts","Multi-CSM rollout","SLA tracking"],col:C.blue},{ph:"12 mo",label:"Intelligence",items:["Pattern aggregation","Auto PM digest","Cross-account"],col:C.purple},{ph:"18 mo",label:"Prediction",items:["Predictive churn","Auto-Jira tickets","Renewal scoring"],col:C.gold}];
  return(
    <div style={{padding:"1.25rem 1.5rem",overflowX:"auto"}}>
      <div style={{display:"flex",alignItems:"flex-start",minWidth:580,position:"relative"}}>
        <div style={{position:"absolute",top:20,left:"5%",right:"5%",height:2,background:`linear-gradient(90deg,${C.green},${C.gold})`,zIndex:0}}/>
        {ms.map((m,i)=>(
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",position:"relative",zIndex:1}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:C.ink2,border:`2px solid ${m.col}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8,boxShadow:`0 0 14px ${m.col}44`}}>
              <span style={{fontFamily:"'DM Mono'",fontSize:".5rem",color:m.col,fontWeight:600}}>{m.ph}</span>
            </div>
            <div style={{fontFamily:"'DM Mono'",fontSize:".6rem",color:m.col,marginBottom:6,textAlign:"center"}}>{m.label}</div>
            <div style={{background:C.ink3,borderRadius:".5rem",padding:".6rem .7rem",border:`1px solid ${m.col}33`,width:"90%"}}>
              {m.items.map((it,j)=>(
                <div key={j} style={{fontSize:".61rem",color:"rgba(244,241,235,.65)",lineHeight:1.55,paddingLeft:8,position:"relative"}}>
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

export default function App(){
  const[modal,sM]=useState(null);
  const[view,sV]=useState("future");
  const byRoute={
    Engineering:INSIGHTS.filter(i=>i.route==="Engineering"),
    "CS Leadership":INSIGHTS.filter(i=>i.route==="CS Leadership"),
    "Sales Leadership":INSIGHTS.filter(i=>i.route==="Sales Leadership"),
    "Product Management":INSIGHTS.filter(i=>i.route==="Product Management"),
  };

  return(
    <div style={{minHeight:"100vh",background:C.ink,color:C.paper,fontFamily:"'DM Sans',sans-serif",fontSize:"16px"}}>
      <style>{CSS}</style>

      {/* HEADER */}
      <header style={{position:"relative",zIndex:10,padding:"1.5rem 2rem 1.25rem",borderBottom:"1px solid rgba(201,168,76,.2)",background:"linear-gradient(180deg,rgba(0,196,180,.05) 0%,transparent 100%)",display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem",animation:"fadeUp .5s ease both"}}>
        <div>
          <div style={{fontFamily:"'DM Mono'",fontSize:".66rem",fontWeight:500,letterSpacing:".18em",textTransform:"uppercase",color:C.teal,marginBottom:".35rem",display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:20,height:1,background:C.teal,display:"inline-block"}}/>Invoca · JTBD Feedback Loop
          </div>
          <h1 style={{fontFamily:"'DM Serif Display'",fontSize:"2.1rem",fontWeight:400,lineHeight:1.1}}>
            Insight <em style={{fontStyle:"italic",color:C.gold}}>Intelligence</em> Dashboard
          </h1>
          <div style={{fontFamily:"'DM Mono'",fontSize:".68rem",color:"rgba(244,241,235,.45)",marginTop:".4rem"}}>
            ACCOUNT: Acme Financial Services &nbsp;·&nbsp; CSM: Jordan Rivera &nbsp;·&nbsp; ARR: $84,000 &nbsp;·&nbsp; Renewal: June 30, 2025
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:".6rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:".6rem",flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(61,190,138,.12)",border:"1px solid rgba(61,190,138,.3)",borderRadius:"2rem",padding:".28rem .8rem",fontFamily:"'DM Mono'",fontSize:".66rem",color:C.green,letterSpacing:".1em"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:C.green,animation:"pgDot 1.8s ease-in-out infinite"}}/>PIPELINE COMPLETE
            </div>
            <Toggle opts={[{v:"current",l:"Current State"},{v:"future",l:"Future State →"}]} val={view==="csm"?"future":view} set={v=>{sV(v);}}/>
            <button onClick={()=>sV(v=>v==="csm"?"future":"csm")} style={{padding:".28rem .75rem",borderRadius:".3rem",fontSize:".6rem",background:view==="csm"?"rgba(74,143,232,.2)":"rgba(255,255,255,.05)",border:`1px solid ${view==="csm"?C.blue:"rgba(255,255,255,.1)"}`,color:view==="csm"?C.blue:"rgba(244,241,235,.5)",cursor:"pointer",fontFamily:"'DM Mono'",letterSpacing:".08em",textTransform:"uppercase",transition:"all .2s"}}>
              {view==="csm"?"← Full View":"👤 CSM View"}
            </button>
          </div>
          <div style={{display:"flex",gap:"1rem",alignItems:"center"}}>
            <span style={{fontFamily:"'DM Mono'",fontSize:".66rem",color:"rgba(244,241,235,.4)"}}>TXN-2025-0312-ACM · 6 insights · 0 to human review</span>
            <span style={{fontFamily:"'DM Mono'",fontSize:".62rem",color:"rgba(201,168,76,.6)"}}>◈ Erwin M. McDonald</span>
          </div>
        </div>
      </header>

      {/* CONDITIONAL VIEWS */}
      {view==="current"
        ?<CurrentState onFlip={()=>sV("future")}/>
        :view==="csm"
        ?<CsmView/>
        :(
        <main style={{position:"relative",zIndex:1,padding:"1.75rem 2rem 3rem",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1.1rem"}}>

          {/* KPI ROW */}
          <div style={{gridColumn:"1/-1",display:"flex",gap:"1rem"}}>
            <Kpi label="Insights Extracted" value={6} color={C.teal} sub="Auto-routing: 6 · Human review: 0" delay={50}/>
            <Kpi label="Critical Alerts" value={2} color={C.red} sub="Bug + Churn · 4-hr SLA" delay={100}/>
            <Kpi label="Avg. Confidence" value={95.7} suffix="%" color={C.gold} sub="All above 75% threshold" delay={150}/>
            <Kpi label="Insights Routed" value={6} suffix="/6" color={C.green} sub="0 to Human Review Queue" delay={200}/>
            <Kpi label="ARR at Risk" prefix="$" value={84} suffix="K" color={C.orange} sub="Renewal June 30, 2025" delay={250}/>
          </div>

          {/* ROUTING MAP */}
          <Panel title="Stakeholder Routing Map" badge="All 6 routed · 0 to queue" fullWidth delay={140} ag={`linear-gradient(90deg,${C.teal},${C.gold})`}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",padding:"1.1rem 1.5rem"}}>
              {[{d:"Engineering",icon:"🔧",ins:byRoute["Engineering"]},{d:"CS Leadership",icon:"🤝",ins:byRoute["CS Leadership"]},{d:"Sales Leadership",icon:"💼",ins:byRoute["Sales Leadership"]},{d:"Product Management",icon:"📋",ins:byRoute["Product Management"]}].map(({d,icon,ins},li)=>(
                <div key={d} style={{padding:"0 1rem",borderRight:li<3?"1px solid rgba(255,255,255,.05)":"none",paddingLeft:li===0?0:undefined}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:".85rem",paddingBottom:".65rem",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                    <span style={{fontSize:".88rem"}}>{icon}</span>
                    <span style={{fontSize:".71rem",fontWeight:600,color:"rgba(244,241,235,.85)"}}>{d}</span>
                    <span style={{marginLeft:"auto",fontFamily:"'DM Mono'",fontSize:".58rem",color:"rgba(244,241,235,.35)"}}>{ins.length}</span>
                  </div>
                  {ins.map((ins2,idx)=><InsCard key={ins2.id} ins={ins2} onOpen={sM} delay={200+li*40+idx*40}/>)}
                </div>
              ))}
            </div>
          </Panel>

          {/* VERBATIM QUOTES */}
          <Panel title="Verbatim Evidence" badge="Exact from transcript" delay={190}>
            <div style={{padding:"1rem 1.5rem 1.15rem"}}>
              {[
                {q:"We've flagged it twice to support and the ticket is still open. It's not a minor thing — we're making media spend decisions based on this data.",m:"Bug Report · 97% confidence"},
                {q:"The bug needs to get fixed and the pricing conversation needs to happen before June. Otherwise honestly I don't know what the board is going to say.",m:"Churn Signal · 93% confidence"},
                {q:"Our inside sales team actually credits Invoca with a 23% improvement in qualified lead rate this quarter, which is huge.",m:"Positive Signal · 99% confidence"},
              ].map((q,i)=>(
                <div key={i} style={{padding:".85rem 0",borderBottom:i<2?"1px solid rgba(255,255,255,.05)":"none"}}>
                  <div style={{fontFamily:"'DM Serif Display'",fontStyle:"italic",fontSize:".83rem",lineHeight:1.55,position:"relative",paddingLeft:"1rem",marginBottom:4}}>
                    <span style={{position:"absolute",left:0,top:"-.1rem",fontSize:"1.3rem",color:C.gold,lineHeight:1}}>"</span>{q.q}
                  </div>
                  <div style={{fontFamily:"'DM Mono'",fontSize:".58rem",color:"rgba(244,241,235,.35)",paddingLeft:"1rem"}}>Acme Financial Services · {q.m}</div>
                </div>
              ))}
            </div>
          </Panel>

          {/* INSIGHT TYPE DONUT */}
          <Panel title="Insight Type Breakdown" badge="6 total" delay={220}>
            <div style={{padding:"1.1rem 1.5rem",display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem"}}>
              <Donut size={120} sw={12} label="6" sub="Insights" segs={[{p:33,c:C.red},{p:17,c:C.orange},{p:17,c:C.yellow},{p:33,c:C.green}]}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".4rem .8rem",width:"100%"}}>
                {[[C.red,"Bug/Churn","2"],[C.orange,"Pricing","1"],[C.yellow,"Feature","1"],[C.green,"Positive","2"]].map(([col,lab,cnt])=>(
                  <div key={lab} style={{display:"flex",alignItems:"center",gap:6,fontSize:".66rem",color:"rgba(244,241,235,.65)"}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:col,flexShrink:0}}/>{lab}
                    <span style={{marginLeft:"auto",fontFamily:"'DM Mono'",fontSize:".62rem",color:"rgba(244,241,235,.4)"}}>{cnt}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* CONFIDENCE BARS */}
          <Panel title="Confidence by Insight" badge="All ≥ 75%" delay={250}>
            <div style={{padding:"1.1rem 1.5rem",display:"flex",flexDirection:"column",gap:".6rem"}}>
              {INSIGHTS.map(ins=><BarRow key={ins.id} label={ins.type} pct={ins.confidence} color={UC[ins.urgency]}/>)}
            </div>
          </Panel>

          {/* SLA DONUT */}
          <Panel title="SLA Compliance" badge="On Track: 83%" delay={280}>
            <div style={{padding:"1.1rem 1.5rem",display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem"}}>
              <Donut size={120} sw={12} label="83%" sub="On Track" segs={[{p:83,c:C.green},{p:17,c:C.red}]}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".4rem .8rem",width:"100%"}}>
                {[[C.green,"On Track","5/6"],[C.red,"At Risk","1/6"]].map(([col,lab,cnt])=>(
                  <div key={lab} style={{display:"flex",alignItems:"center",gap:6,fontSize:".66rem",color:"rgba(244,241,235,.65)"}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:col,flexShrink:0}}/>{lab}
                    <span style={{marginLeft:"auto",fontFamily:"'DM Mono'",fontSize:".62rem",color:"rgba(244,241,235,.4)"}}>{cnt}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* ARCH PANEL */}
          <ArchPanel/>

          {/* ACCOUNT RISK TABLE */}
          <Panel title="Account Risk Register" badge="Simulated portfolio · 5 accounts" fullWidth delay={320}>
            <div>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",padding:".6rem 1.5rem",background:"rgba(255,255,255,.03)"}}>
                {["Account","ARR","Renewal","Risk","Status","Signals"].map(h=>(
                  <div key={h} style={{fontFamily:"'DM Mono'",fontSize:".58rem",letterSpacing:".12em",textTransform:"uppercase",color:"rgba(244,241,235,.3)"}}>{h}</div>
                ))}
              </div>
              {[
                {i:"A",n:"Acme Financial Services",csm:"Jordan Rivera",arr:"$84,000",r:"Jun 30",sc:85,sc_c:C.red,st:"⚠ At Risk",st_c:C.red,sig:"6 · 2 CRITICAL",sig_c:C.red,bg:`linear-gradient(135deg,${C.teal},${C.blue})`},
                {i:"M",n:"Meridian Healthcare",csm:"Taylor Chen",arr:"$126,000",r:"Sep 15",sc:52,sc_c:C.orange,st:"◎ Watch",st_c:C.orange,sig:"3 · 1 HIGH",sig_c:C.orange,bg:`linear-gradient(135deg,${C.orange},${C.gold})`},
                {i:"P",n:"Peak Auto Group",csm:"Marcus Webb",arr:"$212,000",r:"Dec 1",sc:22,sc_c:C.green,st:"✓ Healthy",st_c:C.green,sig:"1 · Positive",sig_c:C.green,bg:`linear-gradient(135deg,${C.green},${C.teal})`},
                {i:"V",n:"Vantage Retail Corp",csm:"Jordan Rivera",arr:"$68,000",r:"Mar 31",sc:68,sc_c:C.orange,st:"◎ Watch",st_c:C.orange,sig:"2 · Feature Gap",sig_c:C.orange,bg:`linear-gradient(135deg,${C.purple},${C.blue})`},
                {i:"S",n:"Suncoast Insurance",csm:"Taylor Chen",arr:"$94,000",r:"Jul 15",sc:18,sc_c:C.green,st:"✓ Healthy",st_c:C.green,sig:"2 · Positive",sig_c:C.green,bg:`linear-gradient(135deg,${C.teal},${C.green})`},
              ].map(a=>(
                <div key={a.n} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",padding:".85rem 1.5rem",borderBottom:"1px solid rgba(255,255,255,.04)",alignItems:"center",transition:"background .15s",cursor:"default"}}
                  onMouseOver={e=>e.currentTarget.style.background="rgba(255,255,255,.025)"}
                  onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:a.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Serif Display'",fontSize:".8rem",color:C.ink,flexShrink:0}}>{a.i}</div>
                    <div>
                      <div style={{fontSize:".78rem",fontWeight:500}}>{a.n}</div>
                      <div style={{fontSize:".63rem",color:"rgba(244,241,235,.4)"}}>CSM: {a.csm}</div>
                    </div>
                  </div>
                  <div style={{fontFamily:"'DM Mono'",fontSize:".72rem",color:"rgba(244,241,235,.7)"}}>{a.arr}</div>
                  <div style={{fontFamily:"'DM Mono'",fontSize:".72rem",color:"rgba(244,241,235,.7)"}}>{a.r}</div>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:40,height:4,borderRadius:2,background:"rgba(255,255,255,.08)",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${a.sc}%`,background:a.sc_c,borderRadius:2}}/>
                    </div>
                    <span style={{fontFamily:"'DM Mono'",fontSize:".62rem",color:a.sc_c}}>{a.sc}</span>
                  </div>
                  <span style={{fontFamily:"'DM Mono'",fontSize:".6rem",padding:".18rem .42rem",borderRadius:".2rem",background:`${a.st_c}22`,color:a.st_c}}>{a.st}</span>
                  <div style={{fontFamily:"'DM Mono'",fontSize:".68rem",color:a.sig_c}}>{a.sig}</div>
                </div>
              ))}
            </div>
          </Panel>

          {/* CSM CONFIRMATIONS */}
          <Panel title="CSM Closed-Loop Confirmations" badge="6 / 6 confirmed" fullWidth delay={370} ag={`linear-gradient(90deg,${C.green},${C.teal})`}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:".7rem",padding:"1.1rem 1.5rem"}}>
              {INSIGHTS.map(ins=>(
                <div key={ins.id} style={{background:C.ink3,borderRadius:".75rem",padding:".8rem .9rem",border:"1px solid rgba(61,190,138,.18)",display:"flex",gap:".65rem"}}>
                  <span style={{fontSize:".95rem",flexShrink:0,marginTop:2}}>✅</span>
                  <div>
                    <div style={{fontFamily:"'DM Mono'",fontSize:".56rem",letterSpacing:".1em",textTransform:"uppercase",color:C.green,marginBottom:3}}>Insight Confirmed</div>
                    <div style={{fontFamily:"'DM Mono'",fontSize:".54rem",color:"rgba(244,241,235,.28)",marginBottom:3}}>{ins.id} · {ins.type}</div>
                    <div style={{fontSize:".67rem",color:"rgba(244,241,235,.72)",lineHeight:1.4}}>Your {ins.type} from {ins.account} has been routed to {ins.route}.</div>
                    <div style={{fontFamily:"'DM Mono'",fontSize:".56rem",color:"rgba(244,241,235,.32)",marginTop:3}}>SLA: <span style={{color:C.teal}}>{ins.sla}</span> · <span style={{color:C.teal}}>{ins.confidence}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* PIPELINE FLOW */}
          <Panel title="Pipeline Architecture" badge="JTBD Feedback Loop v1.0" fullWidth delay={410}>
            <PipeFlow/>
          </Panel>

          {/* ROADMAP */}
          <Panel title="18-Month Intelligence Roadmap" badge="Pillar 4 · The Future" fullWidth delay={450} ag={`linear-gradient(90deg,${C.purple},${C.gold})`}>
            <Roadmap/>
          </Panel>

        </main>
      )}

      {/* FOOTER */}
      <footer style={{position:"relative",zIndex:1,padding:".9rem 2rem",borderTop:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:".5rem"}}>
        <div style={{fontFamily:"'DM Mono'",fontSize:".6rem",color:"rgba(244,241,235,.25)"}}>
          JTBD Feedback Loop Architect · Invoca Applied AI Analyst POC · Option 3 · Erwin M. McDonald
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"1.5rem",fontFamily:"'DM Mono'",fontSize:".6rem",color:"rgba(244,241,235,.25)"}}>
          <span>Pipeline: claude-sonnet-4-6</span>
          <span>Prompt v1.0.0</span>
          <span style={{color:"rgba(201,168,76,.55)"}}>github.com/emcdo411/jtbd-feedback-loop</span>
        </div>
      </footer>

      {modal&&<Modal ins={modal} onClose={()=>sM(null)}/>}
    </div>
  );
}
