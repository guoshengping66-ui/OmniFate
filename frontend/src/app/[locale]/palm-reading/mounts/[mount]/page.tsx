import { notFound } from "next/navigation"
import { PalmMounts } from "@/data/programmatic/palm/mounts"
import { PalmMountTemplate } from "@/components/templates/PalmMountTemplate"

interface PageProps {
  params: Promise<{ locale: string; mount: string }>
}

export async function generateStaticParams() {
  return PalmMounts.map(mount => ({ mount: mount.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, mount } = await params
  const data = PalmMounts.find(m => m.id === mount)
  if (!data) return {}

  const isZh = locale === "zh"

  return {
    title: isZh ? data.title_zh : data.title_en,
    description: isZh ? data.meta_description_zh : data.meta_description_en,
    keywords: isZh ? data.keywords_zh : data.keywords_en,
    openGraph: {
      title: isZh ? data.title_zh : data.title_en,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
      type: "article",
      locale: isZh ? "zh_CN" : "en_US",
      url: `https://www.khanfate.com/${locale}/palm-reading/mounts/${mount}`,
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? `${data.title_zh} | KhanFate` : `${data.title_en} | KhanFate`,
      description: isZh ? data.meta_description_zh : data.meta_description_en,
    },
    alternates: {
      canonical: `https://www.khanfate.com/${locale}/palm-reading/mounts/${mount}`,
      languages: {
        en: `https://www.khanfate.com/en/palm-reading/mounts/${mount}`,
        zh: `https://www.khanfate.com/zh/palm-reading/mounts/${mount}`,
        "x-default": `https://www.khanfate.com/en/palm-reading/mounts/${mount}`,
      },
    },
  }
}

export default async function PalmMountPage({ params }: PageProps) {
  const { locale, mount } = await params
  const data = PalmMounts.find(m => m.id === mount)
  if (!data) notFound()

  return <PalmMountTemplate data={data} locale={locale} />
}
