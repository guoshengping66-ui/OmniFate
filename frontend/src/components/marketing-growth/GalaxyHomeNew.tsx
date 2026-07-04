"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const TRIGRAMS = ["乾","兑","离","震","巽","坎","艮","坤"]

/* ── Seeded PRNG ── */
function srng(s: number) { let v = s; return () => { v = (v * 16807 + 0) % 2147483647; return (v - 1) / 2147483646 } }

/* ── Canvas-generated galaxy texture ── */
function generateGalaxyTexture(): string {
  const W = 2048, H = 800
  const canvas = typeof document !== "undefined" ? document.createElement("canvas") : null
  if (!canvas) return ""
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext("2d")!
  const r = srng(191)

  // Base: deep space
  ctx.fillStyle = "#02050d"; ctx.fillRect(0, 0, W, H)

  // Nebula clouds — organic soft blobs
  for (let i = 0; i < 18; i++) {
    const cx = r() * W, cy = H * 0.3 + r() * H * 0.4
    const rx = 80 + r() * 320, ry = 30 + r() * 80
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry))
    const hue = r() > 0.7 ? 38 : r() > 0.4 ? 195 : 220
    grad.addColorStop(0, `hsla(${hue}, 60%, ${45 + r() * 30}%, ${0.08 + r() * 0.12})`)
    grad.addColorStop(0.5, `hsla(${hue}, 50%, 35%, ${0.03 + r() * 0.06})`)
    grad.addColorStop(1, "transparent")
    ctx.fillStyle = grad; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, r() * 0.3, 0, Math.PI * 2); ctx.fill()
  }

  // Bright core — warm ivory + gold streak
  for (let i = 0; i < 6; i++) {
    const cx = W * 0.25 + r() * W * 0.5, cy = H * 0.35 + r() * H * 0.3
    const rx = 40 + r() * 200, ry = 8 + r() * 30
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry))
    grad.addColorStop(0, `rgba(255,240,200,${0.10 + r() * 0.10})`)
    grad.addColorStop(0.4, `rgba(218,180,74,${0.06 + r() * 0.08})`)
    grad.addColorStop(1, "transparent")
    ctx.fillStyle = grad; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, r() * 0.15, 0, Math.PI * 2); ctx.fill()
  }

  // Dark dust lanes — multiply-style dark streaks
  for (let i = 0; i < 8; i++) {
    const cx = r() * W, cy = H * 0.32 + r() * H * 0.36
    const rx = 30 + r() * 180, ry = 5 + r() * 22
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry))
    grad.addColorStop(0, `rgba(0,2,6,${0.5 + r() * 0.35})`)
    grad.addColorStop(0.6, `rgba(0,2,6,0.15)`)
    grad.addColorStop(1, "transparent")
    ctx.fillStyle = grad; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, r() * 0.2, 0, Math.PI * 2); ctx.fill()
  }

  // Dense star field — 6000+ stars with core concentration
  const r2 = srng(193)
  for (let i = 0; i < 6500; i++) {
    const x = r2() * W
    const bias = r2()
    const y = H * 0.3 + (bias < 0.78 ? r2() * H * 0.35 : r2() * H * 0.7 - H * 0.15)
    const rr = r2()
    const size = rr > 0.98 ? 2.2 : rr > 0.85 ? 1.3 : 0.5
    const alpha = rr > 0.92 ? 0.85 : 0.18 + r2() * 0.55
    const color = rr > 0.72 ? `rgba(255,220,130,${alpha})` : rr > 0.48 ? `rgba(135,225,235,${alpha * 0.7})` : `rgba(255,250,225,${alpha * 0.8})`
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill()
  }

  // Bright foreground stars with glow
  for (let i = 0; i < 40; i++) {
    const x = r2() * W, y = H * 0.3 + r2() * H * 0.4
    const size = 1.2 + r2() * 1.5
    const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 4)
    glow.addColorStop(0, "rgba(255,240,200,0.7)")
    glow.addColorStop(0.3, "rgba(255,220,140,0.25)")
    glow.addColorStop(1, "transparent")
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, size * 4, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = "rgba(255,245,210,0.9)"; ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill()
  }

  return canvas.toDataURL("image/webp", 0.75)
}

