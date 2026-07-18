import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const base = "https://www.khanfate.com"
  const path = `/${locale}/am16`

  return {
    title: "AM16 Profile Level Test | KhanFate",
    description: "Free AM16 Profile Level Test — 12 immersive scenario questions to pinpoint your behavioral state across four dimensions.",
    openGraph: {
      title: "AM16 Profile Level Test — Unlock Your Behavioral Code",
      description: "12 immersive questions across four dimensions to pinpoint your behavioral state",
      url: `${base}${path}`,
      siteName: "KhanFate",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "AM16 Profile Level Test | KhanFate",
      description: "12 immersive questions to unlock your behavioral code",
    },
    alternates: {
      canonical: `${base}${path}`,
      languages: {
        en: `${base}/en/am16`,
        zh: `${base}/zh/am16`,
        "x-default": `${base}/en/am16`,
      },
    },
  }
}

export default function AM16Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
