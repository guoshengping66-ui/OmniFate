import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Event Review - Destiny Mirror",
  description: "Enter key events with time and description. AI analyzes causes, impacts, and future trends from a destiny perspective.",
  keywords: ["event review", "destiny analysis", "fortune analysis", "key events"],
  openGraph: {
    title: "Event Review - Destiny Mirror",
    description: "AI analysis of key events from a destiny perspective",
    type: "website",
  },
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children
}
