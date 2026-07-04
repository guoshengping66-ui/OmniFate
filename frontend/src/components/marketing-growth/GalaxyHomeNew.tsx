"use client"

import { useMemo, useRef, useEffect, useCallback, useState } from "react"; import Link from "next/link"; import { ArrowRight } from "lucide-react"; import { useLanguage } from "@/contexts/LanguageContext"

/* ── Constants ── */
const T = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"]
function srng(s: number) { let v = s; return () => { v = (v * 16807 + 0) % 2147483647; return (v - 1) / 2147483646 } }
function mkS() {
  const r1 = srng(191), r2 = srng(377), r3 = srng(523); const s: any[] = []
  for (let i = 0; i < 300; i++) { s.push({ id: `f${i}`, x: r1() * 100, y: r2() * 100, sz: .25 + r3() * .55, o: .08 + r1() * .3, tw: r1() > .5, sp: 2.5 + r2() * 4, dl: r3() * 5 }) }
  for (let i = 0; i < 100; i++) { s.push({ id: `m${i}`, x: r1() * 100, y: r2() < .65 ? 25 + r3() * 50 : 5 + r1() * 90, sz: .45 + r2() * 1.1, o: .18 + r1() * .4, tw: r1() > .3, sp: 2 + r2() * 3, dl: r3() * 4 }) }
  for (let i = 0; i < 30; i++) { s.push({ id: `n${i}`, x: r1() * 100, y: r2() < .7 ? 25 + r3() * 45 : 10 + r1() * 85, sz: .7 + r2() * 1.6, o: .3 + r1() * .5, tw: !0, sp: 1.5 + r3() * 2.5, dl: r1() * 2 }) }
  return s
}
function mkQ() { const r = srng(73); return Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * 360, d = 15 + (i % 5) * 7; return { id: i, ang: a, dist: d, sp: 2 + (i % 5) * 1.2, dl: i * .5, sz: 1.2 + (i % 5) * .6 } }) }
const SYS = [{ n: "八字", nE: "Bazi", c: "#5A9E8E", f: !0 }, { n: "紫微", nE: "Ziwei", c: "#8B7EC7", f: !0 }, { n: "星盘", nE: "Astrology", c: "#7B9EC7", f: !0 }, { n: "塔罗", nE: "Tarot", c: "#C77B8B", f: !1 }, { n: "面相", nE: "Face", c: "#C4BFB0", f: !1 }]
const INP = { zh: ["生辰八字", "出生地点", "面相照片", "手相照片", "当前问题"], en: ["Birth date & time", "Birth location", "Face photo", "Palm photo", "Your question"] }
const OUT = { zh: ["性格结构", "事业方向", "关系模式", "财富窗口", "今日行动"], en: ["Personality", "Career", "Relationships", "Wealth window", "Daily action"] }
const DOS = { zh: [{ i: "01", t: "性格结构", d: "八字日主、紫微命宫主星、星盘上升星座——三系统交叉定位核心特质。", tag: "八字+紫微+星盘", c: "#5A9E8E" }, { i: "02", t: "事业方向", d: "AI分析能量走向与发力时机。识别最佳工作节奏和阶段窗口。", tag: "八字+星盘", c: "#7B9EC7" }, { i: "03", t: "关系模式", d: "亲密与合作关系中的底层驱动模式——两盘对照看吸引与契合。", tag: "紫微+面相", c: "#C77B8B" }, { i: "04", t: "财富窗口", d: "识别能量流动、突破机会与防守时期——八字财星交叉验证。", tag: "八字+紫微", c: "#C9A84C" }, { i: "05", t: "生活方式", d: "面相与星盘匹配的日常仪式感——睡眠、工作环境、香味偏好。", tag: "面相+星盘", c: "#8B7EC7" }, { i: "06", t: "今日行动", d: "画像最终输出——今天能做的一件事。把分析变成执行。", tag: "全系统", c: "#E8CB7A" }], en: [{ i: "01", t: "Personality", d: "Bazi Day Master + Ziwei Life Palace + Astrology Ascendant.", tag: "Bazi+Ziwei+Astro", c: "#5A9E8E" }, { i: "02", t: "Career", d: "AI maps energy direction and timing.", tag: "Bazi+Astrology", c: "#7B9EC7" }, { i: "03", t: "Relationships", d: "Core drive in intimacy and partnership.", tag: "Ziwei+Face", c: "#C77B8B" }, { i: "04", t: "Wealth Window", d: "Energy flow, breakthroughs, defense.", tag: "Bazi+Ziwei", c: "#C9A84C" }, { i: "05", t: "Lifestyle", d: "Daily rituals matched to profile.", tag: "Face+Astro", c: "#8B7EC7" }, { i: "06", t: "Daily Action", d: "One thing you can do today.", tag: "All Systems", c: "#E8CB7A" }] }
const ENT = { zh: [{ t: "完整画像", d: "五系统全开，AI深度交叉验证。", cta: "建立我的画像 →", to: "/reading/new", hl: !0, icon: "🔮" }, { t: "单题快问", d: "聚焦一个方向，快速获取AI解读。", cta: "快速提问 →", to: "/reading/new?intent=quick", hl: !1, icon: "⚡" }, { t: "关系合参", d: "两人命盘对照分析。", cta: "合参分析 →", to: "/bazi/compatibility", hl: !1, icon: "💫" }], en: [{ t: "Full Profile", d: "All five systems. Deep AI cross-validation.", cta: "Build My Profile →", to: "/reading/new", hl: !0, icon: "🔮" }, { t: "Quick Read", d: "Focus on one area.", cta: "Quick Read →", to: "/reading/new?intent=quick", hl: !1, icon: "⚡" }, { t: "Synastry", d: "Two charts compared.", cta: "Synastry →", to: "/bazi/compatibility", hl: !1, icon: "💫" }] }
const TRS = { zh: [["💎", "灵石晶品"], ["🎐", "香道雅韵"], ["📿", "护符配饰"], ["📖", "古籍典藏"], ["🕯️", "仪式定制"], ["🌿", "生活方式"]], en: [["💎", "Crystals"], ["🎐", "Incense"], ["📿", "Talismans"], ["📖", "Scriptures"], ["🕯️", "Rituals"], ["🌿", "Lifestyle"]] }
const TD = { zh: { u: "10,000+", r: "4.9", rp: "50,000+", ul: "用户", rl: "评分", rpl: "报告已生成", t1: "真正让我看清了自己的底层模式。", n1: "林小姐·96分", t2: "AI交叉验证比单一系统靠谱得多。", n2: "陈先生·98分" }, en: { u: "10,000+", r: "4.9", rp: "50,000+", ul: "Users", rl: "Rating", rpl: "Reports", t1: "It showed me my underlying patterns.", n1: "Ms.Lin·96", t2: "Cross-validation is far more reliable.", n2: "Mr.Chen·98" } }
const PRC = { zh: [{ name: "免费版", price: "¥0", desc: "体验全部系统\n基础预览功能", cta: "免费注册", hl: !1 }, { name: "深度报告", price: "按次", desc: "完整五维画像\n单次解锁·永久可查", cta: "建立画像", hl: !0 }, { name: "星尘充值", price: "灵活", desc: "按需充值\n充越多赠越多", cta: "查看定价", hl: !1 }], en: [{ name: "Free", price: "Free", desc: "All systems\nBasic preview", cta: "Sign Up", hl: !1 }, { name: "Deep Report", price: "Per-use", desc: "Full 5D profile\nOne-time·Permanent", cta: "Build Profile", hl: !0 }, { name: "Top-up", price: "Flexible", desc: "Pay as you go\nMore=bonus", cta: "Pricing", hl: !1 }] }

