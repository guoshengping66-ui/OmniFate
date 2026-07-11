"use client"
import { createContext, useContext, useEffect, useState } from "react"
type Theme = "day" | "night"
interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}
const ThemeContext = createContext<ThemeContextType>({
  theme: "night",
  toggleTheme: () => {},
})
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("night")
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") as Theme | null
      if (stored === "day" || stored === "night") setTheme(stored)
      else setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day")
    } catch {}
  }, [])
  useEffect(() => {
    try {
      document.documentElement.classList.remove("day-theme", "night-theme")
      document.documentElement.classList.add(theme + "-theme")
      localStorage.setItem("theme", theme)
    } catch {}
  }, [theme])
  const toggleTheme = () => setTheme(prev => prev === "night" ? "day" : "night")
  return (<ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>)
}
export const useTheme = () => useContext(ThemeContext)
