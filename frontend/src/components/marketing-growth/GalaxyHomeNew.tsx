"use client"

import { useMemo, useRef, useEffect, useCallback, useState } from "react"; import Link from "next/link"; import { ArrowRight } from "lucide-react"; import { useLanguage } from "@/contexts/LanguageContext"

/* ── Shared constants ── */
const T=["乾","兑","离","震","巽","坎","艮","坤"]
function srng(s:number){let v=s;return()=>{v=(v*16807+0)%2147483647;return(v-1)/2147483646}}
function mkS(){
  const r1=srng(191),r2=srng(377),r3=srng(523);const stars:any[]=[]
  for(let i=0;i<250;i++){const x=r1()*100,y=r2()*100;stars.push({id:`f${i}`,x,y,sz:.3+r3()*.5,o:.1+r1()*.3,h:240+r2()*40,isGold:r3()>.92,tw:r1()>.55,sp:2.5+r2()*3,dl:r3()*4,tier:"far"})}
  for(let i=0;i<120;i++){const x=r1()*100,b=r2()<.7,y=b?25+r3()*45:5+r1()*90;stars.push({id:`m${i}`,x,y,sz:.6+r2()*1.3,o:.25+r1()*.5,h:210+r3()*50,isGold:r2()>.82,tw:r1()>.35,sp:2+r2()*2.5,dl:r3()*3,tier:"mid"})}
  for(let i=0;i<30;i++){const x=r1()*100,y=r2()<.8?25+r3()*45:10+r1()*80;stars.push({id:`n${i}`,x,y,sz:1+r2()*1.8,o:.4+r1()*.45,h:230+r3()*30,isGold:r2()>.7,tw:!0,sp:1.5+r3()*2,dl:r1()*2,tier:"near"})}
  return stars
}
function mkQ(){const r=srng(73);return Array.from({length:30},(_,i)=>{const a=(i/30)*360,d=16+(i%4)*6;return{id:i,ang:a,dist:d,sp:2+(i%4)*1.2,dl:i*.5,sz:1.2+(i%4)*.7}})}
const SYS=[{n:"八字",nE:"Bazi",q:"底层结构",qE:"Structure",a:"长期节奏与人生框架",aE:"Long-term rhythm",c:"#5A9E8E",f:!0},{n:"紫微",nE:"Ziwei",q:"能量周期",qE:"Cycles",a:"十二宫主星分布与大限流年",aE:"12-palace distribution",c:"#8B7EC7",f:!0},{n:"星盘",nE:"Astrology",q:"心理模式",qE:"Patterns",a:"七政四余恒星制·先天格局",aE:"Sidereal configuration",c:"#7B9EC7",f:!0},{n:"塔罗",nE:"Tarot",q:"当下选择",qE:"Choice",a:"聚焦此刻压力与决策",aE:"Current decisions",c:"#C77B8B",f:!1},{n:"面相",nE:"Face",q:"行为印象",qE:"Impression",a:"五官十二宫·禀赋气质",aE:"Five features, 12 palaces",c:"#C4BFB0",f:!1}]
const INP={zh:["生辰八字","出生地点","面相照片","手相照片","当前问题"],en:["Birth date & time","Birth location","Face photo","Palm photo","Your question"]}
const OUT={zh:["性格结构","事业方向","关系模式","财富窗口","今日行动"],en:["Personality","Career","Relationships","Wealth window","Daily action"]}
const DOS={zh:[{i:"01",t:"性格结构",d:"八字日主、紫微命宫主星、星盘上升星座——三系统交叉定位核心特质。",tag:"八字+紫微+星盘",c:"#5A9E8E"},{i:"02",t:"事业方向",d:"AI分析能量走向与发力时机。识别最佳工作节奏和阶段窗口。",tag:"八字+星盘",c:"#7B9EC7"},{i:"03",t:"关系模式",d:"亲密与合作关系中的底层驱动模式——两盘对照看吸引与契合。",tag:"紫微+面相",c:"#C77B8B"},{i:"04",t:"财富窗口",d:"识别能量流动、突破机会与防守时期——八字财星交叉验证。",tag:"八字+紫微",c:"#C9A84C"},{i:"05",t:"生活方式",d:"面相与星盘匹配的日常仪式感——睡眠、工作环境、香味偏好。",tag:"面相+星盘",c:"#8B7EC7"},{i:"06",t:"今日行动",d:"画像最终输出——今天能做的一件事。把分析变成执行。",tag:"全系统",c:"#E8CB7A"}],en:[{i:"01",t:"Personality",d:"Bazi Day Master + Ziwei Life Palace + Astrology Ascendant — three-system cross-positioning.",tag:"Bazi+Ziwei+Astro",c:"#5A9E8E"},{i:"02",t:"Career",d:"AI maps energy direction and timing. Optimal rhythm and phase windows.",tag:"Bazi+Astrology",c:"#7B9EC7"},{i:"03",t:"Relationships",d:"Core drive in intimacy and partnership — two charts compared for fit.",tag:"Ziwei+Face",c:"#C77B8B"},{i:"04",t:"Wealth Window",d:"Energy flow, breakthroughs, defense — validated with Bazi wealth stars.",tag:"Bazi+Ziwei",c:"#C9A84C"},{i:"05",t:"Lifestyle",d:"Daily rituals matched to profile — sleep, workspace, scent.",tag:"Face+Astro",c:"#8B7EC7"},{i:"06",t:"Daily Action",d:"The final output — one thing you can do today.",tag:"All Systems",c:"#E8CB7A"}]}
const ENT={zh:[{t:"完整画像",d:"五系统全开，AI深度交叉验证。完整命运画像+今日行动。",cta:"建立我的画像 →",to:"/reading/new",hl:!0,badge:"推荐入口",icon:"🔮"},{t:"单题快问",d:"聚焦一个方向，快速获取AI解读。适合有明确问题的用户。",cta:"快速提问 →",to:"/reading/new?intent=quick",hl:!1,badge:"",icon:"⚡"},{t:"关系合参",d:"两人命盘对照分析，AI交叉验证契合度与互补空间。",cta:"合参分析 →",to:"/bazi/compatibility",hl:!1,badge:"",icon:"💫"}],en:[{t:"Full Profile",d:"All five systems. Deep AI cross-validation. Full destiny profile + daily action.",cta:"Build My Profile →",to:"/reading/new",hl:!0,badge:"Recommended",icon:"🔮"},{t:"Quick Read",d:"Focus on one area. Fast AI insight for users with a clear question.",cta:"Quick Read →",to:"/reading/new?intent=quick",hl:!1,badge:"",icon:"⚡"},{t:"Synastry",d:"Two charts compared. AI cross-validates compatibility.",cta:"Synastry →",to:"/bazi/compatibility",hl:!1,badge:"",icon:"💫"}]}
const TRS={zh:[["💎","灵石晶品"],["🎐","香道雅韵"],["📿","护符配饰"],["📖","古籍典藏"],["🕯️","仪式定制"],["🌿","生活方式"]],en:[["💎","Crystals"],["🎐","Incense"],["📿","Talismans"],["📖","Scriptures"],["🕯️","Rituals"],["🌿","Lifestyle"]]}
const TD={zh:{u:"10,000+",r:"4.9",rp:"50,000+",ul:"用户",rl:"评分",rpl:"报告已生成",t1:"真正让我看清了自己的底层模式。",n1:"林小姐·96分",t2:"AI交叉验证比单一系统靠谱得多。",n2:"陈先生·98分"},en:{u:"10,000+",r:"4.9",rp:"50,000+",ul:"Users",rl:"Rating",rpl:"Reports",t1:"It showed me my underlying patterns.",n1:"Ms.Lin·96",t2:"Cross-validation is far more reliable.",n2:"Mr.Chen·98"}}
const PRC={zh:[{name:"免费版",price:"¥0",desc:"体验全部系统\n基础预览功能",cta:"免费注册",hl:!1},{name:"深度报告",price:"按次",desc:"完整五维画像\n单次解锁·永久可查",cta:"建立画像",hl:!0},{name:"星尘充值",price:"灵活",desc:"按需充值\n充越多赠越多",cta:"查看定价",hl:!1}],en:[{name:"Free",price:"Free",desc:"All systems\nBasic preview",cta:"Sign Up",hl:!1},{name:"Deep Report",price:"Per-use",desc:"Full 5D profile\nOne-time·Permanent",cta:"Build Profile",hl:!0},{name:"Top-up",price:"Flexible",desc:"Pay as you go\nMore=bonus",cta:"Pricing",hl:!1}]}

