"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface AccordionItemProps {
  question: string
  answer: string
  defaultOpen?: boolean
}

export function AccordionItem({ question, answer, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

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
        className="w-full flex items-center justify-between p-5 text-left
                   hover:bg-white/[0.02] transition-colors duration-200"
      >
        <span className={`font-serif font-medium pr-4 transition-colors duration-200
          ${isOpen ? "text-gold" : "text-white/80"}`}>
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-shrink-0"
        >
          <ChevronDown
            size={18}
            className={`transition-colors duration-200 ${isOpen ? "text-gold" : "text-gold/40"}`}
          />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="px-5 pb-5 text-white/45 text-sm leading-relaxed border-t border-white/[0.06] pt-4 mx-5">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
