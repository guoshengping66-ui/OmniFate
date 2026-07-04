"use client"

import { useMemo, useRef, useEffect, useCallback, useState } from "react"; import Link from "next/link"; import { ArrowRight } from "lucide-react"; import { useLanguage } from "@/contexts/LanguageContext"

/* ── 2D Value Noise for organic terrain generation ── */
function hash2d(ix: number, iy: number, seed: number): number {
  let n = Math.sin(ix * 127.1 + iy * 311.7 + seed) * 43758.5453
  return n - Math.floor(n)
}
function smoothNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix, fy = y - iy
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy)
  const n00 = hash2d(ix, iy, seed), n10 = hash2d(ix + 1, iy, seed)
  const n01 = hash2d(ix, iy + 1, seed), n11 = hash2d(ix + 1, iy + 1, seed)
  const nx0 = n00 + (n10 - n00) * sx, nx1 = n01 + (n11 - n01) * sx
  return nx0 + (nx1 - nx0) * sy
}
function fbm(x: number, y: number, seed: number, octaves: number = 3): number {
  let v = 0, amp = 1, freq = 1, total = 0
  for (let i = 0; i < octaves; i++) {
    v += smoothNoise(x * freq, y * freq, seed + i * 197) * amp
    total += amp; amp *= 0.5; freq *= 2.2
  }
  return v / total
}

