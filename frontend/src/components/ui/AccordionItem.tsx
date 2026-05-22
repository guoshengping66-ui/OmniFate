"use client"
import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface AccordionItemProps {
  question: string
  answer: string
  defaultOpen?: boolean
}

export function AccordionItem({ question, answer, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<string>(defaultOpen ? "auto" : "0px")

  useEffect(() => {
    if (isOpen) {
      const el = contentRef.current
      if (el) {
        setHeight(el.scrollHeight + "px")
        // After transition, set to auto for dynamic content
        const timer = setTimeout(() => setHeight("auto"), 300)
        return () => clearTimeout(timer)
      }
    } else {
      // First set explicit height, then 0
      const el = contentRef.current
      if (el) {
        setHeight(el.scrollHeight + "px")
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setHeight("0px"))
        })
      }
    }
  }, [isOpen])

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-300
        ${isOpen
          ? "border-gold/25 bg-white/[0.03] shadow-[0_0_30px_rgba(201,168,76,0.05)]"
          : "border-white/10 hover:border-gold/15 bg-transparent"
        }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors duration-200"
      >
        <span className={`font-serif font-medium pr-4 transition-colors duration-200
          ${isOpen ? "text-gold" : "text-white/80"}`}>
          {question}
        </span>
        <div
          className="flex-shrink-0 transition-transform duration-250"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease-out",
          }}
        >
          <ChevronDown
            size={18}
            className={`transition-colors duration-200 ${isOpen ? "text-gold" : "text-gold/40"}`}
          />
        </div>
      </button>
      <div
        style={{
          height,
          opacity: isOpen ? 1 : 0,
          overflow: "hidden",
          transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
        }}
      >
        <div ref={contentRef} className="px-5 pb-5 text-white/45 text-sm leading-relaxed border-t border-white/[0.06] pt-4 mx-5">
          {answer}
        </div>
      </div>
    </div>
  )
}
