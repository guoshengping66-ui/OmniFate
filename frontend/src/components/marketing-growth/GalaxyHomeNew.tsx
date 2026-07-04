"use client"

import { useMemo } from "react"; import Link from "next/link"; import { ArrowRight } from "lucide-react"; import { useLanguage } from "@/contexts/LanguageContext"

const T = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"]
function srng(s: number) { let v = s; return () => { v = (v * 16807 + 0) % 2147483647; return (v - 1) / 2147483646 } }
function mkQ() { const r = srng(73); return Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * 360, d = 15 + (i % 5) * 7; return { id: i, ang: a, dist: d, sp: 2 + (i % 5) * 1.2, dl: i * .5, sz: 1.2 + (i % 5) * .6 } }) }
const SYS = [{ n: "八字", nE: "Bazi", c: "#5A9E8E", f: !0 }, { n: "紫微", nE: "Ziwei", c: "#8B7EC7", f: !0 }, { n: "星盘", nE: "Astrology", c: "#7B9EC7", f: !0 }, { n: "塔罗", nE: "Tarot", c: "#C77B8B", f: !1 }, { n: "面相", nE: "Face", c: "#C4BFB0", f: !1 }]
const INP = { zh: ["生辰八字", "出生地点", "面相照片", "手相照片", "当前问题"], en: ["Birth date & time", "Birth location", "Face photo", "Palm photo", "Your question"] }
const OUT = { zh: ["性格结构", "事业方向", "关系模式", "财富窗口", "今日行动"], en: ["Personality", "Career", "Relationships", "Wealth window", "Daily action"] }
const DOS = { zh: [{ i: "01", t: "性格结构", d: "八字日主、紫微命宫主星、星盘上升星座——三系统交叉定位核心特质。", tag: "八字+紫微+星盘", c: "#5A9E8E" }, { i: "02", t: "事业方向", d: "AI分析能量走向与发力时机。", tag: "八字+星盘", c: "#7B9EC7" }, { i: "03", t: "关系模式", d: "亲密与合作关系中的底层驱动模式。", tag: "紫微+面相", c: "#C77B8B" }, { i: "04", t: "财富窗口", d: "识别能量流动、突破机会与防守时期。", tag: "八字+紫微", c: "#C9A84C" }, { i: "05", t: "生活方式", d: "面相与星盘匹配的日常仪式感。", tag: "面相+星盘", c: "#8B7EC7" }, { i: "06", t: "今日行动", d: "今天能做的一件事。把分析变成执行。", tag: "全系统", c: "#E8CB7A" }], en: [{ i: "01", t: "Personality", d: "Bazi Day Master + Ziwei Life Palace + Astrology Ascendant.", tag: "Bazi+Ziwei+Astro", c: "#5A9E8E" }, { i: "02", t: "Career", d: "AI maps energy direction and timing.", tag: "Bazi+Astrology", c: "#7B9EC7" }, { i: "03", t: "Relationships", d: "Core drive in intimacy and partnership.", tag: "Ziwei+Face", c: "#C77B8B" }, { i: "04", t: "Wealth Window", d: "Energy flow, breakthroughs, defense.", tag: "Bazi+Ziwei", c: "#C9A84C" }, { i: "05", t: "Lifestyle", d: "Daily rituals matched to profile.", tag: "Face+Astro", c: "#8B7EC7" }, { i: "06", t: "Daily Action", d: "One thing you can do today.", tag: "All Systems", c: "#E8CB7A" }] }
const ENT = { zh: [{ t: "完整画像", d: "五系统全开，AI深度交叉验证。", cta: "建立我的画像 →", to: "/reading/new", hl: !0, icon: "🔮" }, { t: "单题快问", d: "聚焦一个方向，快速获取AI解读。", cta: "快速提问 →", to: "/reading/new?intent=quick", hl: !1, icon: "⚡" }, { t: "关系合参", d: "两人命盘对照分析。", cta: "合参分析 →", to: "/bazi/compatibility", hl: !1, icon: "💫" }], en: [{ t: "Full Profile", d: "All five systems. Deep AI cross-validation.", cta: "Build My Profile →", to: "/reading/new", hl: !0, icon: "🔮" }, { t: "Quick Read", d: "Focus on one area.", cta: "Quick Read →", to: "/reading/new?intent=quick", hl: !1, icon: "⚡" }, { t: "Synastry", d: "Two charts compared.", cta: "Synastry →", to: "/bazi/compatibility", hl: !1, icon: "💫" }] }
const TRS = { zh: [["💎", "灵石晶品"], ["🎐", "香道雅韵"], ["📿", "护符配饰"], ["📖", "古籍典藏"], ["🕯️", "仪式定制"], ["🌿", "生活方式"]], en: [["💎", "Crystals"], ["🎐", "Incense"], ["📿", "Talismans"], ["📖", "Scriptures"], ["🕯️", "Rituals"], ["🌿", "Lifestyle"]] }
const TD = { zh: { u: "10,000+", r: "4.9", rp: "50,000+", ul: "用户", rl: "评分", rpl: "报告已生成", t1: "真正让我看清了自己的底层模式。", n1: "林小姐·96分", t2: "AI交叉验证比单一系统靠谱得多。", n2: "陈先生·98分" }, en: { u: "10,000+", r: "4.9", rp: "50,000+", ul: "Users", rl: "Rating", rpl: "Reports", t1: "It showed me my underlying patterns.", n1: "Ms.Lin·96", t2: "Cross-validation is far more reliable.", n2: "Mr.Chen·98" } }
const PRC = { zh: [{ name: "免费版", price: "¥0", desc: "体验全部系统\n基础预览功能", cta: "免费注册", hl: !1 }, { name: "深度报告", price: "按次", desc: "完整五维画像\n单次解锁·永久可查", cta: "建立画像", hl: !0 }, { name: "星尘充值", price: "灵活", desc: "按需充值\n充越多赠越多", cta: "查看定价", hl: !1 }], en: [{ name: "Free", price: "Free", desc: "All systems\nBasic preview", cta: "Sign Up", hl: !1 }, { name: "Deep Report", price: "Per-use", desc: "Full 5D profile\nOne-time·Permanent", cta: "Build Profile", hl: !0 }, { name: "Top-up", price: "Flexible", desc: "Pay as you go\nMore=bonus", cta: "Pricing", hl: !1 }] }

