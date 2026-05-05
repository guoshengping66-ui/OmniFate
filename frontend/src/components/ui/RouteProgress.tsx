"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function RouteProgress() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    setProgress(30)

    const t1 = setTimeout(() => setProgress(70), 100)
    const t2 = setTimeout(() => setProgress(100), 250)
    const t3 = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 400)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-gold/40 via-gold to-gold-light transition-all duration-300 ease-out shadow-[0_0_8px_rgba(201,168,76,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