/* ── Far stars (Layer 2) ── */
function genFarStars() { const r = srng(42); return Array.from({ length: 140 }, (_, i) => ({ id: i, left: r() * 100, top: r() * 100, size: 0.4 + r() * 0.8, opacity: 0.18 + r() * 0.4 })) }

/* ── Bilingual ── */
const SYS = [{ n:"八字",nEn:"Bazi",q:"底层结构",qEn:"Structure",a:"你的长期节奏与人生框架",aEn:"Your long-term rhythm",c:"#5A9E8E",f:true},{ n:"紫微",nEn:"Ziwei",q:"能量周期",qEn:"Cycles",a:"十二宫主星分布与大限流年",aEn:"12-palace star distribution",c:"#8B7EC7",f:true},{ n:"星盘",nEn:"Astrology",q:"心理模式",qEn:"Patterns",a:"七政四余恒星制，论先天格局",aEn:"Sidereal, innate configuration",c:"#7B9EC7",f:true},{ n:"塔罗",nEn:"Tarot",q:"当下选择",qEn:"Choice",a:"聚焦此刻的压力与决策方向",aEn:"Current pressure and decisions",c:"#C77B8B",f:false},{ n:"面相",nEn:"Face",q:"行为印象",qEn:"Impression",a:"五官十二宫，看禀赋与气质",aEn:"Five features, 12 palaces",c:"#C4BFB0",f:false}]
const INP={zh:["生辰八字","出生地点","面相照片","手相照片","当前问题"],en:["Birth date & time","Birth location","Face photo","Palm photo","Your question"]}
const OUT={zh:["性格结构","事业方向","关系模式","财富窗口","今日行动"],en:["Personality","Career","Relationships","Wealth window","Daily action"]}
const DOS={zh:[{i:"01",t:"性格结构",d:"八字日主、紫微命宫主星、星盘上升星座——三个系统交叉定位核心人格特质。",tag:"八字+紫微+星盘",c:"#5A9E8E"},{i:"02",t:"事业方向",d:"AI 分析能量走向与发力时机。识别最佳工作节奏、阶段性窗口和避坑方向。",tag:"八字+星盘",c:"#7B9EC7"},{i:"03",t:"关系模式",d:"亲密关系与合作关系中的底层驱动模式。两盘对照看吸引与契合度。",tag:"紫微+面相",c:"#C77B8B"},{i:"04",t:"财富窗口",d:"识别能量流动感、突破机会、防守时期。八字财星与大限流年交叉验证。",tag:"八字+紫微",c:"#C9A84C"},{i:"05",t:"生活方式",d:"面相与星盘生成的日常仪式感建议——睡眠节律、工作环境、香气偏好。",tag:"面相+星盘",c:"#8B7EC7"},{i:"06",t:"今日行动",d:"画像的最终输出——今天可以做的一件事。把分析变成执行。",tag:"全系统",c:"#E8CB7A"}],en:[{i:"01",t:"Personality",d:"Bazi Day Master + Ziwei Life Palace + Astrology Ascendant — cross-position core traits.",tag:"Bazi+Ziwei+Astro",c:"#5A9E8E"},{i:"02",t:"Career",d:"AI maps energy direction and timing. Optimal rhythm, phase windows, and pitfalls.",tag:"Bazi+Astrology",c:"#7B9EC7"},{i:"03",t:"Relationships",d:"Core drive in intimacy and partnership — two charts compared for fit.",tag:"Ziwei+Face",c:"#C77B8B"},{i:"04",t:"Wealth Window",d:"Energy flow, breakthroughs, defense periods — validated with Bazi wealth stars.",tag:"Bazi+Ziwei",c:"#C9A84C"},{i:"05",t:"Lifestyle",d:"Daily rituals matched to profile — sleep, workspace, scent, color preferences.",tag:"Face+Astro",c:"#8B7EC7"},{i:"06",t:"Daily Action",d:"The final output — one thing you can do today. Turn analysis into execution.",tag:"All Systems",c:"#E8CB7A"}]}
const ENT={zh:[{t:"完整画像",d:"五系统全开，AI 深度交叉验证。获取完整命运画像 + 今日行动建议。",cta:"建立我的画像 →",to:"/reading/new",hl:true,badge:"推荐入口",icon:"🔮"},{t:"单题快问",d:"聚焦一个方向，快速获取 AI 解读。适合有明确问题的用户。",cta:"快速提问 →",to:"/reading/new?intent=quick",hl:false,badge:"",icon:"⚡"},{t:"关系合参",d:"两人命盘对照分析，AI 交叉验证契合度与互补空间。",cta:"合参分析 →",to:"/bazi/compatibility",hl:false,badge:"",icon:"💫"}],en:[{t:"Full Profile",d:"All five systems. Deep AI cross-validation. Full destiny profile + daily action.",cta:"Build My Profile →",to:"/reading/new",hl:true,badge:"Recommended",icon:"🔮"},{t:"Quick Read",d:"Focus on one area. Fast AI insight for users with a clear question.",cta:"Quick Read →",to:"/reading/new?intent=quick",hl:false,badge:"",icon:"⚡"},{t:"Synastry",d:"Two charts compared. AI cross-validates compatibility.",cta:"Synastry →",to:"/bazi/compatibility",hl:false,badge:"",icon:"💫"}]}
const TRS={zh:[["💎","灵石晶品"],["🎐","香道雅韵"],["📿","护符配饰"],["📖","古籍典藏"],["🕯️","仪式定制"],["🌿","生活方式"]],en:[["💎","Crystals"],["🎐","Incense"],["📿","Talismans"],["📖","Scriptures"],["🕯️","Rituals"],["🌿","Lifestyle"]]}
const TD={zh:{u:"10,000+",r:"4.9",rp:"50,000+",ul:"用户",rl:"评分",rpl:"报告已生成",t1:"真正让我看清了自己的底层模式，不是告知结局，而是理解结构。",n1:"林小姐 · 96分",t2:"AI 交叉验证让各个系统结论互相印证或反驳——比单一系统靠谱得多。",n2:"陈先生 · 98分"},en:{u:"10,000+",r:"4.9",rp:"50,000+",ul:"Users",rl:"Rating",rpl:"Reports",t1:"It showed me my underlying patterns — not a fixed ending, but understanding the structure.",n1:"Ms. Lin · 96",t2:"Cross-validation lets systems confirm or contradict each other — far more reliable.",n2:"Mr. Chen · 98"}}
const PRC={zh:[{name:"免费版",price:"¥0",desc:"体验全部系统\n基础预览功能",cta:"免费注册",hl:false},{name:"深度报告",price:"按次",desc:"完整五维画像\n单次解锁 · 永久可查",cta:"建立画像",hl:true},{name:"星尘充值",price:"灵活",desc:"按需充值\n充越多赠越多",cta:"查看定价",hl:false}],en:[{name:"Free",price:"Free",desc:"All systems\nBasic preview",cta:"Sign Up",hl:false},{name:"Deep Report",price:"Per-use",desc:"Full 5D profile\nOne-time · Permanent",cta:"Build Profile",hl:true},{name:"Top-up",price:"Flexible",desc:"Pay as you go\nMore = bonus",cta:"Pricing",hl:false}]}

