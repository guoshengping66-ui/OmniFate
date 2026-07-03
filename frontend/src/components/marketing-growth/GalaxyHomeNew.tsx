"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const TRIGRAMS = ["☰乾","☱兑","☲离","☳震","☴巽","☵坎","☶艮","☷坤"]

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
    <div className="w-full text-white" style={{ background: "#020617" }}>
      {/* Layer 1: Nebula glows — covers full scrollable page */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(123,158,199,0.35) 0%, transparent 60%)," +
          "radial-gradient(ellipse 50% 50% at 25% 55%, rgba(139,126,199,0.25) 0%, transparent 50%)," +
          "radial-gradient(ellipse 40% 40% at 75% 45%, rgba(201,168,76,0.15) 0%, transparent 50%)," +
          "radial-gradient(ellipse 60% 40% at 60% 60%, rgba(123,158,199,0.15) 0%, transparent 50%)",
      }} />

      {/* Layer 2: Star field */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
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
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" style={{
        opacity: 0.6,
        background: "linear-gradient(180deg, transparent 0%, rgba(123,158,199,0.15) 20%, rgba(139,126,199,0.18) 35%, rgba(201,168,76,0.08) 48%, rgba(123,158,199,0.12) 60%, rgba(139,126,199,0.08) 75%, transparent 100%)",
        transform: "skewY(-2deg)",
      }} />

      {/* Layer 4: Bagua */}
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0" aria-hidden="true" style={{ opacity: 0.55 }}>
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
          <p className="mt-4 text-[11px] tracking-[0.15em] text-white/30">AI 命运行动系统</p>
        </div>
        <div className="mt-10">
          <p className="font-serif text-xl text-white/60">看见内在结构 · 找到下一步</p>
          <div className="mx-auto mt-4 h-px w-48" style={{ background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} />
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-white/35">
            融合八字、紫微、星盘、塔罗、面相手相<br/>AI 五维交叉验证，生成你的完整命运画像
          </p>
        </div>
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/zh/reading/new" className="group rounded-xl px-10 py-4 font-medium transition-all hover:scale-[1.03]" style={{ background: "#C9A84C", color: "#020617" }}>
            <span className="flex items-center gap-2">建立我的画像 <ArrowRight size={16} /></span>
          </Link>
          <Link href="/zh/almanac" className="rounded-xl border px-10 py-4 text-white/75 transition-all hover:border-white/35" style={{ borderColor: "rgba(255,255,255,0.18)" }}>
            <span className="flex items-center gap-2">查看今日趋势 <ArrowRight size={15} /></span>
          </Link>
        </div>
        <div className="absolute bottom-8 opacity-40">
          <div className="mx-auto h-8 w-5 rounded-full border border-white/20">
            <div className="mx-auto mt-1.5 h-2 w-1 rounded-full bg-white/30 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══ Section: 如何运作 ═══ */}
      <section className="relative z-[2] mx-auto max-w-5xl px-6 pt-20">
        <div className="border border-white/[0.05] rounded-2xl p-8 md:p-12" style={{ background: "linear-gradient(135deg, #060E24, #030918)" }}>
          <p className="text-center text-[11px] tracking-[0.2em] text-white/25 uppercase mb-2">HOW IT WORKS</p>
          <h2 className="text-center font-serif text-2xl md:text-3xl text-white/75">三步，生成你的专属命运画像</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "录入信息", desc: "填写出生时间、地点，上传面相手相照片，选择当下关心的方向", icon: "✏️" },
              { step: "02", title: "AI 五维合参", desc: "八字起盘 × 紫微排宫 × 星盘推运 × 塔罗择问 × 面相解读，交叉验证", icon: "⚡" },
              { step: "03", title: "获取画像 + 行动", desc: "生成完整命运画像，输出今日行动建议——不是告诉你结局，是指出下一步", icon: "🎯" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[10px] tracking-[0.15em] text-white/20">{item.step}</span>
                <h3 className="font-serif text-lg text-white/70">{item.title}</h3>
                <p className="text-[13px] leading-relaxed text-white/35">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/zh/reading/new" className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 font-medium transition-all hover:scale-[1.02]" style={{ background: "#C9A84C", color: "#020617" }}>
              开始建立画像 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Section: 画像包含什么 ═══ */}
      <section className="relative z-[2] mx-auto max-w-5xl px-6 pt-16">
        <h2 className="text-center font-serif text-2xl md:text-3xl text-white/75">你的命运画像包含</h2>
        <p className="mt-3 text-center text-[13px] text-white/35">五维交叉验证后，AI 生成一份结构化画像，分为五个模块</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "性格结构", desc: "内在优势与摩擦点——你如何与世界互动", tag: "八字 + 星盘" },
            { title: "事业方向", desc: "最佳发力领域与时机窗口——你的能量投向何处", tag: "八字 + 紫微" },
            { title: "关系模式", desc: "吸引与长期契合——在关系中看见自己", tag: "星盘 + 面相" },
            { title: "财富窗口", desc: "突破时机与节奏——不是数字，是流动感", tag: "八字 + 塔罗" },
            { title: "今日行动", desc: "今天能做的一件事——把分析变执行", tag: "全系统" },
            { title: "完整档案", desc: "自由追问、事件复盘、趋势追踪——画像持续生长", tag: "持续更新" },
          ].map((m, i) => (
            <div key={i} className="rounded-xl border border-white/[0.04] p-5 transition-all hover:border-white/[0.1]" style={{ background: "linear-gradient(135deg, #060E24, #030918)" }}>
              <span className="text-[10px] tracking-[0.12em] text-white/20">{m.tag}</span>
              <h3 className="mt-2 font-serif text-base text-white/70">{m.title}</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-white/35">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Section: 命运系统 ═══ */}
      <section className="relative z-[2] mx-auto max-w-5xl px-6 pt-16">
        <h2 className="text-center font-serif text-2xl md:text-3xl text-white/75">五大命运分析系统</h2>
        <p className="mt-3 text-center text-[13px] text-white/35">录入一份信息，AI 同步运行五个系统的交叉验证</p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { name: "八字", sub: "命盘起运", href: "/zh/bazi", free: true },
            { name: "紫微", sub: "十二宫排盘", href: "/zh/ziwei", free: true },
            { name: "星盘", sub: "七政四余", href: "/zh/astrology", free: true },
            { name: "塔罗", sub: "当下择问", href: "/zh/tarot", free: false },
            { name: "面相", sub: "五官十二宫", href: "/zh/face-reading", free: false },
          ].map((s, i) => (
            <Link key={i} href={s.href} className="group flex flex-col items-center gap-2 rounded-xl border border-white/[0.04] p-5 text-center transition-all hover:border-white/[0.12] hover:-translate-y-0.5" style={{ background: "linear-gradient(180deg, #060E24, #030918)" }}>
              {s.free && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>免费</span>}
              <span className="font-serif text-2xl text-white/70">{s.name}</span>
              <span className="text-[11px] text-white/30">{s.sub}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ Section: 三种入口 ═══ */}
      <section className="relative z-[2] mx-auto max-w-5xl px-6 pt-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "完整画像", desc: "五维全开，深度分析 → 输出画像 + 行动建议", href: "/zh/reading/new", cta: "建立画像" },
            { title: "单题快问", desc: "聚焦一个方向，短时高效获取 AI 解读", href: "/zh/reading/new?intent=quick", cta: "快速提问" },
            { title: "关系合参", desc: "两人命盘对照，交叉验证契合度与互补空间", href: "/zh/bazi/compatibility", cta: "合参分析" },
          ].map((p, i) => (
            <Link key={i} href={p.href} className="group flex flex-col rounded-xl border border-white/[0.05] p-6 transition-all hover:border-white/[0.15]" style={{ background: "linear-gradient(135deg, #060E24, #030918)" }}>
              <h3 className="font-serif text-lg text-white/75">{p.title}</h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-white/35">{p.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors" style={{ color: "#C9A84C" }}>{p.cta} →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ Section: Pricing + CTA ═══ */}
      <section className="relative z-[2] mx-auto max-w-5xl px-6 pt-16 pb-10">
        <div className="rounded-2xl border border-white/[0.06] p-8 md:p-12 text-center" style={{ background: "linear-gradient(135deg, #060E24, #030918)" }}>
          <p className="text-[11px] tracking-[0.2em] text-white/25 uppercase">PRICING</p>
          <h2 className="mt-3 font-serif text-3xl text-white/75">免费开始 · 按需付费</h2>
          <p className="mt-3 text-[14px] text-white/35 max-w-lg mx-auto">注册即赠 50 星尘。免费用户可体验全部系统。深度报告按次付费，无月费订阅。</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/zh/register" className="rounded-xl px-12 py-4 font-medium transition-all hover:scale-[1.02]" style={{ background: "#C9A84C", color: "#020617" }}>免费注册</Link>
            <Link href="/zh/pricing" className="rounded-xl border px-12 py-4 text-white/60 transition-all hover:text-white/80" style={{ borderColor: "rgba(255,255,255,0.15)" }}>查看定价</Link>
          </div>
        </div>
      </section>

      {/* ═══ PWA ═══ */}
      <section className="relative z-[2] mx-auto max-w-2xl px-6 pb-20 text-center">
        <p className="text-[11px] text-white/15">添加到手机桌面，像 App 一样使用。用手机浏览器访问 khanfate.com 即可。</p>
      </section>
    </div>
  )
}
