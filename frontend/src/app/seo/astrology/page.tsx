"use client"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

const features = [
  { icon: "☀️", title: "太阳星座", desc: "你的核心人格、生命力和自我表达方式" },
  { icon: "🌙", title: "月亮星座", desc: "内在情感、潜意识和安全感需求" },
  { icon: "⬆️", title: "上升星座", desc: "外在表现、第一印象和人生面具" },
  { icon: "🪐", title: "行星落宫", desc: "十大行星在十二宫位的具体表现" },
  { icon: "📐", title: "相位分析", desc: "行星间的角度关系，揭示天赋与挑战" },
  { icon: "🌟", title: "灵魂使命", desc: "北交点与南交点，探索灵魂的成长方向" },
]

export default function AstrologySEOPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: "星盘分析" }]} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "AI星盘分析工具",
            "description": "输入出生信息，AI自动绘制星盘并分析行星落宫、相位角度",
            "url": "https://destinymirror.com/seo/astrology",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web",
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">✦</div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold mb-4">
              AI 星盘分析
            </h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
              基于你的出生时间和地点，AI 将绘制专属星盘，深入解读行星落宫、相位关系，
              揭示你独特的生命蓝图。
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {features.map((f) => (
              <div key={f.title} className="card-glow p-5 hover:border-gold/30 transition-all duration-300">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-serif font-bold text-gold mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">什么是星盘分析？</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>
                星盘（Natal Chart）是根据一个人出生时太阳系各行星在天空中的精确位置绘制的宇宙地图。
                它记录了你出生那一刻，十大行星在黄道十二宫中的分布情况。
              </p>
              <p>
                通过分析太阳、月亮、上升星座这"三巨头"，以及水星、金星、火星等行星的落座和落宫，
                我们可以深入了解一个人的性格特质、情感模式、思维方式、 relationship patterns 和人生使命。
              </p>
              <p>
                命盘智镜的 AI 星盘系统，能够精确计算行星位置和相位角度，结合现代心理学和传统占星学智慧，
                为你提供深度的星盘解读，帮助你更好地认识自己，把握人生方向。
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-gold/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4">🌟</div>
              <h2 className="font-serif text-2xl text-gold mb-4">探索你的星盘</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                免费体验 AI 星盘分析，发现你独特的宇宙印记
              </p>
              <Link
                href="/reading/new"
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                开始分析 <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
