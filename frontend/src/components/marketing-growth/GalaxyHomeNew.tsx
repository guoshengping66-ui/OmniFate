"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const TRIGRAMS = ["乾","兑","离","震","巽","坎","艮","坤"]

/* ── Seeded PRNG ── */
function srng(s: number) { let v = s; return () => { v = (v * 16807 + 0) % 2147483647; return (v - 1) / 2147483646 } }

/* ── Generate 1200+ stars as box-shadow string (single element, no DOM bloat) ── */
function makeGalaxyBoxShadow(): string {
  const r = srng(137)
  const shadows: string[] = []
  for (let i = 0; i < 1300; i++) {
    const x = r() * 100; const coreBias = r(); const y = 50 + (r() - 0.5) * (coreBias < 0.78 ? 28 : 65)
    const rr = r(); const size = rr > 0.965 ? 2.2 : rr > 0.78 ? 1.2 : 0.55
    const op = rr > 0.88 ? 0.9 : 0.25 + r() * 0.5
    const color = rr > 0.72 ? "rgba(255,218,120," + op.toFixed(2) + ")" : rr > 0.46 ? "rgba(130,225,235," + (op * 0.7).toFixed(2) + ")" : "rgba(255,248,220," + (op * 0.8).toFixed(2) + ")"
    shadows.push(`${x.toFixed(1)}px ${y.toFixed(1)}px 0 ${size.toFixed(1)}px ${color}`)
  }
  return shadows.join(",")
}

const GALAXY_SHADOW = makeGalaxyBoxShadow()

