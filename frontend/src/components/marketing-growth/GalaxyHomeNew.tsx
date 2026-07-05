"use client"

import { useMemo } from "react"; import Link from "next/link"; import { ArrowRight } from "lucide-react"; import { useLanguage } from "@/contexts/LanguageContext"

const T = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"]
function srng(s: number) { let v = s; return () => { v = (v * 16807 + 0) % 2147483647; return (v - 1) / 2147483646 } }
function mkS() {
  const r1 = srng(191), r2 = srng(377), r3 = srng(523); const s: any[] = []
  /* Far: tiny dim stars, even scatter — 500 stars */
  for (let i = 0; i < 500; i++) { s.push({ id: `f${i}`, x: r1() * 100, y: r2() * 100, sz: .15 + r3() * .45, o: .04 + r1() * .25, tw: r1() > .45, sp: 2 + r2() * 5, dl: r3() * 6, clr: r3() > .95 ? "warm" : "cool" }) }
  /* Mid: medium stars, concentrated in diagonal band — 200 stars */
  for (let i = 0; i < 200; i++) { s.push({ id: `m${i}`, x: r1() * 100, y: r2() < .6 ? 22 + r3() * 56 : 5 + r1() * 90, sz: .35 + r2() * 1.2, o: .12 + r1() * .42, tw: r1() > .25, sp: 1.5 + r2() * 3.5, dl: r3() * 5, clr: r2() > .88 ? "warm" : r2() > .75 ? "blue" : "cool" }) }
  /* Near: bright accent stars, mostly in band — 50 stars */
  for (let i = 0; i < 50; i++) { s.push({ id: `n${i}`, x: r1() * 100, y: r2() < .65 ? 22 + r3() * 52 : 8 + r1() * 88, sz: .55 + r2() * 1.8, o: .25 + r1() * .55, tw: !0, sp: 1.2 + r3() * 2.5, dl: r1() * 3, clr: r2() > .65 ? "warm" : "blue" }) }
  return s
}
function mkQ() { const r = srng(73); return Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * 360, d = 15 + (i % 6) * 6; return { id: i, ang: a, dist: d, sp: 2 + (i % 6) * 1.2, dl: i * .5, sz: 1.2 + (i % 6) * .6 } }) }
const SYS = [{ n: "八字", nE: "Bazi", c: "#5A9E8E", f: !0 }, { n: "紫微", nE: "Ziwei", c: "#8B7EC7", f: !0 }, { n: "星盘", nE: "Astrology", c: "#7B9EC7", f: !0 }, { n: "塔罗", nE: "Tarot", c: "#C77B8B", f: !1 }, { n: "面相", nE: "Face", c: "#C4BFB0", f: !1 }]
const INP = { zh: ["生辰八字", "出生地点", "面相照片", "手相照片", "当前问题"], en: ["Birth date & time", "Birth location", "Face photo", "Palm photo", "Your question"] }
const OUT = { zh: ["性格结构", "事业方向", "关系模式", "财富窗口", "今日行动"], en: ["Personality", "Career", "Relationships", "Wealth window", "Daily action"] }
const DOS = { zh: [{ i: "01", t: "性格结构", d: "八字日主、紫微命宫主星、星盘上升星座——三系统交叉定位核心特质。", tag: "八字+紫微+星盘", c: "#5A9E8E" }, { i: "02", t: "事业方向", d: "AI分析能量走向与发力时机。", tag: "八字+星盘", c: "#7B9EC7" }, { i: "03", t: "关系模式", d: "亲密与合作关系中的底层驱动模式。", tag: "紫微+面相", c: "#C77B8B" }, { i: "04", t: "财富窗口", d: "识别能量流动、突破机会与防守时期。", tag: "八字+紫微", c: "#C9A84C" }, { i: "05", t: "生活方式", d: "面相与星盘匹配的日常仪式感。", tag: "面相+星盘", c: "#8B7EC7" }, { i: "06", t: "今日行动", d: "今天能做的一件事。", tag: "全系统", c: "#E8CB7A" }], en: [{ i: "01", t: "Personality", d: "Bazi Day Master + Ziwei Life Palace + Astrology Ascendant.", tag: "Bazi+Ziwei+Astro", c: "#5A9E8E" }, { i: "02", t: "Career", d: "AI maps energy direction and timing.", tag: "Bazi+Astrology", c: "#7B9EC7" }, { i: "03", t: "Relationships", d: "Core drive in intimacy and partnership.", tag: "Ziwei+Face", c: "#C77B8B" }, { i: "04", t: "Wealth Window", d: "Energy flow, breakthroughs, defense.", tag: "Bazi+Ziwei", c: "#C9A84C" }, { i: "05", t: "Lifestyle", d: "Daily rituals matched to profile.", tag: "Face+Astro", c: "#8B7EC7" }, { i: "06", t: "Daily Action", d: "One thing you can do today.", tag: "All Systems", c: "#E8CB7A" }] }
const ENT = { zh: [{ t: "完整画像", d: "五系统全开，AI深度交叉验证。", cta: "建立我的画像", to: "/reading/new", hl: !0, icon: "🔮" }, { t: "单题快问", d: "聚焦一个方向，快速获取AI解读。", cta: "快速提问", to: "/reading/new?intent=quick", hl: !1, icon: "⚡" }, { t: "关系合参", d: "两人命盘对照分析。", cta: "合参分析", to: "/bazi/compatibility", hl: !1, icon: "💫" }], en: [{ t: "Full Profile", d: "All five systems. Deep AI cross-validation.", cta: "Build My Profile", to: "/reading/new", hl: !0, icon: "🔮" }, { t: "Quick Read", d: "Focus on one area.", cta: "Quick Read", to: "/reading/new?intent=quick", hl: !1, icon: "⚡" }, { t: "Synastry", d: "Two charts compared.", cta: "Synastry", to: "/bazi/compatibility", hl: !1, icon: "💫" }] }
const TRS = { zh: [["💎", "灵石晶品"], ["🎐", "香道雅韵"], ["📿", "护符配饰"], ["📖", "古籍典藏"], ["🕯️", "仪式定制"], ["🌿", "生活方式"]], en: [["💎", "Crystals"], ["🎐", "Incense"], ["📿", "Talismans"], ["📖", "Scriptures"], ["🕯️", "Rituals"], ["🌿", "Lifestyle"]] }
const TD = { zh: { u: "10,000+", r: "4.9", rp: "50,000+", ul: "用户", rl: "评分", rpl: "报告已生成", t1: "真正让我看清了自己的底层模式。", n1: "林小姐·96分", t2: "AI交叉验证比单一系统靠谱得多。", n2: "陈先生·98分" }, en: { u: "10,000+", r: "4.9", rp: "50,000+", ul: "Users", rl: "Rating", rpl: "Reports", t1: "It showed me my underlying patterns.", n1: "Ms.Lin·96", t2: "Cross-validation is far more reliable.", n2: "Mr.Chen·98" } }
const PRC = { zh: [{ name: "免费版", price: "¥0", desc: "体验全部系统\n基础预览功能", cta: "免费注册", hl: !1 }, { name: "深度报告", price: "按次", desc: "完整五维画像\n单次解锁·永久可查", cta: "建立画像", hl: !0 }, { name: "星尘充值", price: "灵活", desc: "按需充值\n充越多赠越多", cta: "查看定价", hl: !1 }], en: [{ name: "Free", price: "Free", desc: "All systems\nBasic preview", cta: "Sign Up", hl: !1 }, { name: "Deep Report", price: "Per-use", desc: "Full 5D profile\nOne-time·Permanent", cta: "Build Profile", hl: !0 }, { name: "Top-up", price: "Flexible", desc: "Pay as you go\nMore=bonus", cta: "Pricing", hl: !1 }] }

