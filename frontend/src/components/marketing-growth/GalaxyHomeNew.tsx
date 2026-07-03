"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const TRIGRAMS = ["乾","兑","离","震","巽","坎","艮","坤"]

export default function GalaxyHomeNew() {
  useEffect(() => {
    const s = document.createElement("style")
    s.textContent = `
      @keyframes taijiRotate { from { transform:translate(-50%,-50%) rotate(0deg) } to { transform:translate(-50%,-50%) rotate(360deg) } }
      @keyframes goldFlow { 0% { transform:translateX(-5%) skewY(-4deg) } 50% { transform:translateX(5%) skewY(-4deg) } 100% { transform:translateX(-5%) skewY(-4deg) } }
      @media (prefers-reduced-motion:reduce) { .taiji-field, .gold-dust-flow { animation:none!important } }
    `
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])

  return (
    <div className="w-full text-white" style={{ background: "#020617" }}>
      {/* ═══════════════════════════════════════ */}
      {/* Layer 1: Cosmic base */}
      {/* ═══════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{
        background:
          "radial-gradient(circle at 50% 35%, rgba(212,175,55,0.06), transparent 32%)," +
          "radial-gradient(circle at 50% 58%, rgba(38,90,110,0.18), transparent 48%)," +
          "linear-gradient(180deg, #050914 0%, #07101d 45%, #02050c 100%)",
        zIndex: 0,
      }} />

      {/* ═══════════════════════════════════════ */}
      {/* Layer 2: Distant galaxy mist bands (depth, like Qingnang layers) */}
      {/* ═══════════════════════════════════════ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true" style={{ zIndex: 1 }}>
        <div className="absolute" style={{
          left:"-10%", width:"120%", height:220, top:"30%",
          borderRadius:"50%",
          background:
            "radial-gradient(ellipse at center, rgba(70,150,160,0.08), transparent 65%)," +
            "radial-gradient(ellipse at 45% 50%, rgba(218,180,74,0.06), transparent 50%)",
          filter:"blur(34px)",
          opacity:0.4,
          transform:"rotate(2deg)",
        }} />
        <div className="absolute" style={{
          left:"-10%", width:"120%", height:240, top:"52%",
          borderRadius:"50%",
          background:
            "radial-gradient(ellipse at center, rgba(50,120,140,0.06), transparent 60%)," +
            "radial-gradient(ellipse at 55% 50%, rgba(218,180,74,0.05), transparent 55%)",
          filter:"blur(40px)",
          opacity:0.3,
          transform:"rotate(-3deg)",
        }} />
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* Layer 3: Main Milky Way band */}
      {/* ═══════════════════════════════════════ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true" style={{ zIndex: 2 }}>
        {/* Milky Way container — horizontal fog ellipse */}
        <div className="milky-way-band" style={{
          position:"absolute",
          left:"-10%", top:"38%",
          width:"120%", height:"340px",
          transform:"rotate(-1.5deg)",
          opacity:0.95,
          maskImage:"radial-gradient(ellipse at center, black 0%, black 42%, transparent 76%)",
          WebkitMaskImage:"radial-gradient(ellipse at center, black 0%, black 42%, transparent 76%)",
        }}>
          {/* Nebula core — the foggy glow */}
          <div style={{
            position:"absolute", inset:0,
            background:
              "radial-gradient(ellipse at 35% 48%, rgba(218,180,74,0.16), transparent 26%)," +
              "radial-gradient(ellipse at 55% 52%, rgba(92,180,190,0.18), transparent 32%)," +
              "radial-gradient(ellipse at 70% 46%, rgba(255,230,160,0.10), transparent 20%)," +
              "linear-gradient(90deg," +
              "  transparent 0%," +
              "  rgba(38,92,105,0.10) 16%," +
              "  rgba(116,138,118,0.18) 38%," +
              "  rgba(218,180,74,0.14) 52%," +
              "  rgba(43,116,130,0.14) 70%," +
              "  transparent 100%" +
              ")",
            filter:"blur(24px)",
          }} />

          {/* Star dust layer A — dense tiny dots */}
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,235,170,0.9) 0 1px, transparent 1.6px)," +
              "radial-gradient(circle, rgba(255,255,255,0.5) 0 1px, transparent 1.5px)," +
              "radial-gradient(circle, rgba(126,210,220,0.4) 0 1px, transparent 1.8px)",
            backgroundSize:"38px 26px, 61px 41px, 97px 66px",
            backgroundPosition:"0 0, 20px 12px, 44px 26px",
            opacity:0.5,
            filter:"blur(0.2px)",
          }} />

          {/* Star dust layer B — finer grain */}
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,218,105,0.7) 0 0.7px, transparent 1.3px)," +
              "radial-gradient(circle, rgba(255,255,255,0.3) 0 0.6px, transparent 1.2px)",
            backgroundSize:"18px 14px, 29px 22px",
            opacity:0.25,
            filter:"blur(0.6px)",
          }} />

          {/* Gold dust flow — soft bright band along the Milky Way */}
          <div className="gold-dust-flow" style={{
            position:"absolute", left:0, top:"44%",
            width:"100%", height:"80px",
            background:
              "linear-gradient(90deg," +
              "  transparent 0%," +
              "  rgba(218,180,74,0.04) 18%," +
              "  rgba(255,221,125,0.18) 42%," +
              "  rgba(90,190,200,0.10) 60%," +
              "  transparent 100%" +
              ")",
            filter:"blur(16px)",
            transform:"skewY(-4deg)",
            animation:"goldFlow 20s ease-in-out infinite",
          }} />
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* Layer 4: Tai Chi Bagua — large energy field behind title */}
      {/* ═══════════════════════════════════════ */}
      <div className="taiji-field fixed left-1/2 pointer-events-none" aria-hidden="true" style={{
        width:"min(420px, 84vw)", height:"min(420px, 84vw)",
        top:"38%",
        transform:"translate(-50%, -50%)",
        opacity:0.2,
        zIndex:3,
        animation:"taijiRotate 80s linear infinite",
        filter:"drop-shadow(0 0 32px rgba(218,180,74,0.18))",
      }}>
        {/* Outer ring with glow */}
        <div style={{
          position:"absolute", inset:0,
          border:"1px solid rgba(218,180,74,0.3)",
          borderRadius:"50%",
          boxShadow:"0 0 40px rgba(218,180,74,0.10), inset 0 0 36px rgba(92,180,190,0.08)",
        }} />
        {/* Middle ring */}
        <div style={{
          position:"absolute", inset:"10%",
          border:"0.5px solid rgba(218,180,74,0.15)",
          borderRadius:"50%",
        }} />
        {/* Bagua marks on ring */}
        {TRIGRAMS.map((t, i) => {
          const a = (i/8)*360+22.5
          return (
            <span key={i} className="absolute font-serif" style={{
              left:"50%",top:"50%",
              transform:`rotate(${a}deg) translateY(-45%) rotate(-${a}deg) translateX(-50%)`,
              color:"rgba(218,180,74,0.45)",
              fontSize:"clamp(10px, 1.2vw, 13px)",
            }}>{t}</span>
          )
        })}
        {/* Inner ring */}
        <div style={{
          position:"absolute", inset:"24%",
          border:"0.5px solid rgba(218,180,74,0.1)",
          borderRadius:"50%",
        }} />
        {/* Tai Chi symbol */}
        <div style={{
          position:"absolute", inset:"8%",
          display:"grid", placeItems:"center",
          fontSize:"clamp(70px, 11vw, 120px)",
          color:"rgba(218,180,74,0.38)",
        }}>☯</div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* Layer 5: Vignette */}
      {/* ═══════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{
        background:
          "radial-gradient(circle at 50% 45%, transparent 0%, transparent 36%, rgba(0,0,0,0.22) 76%)," +
          "linear-gradient(180deg, rgba(0,0,0,0.08), transparent 26%, transparent 60%, rgba(0,0,0,0.55))",
        zIndex: 5,
      }} />

      {/* ═══════════════════════════════════════ */}
      {/* Hero Content */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative flex min-h-[88vh] w-full flex-col items-center justify-center px-6 text-center" style={{ zIndex: 10 }}>
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

      {/* ═══════════════════════════════════════ */}
      {/* Section 1: 五大命运系统 */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative mx-auto max-w-6xl px-6 pt-24" style={{ zIndex: 10 }}>
        <div className="mb-12">
          <p className="text-[11px] tracking-[0.2em] text-white/20 uppercase">DESTINY SYSTEMS</p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl text-white/80">五大分析系统</h2>
          <p className="mt-3 text-[14px] text-white/35 max-w-xl">不是单一命理工具——八字、紫微、星盘、塔罗、面相同步运行，AI 交叉验证，输出一致结论</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { n:"八字", q:"底层结构", a:"你的长期节奏与人生框架", c:"#5A9E8E", free:true },
            { n:"紫微", q:"能量周期", a:"十二宫主星分布与大限流年", c:"#8B7EC7", free:true },
            { n:"星盘", q:"心理模式", a:"七政四余恒星制，论先天格局", c:"#7B9EC7", free:true },
            { n:"塔罗", q:"当下选择", a:"聚焦此刻的压力与决策方向", c:"#C77B8B", free:false },
            { n:"面相", q:"行为印象", a:"五官十二宫，看禀赋与气质", c:"#C4BFB0", free:false },
          ].map((s, i) => (
            <Link key={i} href={`/zh${s.n==="八字"?"/bazi":s.n==="紫微"?"/ziwei":s.n==="星盘"?"/astrology":s.n==="塔罗"?"/tarot":"/face-reading"}`}
              className="group flex flex-col rounded-xl border border-white/[0.04] overflow-hidden transition-all hover:-translate-y-1"
              style={{ background:"linear-gradient(180deg, #060E24 0%, #030918 100%)" }}
            >
              <div className="h-1 w-full transition-all group-hover:h-1.5" style={{ background:s.c }} />
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-serif text-xl text-white/75">{s.n}</span>
                  {s.free && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:"rgba(201,168,76,0.1)", color:"#C9A84C" }}>免费</span>}
                </div>
                <p className="text-[10px] tracking-[0.12em] text-white/25 mb-1.5">{s.q}</p>
                <p className="text-[12px] leading-relaxed text-white/35 flex-1">{s.a}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* Section 2: AI 交叉验证 */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20" style={{ zIndex: 10 }}>
        <div className="rounded-2xl border border-white/[0.05] p-8 md:p-14" style={{ background:"linear-gradient(135deg, #060E24 0%, #030918 100%)" }}>
          <div className="grid gap-10 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div className="space-y-3">
              <p className="text-[10px] tracking-[0.15em] text-white/20 mb-4">INPUT · 同步采集</p>
              {["生辰八字","出生地点","面相照片","手相照片","当前问题"].map((inp, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-2.5" style={{ background:"rgba(255,255,255,0.02)" }}>
                  <span className="text-[10px] text-white/20 w-5">{`0${i+1}`}</span>
                  <span className="text-[13px] text-white/50">{inp}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center" style={{
                  background:"radial-gradient(circle, rgba(201,168,76,0.25) 0%, rgba(201,168,76,0.06) 50%, transparent 70%)",
                  boxShadow:"0 0 50px rgba(201,168,76,0.15)",
                  animation:"taijiRotate 3s ease-in-out infinite",
                }}>
                  <span className="font-serif text-2xl text-white/80">合</span>
                </div>
                <div className="absolute -inset-3 rounded-full border border-gold/15" style={{ animation:"taijiRotate 8s linear infinite" }} />
                <div className="absolute -inset-6 rounded-full border border-gold/[0.06]" style={{ animation:"taijiRotate 12s linear infinite reverse" }} />
              </div>
              <p className="font-serif text-lg text-white/70">AI 合参引擎</p>
              <p className="text-[12px] text-white/30 text-center max-w-[180px]">五系统交叉验证<br/>逐项比对冲突与一致</p>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] tracking-[0.15em] text-white/20 mb-4">OUTPUT · 画像输出</p>
              {["性格结构","事业方向","关系模式","财富窗口","今日行动"].map((out, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-3 transition-all hover:border-white/[0.1]" style={{ background:"rgba(255,255,255,0.02)" }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:i===0?"#5A9E8E":i===1?"#7B9EC7":i===2?"#C77B8B":i===3?"#C9A84C":"#8B7EC7" }} />
                  <span className="text-[13px] text-white/50">{out}</span>
                  <span className="ml-auto text-[10px] text-white/15">{95-i*3}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* Section 3-6: same as before */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20" style={{ zIndex: 10 }}>
        <div className="mb-12">
          <p className="text-[11px] tracking-[0.2em] text-white/20 uppercase">YOUR DOSSIER</p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl text-white/80">你的命运画像</h2>
          <p className="mt-3 text-[14px] text-white/35 max-w-xl">AI 生成一份结构化画像，五个模块——从内在结构到今日行动</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { i:"01", t:"性格结构", d:"深度解析你的先天禀赋与行为倾向。八字日主、紫微命宫主星、星盘上升星座——三个系统交叉定位你的核心人格特质，识别优势与摩擦点。", tag:"八字+紫微+星盘", c:"#5A9E8E" },
            { i:"02", t:"事业方向", d:"AI 分析你的能量走向与发力时机。不是告诉你去做什么职业——而是识别你的最佳工作节奏、阶段性窗口和避坑方向。", tag:"八字+星盘", c:"#7B9EC7" },
            { i:"03", t:"关系模式", d:"你在亲密关系、合作关系中的底层驱动模式。两盘对照，看吸引与长期契合度。输出不是标签，是理解自己如何与他人互动。", tag:"紫微+面相", c:"#C77B8B" },
            { i:"04", t:"财富窗口", d:"命理财运 ≠ 银行数字。识别你的能量流动感、阶段性的突破机会、以及需要防守的时期。结合八字财星与大限流年交叉验证。", tag:"八字+紫微", c:"#C9A84C" },
            { i:"05", t:"生活方式", d:"基于五官面相与星盘行星分布，生成匹配的日常仪式感建议——从睡眠节律到工作环境，从香气到颜色偏好。", tag:"面相+星盘", c:"#8B7EC7" },
            { i:"06", t:"今日行动", d:"画像的最终输出——今天可以做的一件事。小到一次对话的节奏，大到一段关系的取舍。把分析变成执行。", tag:"全系统", c:"#E8CB7A" },
          ].map((m, i) => (
            <div key={i} className="group rounded-xl border border-white/[0.04] p-6 transition-all hover:border-white/[0.1]" style={{ background:"linear-gradient(135deg, #060E24, #030918)" }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-serif text-white/15">{m.i}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor:m.c, color:m.c, opacity:0.7 }}>{m.tag}</span>
              </div>
              <h3 className="font-serif text-lg text-white/75 mb-2">{m.t}</h3>
              <p className="text-[12px] leading-relaxed text-white/35">{m.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pt-20" style={{ zIndex: 10 }}>
        <p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-3">GET STARTED</p>
        <h2 className="font-serif text-3xl md:text-4xl text-white/80">选择你的入口</h2>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <Link href="/zh/reading/new" className="group flex flex-col rounded-2xl border-2 p-7 transition-all hover:-translate-y-1" style={{ borderColor:"rgba(201,168,76,0.3)", background:"linear-gradient(135deg, #0A1228, #030918)" }}>
            <span className="text-[10px] tracking-[0.15em] text-white/20 mb-3">推荐入口</span>
            <span className="text-4xl mb-4">🔮</span>
            <h3 className="font-serif text-2xl text-white/80 mb-2">完整画像</h3>
            <p className="text-[13px] leading-relaxed text-white/35 flex-1">五系统全开，AI 深度交叉验证。获取完整命运画像 + 今日行动建议。适合第一次了解自己的用户。</p>
            <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium" style={{ color:"#C9A84C" }}>建立我的画像 →</span>
          </Link>
          <Link href="/zh/reading/new?intent=quick" className="group flex flex-col rounded-2xl border border-white/[0.05] p-7 transition-all hover:border-white/[0.15] hover:-translate-y-0.5" style={{ background:"linear-gradient(135deg, #060E24, #030918)" }}>
            <span className="text-3xl mb-4">⚡</span>
            <h3 className="font-serif text-xl text-white/70 mb-2">单题快问</h3>
            <p className="text-[13px] leading-relaxed text-white/35 flex-1">聚焦一个方向，快速获取 AI 解读。适合有明确问题的用户，短时高效。</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-white/35 group-hover:text-white/55 transition-colors">快速提问 →</span>
          </Link>
          <Link href="/zh/bazi/compatibility" className="group flex flex-col rounded-2xl border border-white/[0.05] p-7 transition-all hover:border-white/[0.15] hover:-translate-y-0.5" style={{ background:"linear-gradient(135deg, #060E24, #030918)" }}>
            <span className="text-3xl mb-4">💫</span>
            <h3 className="font-serif text-xl text-white/70 mb-2">关系合参</h3>
            <p className="text-[13px] leading-relaxed text-white/35 flex-1">两人命盘对照分析，AI 交叉验证契合度与互补空间。适合情侣、合伙人、家庭成员。</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-white/35 group-hover:text-white/55 transition-colors">合参分析 →</span>
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pt-20" style={{ zIndex: 10 }}>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.05] p-8" style={{ background:"linear-gradient(135deg, #060E24, #030918)" }}>
            <p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-3">TREASURE HALL</p>
            <h3 className="font-serif text-2xl text-white/75 mb-2">命运藏宝阁</h3>
            <p className="text-[13px] text-white/35 mb-6">AI 根据你的画像匹配生活好物——不是随机推荐，每一步都有依据</p>
            <div className="grid grid-cols-3 gap-3">
              {[["💎","灵石晶品"],["🎐","香道雅韵"],["📿","护符配饰"],["📖","古籍典藏"],["🕯️","仪式定制"],["🌿","生活方式"]].map(([icon, name], i) => (
                <Link key={i} href="/zh/shop" className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.04] p-4 text-center transition-all hover:border-white/[0.1]" style={{ background:"rgba(255,255,255,0.015)" }}>
                  <span className="text-xl">{icon}</span>
                  <span className="text-[11px] text-white/55">{name}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.05] p-8" style={{ background:"linear-gradient(135deg, #060E24, #030918)" }}>
            <p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-6">TRUST</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[["10,000+","用户"],["4.9","评分"],["50,000+","报告已生成"]].map(([n, l]) => (
                <div key={l} className="text-center">
                  <div className="font-serif text-3xl" style={{ color:"#C9A84C" }}>{n}</div>
                  <div className="text-[11px] text-white/25 mt-1">{l}</div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[["真正让我看清了自己的底层模式，不是告知结局，而是理解结构。","林小姐 · 96分"],["AI 交叉验证让各个系统的结论互相印证或反驳——这比单一系统靠谱得多。","陈先生 · 98分"]].map(([text, name], i) => (
                <div key={i} className="border-l-2 border-white/[0.06] pl-4">
                  <p className="text-[13px] leading-relaxed text-white/45">&ldquo;{text}&rdquo;</p>
                  <p className="text-[11px] text-white/20 mt-2">{name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-4xl px-6 pt-20 pb-20" style={{ zIndex: 10 }}>
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-3">PRICING</p>
          <h2 className="font-serif text-3xl md:text-4xl text-white/80">清晰的定价，没有隐藏费用</h2>
          <p className="mt-3 text-[14px] text-white/35">免费开始，按需付费。注册即赠 50 星尘。</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { name:"免费版", price:"¥0", desc:"体验全部系统\n基础预览功能", cta:"免费注册", to:"/zh/register", hl:false },
            { name:"深度报告", price:"按次", desc:"完整五维画像\n单次解锁 · 永久可查", cta:"建立画像", to:"/zh/reading/new", hl:true },
            { name:"星尘充值", price:"灵活", desc:"按需充值\n充越多赠越多", cta:"查看定价", to:"/zh/pricing", hl:false },
          ].map((p, i) => (
            <Link key={i} href={p.to}
              className={`group flex flex-col items-center text-center rounded-2xl p-7 transition-all hover:-translate-y-1 ${p.hl?"border-2":"border"}`}
              style={{
                borderColor:p.hl?"rgba(201,168,76,0.3)":"rgba(255,255,255,0.05)",
                background:p.hl?"linear-gradient(135deg, #0A1228, #030918)":"linear-gradient(135deg, #060E24, #030918)",
              }}
            >
              <span className="text-[11px] tracking-[0.15em] text-white/25 mb-3">{p.name}</span>
              <span className="font-serif text-4xl mb-3" style={{ color:p.hl?"#C9A84C":"rgba(255,255,255,0.6)" }}>{p.price}</span>
              <p className="text-[12px] leading-relaxed text-white/30 flex-1 mb-5 whitespace-pre-line">{p.desc}</p>
              <span className={`rounded-xl px-8 py-3 text-[14px] font-medium transition-all ${p.hl?"":"border"}`} style={p.hl?{background:"#C9A84C",color:"#020617"}:{borderColor:"rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.6)"}}>{p.cta}</span>
            </Link>
          ))}
        </div>
        <p className="text-center text-[11px] text-white/15 mt-6">添加到手机桌面，像 App 一样使用。用手机浏览器访问 khanfate.com 即可。</p>
      </section>
    </div>
  )
}
