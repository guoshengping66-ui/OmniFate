import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Event Review - Profile Mirror",
  description: "Enter key events with time and description. AI analyzes causes, impacts, and future trends from a destiny perspective.",
  keywords: ["event review", "behavioral analysis", "status analysis", "key events"],
  openGraph: {
    title: "Event Review - Profile Mirror",
    description: "AI analysis of key events from a destiny perspective",
    type: "website",
  },
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children
}