/* ── Bilingual content ── */
const SYSTEMS = [
  { n:"八字", nEn:"Bazi", q:"底层结构", qEn:"Structure", a:"你的长期节奏与人生框架", aEn:"Your long-term rhythm and life framework", c:"#5A9E8E", free:true },
  { n:"紫微", nEn:"Ziwei", q:"能量周期", qEn:"Cycles", a:"十二宫主星分布与大限流年", aEn:"12-palace star distribution and decade luck", c:"#8B7EC7", free:true },
  { n:"星盘", nEn:"Astrology", q:"心理模式", qEn:"Patterns", a:"七政四余恒星制，论先天格局", aEn:"Sidereal chart, innate configuration", c:"#7B9EC7", free:true },
  { n:"塔罗", nEn:"Tarot", q:"当下选择", qEn:"Choice", a:"聚焦此刻的压力与决策方向", aEn:"Current pressure and decision focus", c:"#C77B8B", free:false },
  { n:"面相", nEn:"Face", q:"行为印象", qEn:"Impression", a:"五官十二宫，看禀赋与气质", aEn:"Five features, 12 palaces — temperament reading", c:"#C4BFB0", free:false },
]
const INPUTS = { zh: ["生辰八字","出生地点","面相照片","手相照片","当前问题"], en: ["Birth date & time","Birth location","Face photo","Palm photo","Your question"] }
const OUTPUTS = { zh: ["性格结构","事业方向","关系模式","财富窗口","今日行动"], en: ["Personality","Career","Relationships","Wealth window","Daily action"] }
const DOSSIER = {
  zh: [{ i:"01", t:"性格结构", d:"八字日主、紫微命宫主星、星盘上升星座——三个系统交叉定位核心人格特质。", tag:"八字+紫微+星盘", c:"#5A9E8E" },{ i:"02", t:"事业方向", d:"AI 分析能量走向与发力时机。识别最佳工作节奏、阶段性窗口和避坑方向。", tag:"八字+星盘", c:"#7B9EC7" },{ i:"03", t:"关系模式", d:"亲密关系与合作关系中的底层驱动模式。两盘对照看吸引与契合度。", tag:"紫微+面相", c:"#C77B8B" },{ i:"04", t:"财富窗口", d:"识别能量流动感、突破机会、防守时期。八字财星与大限流年交叉验证。", tag:"八字+紫微", c:"#C9A84C" },{ i:"05", t:"生活方式", d:"面相与星盘生成的日常仪式感建议——睡眠节律、工作环境、香气偏好。", tag:"面相+星盘", c:"#8B7EC7" },{ i:"06", t:"今日行动", d:"画像的最终输出——今天可以做的一件事。把分析变成执行。", tag:"全系统", c:"#E8CB7A" }],
  en: [{ i:"01", t:"Personality", d:"Bazi Day Master + Ziwei Life Palace star + Astrology Ascendant — three systems cross-position core traits.", tag:"Bazi+Ziwei+Astro", c:"#5A9E8E" },{ i:"02", t:"Career", d:"AI maps energy direction and timing. Identifies optimal work rhythm, phase windows, and pitfalls.", tag:"Bazi+Astrology", c:"#7B9EC7" },{ i:"03", t:"Relationships", d:"Core drive in intimacy and partnership — two charts compared for attraction and long-term fit.", tag:"Ziwei+Face", c:"#C77B8B" },{ i:"04", t:"Wealth Window", d:"Energy flow, phase breakthroughs, and defense periods — validated with Bazi wealth stars.", tag:"Bazi+Ziwei", c:"#C9A84C" },{ i:"05", t:"Lifestyle", d:"Daily rituals matched to profile — from sleep rhythm to workspace, scent to color preferences.", tag:"Face+Astro", c:"#8B7EC7" },{ i:"06", t:"Daily Action", d:"The final output — one thing you can do today. Turn analysis into execution.", tag:"All Systems", c:"#E8CB7A" }],
}
const ENTRIES = {
  zh: [{ t:"完整画像", d:"五系统全开，AI 深度交叉验证。获取完整命运画像 + 今日行动建议。", cta:"建立我的画像 →", to:"/reading/new", hl:true, badge:"推荐入口", icon:"🔮" },{ t:"单题快问", d:"聚焦一个方向，快速获取 AI 解读。适合有明确问题的用户。", cta:"快速提问 →", to:"/reading/new?intent=quick", hl:false, badge:"", icon:"⚡" },{ t:"关系合参", d:"两人命盘对照分析，AI 交叉验证契合度与互补空间。", cta:"合参分析 →", to:"/bazi/compatibility", hl:false, badge:"", icon:"💫" }],
  en: [{ t:"Full Profile", d:"All five systems. Deep AI cross-validation. Full destiny profile + daily action.", cta:"Build My Profile →", to:"/reading/new", hl:true, badge:"Recommended", icon:"🔮" },{ t:"Quick Read", d:"Focus on one area. Fast AI insight for users with a clear question.", cta:"Quick Read →", to:"/reading/new?intent=quick", hl:false, badge:"", icon:"⚡" },{ t:"Synastry", d:"Two charts compared. AI cross-validates compatibility and complementary space.", cta:"Synastry →", to:"/bazi/compatibility", hl:false, badge:"", icon:"💫" }],
}
const TREASURE = { zh: [["💎","灵石晶品"],["🎐","香道雅韵"],["📿","护符配饰"],["📖","古籍典藏"],["🕯️","仪式定制"],["🌿","生活方式"]], en: [["💎","Crystals"],["🎐","Incense"],["📿","Talismans"],["📖","Scriptures"],["🕯️","Rituals"],["🌿","Lifestyle"]] }
const T_DATA = { zh: { u:"10,000+",r:"4.9",rp:"50,000+",ul:"用户",rl:"评分",rpl:"报告已生成",t1:"真正让我看清了自己的底层模式，不是告知结局，而是理解结构。",n1:"林小姐 · 96分",t2:"AI 交叉验证让各个系统的结论互相印证或反驳——这比单一系统靠谱得多。",n2:"陈先生 · 98分"}, en: { u:"10,000+",r:"4.9",rp:"50,000+",ul:"Users",rl:"Rating",rpl:"Reports",t1:"It showed me my underlying patterns — not a fixed ending, but understanding the structure.",n1:"Ms. Lin · 96",t2:"Cross-validation lets systems confirm or contradict each other — far more reliable than a single source.",n2:"Mr. Chen · 98"} }
const PRICING = { zh: [{ name:"免费版", price:"¥0", desc:"体验全部系统\n基础预览功能", cta:"免费注册", hl:false },{ name:"深度报告", price:"按次", desc:"完整五维画像\n单次解锁 · 永久可查", cta:"建立画像", hl:true },{ name:"星尘充值", price:"灵活", desc:"按需充值\n充越多赠越多", cta:"查看定价", hl:false }], en: [{ name:"Free", price:"Free", desc:"All systems\nBasic preview", cta:"Sign Up", hl:false },{ name:"Deep Report", price:"Per-use", desc:"Full 5D profile\nOne-time · Permanent", cta:"Build Profile", hl:true },{ name:"Top-up", price:"Flexible", desc:"Pay as you go\nMore = bonus", cta:"Pricing", hl:false }] }