export default function GalaxyHomeNew() { const { locale, localeHref } = useLanguage(); const isZh = locale === "zh"
  const stars = useMemo(() => mkS(), []), qi = useMemo(() => mkQ(), [])
  const cb = { background: "linear-gradient(135deg, #060E24, #030918)" }, cd = "rounded-2xl border border-white/[0.05]"

  return (<div className="w-full text-white" style={{ background: "#020210" }}>
    {/* ═══ L0: Deep space gradient + subtle nebula ═══ */}
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" style={{ background: "radial-gradient(ellipse at 50% 38%, #100d28 0%, #08051c 40%, #02010c 80%, #000 100%)" }} />
    {/* Subtle nebula wisps */}
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" style={{ background: "radial-gradient(ellipse at 30% 25%, rgba(60,20,100,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 55%, rgba(30,15,80,0.05) 0%, transparent 50%), radial-gradient(ellipse at 50% 35%, rgba(80,30,120,0.04) 0%, transparent 40%)" }} />

    {/* ═══ L1: Galaxy River — ONE continuous diagonal glow band ═══ */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true" style={{ zIndex: 1 }}>
      {/* Main bright galaxy band */}
      <div style={{ position: "absolute", left: "-35%", top: "8%", width: "170%", height: "84%", transform: "rotate(-16deg)", background: "linear-gradient(90deg, rgba(20,8,50,0) 0%, rgba(35,15,80,0.06) 10%, rgba(60,25,130,0.14) 25%, rgba(90,35,160,0.20) 40%, rgba(110,45,180,0.22) 48%, rgba(110,45,180,0.22) 52%, rgba(80,30,150,0.14) 65%, rgba(40,15,90,0.05) 82%, rgba(15,5,40,0) 100%)", filter: "blur(7px)", maskImage: "radial-gradient(ellipse at center, black 0%, black 18%, rgba(0,0,0,0.5) 50%, transparent 85%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, black 18%, rgba(0,0,0,0.5) 50%, transparent 85%)", animation: "galaxyFlow 45s ease-in-out infinite",willChange: "transform" }} />
      {/* Secondary band — slightly offset for depth */}
      <div style={{ position: "absolute", left: "-15%", top: "5%", width: "130%", height: "90%", transform: "rotate(-14deg)", background: "linear-gradient(90deg, rgba(15,8,50,0) 0%, rgba(35,15,85,0.04) 25%, rgba(65,25,130,0.10) 48%, rgba(65,25,130,0.10) 52%, rgba(35,15,85,0.04) 75%, rgba(10,5,35,0) 100%)", filter: "blur(14px)", maskImage: "radial-gradient(ellipse at center, black 0%, black 12%, rgba(0,0,0,0.35) 42%, transparent 82%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, black 12%, rgba(0,0,0,0.35) 42%, transparent 82%)", animation: "galaxyFlow 60s ease-in-out infinite reverse",willChange: "transform" }} />
      {/* Third wider wash */}
      <div style={{ position: "absolute", left: "-5%", top: "0%", width: "110%", height: "100%", transform: "rotate(-12deg)", background: "linear-gradient(90deg, rgba(10,5,40,0) 0%, rgba(20,12,70,0.03) 35%, rgba(45,20,110,0.06) 50%, rgba(20,12,70,0.03) 65%, rgba(5,3,25,0) 100%)", filter: "blur(22px)", maskImage: "radial-gradient(ellipse at center, black 0%, black 10%, rgba(0,0,0,0.3) 40%, transparent 78%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, black 10%, rgba(0,0,0,0.3) 40%, transparent 78%)", animation: "galaxyFlow 70s ease-in-out infinite",willChange: "transform" }} />
      {/* Core bright nucleus */}
      <div style={{ position: "absolute", left: "38%", top: "26%", width: "24%", height: "200px", background: "radial-gradient(ellipse at 50% 50%, rgba(150,140,220,0.12), rgba(100,75,180,0.06) 30%, rgba(50,25,100,0.02) 55%, transparent 75%)", filter: "blur(5px)", animation: "coreGlow 5s ease-in-out infinite" }} />
      {/* Second smaller bright spot */}
      <div style={{ position: "absolute", left: "55%", top: "42%", width: "12%", height: "100px", background: "radial-gradient(ellipse at 50% 50%, rgba(120,100,200,0.08), rgba(70,40,140,0.04) 40%, transparent 70%)", filter: "blur(4px)", animation: "coreGlow 7s ease-in-out infinite reverse" }} />
    </div>

    {/* ═══ L2: Scattered stars ═══ */}
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ zIndex: 2, contain: "layout style paint" }}>
      {stars.map(s => <span key={s.id} style={{ position: "absolute", left: s.x + "%", top: s.y + "%", width: s.sz, height: s.sz, borderRadius: "50%", background: s.clr === "warm" ? "rgba(255,215,130,0.75)" : s.clr === "blue" ? "rgba(140,180,240,0.65)" : `rgba(220,225,255,${Math.min(0.75, s.o * 1.3)})`, boxShadow: s.clr === "warm" ? `0 0 ${s.sz * 1.5}px rgba(255,200,100,0.25)` : s.clr === "blue" ? `0 0 ${s.sz}px rgba(150,190,240,0.15)` : "none", opacity: s.o, transform: "translate(-50%,-50%)", animation: s.tw ? `starTwinkle ${s.sp}s ease-in-out ${s.dl}s infinite` : "none" }} />)}
    </div>

    {/* ═══ L3: Bagua — emerging from the cosmos, slowly rotating + pulsing ═══ */}
    <div className="fixed left-1/2 pointer-events-none" aria-hidden="true" style={{ width: "min(480px,88vw)", height: "min(480px,88vw)", top: "43%", transform: "translate(-50%,-50%)", zIndex: 5, animation: "baguaSpin 100s linear infinite, baguaEmerge 8s ease-in-out infinite" }}>
      {/* Outer golden halo */}
      <div className="absolute" style={{ inset: "-10%", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, rgba(201,168,76,0.02) 50%, transparent 75%)" }} />
      {/* Outer ring */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(201,168,76,0.18)", boxShadow: "0 0 30px rgba(201,168,76,0.04), 0 0 60px rgba(201,168,76,0.02)" }} />
      {/* 24 tick marks */}
      {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * 360 - 90; return <span key={"t" + i} style={{ position: "absolute", left: "50%", top: "50%", width: 1, height: 2.5, background: "rgba(201,168,76,0.20)", transform: `translate(-50%,-50%) rotate(${a}deg) translateY(-49.5%)` }} /> })}
      {/* Dashed inner ring */}
      <div style={{ position: "absolute", inset: "12%", borderRadius: "50%", border: "1px dashed rgba(201,168,76,0.08)" }} />
      {/* Qi energy particles */}
      {qi.map(p => { const rad = (p.ang * Math.PI) / 180; return <span key={"q" + p.id} style={{ position: "absolute", left: (50 + p.dist * Math.cos(rad)) + "%", top: (50 + p.dist * Math.sin(rad)) + "%", width: p.sz, height: p.sz, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.35), transparent 70%)", boxShadow: "0 0 1.5px rgba(201,168,76,0.1)", animation: `qiPulse ${p.sp}s ease-in-out ${p.dl}s infinite` }} /> })}
      {/* 8 Bagua characters */}
      {T.map((t, i) => { const a = (i / 8) * 360 - 90, rad = (a * Math.PI) / 180, d = 42; return <span key={i} className="absolute font-serif" style={{ left: (50 + d * Math.cos(rad)) + "%", top: (50 + d * Math.sin(rad)) + "%", transform: "translate(-50%,-50%)", color: "rgba(201,168,76,0.22)", fontSize: "clamp(9px,1vw,12px)" }}>{t}</span> })}
      {/* Inner ring */}
      <div style={{ position: "absolute", inset: "22%", borderRadius: "50%", border: "0.5px solid rgba(201,168,76,0.06)" }} />
      {/* Yin-Yang center */}
      <div style={{ position: "absolute", inset: "12%", display: "grid", placeItems: "center", fontSize: "clamp(50px,7vw,85px)", color: "rgba(201,168,76,0.24)", textShadow: "0 0 10px rgba(201,168,76,0.06)" }}>☯</div>
      {/* Orbiting golden dust */}
      {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * 360, rad = (a * Math.PI) / 180, d = 45; return <span key={"du" + i} style={{ position: "absolute", left: (50 + d * Math.cos(rad)) + "%", top: (50 + d * Math.sin(rad)) + "%", width: 1.5, height: 1.5, borderRadius: "50%", background: "rgba(201,168,76,0.30)", boxShadow: "0 0 2px rgba(201,168,76,0.2)", animation: `dustFloat ${3 + i % 3}s ease-in-out ${i * .5}s infinite` }} /> })}
    </div>

    {/* ═══ L4: Vignette ═══ */}
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ background: "radial-gradient(ellipse at 50% 43%, transparent 14%, rgba(0,0,0,0.20) 50%, rgba(0,0,0,0.60) 100%)", zIndex: 6 }} />

    <style>{`
@keyframes baguaSpin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
@keyframes baguaEmerge{0%,100%{opacity:.55}50%{opacity:.82}}
@keyframes starTwinkle{0%,100%{opacity:.06;transform:scale(.45)}50%{opacity:.80;transform:scale(1.18)}}
@keyframes qiPulse{0%,100%{opacity:.20;transform:scale(.6)}50%{opacity:.55;transform:scale(1.10)}}
@keyframes dustFloat{0%{transform:translate(0,0)}50%{transform:translate(3px,-2px)}100%{transform:translate(0,0)}}
@keyframes galaxyFlow{0%{transform:rotate(-15deg) translateX(-2%)}50%{transform:rotate(-15deg) translateX(2%)}100%{transform:rotate(-15deg) translateX(-2%)}}
@keyframes coreGlow{0%,100%{opacity:.5}50%{opacity:.85}}
@keyframes fadeUp{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}
@keyframes rSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){*{animation:none!important}}@media(max-width:768px){.star-mid,.star-near{display:none}.star-far{opacity:.5!important}}
    `}</style>

    {/* ═══ HERO ═══ */}
    <section className="relative flex min-h-[90vh] w-full flex-col items-center justify-center px-6 text-center" style={{ zIndex: 10 }}>
      <div style={{ animation: "fadeUp 0.8s ease-out forwards" }}>
        <h1 className="font-serif text-8xl md:text-10xl font-bold tracking-wide" style={{ background: "linear-gradient(180deg, #f5e0a0 0%, #c49a35 48%, #7d5a10 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 18px rgba(201,168,76,0.15))" }}>{isZh ? "观我" : "Guanwo"}</h1>
        <p className="mt-3 text-[11px] tracking-[0.2em] text-white/20">{isZh ? "AI 命运行动系统" : "AI Destiny Action System"}</p>
      </div>
      <div className="mt-8 max-w-sm" style={{ animation: "fadeUp 0.8s ease-out 0.2s forwards", opacity: 0 }}>
        <p className="text-[14px] leading-relaxed" style={{ color: "rgba(200,195,215,0.45)" }}>{isZh ? "融合八字、紫微、星盘、塔罗、面相手相" : "Integrating Bazi, Ziwei, Astrology, Tarot, Face & Palm."}<br /><span className="text-[12px]" style={{ color: "rgba(200,195,215,0.30)" }}>{isZh ? "AI 五维交叉验证，生成你的完整命运画像" : "AI five-source cross-validation — your complete destiny profile."}</span></p>
      </div>
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row" style={{ animation: "fadeUp 0.8s ease-out 0.4s forwards", opacity: 0 }}>
        <Link href={localeHref("/reading/new")} className="rounded-xl px-10 py-4 font-medium transition-all hover:scale-[1.03]" style={{ background: "#C9A84C", color: "#020617" }}><span className="flex items-center gap-2">{isZh ? "建立我的画像" : "Build My Profile"} <ArrowRight size={16} /></span></Link>
        <Link href={localeHref("/almanac")} className="rounded-xl border px-8 py-4 text-white/50 transition-all hover:border-white/30 hover:text-white/75" style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(5,10,18,0.20)", backdropFilter: "blur(12px)" }}><span>{isZh ? "今日趋势" : "Today's Trend"}</span></Link>
      </div>
      <div className="absolute bottom-8 opacity-20"><div className="mx-auto h-8 w-5 rounded-full border border-white/10"><div className="mx-auto mt-1.5 h-2 w-1 rounded-full bg-white/12 animate-bounce" /></div></div>
    </section>

    {/* ═══ CONTENT ═══ */}
    <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-12" style={{ zIndex: 10 }}>
      <div className="mb-10"><p className="text-[10px] tracking-[0.2em] text-white/15 uppercase">DESTINY SYSTEMS</p><h2 className="mt-2 font-serif text-3xl md:text-4xl text-white/80">{isZh ? "五大分析系统" : "Five Analysis Systems"}</h2></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{SYS.map((s, i) => <Link key={i} href={localeHref(s.n === "八字" ? "/bazi" : s.n === "紫微" ? "/ziwei" : s.n === "星盘" ? "/astrology" : s.n === "塔罗" ? "/tarot" : "/face-reading")} className="group flex flex-col rounded-xl border border-white/[0.04] overflow-hidden transition-all hover:-translate-y-1" style={{ background: "linear-gradient(180deg, #060E24 0%, #030918 100%)" }}><div className="h-1 w-full transition-all group-hover:h-1.5" style={{ background: s.c }} /><div className="p-5"><span className="font-serif text-xl text-white/75">{isZh ? s.n : s.nE}</span>{s.f && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>{isZh ? "免费" : "Free"}</span>}</div></Link>)}</div>
    </section>

    <section className="relative mx-auto max-w-6xl px-6 pt-12 pb-12" style={{ zIndex: 10 }}>
      <div className={cd + " p-8 md:p-14"} style={cb}><div className="grid gap-10 lg:grid-cols-[1fr_auto_1fr] lg:items-center"><div className="space-y-3"><p className="text-[10px] tracking-[0.15em] text-white/20 mb-4">{isZh ? "INPUT · 同步采集" : "INPUT · Collection"}</p>{(isZh ? INP.zh : INP.en).map((inp: string, i: number) => <div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-2.5" style={{ background: "rgba(255,255,255,0.02)" }}><span className="text-[10px] text-white/20 w-5">0{i + 1}</span><span className="text-[13px] text-white/50">{inp}</span></div>)}</div><div className="flex flex-col items-center gap-4"><div className="relative"><div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, rgba(201,168,76,0.25) 0%, rgba(201,168,76,0.06) 50%, transparent 70%)", boxShadow: "0 0 50px rgba(201,168,76,0.15)" }}><span className="font-serif text-2xl text-white/80">{isZh ? "合" : "AI"}</span></div><div className="absolute -inset-3 rounded-full border border-gold/15" style={{ animation: "rSpin 8s linear infinite" }} /><div className="absolute -inset-6 rounded-full border border-gold/[0.06]" style={{ animation: "rSpin 12s linear infinite reverse" }} /></div><p className="font-serif text-lg text-white/70">{isZh ? "AI 合参引擎" : "AI Synthesis Engine"}</p></div><div className="space-y-3"><p className="text-[10px] tracking-[0.15em] text-white/20 mb-4">{isZh ? "OUTPUT · 画像输出" : "OUTPUT · Profile"}</p>{(isZh ? OUT.zh : OUT.en).map((out: string, i: number) => <div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-3" style={{ background: "rgba(255,255,255,0.02)" }}><span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i === 0 ? "#5A9E8E" : i === 1 ? "#7B9EC7" : i === 2 ? "#C77B8B" : i === 3 ? "#C9A84C" : "#8B7EC7" }} /><span className="text-[13px] text-white/50">{out}</span></div>)}</div></div></div>
    </section>

    <section className="relative mx-auto max-w-6xl px-6 pt-12 pb-12" style={{ zIndex: 10 }}>
      <div className="mb-10"><p className="text-[10px] tracking-[0.2em] text-white/15 uppercase">YOUR DOSSIER</p><h2 className="mt-2 font-serif text-3xl md:text-4xl text-white/80">{isZh ? "你的命运画像" : "Your Destiny Profile"}</h2></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(isZh ? DOS.zh : DOS.en).map((m, i) => <div key={i} className="group rounded-xl border border-white/[0.04] p-6 transition-all hover:border-white/[0.1]" style={cb}><div className="flex items-center gap-3 mb-4"><span className="text-2xl font-serif text-white/15">{m.i}</span><span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: m.c, color: m.c, opacity: .7 }}>{m.tag}</span></div><h3 className="font-serif text-lg text-white/75 mb-2">{m.t}</h3><p className="text-[12px] leading-relaxed text-white/35">{m.d}</p></div>)}</div>
    </section>

    <section className="relative mx-auto max-w-6xl px-6 pt-12 pb-12" style={{ zIndex: 10 }}>
      <div className="grid gap-10 lg:grid-cols-2"><div className={cd + " p-8"} style={cb}><p className="text-[10px] tracking-[0.2em] text-white/15 uppercase mb-3">TREASURE HALL</p><h3 className="font-serif text-2xl text-white/75 mb-2">{isZh ? "命运藏宝阁" : "Destiny Treasure Hall"}</h3><div className="grid grid-cols-3 gap-3">{(isZh ? TRS.zh : TRS.en).map(([icon, name]: string[], i: number) => <Link key={i} href={localeHref("/shop")} className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.04] p-4 text-center transition-all hover:border-white/[0.1]" style={{ background: "rgba(255,255,255,0.015)" }}><span className="text-xl">{icon}</span><span className="text-[11px] text-white/55">{name}</span></Link>)}</div></div><div className={cd + " p-8"} style={cb}><p className="text-[10px] tracking-[0.2em] text-white/15 uppercase mb-6">TRUST</p><div className="grid grid-cols-3 gap-4 mb-8">{[["10,000+", (isZh ? TD.zh : TD.en).ul], ["4.9", (isZh ? TD.zh : TD.en).rl], ["50,000+", (isZh ? TD.zh : TD.en).rpl]].map(([n, l]) => <div key={l} className="text-center"><div className="font-serif text-3xl" style={{ color: "#C9A84C" }}>{n}</div><div className="text-[11px] text-white/25 mt-1">{l}</div></div>)}</div><div className="space-y-4">{[(isZh ? TD.zh : TD.en).t1, (isZh ? TD.zh : TD.en).t2].map((text, i) => <div key={i} className="border-l-2 border-white/[0.06] pl-4"><p className="text-[13px] leading-relaxed text-white/45">{text}</p><p className="text-[11px] text-white/20 mt-2">{i === 0 ? (isZh ? TD.zh : TD.en).n1 : (isZh ? TD.zh : TD.en).n2}</p></div>)}</div></div></div>
    </section>

    <section className="relative mx-auto max-w-4xl px-6 pt-12 pb-20" style={{ zIndex: 10 }}>
      <div className="text-center mb-8"><p className="text-[10px] tracking-[0.2em] text-white/15 uppercase mb-3">GET STARTED</p><h2 className="font-serif text-3xl md:text-4xl text-white/80">{isZh ? "选择你的入口" : "Choose Your Entry"}</h2></div>
      <div className="grid gap-4 lg:grid-cols-3">{(isZh ? ENT.zh : ENT.en).map((e, i) => <Link key={i} href={localeHref(e.to)} className={`group flex flex-col rounded-2xl p-7 transition-all hover:-translate-y-1 ${e.hl ? "border-2" : "border"}`} style={{ borderColor: e.hl ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.05)", background: e.hl ? "linear-gradient(135deg, #0A1228, #030918)" : cb.background }}><span className="text-4xl mb-4">{e.icon}</span><h3 className="font-serif text-2xl text-white/80 mb-2">{e.t}</h3><p className="text-[13px] leading-relaxed text-white/35 flex-1 mb-5">{e.d}</p><span className="inline-flex items-center gap-2 text-[14px] font-medium" style={{ color: e.hl ? "#C9A84C" : "rgba(255,255,255,0.5)" }}>{e.cta}</span></Link>)}</div>
    </section>
  </div>)}
