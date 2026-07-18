import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === "zh"
  const base = "https://www.khanfate.com"
  const path = `/${locale}/face-reading`

  return {
    title: isZh ? "AI 面相分析 — 智能面部特征解读 | KhanFate" : "AI Face Analysis - Intelligent Face Feature Analysis | KhanFate",
    description: isZh
      ? "上传照片，AI 分析面部轮廓、三停五眼，解读行为模式。不是看相算命，是用计算机视觉照见你的面部数据。"
      : "Upload a photo for AI-powered face analysis. Analyzes face shape, features, Three Divisions Five Eyes, and decodes behavioral patterns.",
    keywords: isZh
      ? "面相分析,AI面相,面部识别,面相解读,在线面相,面相测试"
      : ["face analysis", "AI face analysis", "face feature", "facial features", "status analysis", "online face analysis"],
    openGraph: {
      title: isZh ? "AI 面相分析 — 智能面部特征解读 | KhanFate" : "AI Face Analysis - Intelligent Face Feature Analysis",
      description: isZh
        ? "AI 面相分析，面部特征与行为模式解读"
        : "Upload a photo for AI face analysis and behavioral analysis",
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${base}${path}`,
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: { en: `${base}/en/face-reading`, zh: `${base}/zh/face-reading`, "x-default": `${base}/en/face-reading` },
    },
  }
}

export default function FaceReadingLayout({ children }: { children: React.ReactNode }) {
  return children
}
