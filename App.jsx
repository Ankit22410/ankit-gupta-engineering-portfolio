import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

const C = {
  bg:"#020408",bg2:"#030b18",cyan:"#00f5ff",blue:"#0070ff",purple:"#8b00ff",
  amber:"#ff9500",green:"#00ff88",rose:"#ff2060",text:"#e8f4ff",muted:"#7090b0",dim:"#304560",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Exo+2:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#020408;color:#e8f4ff;font-family:'Exo 2',sans-serif;overflow-x:hidden}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#020408}
::-webkit-scrollbar-thumb{background:linear-gradient(#0070ff,#00f5ff);border-radius:2px}
a{text-decoration:none}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes spinR{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
@keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes scanV{from{top:-4px}to{top:100%}}
@keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
@keyframes glitch{0%,87%,100%{clip-path:none;transform:none}88%{clip-path:polygon(0 0,100% 0,100% 30%,0 30%);transform:translate(-3px,0)}89%{clip-path:polygon(0 60%,100% 60%,100% 100%,0 100%);transform:translate(3px,0)}90%{clip-path:none;transform:none}}
@keyframes radarSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes radarPulse{0%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(1.8)}}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes countUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes gridMove{from{background-position:0 0}to{background-position:60px 60px}}
@keyframes beamH{0%{left:-5%;opacity:0}10%{opacity:1}90%{opacity:1}100%{left:105%;opacity:0}}
.neon{font-family:'Orbitron',sans-serif}
.mono{font-family:'Share Tech Mono',monospace}
.glass{background:rgba(0,20,50,.65);backdrop-filter:blur(24px);border:1px solid rgba(0,245,255,.1);border-radius:12px}
.card-hover{transition:all .3s cubic-bezier(.4,0,.2,1)}
.card-hover:hover{transform:translateY(-6px) scale(1.01);border-color:rgba(0,245,255,.35)!important;box-shadow:0 20px 60px rgba(0,245,255,.1)}
.scan-active{position:relative;overflow:hidden}
.scan-active::before{content:'';position:absolute;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,rgba(0,245,255,.6),transparent);animation:scanV 3.5s linear infinite;z-index:1;pointer-events:none}
.grid-bg{background-image:linear-gradient(rgba(0,245,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,.04) 1px,transparent 1px);background-size:60px 60px;animation:gridMove 20s linear infinite}
.pcb-bg{background-image:repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(0,112,255,.06) 59px,rgba(0,112,255,.06) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(0,112,255,.06) 59px,rgba(0,112,255,.06) 60px)}
`;

const TICKER_ITEMS = ["EMBEDDED SYSTEMS","DRONE TECHNOLOGY","AEROSPACE ENGINEERING","ROBOTICS","IoT SYSTEMS","FPV DRONES","SENSOR FUSION","ARDUINO","ESP32","BETAFLIGHT","GPS NAVIGATION","LoRa COMMS","HAL KORWA","IIT KANPUR","KNIT SULTANPUR","SIH 2024","SIH 2025","NPTEL ELITE","SSB SHORTLISTED"];

function Ticker() {
  const items = [...TICKER_ITEMS,...TICKER_ITEMS];
  return (
    <div style={{overflow:"hidden",padding:"9px 0",borderTop:"1px solid rgba(0,245,255,.07)",borderBottom:"1px solid rgba(0,245,255,.07)",background:"rgba(0,245,255,.02)",position:"relative",zIndex:5}}>
      <div style={{display:"flex",width:"max-content",animation:"ticker 40s linear infinite"}}>
        {items.map((t,i)=>(
          <span key={i} className="mono" style={{fontSize:10,letterSpacing:3,color:i%5===0?C.cyan:C.dim,paddingRight:48,whiteSpace:"nowrap"}}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function HeroCanvas() {
  const mountRef = useRef(null);
  const mouseRef = useRef({x:0,y:0});
  useEffect(()=>{
    const el = mountRef.current; if(!el) return;
    const W=el.clientWidth, H=el.clientHeight;
    const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText="position:absolute;top:0;left:0;pointer-events:none;";
    const scene=new THREE.Scene();
    const cam=new THREE.PerspectiveCamera(60,W/H,.1,1000);
    cam.position.set(0,0,5);
    const grp=new THREE.Group();
    grp.add(new THREE.Mesh(new THREE.OctahedronGeometry(.45,0),new THREE.MeshBasicMaterial({color:0x00f5ff,wireframe:true,transparent:true,opacity:.55})));
    [[1.1,0,0],[-1.1,0,0],[0,0,1.1],[0,0,-1.1]].forEach(p=>{
      const arm=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.95,6),new THREE.MeshBasicMaterial({color:0x0070ff,transparent:true,opacity:.6}));
      arm.rotation.z=Math.PI/2; arm.position.set(p[0]/2,0,p[2]/2);
      if(p[2]!==0){arm.rotation.x=Math.PI/2;arm.rotation.z=0;} grp.add(arm);
      const motor=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.08,16),new THREE.MeshBasicMaterial({color:0x00f5ff,wireframe:true,transparent:true,opacity:.7}));
      motor.position.set(...p); grp.add(motor);
      const prop=new THREE.Mesh(new THREE.TorusGeometry(.22,.02,6,24),new THREE.MeshBasicMaterial({color:0x8b00ff,transparent:true,opacity:.5}));
      prop.position.set(...p); prop.userData.spin=true; grp.add(prop);
    });
    scene.add(grp);
    const orbitRing=new THREE.Mesh(new THREE.TorusGeometry(2.2,.015,6,80),new THREE.MeshBasicMaterial({color:0x0070ff,transparent:true,opacity:.2}));
    orbitRing.rotation.x=.4; scene.add(orbitRing);
    const satGrp=new THREE.Group();
    satGrp.add(new THREE.Mesh(new THREE.BoxGeometry(.2,.1,.3),new THREE.MeshBasicMaterial({color:0x00f5ff,wireframe:true,transparent:true,opacity:.7})));
    [-1,1].forEach(side=>{const p=new THREE.Mesh(new THREE.BoxGeometry(.5,.01,.18),new THREE.MeshBasicMaterial({color:0x0040ff,transparent:true,opacity:.4}));p.position.x=side*.35;satGrp.add(p);});
    scene.add(satGrp);
    const pcb=new THREE.Mesh(new THREE.PlaneGeometry(3,2,8,5),new THREE.MeshBasicMaterial({color:0x003020,wireframe:true,transparent:true,opacity:.12}));
    pcb.position.set(-1.5,-1.5,-1); pcb.rotation.x=-.3; scene.add(pcb);
    const pos=new Float32Array(320*3); for(let i=0;i<960;i++) pos[i]=(Math.random()-.5)*14;
    const ptGeo=new THREE.BufferGeometry(); ptGeo.setAttribute("position",new THREE.BufferAttribute(pos,3));
    scene.add(new THREE.Points(ptGeo,new THREE.PointsMaterial({color:0x00f5ff,size:.04,transparent:true,opacity:.55})));
    let t=0;
    let af=requestAnimationFrame(function loop(){
      t+=.007;
      grp.rotation.y=t*.5+mouseRef.current.x*.4; grp.rotation.x=Math.sin(t*.3)*.15+mouseRef.current.y*.3;
      grp.position.y=Math.sin(t)*.15; grp.children.forEach(c=>{if(c.userData.spin) c.rotation.y+=.06;});
      satGrp.position.x=Math.cos(t*.4)*2.2; satGrp.position.z=Math.sin(t*.4)*2.2-1;
      satGrp.position.y=Math.sin(t*.4)*.5; satGrp.rotation.y=t*.4+Math.PI/2;
      orbitRing.rotation.y=t*.08; renderer.render(scene,cam); af=requestAnimationFrame(loop);
    });
    const onMouse=e=>{const r=el.getBoundingClientRect();mouseRef.current={x:(e.clientX-r.left)/W-.5,y:(e.clientY-r.top)/H-.5};};
    const onResize=()=>{const nW=el.clientWidth,nH=el.clientHeight;cam.aspect=nW/nH;cam.updateProjectionMatrix();renderer.setSize(nW,nH);};
    window.addEventListener("mousemove",onMouse); window.addEventListener("resize",onResize);
    return()=>{cancelAnimationFrame(af);window.removeEventListener("mousemove",onMouse);window.removeEventListener("resize",onResize);try{el.removeChild(renderer.domElement);}catch(e){}renderer.dispose();};
  },[]);
  return <div ref={mountRef} style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:1}}/>;
}

function Radar() {
  return (
    <div style={{position:"relative",width:130,height:130,flexShrink:0}}>
      {[1,.7,.4].map((s,i)=>(
        <div key={i} style={{position:"absolute",inset:`${(1-s)*50}%`,border:`1px solid rgba(0,245,255,${.08+i*.06})`,borderRadius:"50%"}}/>
      ))}
      <div style={{position:"absolute",top:"50%",left:"50%",width:"50%",height:1,transformOrigin:"0 0",background:"linear-gradient(90deg,rgba(0,245,255,.8),transparent)",animation:"radarSpin 3s linear infinite"}}/>
      {[0,1,2,3].map(i=>(<div key={i} style={{position:"absolute",top:`${10+i*22}%`,left:`${12+i*18}%`,width:4,height:4,borderRadius:"50%",background:C.cyan,animation:`pulse ${1+i*.3}s ease-in-out infinite ${i*.2}s`,boxShadow:`0 0 8px ${C.cyan}`}}/>))}
      <div style={{position:"absolute",inset:"50%",width:6,height:6,background:C.cyan,borderRadius:"50%",transform:"translate(-50%,-50%)",boxShadow:`0 0 14px ${C.cyan}`}}/>
    </div>
  );
}

const TITLES=["Electronics Engineer","Embedded Systems Developer","Robotics Engineer","IoT & Drone Systems Developer","Aerospace Technology Innovator","FPV Systems Engineer"];
function TypeWriter() {
  const [idx,setIdx]=useState(0);const [txt,setTxt]=useState("");const [del,setDel]=useState(false);
  useEffect(()=>{
    const cur=TITLES[idx];let t;
    if(!del&&txt.length<cur.length) t=setTimeout(()=>setTxt(cur.slice(0,txt.length+1)),65);
    else if(!del&&txt.length===cur.length) t=setTimeout(()=>setDel(true),2000);
    else if(del&&txt.length>0) t=setTimeout(()=>setTxt(txt.slice(0,-1)),32);
    else{setDel(false);setIdx((idx+1)%TITLES.length);}
    return()=>clearTimeout(t);
  },[txt,del,idx]);
  return <span style={{color:C.cyan}}>{txt}<span style={{animation:"blink 1s infinite",color:C.cyan}}>▌</span></span>;
}

function Counter({end,label,suffix="",color=C.cyan}) {
  const [v,setV]=useState(0);const ref=useRef(null);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){let s=0;const step=end/1800*16;const iv=setInterval(()=>{s=Math.min(s+step,end);setV(Math.round(s));if(s>=end)clearInterval(iv);},16);obs.disconnect();}
    },{threshold:.4});
    if(ref.current) obs.observe(ref.current); return()=>obs.disconnect();
  },[end]);
  return (
    <div ref={ref} style={{textAlign:"center",padding:"20px 28px"}}>
      <div className="neon" style={{fontSize:"clamp(28px,4vw,48px)",fontWeight:900,color,lineHeight:1,textShadow:`0 0 30px ${color}88`}}>{v}{suffix}</div>
      <div className="mono" style={{fontSize:10,letterSpacing:3,color:C.dim,marginTop:8}}>{label}</div>
    </div>
  );
}

const SKILLS_ORBIT=[
  {name:"Arduino",r:90,dur:8,col:C.cyan},{name:"ESP32",r:90,dur:8,col:C.cyan,offset:180},
  {name:"Embedded C",r:130,dur:12,col:C.blue},{name:"Python",r:130,dur:12,col:C.blue,offset:90},
  {name:"MATLAB",r:130,dur:12,col:C.blue,offset:210},{name:"Proteus",r:130,dur:12,col:C.blue,offset:300},
  {name:"UART/I2C/SPI",r:175,dur:17,col:C.purple},{name:"WiFi",r:175,dur:17,col:C.purple,offset:60},
  {name:"GSM/LoRa",r:175,dur:17,col:C.purple,offset:140},{name:"GPS",r:175,dur:17,col:C.purple,offset:220},
  {name:"AutoCAD",r:215,dur:22,col:C.amber},{name:"3D Modelling",r:215,dur:22,col:C.amber,offset:80},
  {name:"Betaflight",r:215,dur:22,col:C.amber,offset:175},{name:"TinkerCAD",r:215,dur:22,col:C.amber,offset:270},
];
function SkillOrbit() {
  const canvasRef=useRef(null);
  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");const SIZE=500;canvas.width=SIZE;canvas.height=SIZE;
    const cx=SIZE/2,cy=SIZE/2;let t=0;let af;
    const draw=()=>{
      ctx.clearRect(0,0,SIZE,SIZE);
      [90,130,175,215].forEach((r,i)=>{ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle=`rgba(0,112,255,${.1+i*.02})`;ctx.lineWidth=1;ctx.stroke();});
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,38);g.addColorStop(0,"rgba(0,245,255,.25)");g.addColorStop(1,"transparent");
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,38,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(cx,cy,18,0,Math.PI*2);ctx.strokeStyle="rgba(0,245,255,.6)";ctx.lineWidth=1.5;ctx.stroke();
      ctx.fillStyle="#00f5ff";ctx.font="bold 10px 'Orbitron',sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("AG",cx,cy);
      SKILLS_ORBIT.forEach(s=>{
        const ang=((t/s.dur+(s.offset||0)/360)%1)*Math.PI*2;
        const x=cx+Math.cos(ang)*s.r,y=cy+Math.sin(ang)*s.r;
        const sg=ctx.createRadialGradient(x,y,0,x,y,12);sg.addColorStop(0,s.col+"44");sg.addColorStop(1,"transparent");
        ctx.fillStyle=sg;ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fillStyle=s.col;ctx.fill();
        ctx.fillStyle=s.col;ctx.font="10px 'Share Tech Mono',monospace";ctx.textAlign="center";ctx.textBaseline="middle";
        ctx.fillText(s.name,x+(x<cx?-22:22),y+(y<cy-10?-16:y>cy+10?16:0));
      });
      t+=.002;af=requestAnimationFrame(draw);
    };
    draw();return()=>cancelAnimationFrame(af);
  },[]);
  return <div style={{display:"flex",justifyContent:"center",padding:"20px 0"}}><canvas ref={canvasRef} style={{maxWidth:"100%",opacity:.92}}/></div>;
}

function SH({n,title,sub}) {
  return (
    <div style={{marginBottom:56}}>
      <div className="mono" style={{fontSize:10,color:C.dim,letterSpacing:5,marginBottom:6}}>{n} // ────────────</div>
      <div style={{display:"flex",alignItems:"center",gap:24,marginBottom:sub?12:0}}>
        <h2 className="neon" style={{fontSize:"clamp(20px,3.2vw,32px)",fontWeight:900,color:C.text,letterSpacing:".08em",whiteSpace:"nowrap"}}>{title}</h2>
        <div style={{height:1,flex:1,background:"linear-gradient(90deg,rgba(0,245,255,.3),transparent)"}}/>
      </div>
      {sub&&<p style={{fontSize:15,color:C.muted,maxWidth:620,lineHeight:1.8}}>{sub}</p>}
    </div>
  );
}

const PROJECTS=[
  {title:"Multi-Purpose Smart Drone Monitoring System",emoji:"🚁",tag:"UAV · GPS · LoRa · WiFi · Sensor Fusion",status:"ACTIVE",color:C.cyan,tech:["GPS Integration","LoRa Telemetry","WiFi","Sensor Fusion","Autonomous Logic"],desc:"GPS-integrated UAV with real-time surveillance, dual LoRa/WiFi telemetry, and autonomous monitoring algorithms for disaster response and security operations."},
  {title:"FPV Drone — Payload Pickup & Drop System",emoji:"🎯",tag:"Betaflight · Servo · FPV · Flight Controller",status:"BUILT",color:C.blue,tech:["Betaflight","FPV Camera","Servo Actuators","Flight Controller","PID Tuning"],desc:"Betaflight-tuned FPV racing drone with precision servo-actuated payload mechanism and live FPV monitoring for autonomous payload operations."},
  {title:"Portable Health Monitoring & Alert System",emoji:"❤️",tag:"ESP8266 · SIM800 · Biomedical · IoT",status:"BUILT",color:C.purple,tech:["ESP8266","SIM800 GSM","Pulse Sensor","Temp Sensor","Auto-Alert"],desc:"Compact wearable IoT health monitor with real-time vital tracking and automated GSM emergency alerts on threshold breach."},
  {title:"Home Automation System",emoji:"🏠",tag:"ESP32 · Blynk · WiFi · Real-time",status:"BUILT",color:C.amber,tech:["ESP32","Blynk Platform","WiFi","4+ Appliances","Fail-safe Logic"],desc:"Wi-Fi smart home system controlling multiple appliances via mobile with real-time state sync and fail-safe logic."},
  {title:"Line Following Robot (PID Control)",emoji:"🤖",tag:"Arduino · PID · IR Array · Autonomous",status:"BUILT",color:C.green,tech:["Arduino Uno","PID Control","IR Sensor Array","Obstacle Avoidance","Path Mapping"],desc:"Autonomous line-following robot with precision PID control, 8-sensor IR array, and multi-track obstacle avoidance."},
  {title:"Aerodynamic Hovercraft Design",emoji:"🛸",tag:"Aerodynamics · Fabrication · Thrust Design",status:"BUILT",color:C.rose,tech:["Thrust Optimization","Skirt Geometry","Aerodynamic Modeling","Mechanical Fabrication"],desc:"Functional hovercraft with iteratively optimized thrust and skirt geometry demonstrating stable lift and directional movement."},
];
const EXPERIENCE=[
  {role:"Robotics & STEM Educator",org:"Physics Wallah",loc:"Gurugram",period:"Oct 2025 – May 2026",color:C.cyan,icon:"🤖",impact:"Delivered hands-on robotics and embedded systems curriculum to 200+ students, translating complex engineering concepts into accessible project-based learning.",tech:["Microcontrollers","Sensor Systems","Automation","Arduino","Robotics Kits"]},
  {role:"Trainee Engineer",org:"Hindustan Aeronautics Limited (HAL)",loc:"Korwa, Amethi",period:"June – July 2025",color:C.blue,icon:"✈️",impact:"6-week industrial training in aerospace sub-assembly lines, quality inspection, and avionics documentation in a defense-grade production environment.",tech:["Aerospace Manufacturing","Quality Inspection","Avionics","Defense Systems","Sub-assembly"]},
  {role:"Industrial Exposure",org:"NTPC Green Energy",loc:"Ayodhya, India",period:"Jan – Feb 2025",color:C.purple,icon:"⚡",impact:"Studied solar and wind generation operations, grid integration strategies, and India's sustainable energy transition roadmap.",tech:["Solar Power","Wind Energy","Grid Integration","SCADA","Power Electronics"]},
];
const ACHIEVEMENTS=[
  {text:"Smart India Hackathon 2024 & 2025",icon:"🏆",col:C.cyan},
  {text:"SSB Interview Shortlisted — Indian Navy SSC (Tech) × 2",icon:"⭐",col:C.blue},
  {text:"IIT Kanpur Techkriti 2025 — National Technical Festival",icon:"🎓",col:C.purple},
  {text:"Research Paper Competition — IIT BHU 'Vision for Viksit Bharat'",icon:"📄",col:C.amber},
  {text:"RC Aeromodelling Workshop — IIT Kanpur (Aircraft, ESCs, Servos)",icon:"✈️",col:C.green},
];

export default function Portfolio() {
  const [boot,setBoot]=useState(true);const [pct,setPct]=useState(0);const [nav,setNav]=useState(false);
  useEffect(()=>{const s=document.createElement("style");s.id="ag-css";s.textContent=CSS;document.head.appendChild(s);return()=>document.getElementById("ag-css")?.remove();},[]);
  useEffect(()=>{let p=0;const iv=setInterval(()=>{p+=Math.random()*14+3;if(p>=100){clearInterval(iv);p=100;setTimeout(()=>setBoot(false),400);}setPct(Math.min(p,100));},80);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const f=()=>setNav(window.scrollY>60);window.addEventListener("scroll",f);return()=>window.removeEventListener("scroll",f);},[]);

  if(boot) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",maxWidth:360}}>
        <div style={{width:120,height:120,margin:"0 auto 32px",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {[{s:110,spd:"4s"},{s:90,spd:"2.5s",rev:true},{s:70,spd:"1.8s"}].map((r,i)=>(
            <div key={i} style={{position:"absolute",width:r.s,height:r.s,borderRadius:"50%",border:"1px solid rgba(0,245,255,.2)",animation:`${r.rev?"spinR":"spin"} ${r.spd} linear infinite`,borderTopColor:C.cyan}}/>
          ))}
          <span className="neon" style={{fontSize:28,fontWeight:900,color:C.cyan}}>AG</span>
        </div>
        <div className="mono" style={{color:C.cyan,fontSize:11,letterSpacing:5,marginBottom:4}}>INITIALIZING SYSTEM</div>
        <div className="mono" style={{color:C.dim,fontSize:10,letterSpacing:2,marginBottom:44}}>ANKIT GUPTA // ENGINEERING PORTFOLIO v3.0</div>
        <div style={{width:"100%",height:2,background:"rgba(0,245,255,.06)",borderRadius:1,marginBottom:10}}>
          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${C.blue},${C.cyan})`,borderRadius:1,transition:"width .1s linear",boxShadow:`0 0 12px ${C.cyan}`}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div className="mono" style={{fontSize:10,color:C.dim}}>LOADING MODULES...</div>
          <div className="mono" style={{fontSize:10,color:C.cyan}}>{Math.round(pct)}%</div>
        </div>
        {pct>40&&<div className="mono" style={{fontSize:10,color:C.dim,marginTop:16,lineHeight:2,textAlign:"left"}}>
          {pct>40&&<div style={{color:"rgba(0,245,255,.5)"}}>✓ Embedded Systems Module</div>}
          {pct>55&&<div style={{color:"rgba(0,245,255,.5)"}}>✓ Drone Navigation Core</div>}
          {pct>70&&<div style={{color:"rgba(0,245,255,.5)"}}>✓ Aerospace Interface</div>}
          {pct>85&&<div style={{color:"rgba(0,245,255,.5)"}}>✓ IoT Network Layer</div>}
          {pct>93&&<div style={{color:C.cyan}}>▶ Compiling portfolio...</div>}
        </div>}
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text}}>
      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:300,padding:"12px 48px",background:nav?"rgba(2,4,8,.95)":"transparent",backdropFilter:nav?"blur(24px)":"none",borderBottom:nav?"1px solid rgba(0,245,255,.07)":"none",transition:"all .3s",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:32,height:32,border:`1px solid ${C.cyan}`,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span className="neon" style={{fontSize:12,fontWeight:700,color:C.cyan}}>AG</span>
          </div>
          <span className="neon" style={{fontSize:12,fontWeight:700,color:C.text,letterSpacing:3}}>ANKIT GUPTA</span>
        </div>
        <div style={{display:"flex",gap:32,alignItems:"center"}}>
          {["About","Experience","Projects","Skills","Contact"].map(s=>(
            <a key={s} href={`#${s.toLowerCase()}`} className="mono" style={{color:C.muted,fontSize:11,letterSpacing:2,transition:"color .2s"}}
              onMouseEnter={e=>e.target.style.color=C.cyan} onMouseLeave={e=>e.target.style.color=C.muted}>{s}</a>
          ))}
          <a href="mailto:ankitgupta22410@gmail.com" className="neon" style={{padding:"7px 18px",border:"1px solid rgba(0,245,255,.3)",borderRadius:4,color:C.cyan,fontSize:10,letterSpacing:2,transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,245,255,.1)";e.currentTarget.style.boxShadow="0 0 18px rgba(0,245,255,.2)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.boxShadow="none";}}>HIRE ME</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:"100vh",position:"relative",display:"flex",alignItems:"center",overflow:"hidden",background:`radial-gradient(ellipse 100% 80% at 60% 50%,rgba(0,112,255,.06) 0%,transparent 65%)`}}>
        <div className="grid-bg" style={{position:"absolute",inset:0,zIndex:0}}/>
        <HeroCanvas/>
        {[[{top:80,left:28},{top:80,right:28},{bottom:28,left:28},{bottom:28,right:28}]].flat().map((p,i)=>(
          <div key={i} style={{position:"absolute",...p,width:40,height:40,borderTop:i<2?"1px solid rgba(0,245,255,.2)":"none",borderBottom:i>=2?"1px solid rgba(0,245,255,.2)":"none",borderLeft:i%2===0?"1px solid rgba(0,245,255,.2)":"none",borderRight:i%2===1?"1px solid rgba(0,245,255,.2)":"none",zIndex:2}}/>
        ))}
        {[{c:"#00f5ff",s:380,l:"-3%",t:"5%",op:.04},{c:"#0070ff",s:480,r:"-5%",t:"25%",op:.05}].map((o,i)=>(
          <div key={i} style={{position:"absolute",width:o.s,height:o.s,borderRadius:"50%",background:o.c,filter:"blur(90px)",opacity:o.op,left:o.l,right:o.r,top:o.t,animation:`float ${5+i*1.8}s ease-in-out infinite`,zIndex:0}}/>
        ))}
        <div style={{maxWidth:1260,margin:"0 auto",padding:"120px 48px 80px",width:"100%",display:"grid",gridTemplateColumns:"1fr 420px",gap:60,alignItems:"center",position:"relative",zIndex:2}}>
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,padding:"6px 20px",border:"1px solid rgba(0,245,255,.2)",borderRadius:100,marginBottom:36,background:"rgba(0,245,255,.04)",animation:"fadeUp .6s ease forwards"}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:C.cyan,animation:"blink 1.8s infinite",boxShadow:`0 0 8px ${C.cyan}`}}/>
              <span className="mono" style={{fontSize:10,letterSpacing:3,color:C.cyan}}>ELECTRONICS ENGINEERING · KNIT SULTANPUR · 2026</span>
            </div>
            <h1 className="neon" style={{fontSize:"clamp(48px,8vw,96px)",fontWeight:900,lineHeight:.95,marginBottom:6,letterSpacing:".05em",animation:"fadeUp .7s .1s ease forwards",opacity:0}}>
              <div style={{background:`linear-gradient(135deg,#ffffff 0%,${C.cyan} 45%,${C.blue} 80%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"glitch 12s ease infinite"}}>ANKIT</div>
              <div style={{background:`linear-gradient(135deg,${C.cyan} 0%,${C.blue} 55%,${C.purple} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>GUPTA</div>
            </h1>
            <div style={{fontSize:"clamp(14px,2vw,19px)",letterSpacing:2,fontWeight:500,marginBottom:48,minHeight:30,animation:"fadeUp .7s .2s ease forwards",opacity:0}}><TypeWriter/></div>
            <div style={{display:"flex",gap:0,marginBottom:48,animation:"fadeUp .7s .35s ease forwards",opacity:0}}>
              {[{n:"7+",l:"Projects"},{n:"HAL",l:"Aerospace"},{n:"3×",l:"NPTEL Certs"},{n:"SIH",l:"2024 & 2025"}].map(({n,l},i)=>(
                <div key={n} style={{paddingRight:32,borderRight:i<3?"1px solid rgba(0,245,255,.1)":"none",marginRight:32,textAlign:"center"}}>
                  <div className="neon" style={{fontSize:22,fontWeight:700,color:C.cyan,textShadow:`0 0 20px ${C.cyan}88`}}>{n}</div>
                  <div className="mono" style={{fontSize:9,letterSpacing:3,color:C.dim,marginTop:4}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",animation:"fadeUp .7s .5s ease forwards",opacity:0}}>
              {[{l:"VIEW PROJECTS",h:"#projects",p:true},{l:"GITHUB ↗",h:"https://github.com/Ankit22410"},{l:"LINKEDIN ↗",h:"https://linkedin.com/in/ankit-gupta-a43091272/"},{l:"CONTACT",h:"#contact"}].map(({l,h,p})=>(
                <a key={l} href={h} className="neon" style={{padding:"12px 28px",borderRadius:4,fontSize:10,letterSpacing:2.5,transition:"all .25s",...(p?{background:`linear-gradient(135deg,${C.blue},${C.cyan})`,color:C.bg,boxShadow:"0 0 28px rgba(0,245,255,.35)"}:{background:"transparent",color:C.cyan,border:"1px solid rgba(0,245,255,.25)"})}}
                  onMouseEnter={e=>{if(!p){e.currentTarget.style.borderColor=C.cyan;e.currentTarget.style.background="rgba(0,245,255,.07)";}else e.currentTarget.style.boxShadow="0 0 50px rgba(0,245,255,.6)";}}
                  onMouseLeave={e=>{if(!p){e.currentTarget.style.borderColor="rgba(0,245,255,.25)";e.currentTarget.style.background="transparent";}else e.currentTarget.style.boxShadow="0 0 28px rgba(0,245,255,.35)";}}
                >{l}</a>
              ))}
            </div>
          </div>
          <div style={{animation:"fadeUp .7s .4s ease forwards",opacity:0}}>
            <div className="glass scan-active" style={{padding:24,marginBottom:18}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <span className="mono" style={{fontSize:10,letterSpacing:3,color:C.cyan}}>SYSTEM STATUS</span>
                <span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:6,height:6,borderRadius:"50%",background:C.green,boxShadow:`0 0 8px ${C.green}`,animation:"blink 2s infinite"}}/><span className="mono" style={{fontSize:9,color:C.green}}>ONLINE</span></span>
              </div>
              {[{k:"LOCATION",v:"Ayodhya, UP, India"},{k:"DEGREE",v:"B.Tech Electronics"},{k:"CGPA",v:"7.80 / 10.0"},{k:"BATCH",v:"2022–2026"},{k:"DOMAIN",v:"Embedded · Drones · Aerospace"}].map(({k,v})=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(0,245,255,.05)"}}>
                  <span className="mono" style={{fontSize:10,color:C.dim,letterSpacing:1.5}}>{k}</span>
                  <span style={{fontSize:13,color:C.text}}>{v}</span>
                </div>
              ))}
            </div>
            <div className="glass" style={{padding:24,display:"flex",alignItems:"center",gap:20}}>
              <Radar/>
              <div>
                <div className="mono" style={{fontSize:10,letterSpacing:3,color:C.cyan,marginBottom:8}}>TRACKING SYSTEMS</div>
                {["Embedded Systems","Drone Technology","Aerospace","Robotics","IoT"].map((s,i)=>(
                  <div key={s} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <div style={{width:4,height:4,borderRadius:"50%",background:C.cyan,animation:`pulse ${1.2+i*.2}s ease-in-out infinite`}}/>
                    <span className="mono" style={{fontSize:10,color:C.muted}}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{position:"absolute",bottom:28,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:8,animation:"float 2.5s ease-in-out infinite",zIndex:2}}>
          <div className="mono" style={{fontSize:9,letterSpacing:5,color:C.dim}}>SCROLL</div>
          <div style={{width:1,height:50,background:`linear-gradient(to bottom,${C.cyan},transparent)`}}/>
        </div>
      </section>

      <Ticker/>

      {/* DASHBOARD */}
      <section style={{padding:"80px 48px",background:`linear-gradient(180deg,${C.bg2} 0%,${C.bg} 100%)`}}>
        <div style={{maxWidth:1260,margin:"0 auto"}}>
          <div className="mono" style={{fontSize:10,letterSpacing:5,color:C.dim,textAlign:"center",marginBottom:32}}>ENGINEERING METRICS // LIVE DASHBOARD</div>
          <div className="glass" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))"}}>
            {[{end:7,suffix:"+",label:"PROJECTS BUILT",color:C.cyan},{end:6,suffix:"",label:"ENGINEERING DOMAINS",color:C.blue},{end:3,suffix:"×",label:"NPTEL CERTIFIED",color:C.purple},{end:2,suffix:"×",label:"HACKATHON (SIH)",color:C.amber},{end:3,suffix:"+",label:"LEADERSHIP ROLES",color:C.green},{end:2,suffix:"×",label:"SSB SHORTLISTED",color:C.rose}].map((c,i)=>(
              <div key={i} style={{borderRight:i<5?"1px solid rgba(0,245,255,.07)":"none"}}><Counter {...c}/></div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{padding:"100px 48px",maxWidth:1260,margin:"0 auto"}}>
        <SH n="01" title="ABOUT THE ENGINEER" sub="Building real technology at the intersection of embedded systems, aerospace, and intelligent automation."/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:52,alignItems:"start"}}>
          <div>
            <p style={{fontSize:17,lineHeight:2,color:C.muted,marginBottom:20}}>Electronics Engineering undergraduate at <span style={{color:C.cyan,fontWeight:600}}>KNIT Sultanpur</span> (class of 2026), with hands-on engineering experience spanning firmware development, aerospace manufacturing at <span style={{color:C.blue}}>HAL Korwa</span>, and autonomous drone systems development.</p>
            <p style={{fontSize:15,lineHeight:1.9,color:C.dim,marginBottom:28}}>From writing embedded C for microcontrollers to assembling aircraft sub-components in a defense production facility — I operate where hardware precision meets software intelligence. Two Navy SSB shortlistings and Smart India Hackathon 2024 & 2025 appearances reflect a consistent drive to compete at the highest level.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {["Embedded Systems","FPV Drone Systems","Aerospace Manufacturing","IoT Development","Robotics Education","NPTEL Elite","STEM Teaching","Control Systems"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",border:"1px solid rgba(0,245,255,.08)",borderRadius:6,background:"rgba(0,245,255,.02)"}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:C.cyan,boxShadow:`0 0 6px ${C.cyan}`}}/><span className="mono" style={{fontSize:11,color:C.muted}}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div className="glass pcb-bg" style={{padding:28,position:"relative",overflow:"hidden"}}>
              <div style={{display:"flex",gap:18,alignItems:"center",marginBottom:22}}>
                <div style={{width:58,height:58,borderRadius:10,background:`linear-gradient(135deg,${C.blue},${C.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span className="neon" style={{fontSize:18,fontWeight:900,color:C.bg}}>AG</span>
                </div>
                <div><div className="neon" style={{fontSize:15,fontWeight:700,color:C.text}}>Ankit Gupta</div><div className="mono" style={{fontSize:11,color:C.dim,marginTop:3}}>Electronics Eng. · KNIT Sultanpur</div></div>
              </div>
              {[{k:"Email",v:"ankitgupta22410@gmail.com",c:C.cyan,h:"mailto:ankitgupta22410@gmail.com"},{k:"Phone",v:"+91-9580399278",c:C.blue,h:"tel:+919580399278"},{k:"GitHub",v:"github.com/Ankit22410",c:C.purple,h:"https://github.com/Ankit22410"},{k:"LinkedIn",v:"ankit-gupta-a43091272",c:C.amber,h:"https://linkedin.com/in/ankit-gupta-a43091272/"}].map(({k,v,c,h})=>(
                <a key={k} href={h} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid rgba(0,245,255,.05)"}}>
                  <span className="mono" style={{fontSize:10,color:C.dim,letterSpacing:1}}>{k}</span><span style={{fontSize:12,color:c}}>{v}</span>
                </a>
              ))}
            </div>
            <div className="glass" style={{padding:22}}>
              <div className="mono" style={{fontSize:10,letterSpacing:3,color:C.dim,marginBottom:16}}>EDUCATION RECORD</div>
              {[{d:"B.Tech — Electronics Eng.",i:"KNIT Sultanpur",y:"2022–2026",s:"CGPA: 7.80",c:C.cyan},{d:"12th — ISC Board",i:"St Peter's Inter College",y:"2020",s:"80.0%",c:C.blue}].map((e,i)=>(
                <div key={i} style={{padding:"12px 0",borderBottom:i===0?"1px solid rgba(0,245,255,.06)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:13,fontWeight:600,color:C.text}}>{e.d}</span>
                    <span className="mono" style={{fontSize:10,color:e.c,padding:"2px 10px",background:e.c+"14",border:`1px solid ${e.c}30`,borderRadius:4}}>{e.s}</span>
                  </div>
                  <div style={{fontSize:12,color:C.dim}}>{e.i} · {e.y}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" style={{padding:"100px 48px",background:"rgba(0,10,28,.5)"}}>
        <div style={{maxWidth:1260,margin:"0 auto"}}>
          <SH n="02" title="MISSION LOG" sub="Engineering experiences across aerospace, education, and energy sectors."/>
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            {EXPERIENCE.map((ex,i)=>(
              <div key={i} className="glass card-hover" style={{padding:0,overflow:"hidden",border:"1px solid rgba(0,245,255,.08)"}}>
                <div style={{height:2,background:`linear-gradient(90deg,transparent,${ex.color},transparent)`}}/>
                <div style={{padding:28,display:"grid",gridTemplateColumns:"70px 1fr auto",gap:24,alignItems:"start"}}>
                  <div style={{width:62,height:62,borderRadius:12,background:ex.color+"14",border:`1px solid ${ex.color}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{ex.icon}</div>
                  <div>
                    <div className="neon" style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>{ex.role}</div>
                    <div style={{fontSize:16,color:ex.color,marginBottom:10}}>{ex.org} · {ex.loc}</div>
                    <p style={{fontSize:14,color:C.dim,lineHeight:1.8,marginBottom:16}}>{ex.impact}</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                      {ex.tech.map(t=>(<span key={t} className="mono" style={{fontSize:10,padding:"3px 10px",borderRadius:4,background:ex.color+"10",border:`1px solid ${ex.color}25`,color:ex.color}}>{t}</span>))}
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div className="mono" style={{fontSize:11,color:C.dim,letterSpacing:1,marginBottom:6}}>{ex.period}</div>
                    <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:100,background:ex.color+"10",border:`1px solid ${ex.color}25`}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:ex.color}}/><span className="mono" style={{fontSize:9,color:ex.color,letterSpacing:1.5}}>COMPLETED</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" style={{padding:"100px 48px",maxWidth:1260,margin:"0 auto"}}>
        <SH n="03" title="ENGINEERING PROJECTS" sub="Real systems. Real hardware. Real results."/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:22}}>
          {PROJECTS.map((p,i)=>(
            <div key={i} className="glass card-hover" style={{padding:0,overflow:"hidden",border:"1px solid rgba(0,245,255,.08)",position:"relative"}}>
              <div style={{height:2,background:`linear-gradient(90deg,transparent,${p.color},transparent)`}}/>
              <div style={{padding:26}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
                  <div style={{fontSize:44,lineHeight:1}}>{p.emoji}</div>
                  <div className="mono" style={{fontSize:9,letterSpacing:1.5,padding:"3px 11px",borderRadius:100,background:p.status==="ACTIVE"?"rgba(0,245,255,.1)":"rgba(0,255,136,.08)",border:`1px solid ${p.status==="ACTIVE"?C.cyan:C.green}28`,color:p.status==="ACTIVE"?C.cyan:C.green}}>{p.status}</div>
                </div>
                <div className="mono" style={{fontSize:9,color:p.color,letterSpacing:2,marginBottom:8}}>{p.tag}</div>
                <div className="neon" style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14,lineHeight:1.5}}>{p.title}</div>
                <p style={{fontSize:13,color:C.dim,lineHeight:1.8,marginBottom:20}}>{p.desc}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {p.tech.map(t=>(<span key={t} className="mono" style={{fontSize:10,padding:"2px 9px",borderRadius:4,background:p.color+"0e",border:`1px solid ${p.color}20`,color:p.color}}>{t}</span>))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" style={{padding:"100px 48px",background:"rgba(0,10,28,.5)"}}>
        <div style={{maxWidth:1260,margin:"0 auto"}}>
          <SH n="04" title="SKILL CONSTELLATION" sub="Interactive orbital map of engineering competencies."/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:52,alignItems:"center"}}>
            <SkillOrbit/>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {Object.entries({"Embedded & Hardware":{items:["Arduino","ESP32","ESP8266","GPS Modules","GSM/SIM800","Biomedical Sensors"],color:C.cyan},"Communication":{items:["UART","I2C","SPI","WiFi","LoRa","GSM"],color:C.blue},"Programming":{items:["Embedded C","Python","Java"],color:C.purple},"Design Tools":{items:["MATLAB","Proteus","AutoCAD","TinkerCAD","3D Modelling"],color:C.amber}}).map(([cat,{items,color}])=>(
                <div key={cat} className="glass" style={{padding:18}}>
                  <div className="mono" style={{fontSize:9,letterSpacing:3,color,marginBottom:12}}>{cat.toUpperCase()}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {items.map(it=>(<span key={it} className="mono" style={{fontSize:10,padding:"3px 9px",borderRadius:4,background:color+"0e",border:`1px solid ${color}20`,color}}>{it}</span>))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CERTS + ACHIEVEMENTS */}
      <section style={{padding:"100px 48px",maxWidth:1260,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48}}>
          <div>
            <SH n="05" title="CERTIFICATIONS"/>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {[{t:"NPTEL Advanced Robotics",i:"IIT Kanpur",tag:"Elite",c:C.cyan},{t:"NPTEL Biomedical Signal Processing",i:"IIT Kharagpur",tag:"Certified",c:C.blue},{t:"NPTEL Digital Circuits",i:"IIT Kharagpur",tag:"Certified",c:C.purple}].map((cert,i)=>(
                <div key={i} className="glass card-hover" style={{padding:22,display:"flex",alignItems:"center",gap:18,border:"1px solid rgba(0,245,255,.08)"}}>
                  <div style={{width:46,height:46,borderRadius:8,background:cert.c+"14",border:`1px solid ${cert.c}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🎖️</div>
                  <div style={{flex:1}}>
                    <div className="neon" style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:3,lineHeight:1.4}}>{cert.t}</div>
                    <div style={{fontSize:12,color:C.dim}}>{cert.i}</div>
                  </div>
                  <span className="mono" style={{fontSize:9,padding:"3px 10px",borderRadius:100,background:cert.c+"14",border:`1px solid ${cert.c}30`,color:cert.c,flexShrink:0}}>{cert.tag}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SH n="06" title="ACHIEVEMENTS"/>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {ACHIEVEMENTS.map((a,i)=>(
                <div key={i} className="glass card-hover" style={{padding:"16px 22px",display:"flex",alignItems:"center",gap:16,borderLeft:`3px solid ${a.col}`,border:"1px solid rgba(0,245,255,.08)",borderRadius:"0 10px 10px 0"}}>
                  <span style={{fontSize:20,flexShrink:0}}>{a.icon}</span>
                  <span style={{fontSize:14,color:C.text,lineHeight:1.55}}>{a.text}</span>
                  <div style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:a.col,boxShadow:`0 0 8px ${a.col}`,flexShrink:0}}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section style={{padding:"100px 48px",background:"rgba(0,10,28,.5)"}}>
        <div style={{maxWidth:1260,margin:"0 auto"}}>
          <SH n="07" title="COMMAND POSITIONS"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20}}>
            {[{r:"Technical Head",o:"Electronics Engineering Forum (Foronix)",p:"KNIT Sultanpur",icon:"⚙️",c:C.cyan,per:"Aug 2025 – May 2026",desc:"Leading technical teams, organising workshops, and driving electronics & robotics projects across the department."},{r:"Media & Outreach Head",o:"Tech & Robotics Club",p:"KNIT Sultanpur",icon:"📡",c:C.blue,per:"Aug 2025 – May 2026",desc:"Led communication, promotion, and outreach campaigns increasing club participation and institutional visibility."},{r:"Volunteer Teacher",o:"Koshish Educational & Welfare Society",p:"Sultanpur (NGO)",icon:"🎓",c:C.purple,per:"Jan 2023 – May 2026",desc:"Teaching underprivileged children as part of a national NGO's education mission — 3+ years of dedicated service."}].map((l,i)=>(
              <div key={i} className="glass card-hover" style={{padding:26,border:"1px solid rgba(0,245,255,.08)",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:`linear-gradient(to bottom,${l.c},transparent)`}}/>
                <div style={{paddingLeft:14}}>
                  <div style={{fontSize:34,marginBottom:16}}>{l.icon}</div>
                  <div className="mono" style={{fontSize:9,letterSpacing:3,color:l.c,marginBottom:6}}>{l.per}</div>
                  <div className="neon" style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:4}}>{l.r}</div>
                  <div style={{fontSize:14,color:l.c,marginBottom:4}}>{l.o}</div>
                  <div style={{fontSize:12,color:C.dim,marginBottom:14}}>{l.p}</div>
                  <p style={{fontSize:13,color:C.dim,lineHeight:1.8}}>{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{padding:"100px 48px",maxWidth:1260,margin:"0 auto"}}>
        <SH n="08" title="ESTABLISH CONTACT" sub="Open to embedded engineering, avionics, drone systems, and IoT roles."/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:52}}>
          <div>
            <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:36}}>
              {[{icon:"📧",l:"Email",v:"ankitgupta22410@gmail.com",href:"mailto:ankitgupta22410@gmail.com",c:C.cyan},{icon:"📱",l:"Phone",v:"+91-9580399278",href:"tel:+919580399278",c:C.blue},{icon:"💼",l:"LinkedIn",v:"ankit-gupta-a43091272",href:"https://linkedin.com/in/ankit-gupta-a43091272/",c:C.purple},{icon:"👨‍💻",l:"GitHub",v:"github.com/Ankit22410",href:"https://github.com/Ankit22410",c:C.amber}].map(({icon,l,v,href,c})=>(
                <a key={l} href={href} className="glass card-hover" style={{padding:"16px 22px",display:"flex",alignItems:"center",gap:16,border:"1px solid rgba(0,245,255,.08)"}}>
                  <div style={{width:40,height:40,borderRadius:8,background:c+"12",border:`1px solid ${c}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>
                  <div><div className="mono" style={{fontSize:9,letterSpacing:2,color:C.dim}}>{l}</div><div style={{fontSize:14,color:C.text,marginTop:3}}>{v}</div></div>
                  <span style={{marginLeft:"auto",color:c,fontSize:16}}>→</span>
                </a>
              ))}
            </div>
            <div className="glass" style={{padding:22,display:"flex",alignItems:"center",gap:20}}>
              <div style={{position:"relative",width:60,height:60,flexShrink:0}}>
                {[0,1,2].map(i=>(<div key={i} style={{position:"absolute",inset:`${i*8}px`,borderRadius:"50%",border:`1px solid rgba(0,245,255,${.6-i*.2})`,animation:`radarPulse ${1.8+i*.5}s ease-out ${i*.4}s infinite`}}/>))}
                <div style={{position:"absolute",inset:"50%",transform:"translate(-50%,-50%)",width:12,height:12,borderRadius:"50%",background:C.cyan,boxShadow:`0 0 16px ${C.cyan}`}}/>
              </div>
              <div><div className="mono" style={{fontSize:10,letterSpacing:3,color:C.cyan,marginBottom:4}}>SIGNAL ACTIVE</div><div style={{fontSize:13,color:C.dim}}>Ready to connect. Response time: &lt;24h.</div></div>
            </div>
          </div>
          <div className="glass scan-active" style={{padding:32}}>
            <div className="mono" style={{fontSize:10,letterSpacing:4,color:C.cyan,marginBottom:28}}>// TRANSMIT MESSAGE</div>
            {["Name","Email","Subject"].map(f=>(
              <div key={f} style={{marginBottom:16}}>
                <label className="mono" style={{display:"block",fontSize:9,color:C.dim,letterSpacing:2.5,marginBottom:8}}>{f.toUpperCase()}</label>
                <input type="text" placeholder={`Enter ${f.toLowerCase()}`} style={{width:"100%",padding:"11px 16px",background:"rgba(0,245,255,.03)",border:"1px solid rgba(0,245,255,.1)",borderRadius:6,color:C.text,fontSize:14,fontFamily:"system-ui",outline:"none",transition:"border-color .2s"}}
                  onFocus={e=>e.target.style.borderColor="rgba(0,245,255,.4)"} onBlur={e=>e.target.style.borderColor="rgba(0,245,255,.1)"}/>
              </div>
            ))}
            <div style={{marginBottom:24}}>
              <label className="mono" style={{display:"block",fontSize:9,color:C.dim,letterSpacing:2.5,marginBottom:8}}>MESSAGE</label>
              <textarea rows={4} placeholder="Describe the opportunity or project..." style={{width:"100%",padding:"11px 16px",background:"rgba(0,245,255,.03)",border:"1px solid rgba(0,245,255,.1)",borderRadius:6,color:C.text,fontSize:14,fontFamily:"system-ui",outline:"none",resize:"vertical",transition:"border-color .2s"}}
                onFocus={e=>e.target.style.borderColor="rgba(0,245,255,.4)"} onBlur={e=>e.target.style.borderColor="rgba(0,245,255,.1)"}/>
            </div>
            <button className="neon" style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${C.blue},${C.cyan})`,border:"none",borderRadius:6,color:C.bg,fontSize:10,fontWeight:700,letterSpacing:3,cursor:"pointer",boxShadow:"0 0 28px rgba(0,245,255,.3)",transition:"all .25s"}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 0 50px rgba(0,245,255,.55)";e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 0 28px rgba(0,245,255,.3)";e.currentTarget.style.transform="none";}}>TRANSMIT MESSAGE ◈</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{padding:"32px 48px",borderTop:"1px solid rgba(0,245,255,.06)",textAlign:"center"}}>
        <Ticker/>
        <div style={{padding:"28px 0 0"}}>
          <div className="neon" style={{fontSize:18,fontWeight:900,letterSpacing:6,marginBottom:8,color:C.cyan,textShadow:"0 0 30px rgba(0,245,255,.44)"}}>ANKIT GUPTA</div>
          <div className="mono" style={{fontSize:9,letterSpacing:4,color:C.dim,marginBottom:4}}>ELECTRONICS · EMBEDDED SYSTEMS · AEROSPACE · ROBOTICS · IoT · DRONES</div>
          <div className="mono" style={{fontSize:9,color:"#1a2a3a",letterSpacing:2}}>© 2026 — ENGINEERED WITH PRECISION</div>
        </div>
      </footer>
    </div>
  );
}