/* ═══════════════════════════════════════════════════════════════
   Galaxy River Canvas — ONE continuous diagonal stream
   Like the Milky Way flowing through deep space
   ═══════════════════════════════════════════════════════════════ */
function useGalaxyRiver(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const rafRef = useRef<number>(0), dimsRef = useRef({ W: 0, H: 0 })

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const setDim = () => { c.width = c.offsetWidth * (devicePixelRatio || 1); c.height = c.offsetHeight * (devicePixelRatio || 1); dimsRef.current = { W: c.width, H: c.height } }
    setDim(); window.addEventListener('resize', setDim); return () => window.removeEventListener('resize', setDim)
  }, [canvasRef])

  useEffect(() => {
    const c = canvasRef.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return
    let animating = true

    function frame(ts: number) {
      if (!animating) return
      const { W, H } = dimsRef.current; if (!W) { rafRef.current = requestAnimationFrame(frame); return }
      ctx!.clearRect(0, 0, W, H)
      const t = ts * 0.00008  // very slow drift
      const cx = W * 0.5, cy = H * 0.44
      const angle = -0.58  // diagonal angle
      const cosA = Math.cos(angle), sinA = Math.sin(angle)

      /* ── Soft background glow along the river path ── */
      const bgGrad = ctx!.createLinearGradient(cx - W * 1.2, cy - sinA * W * 1.2, cx + W * 1.2, cy + sinA * W * 1.2)
      bgGrad.addColorStop(0, 'rgba(15,8,35,0)')
      bgGrad.addColorStop(0.25, 'rgba(30,15,70,0.05)')
      bgGrad.addColorStop(0.45, 'rgba(50,22,100,0.10)')
      bgGrad.addColorStop(0.5, 'rgba(60,25,110,0.12)')
      bgGrad.addColorStop(0.55, 'rgba(45,20,95,0.08)')
      bgGrad.addColorStop(0.75, 'rgba(20,10,55,0.03)')
      bgGrad.addColorStop(1, 'rgba(8,3,25,0)')
      ctx!.fillStyle = bgGrad; ctx!.fillRect(0, 0, W, H)

      /* ── Single continuous river of stars ── */
      const riverLength = W * 2.4
      const halfWidth = H * 0.32

      // Dense star particles along the river
      for (let i = 0; i < 800; i++) {
        // Position along the diagonal
        const seed = i * 127.1
        const along = ((i / 800 + t * 0.015 + Math.sin(seed) * 0.3) % 1.0) * riverLength - riverLength * 0.5
        const px = cx + along * cosA
        const py = cy + along * sinA

        // Distance from river center (Gaussian-like distribution)
        const distFactor = ((Math.sin(seed * 3.7) * 0.5 + 0.5) + (Math.sin(seed * 7.1) * 0.5 + 0.5)) * 0.5
        const distFromCenter = (distFactor - 0.5) * halfWidth * 2

        const rx = px + distFromCenter * sinA
        const ry = py - distFromCenter * cosA

        // Fade at edges of river
        const edgeFade = 1 - Math.abs(distFromCenter) / halfWidth
        if (edgeFade <= 0.05) continue

        const pulse = 0.55 + 0.45 * Math.sin(t * 200 + i * 2.7)
        const alpha = edgeFade * edgeFade * (0.08 + (i % 10 === 0 ? 0.4 : i % 5 === 0 ? 0.25 : 0.1)) * pulse
        if (alpha < 0.02) continue

        const sz = i % 12 === 0 ? 1.0 + Math.random() * 0.5 : 0.3 + (i % 7 === 0 ? 0.6 : 0.2)

        ctx!.beginPath(); ctx!.arc(rx, ry, sz, 0, Math.PI * 2)

        if (sz > 0.8 && alpha > 0.12) {
          // Bright star with glow
          ctx!.fillStyle = `rgba(210,195,245,${Math.min(0.9, alpha * 1.2)})`; ctx!.fill()
          ctx!.beginPath(); ctx!.arc(rx, ry, sz * 3.5, 0, Math.PI * 2)
          const sg = ctx!.createRadialGradient(rx, ry, 0, rx, ry, sz * 3.5)
          sg.addColorStop(0, `rgba(190,170,230,${alpha * 0.35})`); sg.addColorStop(1, 'transparent')
          ctx!.fillStyle = sg; ctx!.fill()
        } else {
          ctx!.fillStyle = `rgba(185,175,220,${alpha})`; ctx!.fill()
        }
      }

      /* ── Extra bright cluster near center ── */
      for (let i = 0; i < 60; i++) {
        const along = ((i / 60 + t * 0.008) % 1.0) * riverLength - riverLength * 0.5
        const px = cx + along * cosA, py = cy + along * sinA
        const spread = (Math.sin(i * 47.3) * 0.5 + 0.5) * halfWidth * 0.5
        const rx = px + spread * sinA, ry = py - spread * cosA
        const pulse = 0.6 + 0.4 * Math.sin(t * 150 + i * 3.1)
        const alpha = (1 - spread / halfWidth) * 0.15 * pulse
        if (alpha < 0.02) continue
        ctx!.beginPath(); ctx!.arc(rx, ry, 1.2, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(220,205,250,${alpha})`; ctx!.fill()
        ctx!.beginPath(); ctx!.arc(rx, ry, 5, 0, Math.PI * 2)
        const sg = ctx!.createRadialGradient(rx, ry, 0, rx, ry, 5)
        sg.addColorStop(0, `rgba(200,185,240,${alpha * 0.5})`); sg.addColorStop(1, 'transparent')
        ctx!.fillStyle = sg; ctx!.fill()
      }

      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => { animating = false; cancelAnimationFrame(rafRef.current) }
  }, [canvasRef])
}

export default function GalaxyHomeNew() { const { locale, localeHref } = useLanguage(); const isZh = locale === "zh"
  const stars = useMemo(() => mkS(), []), qi = useMemo(() => mkQ(), [])
  const galaxyRef = useRef<HTMLCanvasElement>(null); useGalaxyRiver(galaxyRef)
  const cb = { background: "linear-gradient(135deg, #060E24, #030918)" }, cd = "rounded-2xl border border-white/[0.05]"

  return (<div className="w-full text-white" style={{ background: "#020210" }}>
    {/* ═══ L0: Deep space gradient ═══ */}
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" style={{ background: "radial-gradient(ellipse at 50% 42%, #0e0c28 0%, #060418 50%, #010108 100%)" }} />

    {/* ═══ L1: Galaxy River Canvas — ONE continuous diagonal stream ═══ */}
    <canvas ref={galaxyRef} aria-hidden="true" className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, width: "100%", height: "100%" }} />

    {/* ═══ L2: Scattered stars ═══ */}
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ zIndex: 2 }}>
      {stars.map(s => <span key={s.id} style={{ position: "absolute", left: s.x + "%", top: s.y + "%", width: s.sz, height: s.sz, borderRadius: "50%", background: s.o > 0.4 ? "rgba(255,215,130,0.7)" : `rgba(220,225,250,${s.o})`, boxShadow: s.o > 0.4 ? `0 0 ${s.sz * 1.5}px rgba(255,200,100,0.25)` : "none", opacity: s.o, transform: "translate(-50%,-50%)", animation: s.tw ? `starTwinkle ${s.sp}s ease-in-out ${s.dl}s infinite` : "none" }} />)}
    </div>

    {/* ═══ L3: Bagua — faint, slowly rotating ═══ */}
    <div className="fixed left-1/2 pointer-events-none" aria-hidden="true" style={{ width: "min(500px,88vw)", height: "min(500px,88vw)", top: "44%", transform: "translate(-50%,-50%)", opacity: 0.15, zIndex: 5, animation: "baguaSpin 120s linear infinite", filter: "drop-shadow(0 0 40px rgba(201,168,76,0.08))" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(201,168,76,0.22)", boxShadow: "0 0 40px rgba(201,168,76,0.04)" }} />
      {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * 360 - 90; return <span key={"t" + i} style={{ position: "absolute", left: "50%", top: "50%", width: 1, height: 2.5, background: "rgba(201,168,76,0.22)", transform: `translate(-50%,-50%) rotate(${a}deg) translateY(-49.5%)` }} /> })}
      <div style={{ position: "absolute", inset: "12%", borderRadius: "50%", border: "1px dashed rgba(201,168,76,0.08)" }} />
      {qi.map(p => { const rad = (p.ang * Math.PI) / 180; return <span key={"q" + p.id} style={{ position: "absolute", left: (50 + p.dist * Math.cos(rad)) + "%", top: (50 + p.dist * Math.sin(rad)) + "%", width: p.sz, height: p.sz, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.35), transparent 70%)", boxShadow: "0 0 2px rgba(201,168,76,0.1)", animation: `starTwinkle ${p.sp}s ease-in-out ${p.dl}s infinite` }} /> })}
      {T.map((t, i) => { const a = (i / 8) * 360 - 90, rad = (a * Math.PI) / 180, d = 43; return <span key={i} className="absolute font-serif" style={{ left: (50 + d * Math.cos(rad)) + "%", top: (50 + d * Math.sin(rad)) + "%", transform: "translate(-50%,-50%)", color: "rgba(201,168,76,0.22)", fontSize: "clamp(10px,1.1vw,12px)" }}>{t}</span> })}
      <div style={{ position: "absolute", inset: "22%", borderRadius: "50%", border: "0.5px solid rgba(201,168,76,0.06)" }} />
      <div style={{ position: "absolute", inset: "10%", display: "grid", placeItems: "center", fontSize: "clamp(60px,8vw,100px)", color: "rgba(201,168,76,0.22)" }}>☯</div>
    </div>

    {/* ═══ L4: Vignette ═══ */}
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ background: "radial-gradient(circle at 50% 44%, transparent 35%, rgba(0,0,0,0.20) 65%, rgba(0,0,0,0.60) 100%)", zIndex: 6 }} />

    <style>{`
@keyframes baguaSpin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
@keyframes starTwinkle{0%,100%{opacity:.12;transform:scale(.65)}50%{opacity:.75;transform:scale(1.15)}}
@keyframes fadeUp{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){*{animation:none!important}}
    `}</style>

    {/* ═══ HERO ═══ */}
    <section className="relative flex min-h-[90vh] w-full flex-col items-center justify-center px-6 text-center" style={{ zIndex: 10 }}>
      <div style={{ animation: "fadeUp 0.8s ease-out forwards" }}>
        <h1 className="font-serif text-7xl md:text-9xl font-bold" style={{ background: "linear-gradient(180deg, #f1da80 0%, #c49a35 50%, #8a6018 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 20px rgba(201,168,76,0.12))" }}>{isZh ? "观我" : "Guanwo"}</h1>
        <p className="mt-3 text-[11px] tracking-[0.2em] text-white/20">{isZh ? "AI 命运行动系统" : "AI Destiny Action System"}</p>
      </div>
      <div className="mt-8 max-w-sm" style={{ animation: "fadeUp 0.8s ease-out 0.2s forwards", opacity: 0 }}>
        <p className="text-[13px] leading-relaxed" style={{ color: "rgba(200,195,215,0.45)" }}>{isZh ? "融合八字、紫微、星盘、塔罗、面相手相\nAI 五维交叉验证，生成你的完整命运画像" : "Integrating Bazi, Ziwei, Astrology, Tarot, Face & Palm.\nAI five-source cross-validation — your complete destiny profile."}</p>
      </div>
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row" style={{ animation: "fadeUp 0.8s ease-out 0.4s forwards", opacity: 0 }}>
        <Link href={localeHref("/reading/new")} className="rounded-xl px-10 py-4 font-medium transition-all hover:scale-[1.03]" style={{ background: "#C9A84C", color: "#020617" }}><span className="flex items-center gap-2">{isZh ? "建立我的画像" : "Build My Profile"} <ArrowRight size={16} /></span></Link>
        <Link href={localeHref("/almanac")} className="rounded-xl border px-8 py-4 text-white/55 transition-all hover:border-white/30 hover:text-white/80" style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(5,10,18,0.20)", backdropFilter: "blur(12px)" }}><span>{isZh ? "今日趋势" : "Today's Trend"}</span></Link>
      </div>
      <div className="absolute bottom-8 opacity-25"><div className="mx-auto h-8 w-5 rounded-full border border-white/12"><div className="mx-auto mt-1.5 h-2 w-1 rounded-full bg-white/15 animate-bounce" /></div></div>
    </section>

    {/* ═══ CONTENT SECTIONS ═══ */}
    <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-12" style={{ zIndex: 10 }}>
      <div className="mb-10"><p className="text-[10px] tracking-[0.2em] text-white/15 uppercase">DESTINY SYSTEMS</p><h2 className="mt-2 font-serif text-3xl md:text-4xl text-white/80">{isZh ? "五大分析系统" : "Five Analysis Systems"}</h2></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{SYS.map((s, i) => <Link key={i} href={localeHref(s.n === "八字" ? "/bazi" : s.n === "紫微" ? "/ziwei" : s.n === "星盘" ? "/astrology" : s.n === "塔罗" ? "/tarot" : "/face-reading")} className="group flex flex-col rounded-xl border border-white/[0.04] overflow-hidden transition-all hover:-translate-y-1" style={{ background: "linear-gradient(180deg, #060E24 0%, #030918 100%)" }}><div className="h-1 w-full transition-all group-hover:h-1.5" style={{ background: s.c }} /><div className="p-5 flex flex-col flex-1"><span className="font-serif text-xl text-white/75 mb-3">{isZh ? s.n : s.nE}</span>{s.f && <span className="text-[10px] px-2 py-0.5 rounded-full mb-3 inline-block w-fit" style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>{isZh ? "免费" : "Free"}</span>}<div className="flex-1" /></div></Link>)}</div>
    </section>

    <section className="relative mx-auto max-w-6xl px-6 pt-12 pb-12" style={{ zIndex: 10 }}>
      <div className={cd + " p-8 md:p-14"} style={cb}><div className="grid gap-10 lg:grid-cols-[1fr_auto_1fr] lg:items-center"><div className="space-y-3"><p className="text-[10px] tracking-[0.15em] text-white/20 mb-4">{isZh ? "INPUT · 同步采集" : "INPUT · Collection"}</p>{(isZh ? INP.zh : INP.en).map((inp: string, i: number) => <div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-2.5" style={{ background: "rgba(255,255,255,0.02)" }}><span className="text-[10px] text-white/20 w-5">0{i + 1}</span><span className="text-[13px] text-white/50">{inp}</span></div>)}</div><div className="flex flex-col items-center gap-4"><div className="relative"><div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, rgba(201,168,76,0.25) 0%, rgba(201,168,76,0.06) 50%, transparent 70%)", boxShadow: "0 0 50px rgba(201,168,76,0.15)" }}><span className="font-serif text-2xl text-white/80">{isZh ? "合" : "AI"}</span></div><div className="absolute -inset-3 rounded-full border border-gold/15" style={{ animation: "rSpin 8s linear infinite" }} /><div className="absolute -inset-6 rounded-full border border-gold/[0.06]" style={{ animation: "rSpin 12s linear infinite reverse" }} /></div><p className="font-serif text-lg text-white/70">{isZh ? "AI 合参引擎" : "AI Synthesis Engine"}</p><p className="text-[12px] text-white/30 text-center max-w-[180px]">{isZh ? "五系统交叉验证" : "Five-source cross-validation"}<br />{isZh ? "逐项比对冲突与一致" : "Comparing conflicts and consensus"}</p></div><div className="space-y-3"><p className="text-[10px] tracking-[0.15em] text-white/20 mb-4">{isZh ? "OUTPUT · 画像输出" : "OUTPUT · Profile"}</p>{(isZh ? OUT.zh : OUT.en).map((out: string, i: number) => <div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-3" style={{ background: "rgba(255,255,255,0.02)" }}><span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i === 0 ? "#5A9E8E" : i === 1 ? "#7B9EC7" : i === 2 ? "#C77B8B" : i === 3 ? "#C9A84C" : "#8B7EC7" }} /><span className="text-[13px] text-white/50">{out}</span><span className="ml-auto text-[10px] text-white/15">{95 - i * 3}%</span></div>)}</div></div></div>
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
