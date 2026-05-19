"use client"

import dynamic from "next/dynamic"

const NebulaBackground = dynamic(
  () => import("./NebulaBackground").then(m => ({ default: m.NebulaBackground })),
  { ssr: false }
)
const StarField = dynamic(
  () => import("./StarField").then(m => ({ default: m.StarField })),
  { ssr: false }
)
const MagicCursor = dynamic(
  () => import("./MagicCursor").then(m => ({ default: m.MagicCursor })),
  { ssr: false }
)

export default function AnimatedBackground() {
  return (
    <>
      <NebulaBackground />
      <StarField />
      <MagicCursor />
    </>
  )
}