/* ── Shared constants ── */
const T = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"]
function srng(s: number) { let v = s; return () => { v = (v * 16807 + 0) % 2147483647; return (v - 1) / 2147483646 } }
function mkS() {
  const r1 = srng(191), r2 = srng(377), r3 = srng(523); const stars: any[] = []
  for (let i = 0; i < 200; i++) { const x = r1() * 100, y = r2() * 100; stars.push({ id: `f${i}`, x, y, sz: .3 + r3() * .5, o: .08 + r1() * .25, h: 240 + r2() * 40, isGold: r3() > .93, sp: 3 + r2() * 4, dl: r3() * 5 }) }
  for (let i = 0; i < 80; i++) { const x = r1() * 100, b = r2() < .6, y = b ? 25 + r3() * 50 : 5 + r1() * 90; stars.push({ id: `m${i}`, x, y, sz: .5 + r2() * 1.2, o: .2 + r1() * .4, h: 215 + r3() * 45, isGold: r2() > .85, sp: 2 + r2() * 3, dl: r3() * 3 }) }
  for (let i = 0; i < 25; i++) { const x = r1() * 100, y = r2() < .75 ? 25 + r3() * 45 : 10 + r1() * 85; stars.push({ id: `n${i}`, x, y, sz: .8 + r2() * 1.8, o: .35 + r1() * .5, h: 235 + r3() * 25, isGold: r2() > .7, sp: 1.5 + r3() * 2.5, dl: r1() * 2 }) }
  return stars
}
function mkQ() { const r = srng(73); return Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * 360, d = 15 + (i % 5) * 7; return { id: i, ang: a, dist: d, sp: 2 + (i % 5) * 1.2, dl: i * .5, sz: 1.2 + (i % 5) * .6 } }) }
const SYS = [{ n: "八字", nE: "Bazi", q: "底层结构", qE: "Structure", a: "长期节奏与人生框架", aE: "Long-term rhythm", c: "#5A9E8E", f: !0 }, { n: "紫微", nE: "Ziwei", q: "能量周期", qE: "Cycles", a: "十二宫主星分布与大限流年", aE: "12-palace distribution", c: "#8B7EC7", f: !0 }, { n: "星盘", nE: "Astrology", q: "心理模式", qE: "Patterns", a: "七政四余恒星制·先天格局", aE: "Sidereal configuration", c: "#7B9EC7", f: !0 }, { n: "塔罗", nE: "Tarot", q: "当下选择", qE: "Choice", a: "聚焦此刻压力与决策", aE: "Current decisions", c: "#C77B8B", f: !1 }, { n: "面相", nE: "Face", q: "行为印象", qE: "Impression", a: "五官十二宫·禀赋气质", aE: "Five features, 12 palaces", c: "#C4BFB0", f: !1 }]
const INP = { zh: ["生辰八字", "出生地点", "面相照片", "手相照片", "当前问题"], en: ["Birth date & time", "Birth location", "Face photo", "Palm photo", "Your question"] }
const OUT = { zh: ["性格结构", "事业方向", "关系模式", "财富窗口", "今日行动"], en: ["Personality", "Career", "Relationships", "Wealth window", "Daily action"] }
const DOS = { zh: [{ i: "01", t: "性格结构", d: "八字日主、紫微命宫主星、星盘上升星座——三系统交叉定位核心特质。", tag: "八字+紫微+星盘", c: "#5A9E8E" }, { i: "02", t: "事业方向", d: "AI分析能量走向与发力时机。识别最佳工作节奏和阶段窗口。", tag: "八字+星盘", c: "#7B9EC7" }, { i: "03", t: "关系模式", d: "亲密与合作关系中的底层驱动模式——两盘对照看吸引与契合。", tag: "紫微+面相", c: "#C77B8B" }, { i: "04", t: "财富窗口", d: "识别能量流动、突破机会与防守时期——八字财星交叉验证。", tag: "八字+紫微", c: "#C9A84C" }, { i: "05", t: "生活方式", d: "面相与星盘匹配的日常仪式感——睡眠、工作环境、香味偏好。", tag: "面相+星盘", c: "#8B7EC7" }, { i: "06", t: "今日行动", d: "画像最终输出——今天能做的一件事。把分析变成执行。", tag: "全系统", c: "#E8CB7A" }], en: [{ i: "01", t: "Personality", d: "Bazi Day Master + Ziwei Life Palace + Astrology Ascendant — three-system cross-positioning.", tag: "Bazi+Ziwei+Astro", c: "#5A9E8E" }, { i: "02", t: "Career", d: "AI maps energy direction and timing. Optimal rhythm and phase windows.", tag: "Bazi+Astrology", c: "#7B9EC7" }, { i: "03", t: "Relationships", d: "Core drive in intimacy and partnership — two charts compared for fit.", tag: "Ziwei+Face", c: "#C77B8B" }, { i: "04", t: "Wealth Window", d: "Energy flow, breakthroughs, defense — validated with Bazi wealth stars.", tag: "Bazi+Ziwei", c: "#C9A84C" }, { i: "05", t: "Lifestyle", d: "Daily rituals matched to profile — sleep, workspace, scent.", tag: "Face+Astro", c: "#8B7EC7" }, { i: "06", t: "Daily Action", d: "The final output — one thing you can do today.", tag: "All Systems", c: "#E8CB7A" }] }
const ENT = { zh: [{ t: "完整画像", d: "五系统全开，AI深度交叉验证。完整命运画像+今日行动。", cta: "建立我的画像 →", to: "/reading/new", hl: !0, badge: "推荐入口", icon: "🔮" }, { t: "单题快问", d: "聚焦一个方向，快速获取AI解读。适合有明确问题的用户。", cta: "快速提问 →", to: "/reading/new?intent=quick", hl: !1, badge: "", icon: "⚡" }, { t: "关系合参", d: "两人命盘对照分析，AI交叉验证契合度与互补空间。", cta: "合参分析 →", to: "/bazi/compatibility", hl: !1, badge: "", icon: "💫" }], en: [{ t: "Full Profile", d: "All five systems. Deep AI cross-validation. Full destiny profile + daily action.", cta: "Build My Profile →", to: "/reading/new", hl: !0, badge: "Recommended", icon: "🔮" }, { t: "Quick Read", d: "Focus on one area. Fast AI insight for users with a clear question.", cta: "Quick Read →", to: "/reading/new?intent=quick", hl: !1, badge: "", icon: "⚡" }, { t: "Synastry", d: "Two charts compared. AI cross-validates compatibility.", cta: "Synastry →", to: "/bazi/compatibility", hl: !1, badge: "", icon: "💫" }] }
const TRS = { zh: [["💎", "灵石晶品"], ["🎐", "香道雅韵"], ["📿", "护符配饰"], ["📖", "古籍典藏"], ["🕯️", "仪式定制"], ["🌿", "生活方式"]], en: [["💎", "Crystals"], ["🎐", "Incense"], ["📿", "Talismans"], ["📖", "Scriptures"], ["🕯️", "Rituals"], ["🌿", "Lifestyle"]] }
const TD = { zh: { u: "10,000+", r: "4.9", rp: "50,000+", ul: "用户", rl: "评分", rpl: "报告已生成", t1: "真正让我看清了自己的底层模式。", n1: "林小姐·96分", t2: "AI交叉验证比单一系统靠谱得多。", n2: "陈先生·98分" }, en: { u: "10,000+", r: "4.9", rp: "50,000+", ul: "Users", rl: "Rating", rpl: "Reports", t1: "It showed me my underlying patterns.", n1: "Ms.Lin·96", t2: "Cross-validation is far more reliable.", n2: "Mr.Chen·98" } }
const PRC = { zh: [{ name: "免费版", price: "¥0", desc: "体验全部系统\n基础预览功能", cta: "免费注册", hl: !1 }, { name: "深度报告", price: "按次", desc: "完整五维画像\n单次解锁·永久可查", cta: "建立画像", hl: !0 }, { name: "星尘充值", price: "灵活", desc: "按需充值\n充越多赠越多", cta: "查看定价", hl: !1 }], en: [{ name: "Free", price: "Free", desc: "All systems\nBasic preview", cta: "Sign Up", hl: !1 }, { name: "Deep Report", price: "Per-use", desc: "Full 5D profile\nOne-time·Permanent", cta: "Build Profile", hl: !0 }, { name: "Top-up", price: "Flexible", desc: "Pay as you go\nMore=bonus", cta: "Pricing", hl: !1 }] }

