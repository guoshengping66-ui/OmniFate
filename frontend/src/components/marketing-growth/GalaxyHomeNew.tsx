"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const CLASSICS = [
  "周易","滴天髓","三命通会","子平真诠","穷通宝鉴",
  "渊海子平","紫微斗数全书","果老星宗","增删卜易",
  "卜筮正宗","六壬大全","烟波钓叟歌",
]
const TRIGRAMS = ["☰乾","☱兑","☲离","☳震","☴巽","☵坎","☶艮","☷坤"]
const FEATURES = [
  { char: "命", title: "八字排盘", desc: "录入生辰，按古法自动起盘排柱", href: "/bazi", free: true },
  { char: "紫", title: "紫微斗数", desc: "十二宫排盘，看主星四化与大限流年", href: "/ziwei", free: true },
  { char: "卦", title: "六爻起卦", desc: "依《增删卜易》《卜筮正宗》参详卦象", href: "/divination", free: false },
  { char: "星", title: "星盘解读", desc: "七政四余 · 恒星制，以二十八宿论命格", href: "/astrology", free: true },
  { char: "缘", title: "八字合盘", desc: "两盘对照，参看缘分契合与互补", href: "/bazi/compatibility", free: true },
  { char: "面", title: "面相分析", desc: "五官十二宫，看先天禀赋与后天运势", href: "/face-reading", free: false },
]
const STATS = [
  ["8+","大推演模块"],["4","维交互模式"],["50","注册即赠灵签"],["0","月费订阅"],
]

