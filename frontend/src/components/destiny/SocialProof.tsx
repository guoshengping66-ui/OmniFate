"use client"
import { useRef, useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

interface Testimonial {
  name: string
  job: string
  text: string
  score: string
  source: string
}

const SOURCE_COLORS: Record<string, string> = {
  "小红书": "#FF2442",
  "Xiaohongshu": "#FF2442",
  "知乎": "#0066FF",
  "Zhihu": "#0066FF",
  "微信": "#07C160",
  "WeChat": "#07C160",
}

export default function SocialProof() {
  const { t, locale } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Fetch testimonials from i18n
  const data = t("home.testimonials", { returnObjects: true }) as { title: string; list: Testimonial[] }
  const title = data?.title ?? (locale === "zh" ? "用户真实反馈" : "Real User Reviews")
  const list: Testimonial[] = data?.list ?? []

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.15 }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  if (list.length === 0) return null

  return (
    <section
      ref={containerRef}
      role="region"
      aria-labelledby="social-proof-title"
      className="relative py-16 md:py-28 px-4"
    >
      {/* Subtle glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#C5A880]/[0.015] blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* Section header */}
        <div
          className="text-center mb-10 md:mb-14 transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(30px)" }}
        >
          <span className="text-[#C5A880]/40 text-[10px] tracking-[0.5em] uppercase font-medium">
            {locale === "zh" ? "真实反馈" : "TESTIMONIALS"}
          </span>
          <h2 id="social-proof-title" className="text-2xl md:text-4xl font-serif font-bold mt-3 mb-3 tracking-wide">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #C5A880, #E8D5B7)" }}>
              {title}
            </span>
          </h2>
        </div>

        {/* Testimonial cards — horizontal scroll on mobile, grid on desktop */}
        <div
          className="flex gap-4 md:gap-5 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0 scrollbar-hide"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(20px)", transition: "all 1s ease-out 0.3s" }}
        >
          {list.map((item, i) => {
            const sourceColor = SOURCE_COLORS[item.source] ?? "#C5A880"
            return (
              <div
                key={i}
                className="min-w-[280px] md:min-w-0 snap-start rounded-3xl p-5 md:p-6 transition-all duration-300 group hover:border-[#C5A880]/20"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(10px)",
                  transitionDelay: `${0.15 + i * 0.1}s`,
                }}
              >
                {/* Score badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {/* Avatar placeholder */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${sourceColor}20, ${sourceColor}08)`,
                        border: `1px solid ${sourceColor}30`,
                        color: sourceColor,
                      }}
                    >
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white/70 text-xs font-medium">{item.name}</div>
                      <div className="text-white/30 text-[10px]">{item.job}</div>
                    </div>
                  </div>
                  <div
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: "linear-gradient(135deg, rgba(197,168,128,0.15), rgba(197,168,128,0.05))",
                      border: "1px solid rgba(197,168,128,0.2)",
                      color: "#C5A880",
                    }}
                  >
                    {item.score}
                  </div>
                </div>

                {/* Review text */}
                <p className="text-white/40 text-xs leading-relaxed mb-4">
                  &ldquo;{item.text}&rdquo;
                </p>

                {/* Source tag */}
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full" style={{ background: sourceColor }} />
                  <span className="text-[10px] tracking-wider" style={{ color: `${sourceColor}99` }}>
                    {item.source}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust indicators */}
        <div
          className="flex items-center justify-center gap-6 mt-8 md:mt-10 text-white/15 text-[10px] tracking-widest transition-all duration-1000 delay-700"
          style={{ opacity: isVisible ? 1 : 0 }}
        >
          <span>{locale === "zh" ? "数据来自真实用户" : "From Real Users"}</span>
          <span className="w-px h-3 bg-white/10" />
          <span>4.9 ★</span>
          <span className="w-px h-3 bg-white/10" />
          <span>{locale === "zh" ? "已服务 10,000+ 用户" : "10,000+ Users Served"}</span>
        </div>
      </div>
    </section>
  )
}
