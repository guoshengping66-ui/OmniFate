"use client"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

const features = [
  { icon: "🃏", title: "多种牌阵", desc: "凯尔特十字、时间之流、三角牌阵等经典牌阵" },
  { icon: "🔮", title: "AI解读", desc: "深度解析每张牌的含义及牌与牌之间的关系" },
  { icon: "✨", title: "正逆位分析", desc: "精准区分正位与逆位的不同含义" },
  { icon: "💫", title: "整体洞察", desc: "综合牌阵给出全面的形势判断和建议" },
  { icon: "🎯", title: "行动指引", desc: "基于牌阵能量给出具体可行的行动建议" },
  { icon: "🧘", title: "心灵疗愈", desc: "通过塔罗探索内心，获得心灵的平静与方向" },
]

const spreads = [
  { name: "单牌占卜", cards: 1, desc: "快速获取当下的能量指引" },
  { name: "三角牌阵", cards: 3, desc: "过去、现在、未来的完整视角" },
  { name: "时间之流", cards: 5, desc: "深入了解事件的发展脉络" },
  { name: "凯尔特十字", cards: 10, desc: "最全面深入的牌阵解读" },
]

export default function TarotSEOPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: "塔罗占卜" }]} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "AI塔罗占卜工具",
            "description": "在线塔罗牌占卜，AI解读牌阵含义",
            "url": "https://destinymirror.com/seo/tarot",
            "applicationCategory": "LifestyleApplication",
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">🃏</div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold mb-4">
              AI 塔罗占卜
            </h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
              选择你心仪的牌阵，让 AI 塔罗师为你解读牌面信息，
              揭示当下的能量状态，为你指引前行的方向。
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
            <h2 className="font-serif text-2xl text-gold mb-6">可用牌阵</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {spreads.map((s) => (
                <div key={s.name} className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-bold text-lg">
                    {s.cards}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{s.name}</h3>
                    <p className="text-white/40 text-xs">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">什么是塔罗占卜？</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>
                塔罗牌是一种古老的占卜工具，由78张牌组成，每张牌都蕴含着丰富的象征意义。
                通过牌阵的排列和解读，塔罗可以帮助我们探索潜意识，理解当下的处境，预见可能的发展方向。
              </p>
              <p>
                塔罗占卜不是宿命论的预测，而是一种自我探索和反思的工具。它帮助我们看清问题的本质，
                发现被忽视的可能性，从而做出更明智的选择。
              </p>
              <p>
                命盘智镜的 AI 塔罗系统，结合了传统塔罗的象征智慧与现代心理学解读，
                为你提供深度、全面、富有洞察力的牌阵解读。
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-gold/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4">✨</div>
              <h2 className="font-serif text-2xl text-gold mb-4">开始你的塔罗之旅</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                选择牌阵，静心冥想，让塔罗为你揭示当下的能量与指引
              </p>
              <Link
                href="/reading/new"
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                开始占卜 <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
