"use client"
import { useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

const MAJOR_ARCANA = [
  "愚者","魔术师","女祭司","皇后","皇帝","教皇","恋人",
  "战车","力量","隐者","命运之轮","正义","倒吊人","死神",
  "节制","恶魔","塔","星星","月亮","太阳","审判","世界",
]

interface Card { position: string; card: string; reversed: boolean }
interface Props { onSelect: (cards: Card[]) => void }

export function TarotPicker({ onSelect }: Props) {
  const { t } = useLanguage()
  const [cards, setCards] = useState<Card[]>([])
  const [drawing, setDrawing] = useState(false)

  const POSITIONS = [t("new.tarot.past"), t("new.tarot.present"), t("new.tarot.future")]

  const drawRandom = () => {
    setDrawing(true)
    setTimeout(() => {
      const drawn = POSITIONS.map(pos => ({
        position: pos,
        card: MAJOR_ARCANA[Math.floor(Math.random() * MAJOR_ARCANA.length)],
        reversed: Math.random() > 0.65,
      }))
      setCards(drawn)
      onSelect(drawn)
      setDrawing(false)
    }, 1200)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70">{t("new.tarotDrawTitle")}</h3>
        <button type="button" onClick={drawRandom}
 className="text-xs px-4 py-1.5 rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition-all">
          {drawing ? t("new.tarotShuffling") : cards.length ? t("new.tarotRedraw") : t("new.tarotRandomDraw")}
        </button>
      </div>

      {drawing && (
        <div className="flex gap-3 justify-center py-4">
          {[0,1,2].map(i => (
            <div key={i} className="w-20 h-32 rounded-xl bg-gold/10 border border-gold/20 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      )}

      {!drawing && cards.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {cards.map((c, i) => (
            <div key={i} className="card-glow p-3 text-center">
              <div className="text-xs text-white/40 mb-1">{c.position}</div>
              <div className={`text-2xl mb-1 ${c.reversed ? "rotate-180" : ""}`}>🃏</div>
              <div className="text-gold text-sm font-medium leading-tight">{c.card}</div>
              {c.reversed && <div className="text-white/30 text-xs mt-1">{t("new.tarotReversed")}</div>}
            </div>
          ))}
        </div>
      )}

      {!drawing && cards.length === 0 && (
        <div className="border border-dashed border-white/10 rounded-xl p-6 text-center text-white/30 text-sm">
          {t("new.tarotHint")}
        </div>
      )}
    </div>
  )
}