export default function GalaxyHomeNew() {
  useEffect(() => {
    const s = document.createElement("style")
    s.textContent = `
      @keyframes gh-ring-slow { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
      @keyframes gh-ring-rev { from { transform:rotate(360deg) } to { transform:rotate(0deg) } }
      @keyframes gh-marquee { 0% { transform:translateX(0) } 100% { transform:translateX(-50%) } }
      @keyframes gh-star { 0%,100% { opacity:0.4 } 50% { opacity:0.9 } }
      @keyframes gh-qi { 0%,100% { opacity:0.3;transform:scale(0.7) } 50% { opacity:0.95;transform:scale(1.5) } }
      @media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none!important } }
    `
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])

  const ringSlow = { animation: "gh-ring-slow 90s linear infinite" }
  const ringRev = { animation: "gh-ring-rev 70s linear infinite" }
  const ringMed = { animation: "gh-ring-slow 50s linear infinite" }
  const ringFast = { animation: "gh-ring-rev 35s linear infinite" }
  const coreStyle = { animation: "gh-ring-slow 20s linear infinite" }
  const qiAnim = (i: number) => ({ animation: `gh-qi ${2 + (i % 3) * 0.7}s ease-in-out ${i * 0.3}s infinite` })

  return (
    <div className="relative w-full text-white" style={{ background: "#020617" }}>
      {/* Layer 1: Nebula glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(123,158,199,0.35) 0%, transparent 60%)," +
          "radial-gradient(ellipse 50% 50% at 25% 55%, rgba(139,126,199,0.25) 0%, transparent 50%)," +
          "radial-gradient(ellipse 40% 40% at 75% 45%, rgba(201,168,76,0.15) 0%, transparent 50%)," +
          "radial-gradient(ellipse 60% 40% at 60% 60%, rgba(123,158,199,0.15) 0%, transparent 50%)",
      }} />

      {/* Layer 2: Star field */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: (i % 3) + 1, height: (i % 3) + 1,
            top: `${(i * 53 + 7) % 85 + 5}%`,
            left: `${(i * 37 + 11) % 100}%`,
            background: i % 6 === 0 ? "rgba(201,168,76,0.8)" : "rgba(200,210,240,0.6)",
            boxShadow: i % 6 === 0 ? "0 0 8px rgba(201,168,76,0.5)" : "0 0 5px rgba(200,210,240,0.35)",
            opacity: 0.4,
            animation: `gh-star ${3 + (i % 4)}s ease-in-out ${(i * 0.4).toFixed(1)}s infinite`,
          }} />
        ))}
      </div>

      {/* Layer 3: Galaxy river */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{
        opacity: 0.6,
        background: "linear-gradient(180deg, transparent 0%, rgba(123,158,199,0.15) 20%, rgba(139,126,199,0.18) 35%, rgba(201,168,76,0.08) 48%, rgba(123,158,199,0.12) 60%, rgba(139,126,199,0.08) 75%, transparent 100%)",
        transform: "skewY(-2deg)",
      }} />

      {/* Layer 4: Bagua */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none" aria-hidden="true" style={{ opacity: 0.55 }}>
        <div className="relative" style={{ width: "min(82vw, 520px)", height: "min(82vw, 520px)" }}>
          <div className="absolute inset-0 rounded-full border border-white/[0.06]" style={ringSlow} />
          <div className="absolute inset-[5%]" style={ringSlow}>
            {TRIGRAMS.map((t, i) => {
              const a = (i / 8) * 360
              return <div key={i} className="absolute text-[10px] text-white/50 font-serif" style={{ left:"50%", top:"50%", transform:`rotate(${a}deg) translateY(-47%) rotate(-${a}deg) translateX(-50%)` }}>{t}</div>
            })}
          </div>
          <div className="absolute inset-[12%] rounded-full border border-white/[0.07]" style={ringRev} />
          <div className="absolute inset-[18%]" style={ringMed}>
            <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
            {TRIGRAMS.map((t, i) => {
              const a = (i / 8) * 360 + 22.5
              return <div key={i} className="absolute text-xs text-white/35 font-serif" style={{ left:"50%", top:"50%", transform:`rotate(${a}deg) translateY(-${i%2===0?"37%":"34%"}) rotate(-${a}deg) translateX(-50%)` }}>{t.slice(1)}</div>
            })}
          </div>
          <div className="absolute inset-[26%] rounded-full border border-white/[0.07]" style={ringFast} />
          <div className="absolute inset-[24%]" style={ringRev}>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * 360
              return <div key={i} className="absolute rounded-full" style={{
                width: 2 + (i % 3), height: 2 + (i % 3),
                left: "50%", top: "50%",
                transform: `rotate(${a}deg) translateY(-${18 + (i % 3) * 6}%)`,
                background: "radial-gradient(circle, rgba(201,168,76,0.8) 0%, transparent 70%)",
                boxShadow: "0 0 8px rgba(201,168,76,0.5)",
                ...qiAnim(i),
              }} />
            })}
          </div>
          <div className="absolute inset-[34%] rounded-full" style={{ background:"radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)" }} />
          <div className="absolute inset-[36%] rounded-full flex items-center justify-center">
            <div className="absolute inset-[-10%] rounded-full border border-white/[0.08]" style={coreStyle} />
            <span className="text-3xl text-white/50 select-none" style={coreStyle}>☯</span>
          </div>
        </div>
      </div>

      {/* ═══ Hero ═══ */}
      <section className="relative z-[2] flex min-h-[88vh] w-full flex-col items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-serif text-8xl md:text-9xl font-bold" style={{
            background: "linear-gradient(180deg, #E8CB7A 0%, #C9A84C 40%, #A07C2A 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 40px rgba(201,168,76,0.25))",
          }}>观我</h1>
          <p className="mt-4 text-[11px] tracking-[0.15em] text-white/30">AETHER POUCH</p>
        </div>
        <div className="mt-10">
          <p className="font-serif text-xl text-white/60">古籍为根 · AI 参详</p>
          <div className="mx-auto mt-4 h-px w-48" style={{ background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} />
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-white/35">
            《周易》《滴天髓》《三命通会》原文为根<br/>AI 逐句参详，专业克制，按次计费，不订阅
          </p>
        </div>
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/zh/reading/new" className="group rounded-xl px-10 py-4 font-medium transition-all hover:scale-[1.03]" style={{ background: "#C9A84C", color: "#020617" }}>
            <span className="flex items-center gap-2">开始排盘 <ArrowRight size={16} /></span>
          </Link>
          <Link href="/zh/divination" className="rounded-xl border px-10 py-4 text-white/75 transition-all hover:border-white/35" style={{ borderColor: "rgba(255,255,255,0.18)" }}>
            <span className="flex items-center gap-2">六爻起卦 <ArrowRight size={15} /></span>
          </Link>
        </div>
        <div className="absolute bottom-8 opacity-40">
          <div className="mx-auto h-8 w-5 rounded-full border border-white/20">
            <div className="mx-auto mt-1.5 h-2 w-1 rounded-full bg-white/30 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══ Marquee ═══ */}
      <section className="relative z-[2] border-y border-white/[0.03] py-7 overflow-hidden">
        <p className="mb-3 text-center text-[11px] tracking-[0.35em] text-white/25">古籍为根 · 逐句可溯源</p>
        <div className="flex whitespace-nowrap text-[14px] text-white/30 font-serif" style={{ animation: "gh-marquee 80s linear infinite" }}>
          {[...CLASSICS, ...CLASSICS].map((n, i) => (
            <span key={i} className="mx-3">{`《${n}》`}<span className="mx-2 text-white/10">·</span></span>
          ))}
        </div>
      </section>

      {/* ═══ Stats ═══ */}
      <section className="relative z-[2] mx-auto max-w-5xl px-6 pt-16">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.04] md:grid-cols-4" style={{ background: "rgba(255,255,255,0.02)" }}>
          {STATS.map(([n, l]) => (
            <div key={l} className="flex flex-col items-center gap-2 px-4 py-7" style={{ background: "#030918" }}>
              <span className="font-serif text-4xl" style={{ color: "#C9A84C" }}>{n}</span>
              <span className="text-[11px] tracking-[0.15em] text-white/40">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="relative z-[2] mx-auto max-w-5xl px-6 pt-20 pb-10">
        <h2 className="text-center font-serif text-3xl text-white/75">核心功能</h2>
        <div className="mx-auto mt-4 h-px w-32" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)" }} />
        <p className="mt-4 text-center text-[13px] text-white/35">每一句解读都引自古籍原文，可溯源、不空谈、千人千面</p>

        <div className="mt-12">
          <Link href="/zh/reading/new" className="group flex flex-col gap-6 rounded-2xl border border-white/[0.05] p-8 transition-all hover:border-white/[0.15] md:flex-row md:items-center md:gap-8 md:p-10" style={{ background: "linear-gradient(135deg, #060E24, #030918)" }}>
            <span className="self-start font-serif text-6xl md:self-center" style={{ color: "#C9A84C" }}>参</span>
            <div className="flex-1 text-left">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-serif text-2xl text-white/80">三术合参</h3>
                <span className="rounded-full px-3 py-0.5 text-[11px] tracking-[0.1em]" style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C" }}>旗舰 · 三盘互证</span>
              </div>
              <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/45">八字 × 紫微 × 七政三盘互证 — 信度分级的旗舰整合解读</p>
            </div>
            <span className="flex items-center gap-2 text-sm text-white/40 transition-all group-hover:gap-3 group-hover:text-white/60">了解更多 →</span>
          </Link>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(f => (
            <Link key={f.title} href={`/zh${f.href}`} className="group relative flex flex-col rounded-2xl border border-white/[0.04] p-7 transition-all hover:border-white/[0.15] hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #060E24, #030918)" }}>
              {f.free && <span className="absolute right-4 top-4 rounded-full px-3 py-0.5 text-[11px]" style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>免费</span>}
              <span className="self-start font-serif text-4xl" style={{ color: "#C9A84C", opacity: 0.75 }}>{f.char}</span>
              <h3 className="mt-4 font-serif text-xl text-white/75">{f.title}</h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-white/40">{f.desc}</p>
              <span className="mt-5 flex items-center gap-1.5 text-xs text-white/30 transition-colors group-hover:text-white/50">了解更多 <span className="transition-transform group-hover:translate-x-1">→</span></span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ Register CTA ═══ */}
      <section className="relative z-[2] mx-auto max-w-2xl px-6 pb-16 pt-6 text-center">
        <p className="font-serif text-3xl text-white/70">注册即赠 <span style={{ color: "#C9A84C" }}>50</span> 灵签</p>
        <p className="mt-3 text-[14px] text-white/35">按次计费，无订阅，充值额外赠 15%</p>
        <Link href="/zh/register" className="mt-10 inline-block rounded-xl px-14 py-4 font-medium transition-all hover:scale-[1.03]" style={{ background: "#C9A84C", color: "#020617" }}>免费注册</Link>
      </section>

      {/* ═══ PWA ═══ */}
      <section className="relative z-[2] mx-auto max-w-2xl px-6 pb-20 text-center">
        <h2 className="font-serif text-2xl text-white/60">随身携带你的<span style={{ color: "#C9A84C" }}>观我</span></h2>
        <p className="mt-3 max-w-sm mx-auto text-[13px] leading-relaxed text-white/25">添加到手机桌面，像原生 App 一样随时打开。无需下载，无需应用商店，一键直达</p>
        <p className="mt-6 text-[11px] text-white/15">使用手机浏览器访问本页，即可添加到桌面</p>
      </section>
    </div>
  )
}