/* ═══════════════════════════════════════════════════════════════
   Flowing Galaxy Canvas — 5 soft nebula blobs + slow starlight points
   ═══════════════════════════════════════════════════════════════ */
function useFlowingGalaxy(canvasRef: React.RefObject<HTMLCanvasElement | null>, isMobile: boolean) {
  const rafRef = useRef<number>(0), dimsRef = useRef({ W: 0, H: 0 })
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const setDim = () => { const W = c.width = c.offsetWidth * (devicePixelRatio || 1); const H = c.height = c.offsetHeight * (devicePixelRatio || 1); dimsRef.current = { W, H } }
    setDim(); window.addEventListener('resize', setDim); return () => window.removeEventListener('resize', setDim)
  }, [canvasRef])
  useEffect(() => {
    const c = canvasRef.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return
    let animating = true
    type Light = { x: number; y: number; s: number; a: number; sp: number; ph: number }
    const lights = useRef<Light[]>([]).current!
    const initLights = () => { lights.length = 0; const { W, H } = dimsRef.current; const cx = W * .5, cy = H * .5
      for (let i = 0; i < (isMobile ? 8 : 22); i++) { const angle = -.6 + (Math.random() - .5) * .4
        lights.push({ x: cx + (Math.random() - .5) * W * 1.4, y: cy + (Math.random() - .5) * H * .8, s: .8 + Math.random() * 2.5, a: .04 + Math.random() * .18, sp: .003 + Math.random() * .015, ph: Math.random() * Math.PI * 2 }) } }
    initLights()
    const frame = (ts: number) => { if (!animating) return
      const { W, H } = dimsRef.current; if (!W) { rafRef.current = requestAnimationFrame(frame); return }
      ctx!.clearRect(0, 0, W, H); const t = ts * .00015, cx = W * .5, cy = H * .5
      // Soft diagonal wash
      const ang = -.6; const wash = ctx!.createLinearGradient(cx - W * .8, cy - Math.tan(ang) * W * .8, cx + W * .8, cy + Math.tan(ang) * W * .8)
      wash.addColorStop(0, 'rgba(12,4,35,0)'); wash.addColorStop(.3, 'rgba(35,12,85,.035)'); wash.addColorStop(.5, 'rgba(55,22,105,.065)'); wash.addColorStop(.7, 'rgba(30,10,70,.025)'); wash.addColorStop(1, 'rgba(8,2,20,0)')
      ctx!.fillStyle = wash; ctx!.fillRect(0, 0, W, H)
      // Nebula blobs
      const blobs = [ { bx: cx - W * .15 + Math.sin(t * .7) * W * .06, by: cy - H * .12 + Math.cos(t * .5) * H * .04, rx: W * .50, ry: H * .16, h: 268, a: .08 }, { bx: cx + W * .10 + Math.cos(t * .6) * W * .07, by: cy + H * .05 + Math.sin(t * .8) * H * .04, rx: W * .38, ry: H * .13, h: 280, a: .06 }, { bx: cx - W * .05 + Math.sin(t * .4) * W * .05, by: cy + H * .18 + Math.cos(t * .55) * H * .03, rx: W * .32, ry: H * .11, h: 255, a: .07 } ]
      if (!isMobile) blobs.push( { bx: cx + W * .20 + Math.cos(t * .45) * W * .08, by: cy - H * .08 + Math.sin(t * .65) * H * .05, rx: W * .28, ry: H * .10, h: 272, a: .05 }, { bx: cx - W * .25 + Math.sin(t * .55) * W * .05, by: cy + H * .22 + Math.cos(t * .7) * H * .03, rx: W * .30, ry: H * .09, h: 260, a: .055 } )
      for (const b of blobs) { const g = ctx!.createRadialGradient(b.bx, b.by, 0, b.bx, b.by, Math.max(b.rx, b.ry)); g.addColorStop(0, `hsla(${b.h},50%,35%,${b.a*1.5})`); g.addColorStop(.4, `hsla(${b.h},40%,25%,${b.a})`); g.addColorStop(.7, `hsla(${b.h+10},35%,18%,${b.a*.4})`); g.addColorStop(1, 'transparent'); ctx!.fillStyle = g; ctx!.fillRect(b.bx - b.rx, b.by - b.ry, b.rx * 2, b.ry * 2) }
      // Slow star points
      for (const l of lights) { l.ph += l.sp; const lx = l.x + Math.sin(l.ph) * 30, ly = l.y + Math.cos(l.ph * 1.3) * 20
        if (lx < -50) l.x += W + 100; if (lx > W + 50) l.x -= W + 100; if (ly < -50) l.y += H + 100; if (ly > H + 50) l.y -= H + 100
        l.x += l.sp * 20; l.y += l.sp * 3
        const pulse = .5 + .5 * Math.sin(t * 30 + l.ph); const alpha = l.a * pulse
        if (alpha < .01) continue; ctx!.beginPath(); ctx!.arc(lx, ly, l.s, 0, Math.PI * 2); ctx!.fillStyle = `rgba(180,160,240,${alpha})`; ctx!.fill()
        if (l.s > 1.5) { ctx!.beginPath(); ctx!.arc(lx, ly, l.s * 3, 0, Math.PI * 2); ctx!.fillStyle = `rgba(160,140,220,${alpha*.15})`; ctx!.fill() } }
      rafRef.current = requestAnimationFrame(frame) }
    rafRef.current = requestAnimationFrame(frame)
    return () => { animating = false; cancelAnimationFrame(rafRef.current) }
  }, [canvasRef, isMobile])
}

