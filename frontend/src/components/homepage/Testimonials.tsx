"use client"

import { Star } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { TiltCard } from "@/components/ui/TiltCard"
import { useLanguage } from "@/contexts/LanguageContext"

export default function Testimonials() {
  const { t, locale } = useLanguage()

  const TESTIMONIALS = locale === "zh" ? [
    {
      profession: "创业者",
      location: "深圳",
      text: "八字说我缺金，推荐了黄水晶，生意确实好转了。",
      score: "9.2",
      source: "小红书",
      avatar: "林",
    },
    {
      profession: "工程师",
      location: "北京",
      text: "星盘把我的土星功课说得一清二楚，感情模式完全对上了。",
      score: "9.5",
      source: "知乎",
      avatar: "陈",
    },
    {
      profession: "教师",
      location: "上海",
      text: "塔罗的疗愈感很强，不是吓人的命理预测，是真的帮我看清了困境和出路。",
      score: "8.8",
      source: "微信",
      avatar: "王",
    },
    {
      profession: "设计师",
      location: "杭州",
      text: "AM16测试太准了！我的人格代码完美描述了我的工作风格。",
      score: "9.3",
      source: "小红书",
      avatar: "张",
    },
  ] : [
    {
      profession: "Entrepreneur",
      location: "Shenzhen",
      text: "Bazi said I lack Metal, recommended citrine. Business has improved significantly.",
      score: "9.2",
      source: "Xiaohongshu",
      avatar: "L",
    },
    {
      profession: "Engineer",
      location: "Beijing",
      text: "Astrology nailed my Saturn lessons. My relationship patterns are exactly as described.",
      score: "9.5",
      source: "Zhihu",
      avatar: "C",
    },
    {
      profession: "Teacher",
      location: "Shanghai",
      text: "Tarot reading was truly healing — not scary fortune-telling, but genuine guidance through my challenges.",
      score: "8.8",
      source: "WeChat",
      avatar: "W",
    },
    {
      profession: "Designer",
      location: "Hangzhou",
      text: "AM16 test is amazingly accurate! My personality code perfectly describes my work style.",
      score: "9.3",
      source: "Xiaohongshu",
      avatar: "Z",
    },
  ]

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
              {t("homepage.testimonials.title")}
            </h2>
            <p className="text-white/40 text-sm">{t("homepage.testimonials.subtitle")}</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.1} direction="up">
              <TiltCard glare={false} rotateX={4} rotateY={4} scale={1.02}>
                <div className="card-glow p-5 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5">{[...Array(5)].map((_, si) => (<Star key={si} size={11} className="text-gold fill-gold" />))}</div>
                    <span className="text-gold/60 text-[11px] font-medium">★ {item.score}</span>
                  </div>

                  <p className="text-white/55 text-sm leading-relaxed mb-4 flex-1">&ldquo;{item.text}&rdquo;</p>

                  <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-gold text-xs font-bold">
                        {item.avatar}
                      </div>
                      <div>
                        <div className="text-white/80 text-xs font-medium">{item.profession}</div>
                        <div className="text-white/30 text-[10px]">{item.location}</div>
                      </div>
                    </div>
                    {item.source && (
                      <span className="text-white/15 text-[9px] bg-white/5 px-1.5 py-0.5 rounded-full">{item.source}</span>
                    )}
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
