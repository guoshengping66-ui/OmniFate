import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI面相分析 - 智能面相识别 | 命盘智镜",
  description: "上传面部照片，AI自动识别面相特征。分析脸型、五官、三庭五眼，解读面相中的命运密码。",
  keywords: ["面相分析", "AI面相", "面相识别", "看面相", "面相算命", "五官面相", "脸型分析", "在线面相"],
  openGraph: {
    title: "AI面相分析 - 智能面相识别 | 命盘智镜",
    description: "上传面部照片，AI自动识别面相特征，解读命运密码",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "https://destinymirror.com/seo/face-reading",
  },
}

export default function FaceReadingLayout({ children }: { children: React.ReactNode }) {
  return children
}
