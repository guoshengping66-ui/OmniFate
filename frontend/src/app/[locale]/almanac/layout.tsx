import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Daily Almanac - Profile Mirror",
  description: "Personalized daily almanac based on your profile chart, including energy index, do's and don'ts, and protection guidance.",
  keywords: ["daily almanac", "energy index", "daily analysis", "calendar"],
  openGraph: {
    title: "Daily Almanac - Profile Mirror",
    description: "Personalized daily almanac based on your profile chart",
    type: "website",
  },
}

export default function AlmanacLayout({ children }: { children: React.ReactNode }) {
  return children
}