export default function GalaxyHomeNew() {
  const { locale, localeHref } = useLanguage(); const isZh = locale === "zh"
  const farStars = useMemo(() => genFarStars(), [])

  useEffect(() => {
    const tex = generateGalaxyTexture()
    if (tex) { const el = document.getElementById("galaxy-tex-layer"); if (el) el.style.backgroundImage = `url(${tex})` }
  }, [])

  const inputs = isZh ? INP.zh : INP.en; const outputs = isZh ? OUT.zh : OUT.en
  const dossier = isZh ? DOS.zh : DOS.en; const entries = isZh ? ENT.zh : ENT.en
  const treasure = isZh ? TRS.zh : TRS.en; const td = isZh ? TD.zh : TD.en; const pricing = isZh ? PRC.zh : PRC.en

  const kf = `@keyframes taijiSpin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}@keyframes ringSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes starTwinkle{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:.85;transform:scale(1.2)}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}`

  return (
    <div className="w-full text-white" style={{ background: "#000" }}>
      {/* ═══════ L1: Deep Space Background ═══════ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{
        background: "radial-gradient(circle at 50% 40%, rgba(10,18,35,0.45), rgba(2,5,12,1) 60%, #000)",
        zIndex: 0,
      }} />

      {/* ═══════ L2: Far Star Field ═══════ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ zIndex: 1 }}>
        {farStars.map(s => <span key={s.id} style={{ position: "absolute", left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, borderRadius: "50%", background: "rgba(255,255,255,0.5)", opacity: s.opacity }} />)}
      </div>

      {/* ═══════ L3: Milky Way Core — Canvas-generated texture ═══════ */}
      <div id="galaxy-tex-layer" className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{
        zIndex: 2,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transform: "rotate(-15deg)",
        opacity: 0.55,
        mixBlendMode: "screen" as const,
        filter: "contrast(1.2) brightness(0.72) saturate(0.8) hue-rotate(148deg)",
        maskImage: "radial-gradient(ellipse at center, black 0%, black 36%, rgba(0,0,0,0.68) 58%, transparent 82%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, black 36%, rgba(0,0,0,0.68) 58%, transparent 82%)",
      }} />

      {/* ═══════ L5: Dark Dust Lanes — CSS overlay on top of galaxy ═══════ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true" style={{ zIndex: 3 }}>
        <div style={{ position: "absolute", left: "-22%", top: "20%", width: "150%", height: "540px", transform: "rotate(-14deg)" }}>
          {[{ t: "38%", r: "2deg", o: 0.65 }, { t: "50%", r: "-3deg", o: 0.50 }, { t: "34%", r: "-1deg", o: 0.38 }].map((d, i) => (
            <div key={i} style={{
              position: "absolute", left: "4%", top: d.t, width: "88%", height: "85px",
              background: "radial-gradient(ellipse at 16% 50%, rgba(0,3,9,0.75), transparent 26%), radial-gradient(ellipse at 38% 48%, rgba(1,7,14,0.66), transparent 30%), radial-gradient(ellipse at 62% 52%, rgba(2,9,16,0.58), transparent 28%), radial-gradient(ellipse at 84% 50%, rgba(0,4,10,0.48), transparent 24%)",
              filter: "blur(9px)", mixBlendMode: "multiply" as const, opacity: d.o,
              transform: `rotate(${d.r})`,
            }} />
          ))}
        </div>
      </div>

      {/* ═══════ L6: Taiji Bagua System ═══════ */}
      <div className="fixed left-1/2 pointer-events-none" aria-hidden="true" style={{
        width: "min(520px, 90vw)", height: "min(520px, 90vw)",
        top: "44%", transform: "translate(-50%,-50%) rotate(0deg)",
        opacity: 0.26, zIndex: 5,
        animation: "taijiSpin 110s linear infinite",
        filter: "drop-shadow(0 0 40px rgba(218,180,74,0.16))",
      }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(218,180,74,0.30)", boxShadow: "0 0 50px rgba(218,180,74,0.10), inset 0 0 42px rgba(80,180,190,0.06)" }} />
        <div style={{ position: "absolute", inset: "12%", borderRadius: "50%", border: "1px dashed rgba(218,180,74,0.22)" }} />
        {TRIGRAMS.map((t, i) => { const a = (i / 8) * 360 - 90, rad = (a * Math.PI) / 180, d = 45; return <span key={i} className="absolute font-serif" style={{ left: `${50 + d * Math.cos(rad)}%`, top: `${50 + d * Math.sin(rad)}%`, transform: "translate(-50%,-50%)", color: "rgba(218,180,74,0.44)", textShadow: "0 0 10px rgba(218,180,74,0.18)", fontSize: "clamp(10px,1.3vw,14px)" }}>{t}</span> })}
        <div style={{ position: "absolute", inset: "24%", borderRadius: "50%", border: "0.5px solid rgba(218,180,74,0.14)" }} />
        <div style={{ position: "absolute", inset: "8%", display: "grid", placeItems: "center", fontSize: "clamp(70px,10vw,115px)", color: "rgba(218,180,74,0.44)", textShadow: "0 0 16px rgba(218,180,74,0.15)" }}>☯</div>
      </div>

      {/* ═══════ L7: Text Readable Mask ═══════ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{
        background: "radial-gradient(circle at 50% 45%, rgba(0,0,0,0.22), transparent 58%)",
        zIndex: 7,
      }} />
      {/* ═══════ Vignette ═══════ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, transparent 22%, transparent 50%, rgba(0,0,0,0.72) 100%)",
        zIndex: 8,
      }} />

      <style>{kf}</style>

      {/* ═══════ HERO ═══════ */}
      <section className="relative flex min-h-[88vh] w-full flex-col items-center justify-center px-6 text-center" style={{ zIndex: 10 }}>
        <div><h1 className="font-serif text-8xl md:text-9xl font-bold" style={{ background: "linear-gradient(180deg, #f1d36f 0%, #c49a35 58%, #8d6a1f 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textShadow: "0 0 32px rgba(218,180,74,0.18), 0 8px 40px rgba(0,0,0,0.45)", filter: "drop-shadow(0 0 40px rgba(201,168,76,0.22))" }}>{isZh ? "观我" : "Guanwo"}</h1><p className="mt-4 text-[11px] tracking-[0.15em] text-white/30">{isZh ? "AI 命运行动系统" : "AI Destiny Action System"}</p></div>
        <div className="mt-10"><p className="font-serif text-xl" style={{ color: "rgba(238,241,232,0.82)", textShadow: "0 0 20px rgba(0,0,0,0.55)" }}>{isZh ? "看见内在结构 · 找到下一步" : "See your structure · Find the next step"}</p><div className="mx-auto mt-4 h-px w-48" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} /><p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed" style={{ color: "rgba(220,224,215,0.58)", lineHeight: 1.65 }}>{isZh ? "融合八字、紫微、星盘、塔罗、面相手相" : "Integrating Bazi, Ziwei, Astrology, Tarot, Face & Palm"}<br />{isZh ? "AI 五维交叉验证，生成你的完整命运画像" : "AI five-source cross-validation — your complete destiny profile"}</p></div>
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row"><Link href={localeHref("/reading/new")} className="group rounded-xl px-10 py-4 font-medium transition-all hover:scale-[1.03]" style={{ background: "#C9A84C", color: "#020617", boxShadow: "0 0 0 1px rgba(255,230,150,0.18), 0 12px 34px rgba(218,180,74,0.18)" }}><span className="flex items-center gap-2">{isZh ? "建立我的画像" : "Build My Profile"} <ArrowRight size={16} /></span></Link><Link href={localeHref("/almanac")} className="rounded-xl border px-10 py-4 text-white/75 transition-all hover:border-white/35" style={{ borderColor: "rgba(255,255,255,0.18)", background: "rgba(5,10,18,0.32)", backdropFilter: "blur(12px)" }}><span className="flex items-center gap-2">{isZh ? "查看今日趋势" : "View Today's Trend"} <ArrowRight size={15} /></span></Link></div>
        <div className="absolute bottom-8 opacity-40"><div className="mx-auto h-8 w-5 rounded-full border border-white/20"><div className="mx-auto mt-1.5 h-2 w-1 rounded-full bg-white/30 animate-bounce" /></div></div>
      </section>

      {/* ═══════ SECTIONS ═══════ */}
      <section className="relative mx-auto max-w-6xl px-6 pt-24" style={{ zIndex: 10 }}><div className="mb-12"><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase">DESTINY SYSTEMS</p><h2 className="mt-3 font-serif text-3xl md:text-4xl">Five Analysis Systems</h2><p className="mt-3 text-[14px] text-white/35 max-w-xl">Not a single tool — Bazi, Ziwei, Astrology, Tarot, and Face reading run together, cross-validated by AI</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{SYS.map((s, i) => (<Link key={i} href={localeHref(s.n === "八字" ? "/bazi" : s.n === "紫微" ? "/ziwei" : s.n === "星盘" ? "/astrology" : s.n === "塔罗" ? "/tarot" : "/face-reading")} className="group flex flex-col rounded-xl border border-white/[0.04] overflow-hidden transition-all hover:-translate-y-1" style={{ background: "linear-gradient(180deg, #060E24 0%, #030918 100%)" }}><div className="h-1 w-full transition-all group-hover:h-1.5" style={{ background: s.c }} /><div className="p-5 flex flex-col flex-1"><div className="flex items-center justify-between mb-3"><span className="font-serif text-xl text-white/75">{s.n}</span>{s.f && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>Free</span>}</div><p className="text-[10px] tracking-[0.12em] text-white/25 mb-1.5">{s.q}</p><p className="text-[12px] leading-relaxed text-white/35 flex-1">{s.a}</p></div></Link>))}</div></section>

      <section className="relative mx-auto max-w-6xl px-6 pt-20" style={{ zIndex: 10 }}><div className="rounded-2xl border border-white/[0.05] p-8 md:p-14" style={{ background: "linear-gradient(135deg, #060E24 0%, #030918 100%)" }}><div className="grid gap-10 lg:grid-cols-[1fr_auto_1fr] lg:items-center"><div className="space-y-3"><p className="text-[10px] tracking-[0.15em] text-white/20 mb-4">INPUT · Collection</p>{inputs.map((inp, i) => (<div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-2.5" style={{ background: "rgba(255,255,255,0.02)" }}><span className="text-[10px] text-white/20 w-5">0{i + 1}</span><span className="text-[13px] text-white/50">{inp}</span></div>))}</div><div className="flex flex-col items-center gap-4"><div className="relative"><div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, rgba(201,168,76,0.25) 0%, rgba(201,168,76,0.06) 50%, transparent 70%)", boxShadow: "0 0 50px rgba(201,168,76,0.15)" }}><span className="font-serif text-2xl text-white/80">AI</span></div><div className="absolute -inset-3 rounded-full border border-gold/15" style={{ animation: "ringSpin 8s linear infinite" }} /><div className="absolute -inset-6 rounded-full border border-gold/[0.06]" style={{ animation: "ringSpin 12s linear infinite reverse" }} /></div><p className="font-serif text-lg text-white/70">AI Synthesis Engine</p><p className="text-[12px] text-white/30 text-center max-w-[180px]">Five-source cross-validation<br />Comparing conflicts and consensus</p></div><div className="space-y-3"><p className="text-[10px] tracking-[0.15em] text-white/20 mb-4">OUTPUT · Profile</p>{outputs.map((out, i) => (<div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-3" style={{ background: "rgba(255,255,255,0.02)" }}><span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i === 0 ? "#5A9E8E" : i === 1 ? "#7B9EC7" : i === 2 ? "#C77B8B" : i === 3 ? "#C9A84C" : "#8B7EC7" }} /><span className="text-[13px] text-white/50">{out}</span><span className="ml-auto text-[10px] text-white/15">{95 - i * 3}%</span></div>))}</div></div></div></section>

      <section className="relative mx-auto max-w-6xl px-6 pt-20" style={{ zIndex: 10 }}><div className="mb-12"><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase">YOUR DOSSIER</p><h2 className="mt-3 font-serif text-3xl md:text-4xl">Your Destiny Profile</h2><p className="mt-3 text-[14px] text-white/35 max-w-xl">AI generates a structured profile — from inner structure to daily action</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{dossier.map((m, i) => (<div key={i} className="group rounded-xl border border-white/[0.04] p-6 transition-all hover:border-white/[0.1]" style={{ background: "linear-gradient(135deg, #060E24, #030918)" }}><div className="flex items-center gap-3 mb-4"><span className="text-2xl font-serif text-white/15">{m.i}</span><span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: m.c, color: m.c, opacity: .7 }}>{m.tag}</span></div><h3 className="font-serif text-lg text-white/75 mb-2">{m.t}</h3><p className="text-[12px] leading-relaxed text-white/35">{m.d}</p></div>))}</div></section>

      <section className="relative mx-auto max-w-6xl px-6 pt-20" style={{ zIndex: 10 }}><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-3">GET STARTED</p><h2 className="font-serif text-3xl md:text-4xl">Choose Your Entry</h2><div className="mt-10 grid gap-4 lg:grid-cols-3">{entries.map((e, i) => (<Link key={i} href={localeHref(e.to)} className={`group flex flex-col rounded-2xl p-7 transition-all hover:-translate-y-1 ${e.hl ? "border-2" : "border"}`} style={{ borderColor: e.hl ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.05)", background: e.hl ? "linear-gradient(135deg, #0A1228, #030918)" : "linear-gradient(135deg, #060E24, #030918)" }}>{e.badge && <span className="text-[10px] tracking-[0.15em] text-white/20 mb-3">{e.badge}</span>}<span className="text-4xl mb-4">{e.icon}</span><h3 className="font-serif text-2xl text-white/80 mb-2">{e.t}</h3><p className="text-[13px] leading-relaxed text-white/35 flex-1">{e.d}</p><span className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium" style={{ color: e.hl ? "#C9A84C" : "rgba(255,255,255,0.5)" }}>{e.cta}</span></Link>))}</div></section>

      <section className="relative mx-auto max-w-6xl px-6 pt-20" style={{ zIndex: 10 }}><div className="grid gap-10 lg:grid-cols-2"><div className="rounded-2xl border border-white/[0.05] p-8" style={{ background: "linear-gradient(135deg, #060E24, #030918)" }}><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-3">TREASURE HALL</p><h3 className="font-serif text-2xl text-white/75 mb-2">Destiny Treasure Hall</h3><p className="text-[13px] text-white/35 mb-6">AI matches lifestyle items to your profile</p><div className="grid grid-cols-3 gap-3">{treasure.map(([icon, name], i) => (<Link key={i} href={localeHref("/shop")} className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.04] p-4 text-center transition-all hover:border-white/[0.1]" style={{ background: "rgba(255,255,255,0.015)" }}><span className="text-xl">{icon}</span><span className="text-[11px] text-white/55">{name}</span></Link>))}</div></div><div className="rounded-2xl border border-white/[0.05] p-8" style={{ background: "linear-gradient(135deg, #060E24, #030918)" }}><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-6">TRUST</p><div className="grid grid-cols-3 gap-4 mb-8">{[["10,000+", td.ul], ["4.9", td.rl], ["50,000+", td.rpl]].map(([n, l]) => (<div key={l} className="text-center"><div className="font-serif text-3xl" style={{ color: "#C9A84C" }}>{n}</div><div className="text-[11px] text-white/25 mt-1">{l}</div></div>))}</div><div className="space-y-4">{[["“" + td.t1 + "”", td.n1], ["“" + td.t2 + "”", td.n2]].map(([text, name], i) => (<div key={i} className="border-l-2 border-white/[0.06] pl-4"><p className="text-[13px] leading-relaxed text-white/45">{text}</p><p className="text-[11px] text-white/20 mt-2">{name}</p></div>))}</div></div></div></section>

      <section className="relative mx-auto max-w-4xl px-6 pt-20 pb-20" style={{ zIndex: 10 }}><div className="text-center mb-10"><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-3">PRICING</p><h2 className="font-serif text-3xl md:text-4xl">Clear pricing, no hidden fees</h2><p className="mt-3 text-[14px] text-white/35">Start free, pay per use. 50 Stardust on sign-up.</p></div><div className="grid gap-4 md:grid-cols-3">{pricing.map((p, i) => (<Link key={i} href={localeHref(p.cta === "免费注册" || p.cta === "Sign Up" ? "/register" : p.cta === "查看定价" || p.cta === "Pricing" ? "/pricing" : "/reading/new")} className={`group flex flex-col items-center text-center rounded-2xl p-7 transition-all hover:-translate-y-1 ${p.hl ? "border-2" : "border"}`} style={{ borderColor: p.hl ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.05)", background: p.hl ? "linear-gradient(135deg, #0A1228, #030918)" : "linear-gradient(135deg, #060E24, #030918)" }}><span className="text-[11px] tracking-[0.15em] text-white/25 mb-3">{p.name}</span><span className="font-serif text-4xl mb-3" style={{ color: p.hl ? "#C9A84C" : "rgba(255,255,255,0.6)" }}>{p.price}</span><p className="text-[12px] leading-relaxed text-white/30 flex-1 mb-5 whitespace-pre-line">{p.desc}</p><span className={`rounded-xl px-8 py-3 text-[14px] font-medium transition-all ${p.hl ? "" : "border"}`} style={p.hl ? { background: "#C9A84C", color: "#020617" } : { borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}>{p.cta}</span></Link>))}</div><p className="text-center text-[11px] text-white/15 mt-6">Add to home screen. Use like a native app</p></section>
    </div>
  )
}
