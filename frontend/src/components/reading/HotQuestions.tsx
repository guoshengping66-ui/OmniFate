"use client"

const HOT_QUESTIONS = [
  { text: "事业方向与跳槽时机", icon: "💼" },
  { text: "近期桃花运与感情发展", icon: "💕" },
  { text: "财运分析与投资建议", icon: "💰" },
  { text: "未来半年整体运势", icon: "🌟" },
  { text: "创业时机与适合领域", icon: "🚀" },
  { text: "家庭关系与相处之道", icon: "🏠" },
]

interface Props {
  value: string
  onChange: (q: string) => void
}

export function HotQuestions({ value, onChange }: Props) {
  return (
    <div>
      <label className="label text-sm text-white/50 mb-3">
        热门问题快速选择（点击后自动填入）
      </label>
      <div className="flex flex-wrap gap-2">
        {HOT_QUESTIONS.map(({ text, icon }) => {
          // Map the quick label to the full question text
          const fullText = ({
            "事业方向与跳槽时机": "我的事业方向如何？今年适合换工作吗？",
            "近期桃花运与感情发展": "近三个月的桃花运和感情发展如何？",
            "财运分析与投资建议": "财运分析：投资理财需要注意什么？",
            "未来半年整体运势": "未来半年的整体运势和吉凶方位",
            "创业时机与适合领域": "我适合创业吗？什么时机最佳？",
            "家庭关系与相处之道": "家庭关系：与家人的缘分和相处之道",
          })[text] || text

          const selected = value === fullText

          return (
            <button
              key={text}
              type="button"
              onClick={() => onChange(fullText)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all
                ${selected
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-white/15 text-white/40 hover:border-white/30 hover:text-white/60 hover:bg-white/5"}`}
            >
              <span>{icon}</span>
              <span>{text}</span>
            </button>
          )
        })}
      </div>
      <p className="text-white/20 text-xs mt-2">或在下方面向框中输入你关心的问题</p>
    </div>
  )
}
