import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Daily Almanac - Profile Mirror",
  description: "Personalized daily almanac based on your profile chart, including daily score, do's and don'ts, and guidance.",
  keywords: ["daily almanac", "daily score", "daily analysis", "calendar"],
  openGraph: {
    title: "Daily Almanac - Profile Mirror",
    description: "Personalized daily almanac based on your profile chart",
    type: "website",
  },
}

export default function AlmanacLayout({ children }: { children: React.ReactNode }) {
  return children
}
