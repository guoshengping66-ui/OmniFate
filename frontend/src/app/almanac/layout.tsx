import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Daily Almanac - Destiny Mirror",
  description: "Personalized daily almanac based on your destiny chart, including energy index, do's and don'ts, and protection guidance.",
  keywords: ["daily almanac", "energy index", "daily fortune", "calendar"],
  openGraph: {
    title: "Daily Almanac - Destiny Mirror",
    description: "Personalized daily almanac based on your destiny chart",
    type: "website",
  },
}

export default function AlmanacLayout({ children }: { children: React.ReactNode }) {
  return children
}
