"use client"
import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

const features = [
  { icon: "📸", title: "AI拍照识别", desc: "上传正面照片，AI自动识别468个面部特征点" },
  { icon: "🎭", title: "脸型分析", desc: "判断圆形、方形、瓜子脸等脸型，解读性格特征" },
  { icon: "👁️", title: "三庭五眼", desc: "分析面部比例，判断运势格局和人生阶段" },
  { icon: "👃", title: "五官详解", desc: "额头、眉毛、眼睛、鼻子、嘴巴逐一解读" },
  { icon: "✨", title: "运势判断", desc: "财运、事业、感情、健康各维度面相分析" },
  { icon: "🔒", title: "隐私保护", desc: "照片仅用于特征提取，处理后立即删除" },
]

const areas = [
  { area: "额头", icon: "🧠", meaning: "智慧、事业、早年运势" },
  { area: "眉毛", icon: "👁️", meaning: "感情、兄弟缘、性格" },
  { area: "眼睛", icon: "✨", meaning: "心灵之窗、智慧、桃花" },
  { area: "鼻子", icon: "👃", meaning: "财运、事业、自我意识" },
  { area: "嘴巴", icon: "👄", meaning: "福禄、口才、享受" },
  { area: "下巴", icon: "😊", meaning: "晚年运势、子女缘" },
]

export default function FaceReadingSEOPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: "AI面相分析" }]} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "AI面相分析工具",
            "description": "上传面部照片，AI自动识别面相特征",
            "url": "https://destinymirror.com/seo/face-reading",
            "applicationCategory": "LifestyleApplication",
          })}}
        />

        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">👁️</div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold mb-4">
              AI 面相分析
            </h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
              上传你的正面照片，AI 将自动识别面部特征，从传统面相学的角度
              解读你面相中蕴含的命运信息。
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
            <h2 className="font-serif text-2xl text-gold mb-6">面相分析区域</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.map((a) => (
                <div key={a.area} className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/10">
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <h3 className="text-white font-medium text-sm">{a.area}</h3>
                    <p className="text-white/40 text-xs">{a.meaning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="card-glass p-8 md:p-10 mb-16">
            <h2 className="font-serif text-2xl text-gold mb-6">什么是面相分析？</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
              <p>
                面相学是中国传统命理学的重要分支，有着数千年的历史。古人认为"相由心生"，
                一个人的面部特征能够反映其性格、运势和人生轨迹。
              </p>
              <p>
                通过分析脸型、三庭五眼的比例、五官的形状和位置，面相学可以判断一个人的
                财运、事业、感情、健康等各个方面的运势走向。
              </p>
              <p>
                命盘智镜的 AI 面相系统，采用 MediaPipe 468 点面部特征识别技术，
                结合传统面相学的解读智慧，为你提供精准、全面的面相分析。
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="card-glass p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-green-400" />
              <h3 className="text-white font-medium">隐私安全保障</h3>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              你上传的面部照片仅用于 AI 特征提取，处理完成后立即删除，不会存储任何原始图像。
              我们严格遵守隐私保护法规，确保你的个人信息安全。
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.5}>
          <div className="text-center card-glass-elevated p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-gold/5 pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4">📸</div>
              <h2 className="font-serif text-2xl text-gold mb-4">开始面相分析</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                上传一张正面照片，让 AI 为你解读面相中的命运密码
              </p>
              <Link
                href="/reading/new"
                className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4"
              >
                上传照片 <ArrowRight size={20} />
              </Link>
              <p className="text-white/20 text-xs mt-4">照片处理后立即删除，绝对安全</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