/* ═══════════════════════════════════════════════════════════════
   Qingnang-style Organic Flowing Galaxy Hero
   Full-screen noise-based cosmic terrain — like flowing mountains
   ═══════════════════════════════════════════════════════════════ */
interface GalaxyLayer { yBase: number; scale: number; speed: number; hue: number; hue2: number; alpha: number; thickness: number }
interface GalaxyRidge { x: number; y: number }

function useFlowingGalaxy(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const rafRef = useRef<number>(0), dimsRef = useRef({ W: 0, H: 0 })
  const seedRef = useRef(Math.random() * 1000)

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const setDim = () => { c.width = c.offsetWidth * (devicePixelRatio || 1); c.height = c.offsetHeight * (devicePixelRatio || 1); dimsRef.current = { W: c.width, H: c.height } }
    setDim(); window.addEventListener('resize', setDim); return () => window.removeEventListener('resize', setDim)
  }, [canvasRef])

  useEffect(() => {
    const c = canvasRef.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return
    let animating = true
    const seed = seedRef.current

    /* 6 galaxy layers — thick flowing bands like Qingnang's mountain ridges */
    const layers: GalaxyLayer[] = [
      { yBase: 0.18, scale: 0.0006, speed: 0.18, hue: 258, hue2: 275, alpha: 0.38, thickness: 0.14 },
      { yBase: 0.30, scale: 0.0009, speed: 0.25, hue: 268, hue2: 285, alpha: 0.32, thickness: 0.16 },
      { yBase: 0.42, scale: 0.0007, speed: 0.20, hue: 250, hue2: 265, alpha: 0.35, thickness: 0.13 },
      { yBase: 0.53, scale: 0.0011, speed: 0.30, hue: 278, hue2: 290, alpha: 0.28, thickness: 0.15 },
      { yBase: 0.65, scale: 0.0008, speed: 0.22, hue: 260, hue2: 272, alpha: 0.25, thickness: 0.12 },
      { yBase: 0.76, scale: 0.0013, speed: 0.35, hue: 270, hue2: 280, alpha: 0.20, thickness: 0.10 },
    ]

    function frame(ts: number) {
      if (!animating) return
      const { W, H } = dimsRef.current; if (!W) { rafRef.current = requestAnimationFrame(frame); return }
      ctx!.clearRect(0, 0, W, H)
      const t = ts * 0.0002

      /* Deep space background */
      const bg = ctx!.createRadialGradient(W * .5, H * .38, 0, W * .5, H * .5, Math.max(W, H) * .7)
      bg.addColorStop(0, '#0c0920'); bg.addColorStop(.4, '#060418'); bg.addColorStop(1, '#010108')
      ctx!.fillStyle = bg; ctx!.fillRect(0, 0, W, H)

      /* Draw each organic cosmic layer */
      for (const l of layers) {
        ctx!.save()
        ctx!.beginPath()
        const topY = l.yBase * H, th = l.thickness * H
        const step = Math.max(2, W / 400)

        // Top edge of the flowing band
        ctx!.moveTo(-10, H)
        for (let x = -10; x <= W + 10; x += step) {
          const n1 = fbm(x * l.scale, t * l.speed, seed + 1, 3)
          const n2 = fbm(x * l.scale * 1.7, t * l.speed * 0.7 + 50, seed + 10, 2)
          const dy = (n1 - 0.5) * th * 1.6 + (n2 - 0.5) * th * 0.8
          const y = topY + dy
          ctx!.lineTo(x, y - th * 0.35)
        }
        ctx!.lineTo(W + 10, H)
        ctx!.closePath()

        // Gradient: bright at ridge top, fading downward
        const grad = ctx!.createLinearGradient(0, topY - th * 0.5, 0, topY + th * 1.5)
        grad.addColorStop(0, `hsla(${l.hue}, 40%, 15%, 0)`)
        grad.addColorStop(0.15, `hsla(${l.hue}, 50%, 22%, ${l.alpha * 0.5})`)
        grad.addColorStop(0.3, `hsla(${l.hue}, 50%, 30%, ${l.alpha * 0.85})`)
        grad.addColorStop(0.45, `hsla(${l.hue2}, 45%, 35%, ${l.alpha})`)
        grad.addColorStop(0.6, `hsla(${l.hue}, 40%, 20%, ${l.alpha * 0.6})`)
        grad.addColorStop(0.85, `hsla(${l.hue}, 30%, 10%, ${l.alpha * 0.2})`)
        grad.addColorStop(1, 'transparent')
        ctx!.fillStyle = grad; ctx!.fill()

        // Ridge highlight line — gives the "mountain ridge" feel
        ctx!.beginPath()
        let firstPoint = true
        for (let x = -10; x <= W + 10; x += step) {
          const n1 = fbm(x * l.scale, t * l.speed, seed + 1, 3)
          const n2 = fbm(x * l.scale * 1.7, t * l.speed * 0.7 + 50, seed + 10, 2)
          const dy = (n1 - 0.5) * th * 1.6 + (n2 - 0.5) * th * 0.8
          if (firstPoint) { ctx!.moveTo(x, topY + dy - th * 0.35); firstPoint = false }
          else ctx!.lineTo(x, topY + dy - th * 0.35)
        }
        ctx!.strokeStyle = `hsla(${l.hue2}, 60%, 55%, ${l.alpha * 0.35})`
        ctx!.lineWidth = Math.max(0.6, th * 0.04); ctx!.stroke()
        ctx!.restore()
      }

      /* Scattered bright star-dust particles along the ridges */
      const starSeed = seed + 500
      for (let i = 0; i < 80; i++) {
        const px = ((Math.sin(i * 127.1 + t * 0.3 + starSeed) * 0.5 + 0.5) * W + t * 15 * (i % 3 === 0 ? 1 : -1)) % W
        const li = i % layers.length; const l = layers[li]
        const nx = fbm(px * l.scale, t * l.speed, seed + 1, 3)
        const ny = fbm(px * l.scale * 1.7 + 50, t * l.speed * 0.7, seed + 10, 2)
        const py = l.yBase * H + (nx - 0.5) * l.thickness * H * 1.6 + (ny - 0.5) * l.thickness * H * 0.8 - l.thickness * H * 0.25
        if (py < 0 || py > H) continue
        const pulse = 0.5 + 0.5 * Math.sin(t * 40 + i * 2.7)
        const alpha = (0.08 + (i % 3 === 0 ? 0.25 : 0.06)) * pulse
        const size = i % 5 === 0 ? 1.2 + Math.random() * 0.4 : 0.4 + Math.random() * 0.6
        ctx!.beginPath(); ctx!.arc(px, py, size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(200,185,240,${alpha})`; ctx!.fill()
        if (i % 8 === 0 && pulse > 0.7) {
          ctx!.beginPath(); ctx!.arc(px, py, size * 4, 0, Math.PI * 2)
          const sg = ctx!.createRadialGradient(px, py, 0, px, py, size * 4)
          sg.addColorStop(0, `rgba(180,160,230,${alpha * 0.5})`); sg.addColorStop(1, 'transparent')
          ctx!.fillStyle = sg; ctx!.fill()
        }
      }

      /* Soft golden core glow behind bagua */
      const core = ctx!.createRadialGradient(W * .5, H * .42, 0, W * .5, H * .42, Math.min(W, H) * .22)
      core.addColorStop(0, 'rgba(201,168,76,0.04)'); core.addColorStop(0.5, 'rgba(201,168,76,0.015)'); core.addColorStop(1, 'transparent')
      ctx!.fillStyle = core; ctx!.fillRect(0, 0, W, H)

      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => { animating = false; cancelAnimationFrame(rafRef.current) }
  }, [canvasRef])
}

export default function GalaxyHomeNew() { const { locale, localeHref } = useLanguage(); const isZh = locale === "zh"
  const stars = useMemo(() => mkS(), []), qi = useMemo(() => mkQ(), []); const [scrollY, setScrollY] = useState(0)
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: !0 }); return () => window.removeEventListener('scroll', h) }, [])
  const baguaScale = Math.max(0.5, 1 - Math.min(scrollY * 0.0008, 0.5))
  const baguaOpacity = Math.max(0.08, 0.22 - Math.min(scrollY * 0.0005, 0.16))
  const flowGalaxyRef = useRef<HTMLCanvasElement>(null); useFlowingGalaxy(flowGalaxyRef)
  const cb = { background: "linear-gradient(135deg, #060E24, #030918)" }, cd = "rounded-2xl border border-white/[0.05]"

  return (<div className="w-full text-white" style={{ background: "#000" }}>
    {/* ═══ Full-screen flowing galaxy Canvas (Qingnang-style hero) ═══ */}
    <canvas ref={flowGalaxyRef} aria-hidden="true" className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, width: "100%", height: "100%" }} />

    {/* ═══ Star layer ═══ */}
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ zIndex: 2 }}>
      {stars.map(s => <span key={s.id} style={{ position: "absolute", left: s.x + "%", top: s.y + "%", width: s.sz, height: s.sz, borderRadius: "50%", background: s.isGold ? "rgba(255,215,120,0.75)" : `hsla(${s.h},60%,75%,0.55)`, boxShadow: s.isGold ? `0 0 ${s.sz * 2}px rgba(255,200,100,0.35)` : "none", opacity: s.o, transform: "translate(-50%,-50%)", animation: s.isGold || s.o > 0.35 ? `twinkle ${s.sp}s ease-in-out ${s.dl}s infinite` : "none" }} />)}
    </div>

    {/* ═══ Bagua — scroll-responsive ═══ */}
    <div className="fixed left-1/2 pointer-events-none" aria-hidden="true" style={{ width: "min(520px,90vw)", height: "min(520px,90vw)", top: "44%", transform: `translate(-50%,-50%) scale(${baguaScale})`, opacity: baguaOpacity, zIndex: 5, animation: "tSpin 110s linear infinite", filter: "drop-shadow(0 0 50px rgba(218,180,74,0.10))" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(218,180,74,0.22)", boxShadow: "0 0 40px rgba(218,180,74,0.04), inset 0 0 30px rgba(80,180,190,0.02)" }} />
      {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * 360 - 90; return <span key={"t" + i} style={{ position: "absolute", left: "50%", top: "50%", width: 1, height: 3, background: "rgba(218,180,74,0.24)", transform: `translate(-50%,-50%) rotate(${a}deg) translateY(-49%)` }} /> })}
      <div style={{ position: "absolute", inset: "12%", borderRadius: "50%", border: "1px dashed rgba(218,180,74,0.10)" }} />
      {qi.map(p => { const rad = (p.ang * Math.PI) / 180; return <span key={"q" + p.id} style={{ position: "absolute", left: (50 + p.dist * Math.cos(rad)) + "%", top: (50 + p.dist * Math.sin(rad)) + "%", width: p.sz, height: p.sz, borderRadius: "50%", background: "radial-gradient(circle, rgba(218,180,74,0.4), transparent 70%)", boxShadow: "0 0 2px rgba(218,180,74,0.12)", animation: `twinkle ${p.sp}s ease-in-out ${p.dl}s infinite` }} /> })}
      {T.map((t, i) => { const a = (i / 8) * 360 - 90, rad = (a * Math.PI) / 180, d = 43; return <span key={i} className="absolute font-serif" style={{ left: (50 + d * Math.cos(rad)) + "%", top: (50 + d * Math.sin(rad)) + "%", transform: "translate(-50%,-50%)", color: "rgba(218,180,74,0.24)", fontSize: "clamp(10px,1.2vw,13px)" }}>{t}</span> })}
      <div style={{ position: "absolute", inset: "22%", borderRadius: "50%", border: "0.5px solid rgba(218,180,74,0.06)" }} />
      <div style={{ position: "absolute", inset: "10%", display: "grid", placeItems: "center", fontSize: "clamp(68px,9vw,108px)", color: "rgba(218,180,74,0.26)", textShadow: "0 0 15px rgba(218,180,74,0.08)" }}>☯</div>
      {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * 360, rad = (a * Math.PI) / 180, d = 46; return <span key={"du" + i} style={{ position: "absolute", left: (50 + d * Math.cos(rad)) + "%", top: (50 + d * Math.sin(rad)) + "%", width: 2, height: 2, borderRadius: "50%", background: "rgba(218,180,74,0.35)", boxShadow: "0 0 3px rgba(218,180,74,0.25)", animation: `dustFloat ${3 + i % 3}s ease-in-out ${i * .5}s infinite` }} /> })}
    </div>

    {/* ═══ Vignette ═══ */}
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ background: "radial-gradient(circle at 50% 42%, transparent 40%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.55) 100%)", zIndex: 6 }} />

    <style>{`
@keyframes tSpin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
@keyframes twinkle{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:.8;transform:scale(1.2)}}
@keyframes dustFloat{0%{transform:translate(0,0)}50%{transform:translate(6px,-4px)}100%{transform:translate(0,0)}}
    `}</style>

    {/* ═══ HERO — minimal text over flowing galaxy ═══ */}
    <section className="relative flex min-h-[92vh] w-full flex-col items-center justify-center px-6 text-center" style={{ zIndex: 10 }}>
      <div className="hero-text">
        <h1 className="font-serif text-7xl md:text-9xl font-bold tracking-[0.02em]" style={{ background: "linear-gradient(180deg, #f5e0a0 0%, #c49a35 50%, #7d5a10 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 24px rgba(218,180,74,0.15))" }}>{isZh ? "观我" : "Guanwo"}</h1>
        <p className="mt-3 text-[11px] tracking-[0.2em] text-white/25">{isZh ? "AI 命运行动系统" : "AI Destiny Action System"}</p>
      </div>
      <div className="mt-8 max-w-sm">
        <p className="text-[13px] leading-relaxed" style={{ color: "rgba(200,195,210,0.5)" }}>{isZh ? "融合八字、紫微、星盘、塔罗、面相手相\nAI 五维交叉验证，生成你的完整命运画像" : "Integrating Bazi, Ziwei, Astrology, Tarot, Face & Palm.\nAI five-source cross-validation — your complete destiny profile."}</p>
      </div>
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Link href={localeHref("/reading/new")} className="rounded-xl px-10 py-4 font-medium transition-all hover:scale-[1.03]" style={{ background: "#C9A84C", color: "#020617" }}><span className="flex items-center gap-2">{isZh ? "建立我的画像" : "Build My Profile"} <ArrowRight size={16} /></span></Link>
        <Link href={localeHref("/almanac")} className="rounded-xl border px-8 py-4 text-white/60 transition-all hover:border-white/30 hover:text-white/80" style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(5,10,18,0.25)", backdropFilter: "blur(12px)" }}><span>{isZh ? "今日趋势" : "Today's Trend"}</span></Link>
      </div>
      <div className="absolute bottom-8 opacity-30"><div className="mx-auto h-8 w-5 rounded-full border border-white/15"><div className="mx-auto mt-1.5 h-2 w-1 rounded-full bg-white/20 animate-bounce" /></div></div>
    </section>

    {/* ═══ CONTENT SECTIONS ═══ */}
    <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-12" style={{ zIndex: 10 }}>
      <div className="mb-10"><p className="text-[10px] tracking-[0.2em] text-white/15 uppercase">DESTINY SYSTEMS</p><h2 className="mt-2 font-serif text-3xl md:text-4xl text-white/80">{isZh ? "五大分析系统" : "Five Analysis Systems"}</h2><p className="mt-2 text-[13px] text-white/30 max-w-xl">{isZh ? "八字、紫微、星盘、塔罗、面相同步运行，AI交叉验证" : "Bazi, Ziwei, Astrology, Tarot, and Face reading run together, cross-validated by AI"}</p></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{SYS.map((s, i) => <Link key={i} href={localeHref(s.n === "八字" ? "/bazi" : s.n === "紫微" ? "/ziwei" : s.n === "星盘" ? "/astrology" : s.n === "塔罗" ? "/tarot" : "/face-reading")} className="group flex flex-col rounded-xl border border-white/[0.04] overflow-hidden transition-all hover:-translate-y-1" style={{ background: "linear-gradient(180deg, #060E24 0%, #030918 100%)" }}><div className="h-1 w-full transition-all group-hover:h-1.5" style={{ background: s.c }} /><div className="p-5 flex flex-col flex-1"><div className="flex items-center justify-between mb-3"><span className="font-serif text-xl text-white/75">{isZh ? s.n : s.nE}</span>{s.f && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>{isZh ? "免费" : "Free"}</span>}</div><p className="text-[10px] tracking-[0.12em] text-white/25 mb-1.5">{isZh ? s.q : s.qE}</p><p className="text-[12px] leading-relaxed text-white/35 flex-1">{isZh ? s.a : s.aE}</p></div></Link>)}</div>
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
      <div className="grid gap-4 lg:grid-cols-3">{(isZh ? ENT.zh : ENT.en).map((e, i) => <Link key={i} href={localeHref(e.to)} className={`group flex flex-col rounded-2xl p-7 transition-all hover:-translate-y-1 ${e.hl ? "border-2" : "border"}`} style={{ borderColor: e.hl ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.05)", background: e.hl ? "linear-gradient(135deg, #0A1228, #030918)" : cb.background }}>{e.badge && <span className="text-[10px] tracking-[0.15em] text-white/20 mb-3">{e.badge}</span>}<span className="text-4xl mb-4">{e.icon}</span><h3 className="font-serif text-2xl text-white/80 mb-2">{e.t}</h3><p className="text-[13px] leading-relaxed text-white/35 flex-1">{e.d}</p><span className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium" style={{ color: e.hl ? "#C9A84C" : "rgba(255,255,255,0.5)" }}>{e.cta}</span></Link>)}</div>
    </section>
  </div>)}
