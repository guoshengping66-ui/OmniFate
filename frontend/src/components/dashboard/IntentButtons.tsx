"use client"
import { useRouter } from "next/navigation"
import { Sparkles, Zap, Target, Users } from "lucide-react"
import { useWizardStore } from "@/stores/useWizardStore"
import { useUserStore } from "@/stores/useUserStore"
import { useLanguage } from "@/contexts/LanguageContext"

interface Props {
  onGework?: () => void
}

export function IntentButtons({ onGework }: Props) {
  const router = useRouter()
  const { reset: resetWizard } = useWizardStore()
  const { t } = useLanguage()

  const handleQuick = () => { resetWizard(); router.push("/predict?intent=quick") }
  const handleFull = () => { resetWizard(); router.push("/predict?intent=full") }
  const handleFriend = () => { resetWizard(); router.push("/predict?intent=friend") }

  return (
    <div className="space-y-3">
      {/* 一键推命 */}
      <button
        onClick={handleQuick}
        className="w-full card-glass p-4 text-left group hover:border-gold/30 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
            <Zap size={20} className="text-gold" />
          </div>
          <div>
            <div className="text-white/80 text-sm font-medium">{t("dash.intent.quick")}</div>
            <div className="text-white/30 text-xs">{t("dash.intent.quickDesc")}</div>
          </div>
        </div>
      </button>

      {/* 完整推命 */}
      <button
        onClick={handleFull}
        className="w-full card-glass p-4 text-left group hover:border-gold/30 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-gold" />
          </div>
          <div>
            <div className="text-white/80 text-sm font-medium">{t("dash.intent.full")}</div>
            <div className="text-white/30 text-xs">{t("dash.intent.fullDesc")}</div>
          </div>
        </div>
      </button>

      {/* 格物致知 */}
      <button
        onClick={onGework}
        className="w-full card-glass p-4 text-left group hover:border-white/20 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
            <Target size={20} className="text-white/50" />
          </div>
          <div>
            <div className="text-white/80 text-sm font-medium">{t("dash.intent.event")}</div>
            <div className="text-white/30 text-xs">{t("dash.intent.eventDesc")}</div>
          </div>
        </div>
      </button>

      {/* 帮朋友测 */}
      <button
        onClick={handleFriend}
        className="w-full card-glass p-4 text-left group hover:border-white/20 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
            <Users size={20} className="text-white/50" />
          </div>
          <div>
            <div className="text-white/80 text-sm font-medium">{t("dash.intent.friend")}</div>
            <div className="text-white/30 text-xs">{t("dash.intent.friendDesc")}</div>
          </div>
        </div>
      </button>
    </div>
  )
}