export default function GalaxyHomeNew() { const { locale, localeHref } = useLanguage(); const isZh = locale === "zh"
  const qi = useMemo(() => mkQ(), [])
  const cb = { background: "linear-gradient(135deg, #060E24, #030918)" }, cd = "rounded-2xl border border-white/[0.05]"

  return (<div className="w-full text-white" style={{ background: "#000" }}>
    {/* ═══ Black Hole Video Background ═══ */}
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <video autoPlay muted loop playsInline className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover" style={{ filter: "brightness(0.55) saturate(0.5)" }}>
        <source src="/black-hole.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay to deepen the video */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 15%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0.7) 100%)" }} />
    </div>

    {/* ═══ Rotating Bagua — positioned at the center (inside the hole) ═══ */}
    <div className="fixed left-1/2 pointer-events-none" aria-hidden="true" style={{ width: "min(360px,70vw)", height: "min(360px,70vw)", top: "44%", transform: "translate(-50%,-50%)", zIndex: 5, animation: "baguaSpin 60s linear infinite" }}>
      {/* Golden glow behind bagua */}
      <div className="absolute" style={{ inset: "-15%", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 40%, transparent 70%)" }} />
      {/* Outer ring */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid rgba(201,168,76,0.35)", boxShadow: "0 0 30px rgba(201,168,76,0.08), 0 0 60px rgba(201,168,76,0.04)" }} />
      {/* Tick marks */}
      {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * 360 - 90; return <span key={"t" + i} style={{ position: "absolute", left: "50%", top: "50%", width: 1, height: 2.5, background: "rgba(201,168,76,0.30)", transform: `translate(-50%,-50%) rotate(${a}deg) translateY(-49.5%)` }} /> })}
      {/* Inner dashed ring */}
      <div style={{ position: "absolute", inset: "12%", borderRadius: "50%", border: "1px dashed rgba(201,168,76,0.12)" }} />
      {/* Qi particles */}
      {qi.map(p => { const rad = (p.ang * Math.PI) / 180; return <span key={"q" + p.id} style={{ position: "absolute", left: (50 + p.dist * Math.cos(rad)) + "%", top: (50 + p.dist * Math.sin(rad)) + "%", width: p.sz, height: p.sz, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.5), transparent 70%)", boxShadow: "0 0 2px rgba(201,168,76,0.15)", animation: `qiPulse ${p.sp}s ease-in-out ${p.dl}s infinite` }} /> })}
      {/* 8 Trigrams */}
      {T.map((t, i) => { const a = (i / 8) * 360 - 90, rad = (a * Math.PI) / 180, d = 41; return <span key={i} className="absolute font-serif" style={{ left: (50 + d * Math.cos(rad)) + "%", top: (50 + d * Math.sin(rad)) + "%", transform: "translate(-50%,-50%)", color: "rgba(201,168,76,0.32)", fontSize: "clamp(9px,1vw,12px)", textShadow: "0 0 3px rgba(201,168,76,0.08)" }}>{t}</span> })}
      {/* Inner ring */}
      <div style={{ position: "absolute", inset: "22%", borderRadius: "50%", border: "0.5px solid rgba(201,168,76,0.10)" }} />
      {/* Yin-Yang center */}
      <div style={{ position: "absolute", inset: "10%", display: "grid", placeItems: "center", fontSize: "clamp(48px,7vw,80px)", color: "rgba(201,168,76,0.32)", textShadow: "0 0 12px rgba(201,168,76,0.1)" }}>☯</div>
      {/* Orbiting dust */}
      {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * 360, rad = (a * Math.PI) / 180, d = 44; return <span key={"du" + i} style={{ position: "absolute", left: (50 + d * Math.cos(rad)) + "%", top: (50 + d * Math.sin(rad)) + "%", width: 2, height: 2, borderRadius: "50%", background: "rgba(201,168,76,0.45)", boxShadow: "0 0 3px rgba(201,168,76,0.3)", animation: `dustOrbit ${3 + i % 3}s ease-in-out ${i * .5}s infinite` }} /> })}
    </div>

    {/* ═══ Vignette ═══ */}
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ background: "radial-gradient(ellipse at 50% 44%, transparent 20%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.65) 100%)", zIndex: 6 }} />

    <style>{`
@keyframes baguaSpin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
@keyframes qiPulse{0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:.7;transform:scale(1.2)}}
@keyframes dustOrbit{0%{transform:translate(0,0)}50%{transform:translate(4px,-3px)}100%{transform:translate(0,0)}}
@keyframes fadeIn{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){*{animation:none!important}}
    `}</style>

    {/* ═══ HERO ═══ */}
    <section className="relative flex min-h-[90vh] w-full flex-col items-center justify-center px-6 text-center" style={{ zIndex: 10 }}>
      <div style={{ animation: "fadeIn 0.8s ease-out forwards" }}>
        <h1 className="font-serif text-7xl md:text-9xl font-bold" style={{ background: "linear-gradient(180deg, #f5e0a0 0%, #c49a35 48%, #7d5a10 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 16px rgba(201,168,76,0.15))" }}>{isZh ? "观我" : "Guanwo"}</h1>
        <p className="mt-3 text-[11px] tracking-[0.2em] text-white/25">{isZh ? "AI 命运行动系统" : "AI Destiny Action System"}</p>
      </div>
      <div className="mt-8 max-w-sm" style={{ animation: "fadeIn 0.8s ease-out 0.2s forwards", opacity: 0 }}>
        <p className="text-[13px] leading-relaxed" style={{ color: "rgba(200,195,215,0.5)" }}>{isZh ? "融合八字、紫微、星盘、塔罗、面相手相\nAI 五维交叉验证，生成你的完整命运画像" : "Integrating Bazi, Ziwei, Astrology, Tarot, Face & Palm.\nAI five-source cross-validation."}</p>
      </div>
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row" style={{ animation: "fadeIn 0.8s ease-out 0.4s forwards", opacity: 0 }}>
        <Link href={localeHref("/reading/new")} className="rounded-xl px-10 py-4 font-medium transition-all hover:scale-[1.03]" style={{ background: "#C9A84C", color: "#020617" }}><span className="flex items-center gap-2">{isZh ? "建立我的画像" : "Build My Profile"} <ArrowRight size={16} /></span></Link>
        <Link href={localeHref("/almanac")} className="rounded-xl border px-8 py-4 text-white/55 transition-all hover:border-white/30 hover:text-white/80" style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(5,10,18,0.20)", backdropFilter: "blur(12px)" }}><span>{isZh ? "今日趋势" : "Today's Trend"}</span></Link>
      </div>
      <div className="absolute bottom-8 opacity-25"><div className="mx-auto h-8 w-5 rounded-full border border-white/12"><div className="mx-auto mt-1.5 h-2 w-1 rounded-full bg-white/15 animate-bounce" /></div></div>
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