export default function GalaxyHomeNew() {
  const { locale, localeHref } = useLanguage()
  const isZh = locale === "zh"
  const inputs = isZh ? INPUTS.zh : INPUTS.en
  const outputs = isZh ? OUTPUTS.zh : OUTPUTS.en
  const dossier = isZh ? DOSSIER.zh : DOSSIER.en
  const entries = isZh ? ENTRIES.zh : ENTRIES.en
  const treasure = isZh ? TREASURE.zh : TREASURE.en
  const td = isZh ? T_DATA.zh : T_DATA.en
  const pricing = isZh ? PRICING.zh : PRICING.en
  const kf = `@keyframes taijiSpin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}@keyframes ringSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes starPulse{0%,100%{opacity:.25}50%{opacity:.7}}@keyframes coreBreathe{0%,100%{opacity:.88}50%{opacity:1}}@keyframes dustFlow1{0%,100%{transform:translateX(0) rotate(2deg)}50%{transform:translateX(14px) rotate(2deg)}}@keyframes dustFlow2{0%,100%{transform:translateX(0) rotate(-3deg)}50%{transform:translateX(-12px) rotate(-3deg)}}@keyframes goldStream{0%{opacity:.4;transform:skewY(-3deg) translateX(-3%)}50%{opacity:.7;transform:skewY(-3deg) translateX(3%)}100%{opacity:.4;transform:skewY(-3deg) translateX(-3%)}}@keyframes nebBreathe{0%,100%{opacity:.65}50%{opacity:.78}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}`

  return (
    <div className="w-full text-white" style={{ background: "#02050d" }}>
      {/* ═══ L0: Deep space ═══ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ background:"radial-gradient(circle at 50% 34%, rgba(218,180,74,0.04), transparent 26%), radial-gradient(circle at 66% 46%, rgba(24,88,116,0.12), transparent 34%), radial-gradient(circle at 22% 66%, rgba(86,66,28,0.08), transparent 32%), radial-gradient(circle at 50% 100%, rgba(0,0,0,0.92), transparent 42%), linear-gradient(180deg, #02050d 0%, #06101b 42%, #02040a 100%)", zIndex:0 }} />

      {/* ═══ L1: Far stars — sparse ═══ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ zIndex:1, backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.35) 0 1px, transparent 1.5px)", backgroundSize:"160px 120px", opacity:.10 }} />

      {/* ═══ L2: Deep nebula clouds ═══ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ zIndex:2 }}><div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 24% 60%, rgba(120,88,36,0.08), transparent 34%), radial-gradient(ellipse at 72% 44%, rgba(42,130,155,0.10), transparent 36%), radial-gradient(ellipse at 50% 38%, rgba(218,180,74,0.03), transparent 28%)", filter:"blur(40px)", opacity:.65, mixBlendMode:"screen" as const, animation:"nebBreathe 14s ease-in-out infinite" }} /></div>

      {/* ═══ L3: Milky Way Core — 620px thick band ═══ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true" style={{ zIndex:3 }}>
        <div style={{ position:"absolute", left:"-26%", top:"16%", width:"160%", height:"620px", transform:"rotate(-14deg)", opacity:1,
          maskImage:"radial-gradient(ellipse at center, black 0%, black 32%, rgba(0,0,0,0.75) 50%, transparent 82%)",
          WebkitMaskImage:"radial-gradient(ellipse at center, black 0%, black 32%, rgba(0,0,0,0.75) 50%, transparent 82%)" }}>

          {/* 3a: Bridge glow — connects left gold to right cyan */}
          <div style={{ position:"absolute", left:0, top:"40%", width:"100%", height:"190px", background:"linear-gradient(90deg, rgba(218,180,74,0.08) 0%, rgba(255,238,190,0.16) 36%, rgba(70,170,190,0.14) 66%, rgba(30,90,120,0.06) 100%)", filter:"blur(26px)", mixBlendMode:"screen" as const, opacity:.78, zIndex:0 }} />

          {/* 3b: Luminous core — warm ivory + dark gold */}
          <div style={{ position:"absolute", left:"16%", top:"36%", width:"68%", height:"220px", background:"radial-gradient(ellipse at 28% 50%, rgba(255,220,135,0.22), transparent 22%), radial-gradient(ellipse at 46% 48%, rgba(255,248,220,0.20), transparent 20%), radial-gradient(ellipse at 61% 52%, rgba(218,180,74,0.18), transparent 22%), radial-gradient(ellipse at 74% 48%, rgba(70,170,190,0.16), transparent 26%), linear-gradient(90deg, transparent 0%, rgba(218,180,74,0.12) 18%, rgba(255,245,210,0.22) 46%, rgba(70,170,190,0.14) 72%, transparent 100%)", filter:"blur(20px)", mixBlendMode:"screen" as const, opacity:.95, zIndex:1, animation:"coreBreathe 7s ease-in-out infinite" }} />

          {/* 3c: Star cluster — 1300 stars via single box-shadow element */}
          <div style={{ position:"absolute", inset:0, zIndex:2 }}>
            <div style={{ position:"absolute", left:0, top:0, width:1, height:1, borderRadius:"50%", boxShadow:GALAXY_SHADOW, animation:"starPulse 4s ease-in-out infinite" }} />
          </div>

          {/* 3d: Dark dust lanes — 3 cuts */}
          <div style={{ position:"absolute", left:"6%", top:"34%", width:"88%", height:"110px", background:"radial-gradient(ellipse at 16% 50%, rgba(0,3,9,0.72), transparent 28%), radial-gradient(ellipse at 38% 48%, rgba(1,7,14,0.64), transparent 32%), radial-gradient(ellipse at 62% 52%, rgba(2,9,16,0.58), transparent 28%), radial-gradient(ellipse at 84% 50%, rgba(0,4,10,0.50), transparent 26%)", filter:"blur(18px)", mixBlendMode:"multiply" as const, opacity:.68, transform:"rotate(-1deg)", zIndex:3 }} />
          <div style={{ position:"absolute", left:"6%", top:"42%", width:"88%", height:"105px", background:"radial-gradient(ellipse at 18% 50%, rgba(0,3,9,0.70), transparent 26%), radial-gradient(ellipse at 40% 48%, rgba(1,7,14,0.62), transparent 30%), radial-gradient(ellipse at 63% 52%, rgba(2,9,16,0.54), transparent 26%), radial-gradient(ellipse at 82% 50%, rgba(0,4,10,0.48), transparent 22%)", filter:"blur(17px)", mixBlendMode:"multiply" as const, opacity:.65, transform:"rotate(2deg)", zIndex:3, animation:"dustFlow1 30s ease-in-out infinite" }} />
          <div style={{ position:"absolute", left:"6%", top:"52%", width:"88%", height:"90px", background:"radial-gradient(ellipse at 28% 50%, rgba(0,3,8,0.56), transparent 24%), radial-gradient(ellipse at 55% 48%, rgba(1,6,12,0.48), transparent 26%), radial-gradient(ellipse at 74% 52%, rgba(1,6,12,0.42), transparent 22%)", filter:"blur(19px)", mixBlendMode:"multiply" as const, opacity:.50, transform:"rotate(-3deg)", zIndex:3, animation:"dustFlow2 34s ease-in-out infinite" }} />

          {/* 3e: Gold stream along core */}
          <div style={{ position:"absolute", left:"14%", top:"44%", width:"72%", height:"45px", background:"linear-gradient(90deg, transparent 0%, rgba(218,180,74,0.06) 22%, rgba(255,221,125,0.14) 48%, rgba(90,190,200,0.05) 66%, transparent 100%)", filter:"blur(14px)", mixBlendMode:"screen" as const, zIndex:1, animation:"goldStream 20s ease-in-out infinite" }} />

          {/* 3f: Edge glow — cyan at boundaries */}
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 34% 24%, rgba(40,140,160,0.13), transparent 28%), radial-gradient(ellipse at 68% 78%, rgba(50,155,175,0.10), transparent 32%), radial-gradient(ellipse at 50% 50%, rgba(218,180,74,0.05), transparent 52%)", filter:"blur(38px)", mixBlendMode:"screen" as const, opacity:.78, zIndex:0 }} />
        </div>
      </div>

      {/* ═══ L4: Foreground gold dust — sparse, small, natural ═══ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ zIndex:4 }}>
        {Array.from({ length: 18 }, (_, i) => { const sd = ((i*137+53)%100)/100; return <span key={i} style={{ position:"absolute", left:`${(i*73+11)%100}%`, top:`${(i*47+7)%100}%`, width:0.8+(i%3)*0.4, height:0.8+(i%3)*0.4, borderRadius:"50%", background:i%5===0?"rgba(218,180,74,0.35)":"rgba(190,205,225,0.18)", boxShadow:i%5===0?"0 0 3px rgba(218,180,74,0.2)":"none", opacity:.08+sd*.25 }} /> })}
      </div>

      {/* ═══ L5: Tai Chi Bagua — 540px formation disk ═══ */}
      <div className="fixed left-1/2 pointer-events-none" aria-hidden="true" style={{ width:"min(540px, 92vw)", height:"min(540px, 92vw)", top:"44%", transform:"translate(-50%,-50%) rotate(0deg)", opacity:.25, zIndex:5, animation:"taijiSpin 90s linear infinite", filter:"drop-shadow(0 0 42px rgba(218,180,74,0.16))" }}>
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"1px solid rgba(218,180,74,0.28)", boxShadow:"0 0 54px rgba(218,180,74,0.10), inset 0 0 48px rgba(80,180,190,0.07)" }} />
        <div style={{ position:"absolute", inset:"12%", borderRadius:"50%", border:"1px dashed rgba(218,180,74,0.22)" }} />
        {TRIGRAMS.map((t, i) => { const a=(i/8)*360-90; const rad=(a*Math.PI)/180; const d=45; return <span key={i} className="absolute font-serif" style={{ left:`${50+d*Math.cos(rad)}%`, top:`${50+d*Math.sin(rad)}%`, transform:"translate(-50%,-50%)", color:"rgba(218,180,74,0.42)", fontSize:"clamp(10px, 1.3vw, 14px)" }}>{t}</span> })}
        <div style={{ position:"absolute", inset:"24%", borderRadius:"50%", border:"0.5px solid rgba(218,180,74,0.14)" }} />
        <div style={{ position:"absolute", inset:"8%", display:"grid", placeItems:"center", fontSize:"clamp(72px, 10vw, 120px)", color:"rgba(218,180,74,0.40)" }}>☯</div>
      </div>

      {/* ═══ L6: Text mask ═══ */}
      <div className="fixed left-1/2 pointer-events-none" aria-hidden="true" style={{ width:700, maxWidth:"96vw", height:540, top:"48%", transform:"translate(-50%,-50%)", background:"radial-gradient(ellipse at center, rgba(2,5,12,0.42) 0%, rgba(2,5,12,0.24) 38%, transparent 76%)", zIndex:6 }} />

      {/* ═══ L7: Vignette ═══ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ background:"radial-gradient(circle at 50% 42%, transparent 0%, transparent 30%, rgba(0,0,0,0.24) 72%), linear-gradient(180deg, rgba(0,0,0,0.12) 0%, transparent 20%, transparent 50%, rgba(0,0,0,0.78) 100%)", zIndex:8 }} />

      <style>{kf}</style>

      {/* ═══ HERO ═══ */}
      <section className="relative flex min-h-[88vh] w-full flex-col items-center justify-center px-6 text-center" style={{ zIndex:10 }}>
        <div>
          <h1 className="font-serif text-8xl md:text-9xl font-bold" style={{ background:"linear-gradient(180deg, #E8CB7A 0%, #C9A84C 40%, #A07C2A 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", filter:"drop-shadow(0 0 40px rgba(201,168,76,0.25))" }}>{isZh?"观我":"Guanwo"}</h1>
          <p className="mt-4 text-[11px] tracking-[0.15em] text-white/30">{isZh?"AI 命运行动系统":"AI Destiny Action System"}</p>
        </div>
        <div className="mt-10">
          <p className="font-serif text-xl text-white/60">{isZh?"看见内在结构 · 找到下一步":"See your structure · Find the next step"}</p>
          <div className="mx-auto mt-4 h-px w-48" style={{ background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} />
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-white/35">{isZh?"融合八字、紫微、星盘、塔罗、面相手相":"Integrating Bazi, Ziwei, Astrology, Tarot, Face & Palm"}<br/>{isZh?"AI 五维交叉验证，生成你的完整命运画像":"AI five-source cross-validation — your complete destiny profile"}</p>
        </div>
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <Link href={localeHref("/reading/new")} className="group rounded-xl px-10 py-4 font-medium transition-all hover:scale-[1.03]" style={{ background:"#C9A84C", color:"#020617" }}><span className="flex items-center gap-2">{isZh?"建立我的画像":"Build My Profile"} <ArrowRight size={16} /></span></Link>
          <Link href={localeHref("/almanac")} className="rounded-xl border px-10 py-4 text-white/75 transition-all hover:border-white/35" style={{ borderColor:"rgba(255,255,255,0.18)" }}><span className="flex items-center gap-2">{isZh?"查看今日趋势":"View Today's Trend"} <ArrowRight size={15} /></span></Link>
        </div>
        <div className="absolute bottom-8 opacity-40"><div className="mx-auto h-8 w-5 rounded-full border border-white/20"><div className="mx-auto mt-1.5 h-2 w-1 rounded-full bg-white/30 animate-bounce" /></div></div>
      </section>

      {/* ═══ S1-S6: Same bilingual sections ═══ */}
      <section className="relative mx-auto max-w-6xl px-6 pt-24" style={{ zIndex:10 }}><div className="mb-12"><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase">DESTINY SYSTEMS</p><h2 className="mt-3 font-serif text-3xl md:text-4xl text-white/80">{isZh?"五大分析系统":"Five Analysis Systems"}</h2><p className="mt-3 text-[14px] text-white/35 max-w-xl">{isZh?"不是单一命理工具——八字、紫微、星盘、塔罗、面相同步运行，AI 交叉验证，输出一致结论":"Not a single tool — Bazi, Ziwei, Astrology, Tarot, and Face reading run together, cross-validated by AI"}</p></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{SYSTEMS.map((s,i)=>(<Link key={i} href={localeHref(s.n==="八字"?"/bazi":s.n==="紫微"?"/ziwei":s.n==="星盘"?"/astrology":s.n==="塔罗"?"/tarot":"/face-reading")} className="group flex flex-col rounded-xl border border-white/[0.04] overflow-hidden transition-all hover:-translate-y-1" style={{ background:"linear-gradient(180deg, #060E24 0%, #030918 100%)" }}><div className="h-1 w-full transition-all group-hover:h-1.5" style={{ background:s.c }} /><div className="p-5 flex flex-col flex-1"><div className="flex items-center justify-between mb-3"><span className="font-serif text-xl text-white/75">{isZh?s.n:s.nEn}</span>{s.free&&<span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:"rgba(201,168,76,0.1)", color:"#C9A84C" }}>{isZh?"免费":"Free"}</span>}</div><p className="text-[10px] tracking-[0.12em] text-white/25 mb-1.5">{isZh?s.q:s.qEn}</p><p className="text-[12px] leading-relaxed text-white/35 flex-1">{isZh?s.a:s.aEn}</p></div></Link>))}</div></section>

      <section className="relative mx-auto max-w-6xl px-6 pt-20" style={{ zIndex:10 }}><div className="rounded-2xl border border-white/[0.05] p-8 md:p-14" style={{ background:"linear-gradient(135deg, #060E24 0%, #030918 100%)" }}><div className="grid gap-10 lg:grid-cols-[1fr_auto_1fr] lg:items-center"><div className="space-y-3"><p className="text-[10px] tracking-[0.15em] text-white/20 mb-4">{isZh?"INPUT · 同步采集":"INPUT · Collection"}</p>{inputs.map((inp,i)=>(<div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-2.5" style={{ background:"rgba(255,255,255,0.02)" }}><span className="text-[10px] text-white/20 w-5">{`0${i+1}`}</span><span className="text-[13px] text-white/50">{inp}</span></div>))}</div><div className="flex flex-col items-center gap-4"><div className="relative"><div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center" style={{ background:"radial-gradient(circle, rgba(201,168,76,0.25) 0%, rgba(201,168,76,0.06) 50%, transparent 70%)", boxShadow:"0 0 50px rgba(201,168,76,0.15)" }}><span className="font-serif text-2xl text-white/80">{isZh?"合":"AI"}</span></div><div className="absolute -inset-3 rounded-full border border-gold/15" style={{ animation:"ringSpin 8s linear infinite" }} /><div className="absolute -inset-6 rounded-full border border-gold/[0.06]" style={{ animation:"ringSpin 12s linear infinite reverse" }} /></div><p className="font-serif text-lg text-white/70">{isZh?"AI 合参引擎":"AI Synthesis Engine"}</p><p className="text-[12px] text-white/30 text-center max-w-[180px]">{isZh?"五系统交叉验证":"Five-source cross-validation"}<br/>{isZh?"逐项比对冲突与一致":"Comparing conflicts and consensus"}</p></div><div className="space-y-3"><p className="text-[10px] tracking-[0.15em] text-white/20 mb-4">{isZh?"OUTPUT · 画像输出":"OUTPUT · Profile"}</p>{outputs.map((out,i)=>(<div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-3" style={{ background:"rgba(255,255,255,0.02)" }}><span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:i===0?"#5A9E8E":i===1?"#7B9EC7":i===2?"#C77B8B":i===3?"#C9A84C":"#8B7EC7" }} /><span className="text-[13px] text-white/50">{out}</span><span className="ml-auto text-[10px] text-white/15">{95-i*3}%</span></div>))}</div></div></div></section>

      <section className="relative mx-auto max-w-6xl px-6 pt-20" style={{ zIndex:10 }}><div className="mb-12"><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase">YOUR DOSSIER</p><h2 className="mt-3 font-serif text-3xl md:text-4xl text-white/80">{isZh?"你的命运画像":"Your Destiny Profile"}</h2><p className="mt-3 text-[14px] text-white/35 max-w-xl">{isZh?"AI 生成一份结构化画像，五个模块——从内在结构到今日行动":"AI generates a structured profile — five modules, from inner structure to daily action"}</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{dossier.map((m,i)=>(<div key={i} className="group rounded-xl border border-white/[0.04] p-6 transition-all hover:border-white/[0.1]" style={{ background:"linear-gradient(135deg, #060E24, #030918)" }}><div className="flex items-center gap-3 mb-4"><span className="text-2xl font-serif text-white/15">{m.i}</span><span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor:m.c, color:m.c, opacity:.7 }}>{m.tag}</span></div><h3 className="font-serif text-lg text-white/75 mb-2">{m.t}</h3><p className="text-[12px] leading-relaxed text-white/35">{m.d}</p></div>))}</div></section>

      <section className="relative mx-auto max-w-6xl px-6 pt-20" style={{ zIndex:10 }}><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-3">GET STARTED</p><h2 className="font-serif text-3xl md:text-4xl text-white/80">{isZh?"选择你的入口":"Choose Your Entry"}</h2><div className="mt-10 grid gap-4 lg:grid-cols-3">{entries.map((e,i)=>(<Link key={i} href={localeHref(e.to)} className={`group flex flex-col rounded-2xl p-7 transition-all hover:-translate-y-1 ${e.hl?"border-2":"border"}`} style={{ borderColor:e.hl?"rgba(201,168,76,0.3)":"rgba(255,255,255,0.05)", background:e.hl?"linear-gradient(135deg, #0A1228, #030918)":"linear-gradient(135deg, #060E24, #030918)" }}>{e.badge&&<span className="text-[10px] tracking-[0.15em] text-white/20 mb-3">{e.badge}</span>}<span className="text-4xl mb-4">{e.icon}</span><h3 className="font-serif text-2xl text-white/80 mb-2">{e.t}</h3><p className="text-[13px] leading-relaxed text-white/35 flex-1">{e.d}</p><span className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium" style={{ color:e.hl?"#C9A84C":"rgba(255,255,255,0.5)" }}>{e.cta}</span></Link>))}</div></section>

      <section className="relative mx-auto max-w-6xl px-6 pt-20" style={{ zIndex:10 }}><div className="grid gap-10 lg:grid-cols-2"><div className="rounded-2xl border border-white/[0.05] p-8" style={{ background:"linear-gradient(135deg, #060E24, #030918)" }}><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-3">TREASURE HALL</p><h3 className="font-serif text-2xl text-white/75 mb-2">{isZh?"命运藏宝阁":"Destiny Treasure Hall"}</h3><p className="text-[13px] text-white/35 mb-6">{isZh?"AI 根据你的画像匹配生活好物":"AI matches lifestyle items to your profile"}</p><div className="grid grid-cols-3 gap-3">{treasure.map(([icon, name], i)=>(<Link key={i} href={localeHref("/shop")} className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.04] p-4 text-center transition-all hover:border-white/[0.1]" style={{ background:"rgba(255,255,255,0.015)" }}><span className="text-xl">{icon}</span><span className="text-[11px] text-white/55">{name}</span></Link>))}</div></div><div className="rounded-2xl border border-white/[0.05] p-8" style={{ background:"linear-gradient(135deg, #060E24, #030918)" }}><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-6">TRUST</p><div className="grid grid-cols-3 gap-4 mb-8">{[["10,000+",td.ul],["4.9",td.rl],["50,000+",td.rpl]].map(([n,l])=>(<div key={l} className="text-center"><div className="font-serif text-3xl" style={{ color:"#C9A84C" }}>{n}</div><div className="text-[11px] text-white/25 mt-1">{l}</div></div>))}</div><div className="space-y-4">{[["“"+td.t1+"”",td.n1],["“"+td.t2+"”",td.n2]].map(([text, name], i)=>(<div key={i} className="border-l-2 border-white/[0.06] pl-4"><p className="text-[13px] leading-relaxed text-white/45">{text}</p><p className="text-[11px] text-white/20 mt-2">{name}</p></div>))}</div></div></div></section>

      <section className="relative mx-auto max-w-4xl px-6 pt-20 pb-20" style={{ zIndex:10 }}><div className="text-center mb-10"><p className="text-[11px] tracking-[0.2em] text-white/20 uppercase mb-3">PRICING</p><h2 className="font-serif text-3xl md:text-4xl text-white/80">{isZh?"清晰的定价，没有隐藏费用":"Clear pricing, no hidden fees"}</h2><p className="mt-3 text-[14px] text-white/35">{isZh?"免费开始，按需付费。注册即赠 50 星尘。":"Start free, pay per use. 50 Stardust on sign-up."}</p></div><div className="grid gap-4 md:grid-cols-3">{pricing.map((p,i)=>(<Link key={i} href={localeHref(p.cta==="免费注册"||p.cta==="Sign Up"?"/register":p.cta==="查看定价"||p.cta==="Pricing"?"/pricing":"/reading/new")} className={`group flex flex-col items-center text-center rounded-2xl p-7 transition-all hover:-translate-y-1 ${p.hl?"border-2":"border"}`} style={{ borderColor:p.hl?"rgba(201,168,76,0.3)":"rgba(255,255,255,0.05)", background:p.hl?"linear-gradient(135deg, #0A1228, #030918)":"linear-gradient(135deg, #060E24, #030918)" }}><span className="text-[11px] tracking-[0.15em] text-white/25 mb-3">{p.name}</span><span className="font-serif text-4xl mb-3" style={{ color:p.hl?"#C9A84C":"rgba(255,255,255,0.6)" }}>{p.price}</span><p className="text-[12px] leading-relaxed text-white/30 flex-1 mb-5 whitespace-pre-line">{p.desc}</p><span className={`rounded-xl px-8 py-3 text-[14px] font-medium transition-all ${p.hl?"":"border"}`} style={p.hl?{background:"#C9A84C",color:"#020617"}:{borderColor:"rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.6)"}}>{p.cta}</span></Link>))}</div><p className="text-center text-[11px] text-white/15 mt-6">{isZh?"添加到手机桌面，像 App 一样使用":"Add to home screen. Use like a native app"}</p></section>
    </div>
  )
}
