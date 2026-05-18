"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, Shield } from "lucide-react"

interface ServiceTermsProps {
  open: boolean
  onClose: () => void
}

export function ServiceTerms({ open, onClose }: ServiceTermsProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[80vh] card-glass rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-gold" />
                <h2 className="font-serif text-lg text-gold">服务条款与免责声明</h2>
              </div>
              <button
                onClick={onClose}
                className="text-white/30 hover:text-white/60"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4 text-white/60 text-sm leading-relaxed">
              <div>
                <h3 className="text-white/80 font-medium mb-2">1. 服务性质</h3>
                <p>
                  命盘智镜（AlphaMirror）提供的所有命理推演、运势分析、能量诊断等功能，
                  均基于算法辅助的心理建议与文化参考，仅供用户娱乐和自我反思使用。
                </p>
              </div>

              <div>
                <h3 className="text-white/80 font-medium mb-2">2. 免责声明</h3>
                <p>
                  本平台提供的内容不构成任何投资建议、法律建议、医疗建议或重大决策依据。
                  用户因参考本平台内容而做出的任何决策，均由用户自行承担责任。
                </p>
              </div>

              <div>
                <h3 className="text-white/80 font-medium mb-2">3. 星尘道具说明</h3>
                <p>
                  星尘（Stardust）是本平台的虚拟道具，用于解锁各项功能。
                  星尘不可提现、不可转让、不可兑换现金或实物。
                  购买星尘即表示您理解并接受此虚拟道具的使用规则。
                </p>
              </div>

              <div>
                <h3 className="text-white/80 font-medium mb-2">4. 会员订阅</h3>
                <p>
                  会员订阅服务可随时取消，取消后将在当前计费周期结束后停止续费。
                  已支付的费用根据退款政策处理。创始席位为一次性终身购买，不支持退款。
                </p>
              </div>

              <div>
                <h3 className="text-white/80 font-medium mb-2">5. 年龄限制</h3>
                <p>
                  本平台面向 18 周岁及以上用户。未满 18 周岁的用户请在监护人指导下使用。
                </p>
              </div>

              <div className="pt-2 border-t border-white/10">
                <p className="text-white/40 text-xs">
                  如有任何疑问，请联系我们的支持团队。继续使用本平台即表示您已阅读并同意上述条款。
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-gold/10 border border-gold/20 rounded-xl text-gold text-sm
                         hover:bg-gold/20 transition-colors"
              >
                我已阅读并理解
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
