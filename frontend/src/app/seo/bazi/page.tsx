"use client"
import Link from "next/link"
import { Sparkles, ArrowRight, Star, Shield, Zap, Clock, CheckCircle } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

const features = [
  { icon: "☯", title: "四柱排盘", desc: "精确到分钟的年月日时四柱排列，支持真太阳时校正" },
  { icon: "🔥", title: "五行分析", desc: "金木水火土五行强弱评分，找出命局喜用神" },
  { icon: "📊", title: "十神格局", desc: "正官、偏财、食神等十神关系解析，判断格局高低" },
  { icon: "📅", title: "流年运势", desc: "大运流年逐年分析，把握人生关键节点" },
  { icon: "💡", title: "喜忌建议", desc: "根据五行喜忌给出颜色、方位、职业等建议" },
  { icon: "🎯", title: "AI解读", desc: "多维度交叉验证，比传统排盘更全面精准" },
]

const steps = [
  { n: "01", title: "填写出生信息", desc: "输入出生年月日时和出生城市" },
  { n: "02", title: "AI自动排盘", desc: "系统自动完成四柱排列和五行计算" },
  { n: "03", title: "查看详细分析", desc: "获取完整的八字命理解读报告" },
]

export default function BaziSEOPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: "八字排盘" }]} />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "AI八字排盘工具",
            "description": "输入出生时间，AI自动排盘并分析四柱八字、五行强弱、十神格局",
            "url": "https://destinymirror.com/seo/bazi",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "CNY",
            },
          })}}
        />

        {/* Hero */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">☯</div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold mb-4">
              AI 八字排盘
            </h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
              输入你的出生时间，AI 命师将自动完成四柱排列、五行分析、十神格局判断，
              为你揭示命局中的先天密码。
            </p>
          </div>
        </ScrollReveal>

        {/* Features Grid */}
        <ScrollReveal delay={0.1}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {features.map((f, i) => (
              <div key={f.title} className="card-glow p-5 hover:border-gold/30 transition-all duration-300">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-serif font-bold text-gold mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* How It Works */}
        <ScrollReveal delay={0.2}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-8 text-center">三步完成排盘</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((s, i) => (
                <div key={s.n} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center mx-auto mb-4 text-gold font-bold">
                    {s.n}
                  </div>
                  <h3 className="text-white font-medium mb-2">{s.title}</h3>
                  <p className="text-white/40 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* SEO Content */}
        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">什么是八字排盘？</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>
                八字排盘，又称四柱排盘，是中国传统命理学的核心工具。它根据一个人出生的年、月、日、时四个时间节点，
                转换为天干地支的组合，形成八个字，即所谓的"生辰八字"。
              </p>
              <p>
                通过分析这八个字之间的五行相生相克关系、十神配置、格局高低，命理师可以推断一个人的性格特征、
                事业财运、婚姻感情、健康状况等人生各个方面的信息。
              </p>
              <p>
                命盘智镜的 AI 八字排盘系统，融合了传统命理学的精髓与现代人工智能技术。不仅能够自动完成排盘计算，
                还能进行深度的格局分析和流年运势研判，为你提供比传统排盘更全面、更精准的命理解读。
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={0.4}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-jade/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4 animate-float">🔮</div>
              <h2 className="font-serif text-2xl text-gold mb-4">开始你的八字排盘</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                免费体验 AI 八字分析，发现你命局中的先天优势与潜在机遇
              </p>
              <Link
                href="/reading/new"
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                免费排盘 <ArrowRight size={20} />
              </Link>
              <p className="text-white/20 text-xs mt-4">无需注册，40秒出结果</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