export default function GalaxyHomeNew() { const { locale, localeHref } = useLanguage(); const isZh = locale === "zh"
  const stars = useMemo(() => mkS(), []), qi = useMemo(() => mkQ(), [])
  const [mouse, setMouse] = useState({ x: .5, y: .5 }), [scrollY, setScrollY] = useState(0), [heroVisible, setHeroVisible] = useState(!1)
  const [sectionsVisible, setSectionsVisible] = useState<Record<string,boolean>>({})
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const flowGalaxyRef = useRef<HTMLCanvasElement>(null); useFlowingGalaxy(flowGalaxyRef, isMobile)

  /* ── Mouse tracking for star parallax ── */
  useEffect(() => { const h = (e: MouseEvent) => setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }); window.addEventListener('mousemove', h, { passive: !0 }); return () => window.removeEventListener('mousemove', h) }, [])
  /* ── Scroll tracking ── */
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: !0 }); return () => window.removeEventListener('scroll', h) }, [])
  /* ── Hero entrance on mount ── */
  useEffect(() => { const t = setTimeout(() => setHeroVisible(!0), 200); return () => clearTimeout(t) }, [])
  /* ── IntersectionObserver for section reveals ── */
  useEffect(() => { const obs = new IntersectionObserver((entries) => { for (const e of entries) { if (e.isIntersecting) { const id = (e.target as HTMLElement).dataset.sectionId; if (id) setSectionsVisible(prev => ({ ...prev, [id]: !0 })) } } }, { threshold: .15, rootMargin: "0px 0px -40px 0px" })
    document.querySelectorAll('[data-section-id]').forEach(el => obs.observe(el)); return () => obs.disconnect() }, [])

  /* ── Derived values ── */
  const baguaTop = 50 - Math.min(scrollY * .04, 35) + "%"
  const baguaScale = 1 - Math.min(scrollY * .00035, .4)
  const baguaOpacity = .25 - Math.min(scrollY * .00035, .18)
  const mx = (mouse.x - .5) * (isMobile ? 0 : 1), my = (mouse.y - .5) * (isMobile ? 0 : 1)
  const parallax = (tier: string) => tier === "near" ? 12 : tier === "mid" ? 7 : 3

  const cb = { background: "linear-gradient(135deg, #060E24, #030918)" }, cd = "rounded-2xl border border-white/[0.05]"
  const sectionClass = (id: string) => `section-reveal ${sectionsVisible[id] ? 'revealed' : ''}`

  return (<div className="w-full text-white" style={{ background: "#000" }}>
    {/* ═══ L0: Deep space ═══ */}
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(10,18,35,0.48), rgba(2,5,12,1) 55%, #000 100%)" }} />

    {/* ═══ L1: Star field with mouse parallax ═══ */}
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ zIndex: 2 }}>
      {stars.map(s => <span key={s.id} style={{ position: "absolute", left: (s.x + mx * parallax(s.tier)) + "%", top: (s.y + my * parallax(s.tier)) + "%", width: s.sz, height: s.sz, borderRadius: "50%", background: s.isGold ? "rgba(255,215,120,0.8)" : `hsla(${s.h},60%,75%,0.65)`, boxShadow: s.isGold ? `0 0 ${s.sz * 2}px rgba(255,200,100,0.4)` : `0 0 ${s.sz}px hsla(${s.h},50%,70%,0.15)`, opacity: s.o, transform: "translate(-50%,-50%)", animation: s.tw ? `twinkle ${s.sp}s ease-in-out ${s.dl}s infinite` : "none", transition: "left 0.6s ease-out, top 0.6s ease-out" }} />)}
    </div>

    {/* ═══ L2: Galaxy band ═══ */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true" style={{ zIndex: 1 }}>
      <div style={{ position: "absolute", left: "-25%", top: "15%", width: "150%", height: "70%", transform: "rotate(-14deg)", background: "linear-gradient(90deg, rgba(218,180,74,0.04) 0%, rgba(218,180,74,0.08) 25%, rgba(255,245,210,0.10) 48%, rgba(80,180,195,0.05) 70%, rgba(20,60,95,0.02) 100%)", filter: "blur(14px)", opacity: .5, animation: "galaxyDrift 30s ease-in-out infinite", maskImage: "radial-gradient(ellipse at center, black 0%, black 25%, rgba(0,0,0,0.5) 50%, transparent 85%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, black 25%, rgba(0,0,0,0.5) 50%, transparent 85%)" }} />
      <div style={{ position: "absolute", left: "5%", top: "55%", width: "120%", height: "50%", transform: "rotate(10deg)", background: "linear-gradient(90deg, rgba(100,140,210,0.02) 0%, rgba(120,160,230,0.05) 35%, rgba(180,200,240,0.07) 55%, rgba(80,120,180,0.03) 80%, transparent 100%)", filter: "blur(18px)", opacity: .35, animation: "galaxyDrift2 40s ease-in-out infinite", maskImage: "radial-gradient(ellipse at center, black 0%, black 20%, rgba(0,0,0,0.4) 45%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, black 20%, rgba(0,0,0,0.4) 45%, transparent 80%)" }} />
    </div>

    {/* ═══ Flowing Galaxy Canvas ═══ */}
    <canvas ref={flowGalaxyRef} aria-hidden="true" className="fixed inset-0 pointer-events-none" style={{ zIndex: 3, width: "100%", height: "100%" }} />

    {/* ═══ L3: Tai Chi — scroll-driven scale + mouse proximity ═══ */}
    <div className="fixed left-1/2 pointer-events-none" aria-hidden="true" style={{ width: "min(540px,92vw)", height: "min(540px,92vw)", top: baguaTop, transform: `translate(-50%,-50%) scale(${baguaScale})`, opacity: baguaOpacity, zIndex: 4, animation: `tSpin ${100 + (1 - baguaScale) * 80}s linear infinite`, filter: "drop-shadow(0 0 60px rgba(218,180,74,0.12))" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(218,180,74,0.26)", boxShadow: "0 0 50px rgba(218,180,74,0.06), inset 0 0 40px rgba(80,180,190,0.03)" }} />
      {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * 360 - 90; return <span key={"t" + i} style={{ position: "absolute", left: "50%", top: "50%", width: 1, height: 3, background: "rgba(218,180,74,0.28)", transform: `translate(-50%,-50%) rotate(${a}deg) translateY(-49%)` }} /> })}
      <div style={{ position: "absolute", inset: "12%", borderRadius: "50%", border: "1px dashed rgba(218,180,74,0.12)" }} />
      {qi.map(p => { const rad = (p.ang * Math.PI) / 180; return <span key={"q" + p.id} style={{ position: "absolute", left: (50 + p.dist * Math.cos(rad)) + "%", top: (50 + p.dist * Math.sin(rad)) + "%", width: p.sz, height: p.sz, borderRadius: "50%", background: "radial-gradient(circle, rgba(218,180,74,0.45), transparent 70%)", boxShadow: "0 0 2px rgba(218,180,74,0.15)", animation: `twinkle ${p.sp}s ease-in-out ${p.dl}s infinite` }} /> })}
      {T.map((t, i) => { const a = (i / 8) * 360 - 90, rad = (a * Math.PI) / 180, d = 43; return <span key={i} className="absolute font-serif" style={{ left: (50 + d * Math.cos(rad)) + "%", top: (50 + d * Math.sin(rad)) + "%", transform: "translate(-50%,-50%)", color: "rgba(218,180,74,0.28)", textShadow: "0 0 4px rgba(218,180,74,0.06)", fontSize: "clamp(10px,1.2vw,13px)" }}>{t}</span> })}
      <div style={{ position: "absolute", inset: "22%", borderRadius: "50%", border: "0.5px solid rgba(218,180,74,0.08)" }} />
      <div style={{ position: "absolute", inset: "10%", display: "grid", placeItems: "center", fontSize: "clamp(68px,9vw,108px)", color: "rgba(218,180,74,0.32)", textShadow: "0 0 18px rgba(218,180,74,0.12)" }}>☯</div>
      {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * 360, rad = (a * Math.PI) / 180, d = 46; return <span key={"du" + i} style={{ position: "absolute", left: (50 + d * Math.cos(rad)) + "%", top: (50 + d * Math.sin(rad)) + "%", width: 2, height: 2, borderRadius: "50%", background: "rgba(218,180,74,0.4)", boxShadow: "0 0 3px rgba(218,180,74,0.3)", animation: `dustFloat ${3 + i % 3}s ease-in-out ${i * .5}s infinite` }} /> })}
    </div>

    {/* ═══ L4: Vignette ═══ */}
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ background: "radial-gradient(circle at 50% 45%, rgba(0,0,0,0.10), transparent 50%), linear-gradient(180deg, rgba(0,0,0,0.06) 0%, transparent 18%, transparent 52%, rgba(0,0,0,0.55) 100%)", zIndex: 8 }} />

    <style>{`
@keyframes tSpin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
@keyframes rSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes twinkle{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:.85;transform:scale(1.2)}}
@keyframes galaxyDrift{0%{transform:rotate(-14deg) translateX(-2%)}50%{transform:rotate(-14deg) translateX(2%)}100%{transform:rotate(-14deg) translateX(-2%)}}
@keyframes galaxyDrift2{0%{transform:rotate(10deg) translateX(2%)}50%{transform:rotate(10deg) translateX(-3%)}100%{transform:rotate(10deg) translateX(2%)}}
@keyframes heroTextReveal{0%{opacity:0;filter:blur(8px);transform:translateY(24px)}100%{opacity:1;filter:blur(0);transform:translateY(0)}}
@keyframes heroFadeUp{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}
@keyframes heroBtnIn{0%{opacity:0;transform:scale(.85)}60%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
@keyframes glowPulse{0%,100%{textShadow:0 0 32px rgba(218,180,74,0.18)}50%{textShadow:0 0 48px rgba(218,180,74,0.32),0 0 80px rgba(218,180,74,0.08)}}
@keyframes sectionReveal{0%{opacity:0;transform:translateY(30px)}100%{opacity:1;transform:translateY(0)}}
@keyframes dustFloat{0%{transform:translate(0,0)}50%{transform:translate(6px,-4px)}100%{transform:translate(0,0)}}
.section-reveal{opacity:0;transform:translateY(30px);transition:opacity 0.7s ease-out,transform 0.7s ease-out}
.section-reveal.revealed{opacity:1;transform:translateY(0)}
.hero-title{opacity:0;animation:heroTextReveal 0.8s ease-out 0.3s forwards,glowPulse 3s ease-in-out 1.2s infinite}
.hero-sub{opacity:0;animation:heroFadeUp 0.6s ease-out 0.7s forwards}
.hero-sub2{opacity:0;animation:heroFadeUp 0.6s ease-out 0.9s forwards}
.hero-btns{opacity:0;animation:heroBtnIn 0.7s ease-out 1.2s forwards}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
    `}</style>

    {/* ═══ HERO ═══ */}
    <section className="relative flex min-h-[88vh] w-full flex-col items-center justify-center px-6 text-center" style={{ zIndex: 10 }}>
      <div>
        <h1 className="font-serif text-8xl md:text-9xl font-bold hero-title" style={{ background: "linear-gradient(180deg, #f1d36f 0%, #c49a35 58%, #8d6a1f 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{isZh ? "观我" : "Guanwo"}</h1>
        <p className="mt-4 text-[11px] tracking-[0.15em] text-white/30 hero-sub">{isZh ? "AI 命运行动系统" : "AI Destiny Action System"}</p>
      </div>
      <div className="mt-10 hero-sub2">
        <p className="font-serif text-xl" style={{ color: "rgba(238,241,232,0.82)" }}>{isZh ? "看见内在结构 · 找到下一步" : "See your structure · Find the next step"}</p>
        <div className="mx-auto mt-4 h-px w-48" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} />
        <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed" style={{ color: "rgba(220,224,215,0.58)" }}>{isZh ? "融合八字、紫微、星盘、塔罗、面相手相" : "Integrating Bazi, Ziwei, Astrology, Tarot, Face & Palm"}<br />{isZh ? "AI 五维交叉验证，生成你的完整命运画像" : "AI five-source cross-validation — your complete destiny profile"}</p>
      </div>
      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row hero-btns">
        <Link href={localeHref("/reading/new")} className="rounded-xl px-10 py-4 font-medium transition-all hover:scale-[1.03]" style={{ background: "#C9A84C", color: "#020617" }}><span className="flex items-center gap-2">{isZh ? "建立我的画像" : "Build My Profile"} <ArrowRight size={16} /></span></Link>
        <Link href={localeHref("/almanac")} className="rounded-xl border px-10 py-4 text-white/75 transition-all hover:border-white/35" style={{ borderColor: "rgba(255,255,255,0.18)", background: "rgba(5,10,18,0.32)", backdropFilter: "blur(12px)" }}><span className="flex items-center gap-2">{isZh ? "查看今日趋势" : "View Today's Trend"} <ArrowRight size={15} /></span></Link>
      </div>
      <div className="absolute bottom-8 opacity-40"><div className="mx-auto h-8 w-5 rounded-full border border-white/20"><div className="mx-auto mt-1.5 h-2 w-1 rounded-full bg-white/30 animate-bounce" /></div></div>
    </section>

    {/* ═══ CONTENT SECTIONS with scroll reveal ═══ */}
    <section className={`relative mx-auto max-w-6xl px-6 pt-24 pb-12 ${sectionClass("systems")}`} data-section-id="systems" style={{ zIndex: 10, transitionDelay: "0s" }}>
      <div className="mb-12"><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase">DESTINY SYSTEMS</p><h2 className="mt-3 font-serif text-3xl md:text-4xl">{isZh ? "五大分析系统" : "Five Analysis Systems"}</h2><p className="mt-3 text-[14px] text-white/35 max-w-xl">{isZh ? "不是单一命理工具——八字、紫微、星盘、塔罗、面相同步运行，AI交叉验证" : "Bazi, Ziwei, Astrology, Tarot, and Face reading run together, cross-validated by AI"}</p></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{SYS.map((s, i) => <Link key={i} href={localeHref(s.n === "八字" ? "/bazi" : s.n === "紫微" ? "/ziwei" : s.n === "星盘" ? "/astrology" : s.n === "塔罗" ? "/tarot" : "/face-reading")} className="group flex flex-col rounded-xl border border-white/[0.04] overflow-hidden transition-all hover:-translate-y-1" style={{ background: "linear-gradient(180deg, #060E24 0%, #030918 100%)" }}><div className="h-1 w-full transition-all group-hover:h-1.5" style={{ background: s.c }} /><div className="p-5 flex flex-col flex-1"><div className="flex items-center justify-between mb-3"><span className="font-serif text-xl text-white/75">{isZh ? s.n : s.nE}</span>{s.f && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>{isZh ? "免费" : "Free"}</span>}</div><p className="text-[10px] tracking-[0.12em] text-white/25 mb-1.5">{isZh ? s.q : s.qE}</p><p className="text-[12px] leading-relaxed text-white/35 flex-1">{isZh ? s.a : s.aE}</p></div></Link>)}</div>
    </section>

    <section className={`relative mx-auto max-w-6xl px-6 pt-12 pb-12 ${sectionClass("workflow")}`} data-section-id="workflow" style={{ zIndex: 10, transitionDelay: "0.1s" }}>
      <div className={cd + " p-8 md:p-14"} style={cb}><div className="grid gap-10 lg:grid-cols-[1fr_auto_1fr] lg:items-center"><div className="space-y-3"><p className="text-[10px] tracking-[0.15em] text-white/20 mb-4">{isZh ? "INPUT · 同步采集" : "INPUT · Collection"}</p>{(isZh ? INP.zh : INP.en).map((inp: string, i: number) => <div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-2.5" style={{ background: "rgba(255,255,255,0.02)" }}><span className="text-[10px] text-white/20 w-5">0{i + 1}</span><span className="text-[13px] text-white/50">{inp}</span></div>)}</div><div className="flex flex-col items-center gap-4"><div className="relative"><div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, rgba(201,168,76,0.25) 0%, rgba(201,168,76,0.06) 50%, transparent 70%)", boxShadow: "0 0 50px rgba(201,168,76,0.15)" }}><span className="font-serif text-2xl text-white/80">{isZh ? "合" : "AI"}</span></div><div className="absolute -inset-3 rounded-full border border-gold/15" style={{ animation: "rSpin 8s linear infinite" }} /><div className="absolute -inset-6 rounded-full border border-gold/[0.06]" style={{ animation: "rSpin 12s linear infinite reverse" }} /></div><p className="font-serif text-lg text-white/70">{isZh ? "AI 合参引擎" : "AI Synthesis Engine"}</p><p className="text-[12px] text-white/30 text-center max-w-[180px]">{isZh ? "五系统交叉验证" : "Five-source cross-validation"}<br />{isZh ? "逐项比对冲突与一致" : "Comparing conflicts and consensus"}</p></div><div className="space-y-3"><p className="text-[10px] tracking-[0.15em] text-white/20 mb-4">{isZh ? "OUTPUT · 画像输出" : "OUTPUT · Profile"}</p>{(isZh ? OUT.zh : OUT.en).map((out: string, i: number) => <div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-3" style={{ background: "rgba(255,255,255,0.02)" }}><span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i === 0 ? "#5A9E8E" : i === 1 ? "#7B9EC7" : i === 2 ? "#C77B8B" : i === 3 ? "#C9A84C" : "#8B7EC7" }} /><span className="text-[13px] text-white/50">{out}</span><span className="ml-auto text-[10px] text-white/15">{95 - i * 3}%</span></div>)}</div></div></div>
    </section>

    <section className={`relative mx-auto max-w-6xl px-6 pt-12 pb-12 ${sectionClass("dossier")}`} data-section-id="dossier" style={{ zIndex: 10, transitionDelay: "0.15s" }}>
      <div className="mb-12"><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase">YOUR DOSSIER</p><h2 className="mt-3 font-serif text-3xl md:text-4xl">{isZh ? "你的命运画像" : "Your Destiny Profile"}</h2><p className="mt-3 text-[14px] text-white/35 max-w-xl">{isZh ? "AI生成结构化画像，从内在结构到今日行动" : "AI generates a structured profile — from inner structure to daily action"}</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(isZh ? DOS.zh : DOS.en).map((m, i) => <div key={i} className="group rounded-xl border border-white/[0.04] p-6 transition-all hover:border-white/[0.1]" style={cb}><div className="flex items-center gap-3 mb-4"><span className="text-2xl font-serif text-white/15">{m.i}</span><span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: m.c, color: m.c, opacity: .7 }}>{m.tag}</span></div><h3 className="font-serif text-lg text-white/75 mb-2">{m.t}</h3><p className="text-[12px] leading-relaxed text-white/35">{m.d}</p></div>)}</div>
    </section>

    <section className={`relative mx-auto max-w-6xl px-6 pt-12 pb-12 ${sectionClass("entry")}`} data-section-id="entry" style={{ zIndex: 10, transitionDelay: "0.2s" }}>
      <p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-3">GET STARTED</p><h2 className="font-serif text-3xl md:text-4xl">{isZh ? "选择你的入口" : "Choose Your Entry"}</h2>
      <div className="mt-10 grid gap-4 lg:grid-cols-3">{(isZh ? ENT.zh : ENT.en).map((e, i) => <Link key={i} href={localeHref(e.to)} className={`group flex flex-col rounded-2xl p-7 transition-all hover:-translate-y-1 ${e.hl ? "border-2" : "border"}`} style={{ borderColor: e.hl ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.05)", background: e.hl ? "linear-gradient(135deg, #0A1228, #030918)" : cb.background }}>{e.badge && <span className="text-[10px] tracking-[0.15em] text-white/20 mb-3">{e.badge}</span>}<span className="text-4xl mb-4">{e.icon}</span><h3 className="font-serif text-2xl text-white/80 mb-2">{e.t}</h3><p className="text-[13px] leading-relaxed text-white/35 flex-1">{e.d}</p><span className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium" style={{ color: e.hl ? "#C9A84C" : "rgba(255,255,255,0.5)" }}>{e.cta}</span></Link>)}</div>
    </section>

    <section className={`relative mx-auto max-w-6xl px-6 pt-12 pb-12 ${sectionClass("shop")}`} data-section-id="shop" style={{ zIndex: 10, transitionDelay: "0.25s" }}>
      <div className="grid gap-10 lg:grid-cols-2"><div className={cd + " p-8"} style={cb}><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-3">TREASURE HALL</p><h3 className="font-serif text-2xl text-white/75 mb-2">{isZh ? "命运藏宝阁" : "Destiny Treasure Hall"}</h3><p className="text-[13px] text-white/35 mb-6">{isZh ? "AI根据画像匹配生活好物" : "AI matches lifestyle items to your profile"}</p><div className="grid grid-cols-3 gap-3">{(isZh ? TRS.zh : TRS.en).map(([icon, name]: string[], i: number) => <Link key={i} href={localeHref("/shop")} className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.04] p-4 text-center transition-all hover:border-white/[0.1]" style={{ background: "rgba(255,255,255,0.015)" }}><span className="text-xl">{icon}</span><span className="text-[11px] text-white/55">{name}</span></Link>)}</div></div><div className={cd + " p-8"} style={cb}><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-6">TRUST</p><div className="grid grid-cols-3 gap-4 mb-8">{[["10,000+", (isZh ? TD.zh : TD.en).ul], ["4.9", (isZh ? TD.zh : TD.en).rl], ["50,000+", (isZh ? TD.zh : TD.en).rpl]].map(([n, l]) => <div key={l} className="text-center"><div className="font-serif text-3xl" style={{ color: "#C9A84C" }}>{n}</div><div className="text-[11px] text-white/25 mt-1">{l}</div></div>)}</div><div className="space-y-4">{[(isZh ? TD.zh : TD.en).t1, (isZh ? TD.zh : TD.en).t2].map((text, i) => <div key={i} className="border-l-2 border-white/[0.06] pl-4"><p className="text-[13px] leading-relaxed text-white/45">{text}</p><p className="text-[11px] text-white/20 mt-2">{i === 0 ? (isZh ? TD.zh : TD.en).n1 : (isZh ? TD.zh : TD.en).n2}</p></div>)}</div></div></div>
    </section>

    <section className={`relative mx-auto max-w-4xl px-6 pt-12 pb-24 ${sectionClass("pricing")}`} data-section-id="pricing" style={{ zIndex: 10, transitionDelay: "0.3s" }}>
      <div className="text-center mb-10"><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-3">PRICING</p><h2 className="font-serif text-3xl md:text-4xl">{isZh ? "清晰的定价，没有隐藏费用" : "Clear pricing, no hidden fees"}</h2><p className="mt-3 text-[14px] text-white/35">{isZh ? "免费开始，按需付费。注册即赠50星尘。" : "Start free, pay per use. 50 Stardust on sign-up."}</p></div>
      <div className="grid gap-4 md:grid-cols-3">{(isZh ? PRC.zh : PRC.en).map((p, i) => <Link key={i} href={localeHref(p.cta === "免费注册" || p.cta === "Sign Up" ? "/register" : p.cta === "查看定价" || p.cta === "Pricing" ? "/pricing" : "/reading/new")} className={`group flex flex-col items-center text-center rounded-2xl p-7 transition-all hover:-translate-y-1 ${p.hl ? "border-2" : "border"}`} style={{ borderColor: p.hl ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.05)", background: p.hl ? "linear-gradient(135deg, #0A1228, #030918)" : cb.background }}><span className="text-[11px] tracking-[0.15em] text-white/25 mb-3">{p.name}</span><span className="font-serif text-4xl mb-3" style={{ color: p.hl ? "#C9A84C" : "rgba(255,255,255,0.6)" }}>{p.price}</span><p className="text-[12px] leading-relaxed text-white/30 flex-1 mb-5 whitespace-pre-line">{p.desc}</p><span className={`rounded-xl px-8 py-3 text-[14px] font-medium transition-all ${p.hl ? "" : "border"}`} style={p.hl ? { background: "#C9A84C", color: "#020617" } : { borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}>{p.cta}</span></Link>)}</div>
      <p className="text-center text-[11px] text-white/15 mt-6">{isZh ? "添加到手机桌面感受原生体验" : "Add to home screen for native experience"}</p>
    </section>
  </div>)}
