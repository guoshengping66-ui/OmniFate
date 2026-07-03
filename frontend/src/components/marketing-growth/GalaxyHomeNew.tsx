"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const TRIGRAMS = ["乾","兑","离","震","巽","坎","艮","坤"]

/* ── Natural random stars — NOT grid pattern ── */
function useStars(count: number) {
  return useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: (i * 37 + 13) % 100,
      top: 38 + ((i * 53 + 7) % 24),
      size: (i * 19 + 7) % 100 > 88 ? 2 : (i * 19 + 7) % 100 > 60 ? 1.3 : 0.7,
      opacity: 0.28 + ((i * 41 + 11) % 100) * 0.006,
      delay: ((i * 73 + 29) % 500) / 100,
    })), [count])
}

export default function GalaxyHomeNew() {
  const galaxyStars = useStars(280)

  return (
    <div className="w-full text-white" style={{ background: "#020617" }}>
      {/* ═══════════════ Layer 1: Cosmic base — subtle deep space glow ═══════════════ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{
        background:
          "radial-gradient(circle at 50% 35%, rgba(212,175,55,0.05), transparent 30%)," +
          "radial-gradient(circle at 50% 55%, rgba(38,90,110,0.14), transparent 45%)," +
          "linear-gradient(180deg, #050914 0%, #07101d 45%, #02050c 100%)",
        zIndex: 0,
      }} />

      {/* ═══════════════ Layer 1b: Background far stars — very subtle ═══════════════ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{
        backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.2) 0 1px, transparent 1.5px)",
        backgroundSize:"180px 140px",
        opacity:0.08,
        zIndex:0,
      }} />

      {/* ═══════════════ Layer 2: Milky Way System ═══════════════ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true" style={{ zIndex: 1 }}>
        {/* Diagonal Milky Way band — lower-left to upper-right */}
        <div style={{
          position:"absolute",
          left:"-18%", top:"30%",
          width:"140%", height:"420px",
          transform:"rotate(-12deg)",
          opacity:0.92,
          maskImage:"radial-gradient(ellipse at center, black 0%, black 35%, rgba(0,0,0,0.7) 50%, transparent 74%)",
          WebkitMaskImage:"radial-gradient(ellipse at center, black 0%, black 35%, rgba(0,0,0,0.7) 50%, transparent 74%)",
        }}>
          {/* ── Nebula clouds ── */}
          {/* Main nebula */}
          <div style={{
            position:"absolute", inset:0, mixBlendMode:"screen" as const,
            background:
              "radial-gradient(ellipse at 22% 52%, rgba(245,230,180,0.14), transparent 22%)," +
              "radial-gradient(ellipse at 42% 48%, rgba(218,180,74,0.18), transparent 20%)," +
              "radial-gradient(ellipse at 58% 55%, rgba(82,170,185,0.16), transparent 26%)," +
              "radial-gradient(ellipse at 76% 46%, rgba(255,245,210,0.11), transparent 18%)," +
              "linear-gradient(90deg, transparent 0%, rgba(90,150,160,0.10) 18%, rgba(218,180,74,0.14) 38%, rgba(245,230,180,0.15) 50%, rgba(60,140,160,0.11) 66%, transparent 100%)",
            filter:"blur(20px)",
          }} />
          {/* Gold nebula */}
          <div style={{
            position:"absolute", inset:0, mixBlendMode:"screen" as const,
            background:
              "radial-gradient(ellipse at 36% 50%, rgba(218,180,74,0.18), transparent 16%)," +
              "radial-gradient(ellipse at 53% 46%, rgba(255,225,145,0.15), transparent 14%)",
            filter:"blur(28px)", opacity:0.7,
          }} />
          {/* Cyan nebula */}
          <div style={{
            position:"absolute", inset:0, mixBlendMode:"screen" as const,
            background:
              "radial-gradient(ellipse at 62% 55%, rgba(45,150,170,0.18), transparent 22%)," +
              "radial-gradient(ellipse at 78% 48%, rgba(30,95,120,0.16), transparent 22%)",
            filter:"blur(32px)", opacity:0.75,
          }} />

          {/* ── Dark dust lanes ── */}
          <div style={{
            position:"absolute", left:0, top:"36%", width:"100%", height:"80px",
            background:
              "radial-gradient(ellipse at 30% 50%, rgba(2,5,12,0.55), transparent 28%)," +
              "radial-gradient(ellipse at 55% 50%, rgba(1,8,14,0.48), transparent 24%)," +
              "radial-gradient(ellipse at 72% 50%, rgba(3,10,18,0.42), transparent 24%)",
            filter:"blur(16px)", mixBlendMode:"multiply" as const, opacity:0.7,
            transform:"rotate(3deg) translateY(-8px)",
          }} />
          <div style={{
            position:"absolute", left:0, top:"52%", width:"100%", height:"70px",
            background:
              "radial-gradient(ellipse at 40% 50%, rgba(1,5,10,0.42), transparent 25%)," +
              "radial-gradient(ellipse at 60% 50%, rgba(2,6,12,0.38), transparent 25%)",
            filter:"blur(18px)", mixBlendMode:"multiply" as const, opacity:0.5,
            transform:"rotate(-4deg) translateY(8px)",
          }} />

          {/* ── Natural stars — concentrated in the band ── */}
          <div className="absolute inset-0" style={{ mixBlendMode:"screen" as const }}>
            {galaxyStars.map(star => (
              <span key={star.id} style={{
                position:"absolute",
                left:`${star.left}%`, top:`${star.top}%`,
                width:star.size, height:star.size,
                borderRadius:"999px",
                background:"rgba(255,235,180,0.9)",
                boxShadow: star.size > 1.5
                  ? "0 0 10px rgba(218,180,74,0.5), 0 0 20px rgba(218,180,74,0.2)"
                  : "0 0 4px rgba(218,180,74,0.35)",
                opacity:star.opacity,
                animation:`starTwinkle ${3+(star.id%3)*1.5}s ease-in-out ${star.delay}s infinite alternate`,
              }} />
            ))}
          </div>

          {/* ── Soft gold flow line along band center ── */}
          <div style={{
            position:"absolute", left:0, top:"46%", width:"100%", height:"60px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(218,180,74,0.04) 20%, rgba(255,221,125,0.10) 44%, rgba(90,190,200,0.06) 62%, transparent 100%)",
            filter:"blur(14px)", mixBlendMode:"screen" as const,
            transform:"skewY(-3deg)",
            animation:"goldFlow 22s ease-in-out infinite",
          }} />
        </div>
      </div>

      {/* ═══════════════ Layer 3: Tai Chi Bagua energy field ═══════════════ */}
      <div className="fixed left-1/2 pointer-events-none" aria-hidden="true" style={{
        width:"min(460px, 86vw)", height:"min(460px, 86vw)",
        top:"38%",
        transform:"translate(-50%, -50%) rotate(0deg)",
        opacity:0.2,
        zIndex:2,
        animation:"taijiSpin 80s linear infinite",
        filter:"drop-shadow(0 0 32px rgba(218,180,74,0.15))",
      }}>
        <div style={{
          position:"absolute", inset:0, borderRadius:"50%",
          border:"1px solid rgba(218,180,74,0.28)",
          boxShadow:"0 0 45px rgba(218,180,74,0.10), inset 0 0 38px rgba(80,180,190,0.06)",
        }} />
        <div style={{ position:"absolute", inset:"10%", borderRadius:"50%", border:"0.5px solid rgba(218,180,74,0.14)" }} />
        {TRIGRAMS.map((t, i) => {
          const a = (i/8)*360+22.5
          return <span key={i} className="absolute font-serif" style={{
            left:"50%",top:"50%",
            transform:`rotate(${a}deg) translateY(-44%) rotate(-${a}deg) translateX(-50%)`,
            color:"rgba(218,180,74,0.42)", fontSize:"clamp(10px, 1.2vw, 13px)",
          }}>{t}</span>
        })}
        <div style={{ position:"absolute", inset:"24%", borderRadius:"50%", border:"0.5px solid rgba(218,180,74,0.10)" }} />
        <div style={{
          position:"absolute", inset:"8%", display:"grid", placeItems:"center",
          fontSize:"clamp(70px, 11vw, 115px)", color:"rgba(218,180,74,0.42)",
        }}>☯</div>
      </div>

      {/* ═══════════════ Layer 4: Vignette ═══════════════ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{
        background:
          "radial-gradient(circle at 50% 45%, transparent 0%, transparent 34%, rgba(0,0,0,0.20) 74%)," +
          "linear-gradient(180deg, rgba(0,0,0,0.06), transparent 24%, transparent 58%, rgba(0,0,0,0.50))",
        zIndex:5,
      }} />

      {/* ═══ Inject keyframes ═══ */}
      <style>{`
        @keyframes taijiSpin { from { transform:translate(-50%,-50%) rotate(0deg) } to { transform:translate(-50%,-50%) rotate(360deg) } }
        @keyframes starTwinkle { from { transform:scale(0.8); opacity:0.3 } to { transform:scale(1.25); opacity:0.9 } }
        @keyframes goldFlow { 0% { transform:skewY(-3deg) translateX(-3%) } 50% { transform:skewY(-3deg) translateX(3%) } 100% { transform:skewY(-3deg) translateX(-3%) } }
        @media (prefers-reduced-motion:reduce) { .fixed { animation:none!important } }
      `}</style>

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
                  animation:"corePulse 3s ease-in-out infinite",
                }}>
                  <span className="font-serif text-2xl text-white/80">合</span>
                </div>
                <div className="absolute -inset-3 rounded-full border border-gold/15" style={{ animation:"ringSpin 8s linear infinite" }} />
                <div className="absolute -inset-6 rounded-full border border-gold/[0.06]" style={{ animation:"ringSpin 12s linear infinite reverse" }} />
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
      {/* Sections 3-6: same content */}
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
              <div className="flex items-center gap-3 mb-4"><span className="text-2xl font-serif text-white/15">{m.i}</span><span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor:m.c, color:m.c, opacity:0.7 }}>{m.tag}</span></div>
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
            <span className="text-[10px] tracking-[0.15em] text-white/20 mb-3">推荐入口</span><span className="text-4xl mb-4">🔮</span>
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
                  <span className="text-xl">{icon}</span><span className="text-[11px] text-white/55">{name}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.05] p-8" style={{ background:"linear-gradient(135deg, #060E24, #030918)" }}>
            <p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-6">TRUST</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[["10,000+","用户"],["4.9","评分"],["50,000+","报告已生成"]].map(([n, l]) => (
                <div key={l} className="text-center"><div className="font-serif text-3xl" style={{ color:"#C9A84C" }}>{n}</div><div className="text-[11px] text-white/25 mt-1">{l}</div></div>
              ))}
            </div>
            <div className="space-y-4">
              {[["真正让我看清了自己的底层模式，不是告知结局，而是理解结构。","林小姐 · 96分"],["AI 交叉验证让各个系统的结论互相印证或反驳——这比单一系统靠谱得多。","陈先生 · 98分"]].map(([text, name], i) => (
                <div key={i} className="border-l-2 border-white/[0.06] pl-4"><p className="text-[13px] leading-relaxed text-white/45">&ldquo;{text}&rdquo;</p><p className="text-[11px] text-white/20 mt-2">{name}</p></div>
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
