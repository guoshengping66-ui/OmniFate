"use client"
import { useState, useEffect, useCallback } from "react"
import {
  Coins, Copy, Check, Loader2, Zap, Gift, Link as LinkIcon,
  ExternalLink, ShieldCheck, AlertCircle, Sparkles, ChevronRight,
  Globe, MapPin,
} from "lucide-react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { useRegion } from "@/hooks/useRegion"
import {
  getGeoConfig, redeemCode, verifyTx,
  type GeoConfig, type StardustPackage,
} from "@/lib/api"

// ── 心学意境 Loading 文案 ───────────────────────────────────────────────────
const CRYPTO_LOADING_TIPS = [
  "正在感应链上灵气…",
  "正在对齐哈希因果…",
  "正在合参跨链脉络…",
  "正在推演 Token 生克…",
  "正在验证地址风水…",
  "正在感应气场共振…",
  "正在解析区块心印…",
]

// ═════════════════════════════════════════════════════════════════════════════
//  Skeleton 骨架屏
// ═════════════════════════════════════════════════════════════════════════════

function SkeletonScreen() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Balance card skeleton */}
      <div className="card-glass p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 shimmer-skeleton" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-24 bg-white/5 rounded shimmer-skeleton" />
            <div className="h-8 w-40 bg-white/5 rounded shimmer-skeleton" />
          </div>
        </div>
      </div>
      {/* Package skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card-glass p-5 space-y-3">
            <div className="h-6 w-20 bg-white/5 rounded shimmer-skeleton" />
            <div className="h-10 w-16 bg-white/5 rounded shimmer-skeleton" />
            <div className="h-4 w-full bg-white/5 rounded shimmer-skeleton" />
            <div className="h-10 w-full bg-white/5 rounded-full shimmer-skeleton" />
          </div>
        ))}
      </div>
      {/* Channel skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass p-6 h-48 shimmer-skeleton" />
        <div className="card-glass p-6 h-48 shimmer-skeleton" />
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  Balance Card
// ═════════════════════════════════════════════════════════════════════════════

function BalanceCard({ balance }: { balance: number }) {
  return (
    <div className="card-glow p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center">
          <Coins size={28} className="text-gold" />
        </div>
        <div>
          <p className="text-white/40 text-xs tracking-wider uppercase mb-1">星尘余额 Stardust</p>
          <p className="text-3xl font-bold text-gold font-serif">{balance.toLocaleString()}</p>
          <p className="text-white/30 text-xs mt-1">
            可用于解锁报告、事件复盘、AI 追问等
          </p>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  Package Card
// ═════════════════════════════════════════════════════════════════════════════

function PackageCard({
  pkg, symbol, currency, isSelected, onSelect,
}: {
  pkg: StardustPackage
  symbol: string
  currency: string
  isSelected: boolean
  onSelect: () => void
}) {
  const rate = currency === "CNY" ? (pkg.price / pkg.stardust * 100).toFixed(1) : (pkg.price / pkg.stardust).toFixed(2)

  return (
    <button
      onClick={onSelect}
      className={`relative card-glass p-5 text-left transition-all duration-300 ${
        isSelected
          ? "border-gold/50 bg-gold/5 shadow-[0_0_30px_rgba(201,168,76,0.1)]"
          : "hover:border-white/20 hover:bg-white/[0.03]"
      }`}
    >
      {pkg.popular && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gold text-ink text-[10px] font-bold rounded-full">
          HOT
        </div>
      )}

      <div className="flex items-baseline gap-1 mb-2">
        <Sparkles size={14} className="text-gold" />
        <span className="text-white/60 text-xs">星尘</span>
      </div>

      <p className="text-2xl font-bold text-white mb-1">{pkg.stardust.toLocaleString()}</p>
      <p className="text-gold font-serif text-lg">
        {symbol}{pkg.price}
      </p>
      <p className="text-white/25 text-[10px] mt-2">
        ≈ {currency === "CNY" ? "￥" : "$"}{rate}/{currency === "CNY" ? "百星" : "星"}
      </p>

      {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
          <Check size={12} className="text-ink" strokeWidth={3} />
        </div>
      )}
    </button>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  CN Region Panel (爱发电 + 卡密)
// ═════════════════════════════════════════════════════════════════════════════

function CNPanel({ config, onRefreshBalance }: { config: GeoConfig; onRefreshBalance: () => void }) {
  const { t } = useLanguage()
  const [redeemInput, setRedeemInput] = useState("")
  const [redeeming, setRedeeming] = useState(false)

  const handleRedeem = async () => {
    if (!redeemInput.trim()) {
      toast.error("请输入兑换码")
      return
    }
    setRedeeming(true)
    try {
      const result = await redeemCode(redeemInput.trim())
      toast.success(result.message)
      setRedeemInput("")
      onRefreshBalance()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "兑换失败，请检查兑换码")
    } finally {
      setRedeeming(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 爱发电/面包多跳转 */}
      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift size={16} className="text-gold" />
          <span className="text-white/70 text-sm font-medium">赞助支持</span>
        </div>
        <p className="text-white/40 text-xs mb-4 leading-relaxed">
          通过爱发电平台赞助我们，获得等值星尘算力。赞助金额将全额转化为星尘。
        </p>
        <a
          href={config.aifadian_url || "https://afdian.com"}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold w-full py-3 flex items-center justify-center gap-2 text-sm"
        >
          前往爱发电赞助 <ExternalLink size={14} />
        </a>
      </div>

      {/* 卡密兑换 */}
      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon size={16} className="text-gold" />
          <span className="text-white/70 text-sm font-medium">卡密 / 兑换码</span>
        </div>
        <p className="text-white/40 text-xs mb-4 leading-relaxed">
          输入通过赞助获得的兑换码，直接激活星尘算力。
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={redeemInput}
            onChange={e => setRedeemInput(e.target.value.toUpperCase())}
            placeholder="输入兑换码 (如 ABCD-1234)"
            className="input-field flex-1 text-sm tracking-widest font-mono"
            maxLength={32}
            onKeyDown={e => e.key === "Enter" && handleRedeem()}
          />
          <button
            onClick={handleRedeem}
            disabled={redeeming || !redeemInput.trim()}
            className="btn-gold px-6 py-3 flex items-center gap-2 text-sm whitespace-nowrap disabled:opacity-40"
          >
            {redeeming ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Zap size={16} />
            )}
            激活
          </button>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  GLOBAL Region Panel (PayPal + USDT)
// ═════════════════════════════════════════════════════════════════════════════

function GlobalPanel({
  config, selectedPkg, onRefreshBalance,
}: {
  config: GeoConfig
  selectedPkg: StardustPackage | null
  onRefreshBalance: () => void
}) {
  const { t } = useLanguage()

  // ── USDT 校验状态 ─────────────────────────────────────────────────────
  const [network, setNetwork] = useState<"TRC20" | "ARBITRUM">("TRC20")
  const [txInput, setTxInput] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean; stardust_granted: number; balance_after: number; message: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const [loadingTip, setLoadingTip] = useState(CRYPTO_LOADING_TIPS[0])

  // 旋转心学文案
  useEffect(() => {
    if (!verifying) return
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % CRYPTO_LOADING_TIPS.length
      setLoadingTip(CRYPTO_LOADING_TIPS[idx])
    }, 2500)
    return () => clearInterval(interval)
  }, [verifying])

  const walletAddress = config.wallet_addresses?.[network] || ""

  const copyAddress = () => {
    if (!walletAddress) return
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    toast.success("收款地址已复制")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerifyTx = async () => {
    if (!txInput.trim()) {
      toast.error("请输入交易哈希")
      return
    }
    setVerifying(true)
    setVerifyResult(null)
    try {
      const result = await verifyTx(txInput.trim(), network)
      setVerifyResult(result)
      toast.success(result.message)
      onRefreshBalance()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "校验失败，请检查 TxID")
    } finally {
      setVerifying(false)
    }
  }

  const cryptoRate = config.crypto_rate?.USDT || 70

  return (
    <div className="space-y-6">
      {/* PayPal */}
      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg viewBox="0 0 24 24" width={16} height={16} className="text-blue-400" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
          </svg>
          <span className="text-white/70 text-sm font-medium">PayPal 安全支付</span>
        </div>
        <p className="text-white/40 text-xs mb-4 leading-relaxed">
          使用 PayPal 信用卡/借记卡安全支付，到账即刻自动充值。
        </p>
        {selectedPkg ? (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">充值金额</span>
              <span className="text-white font-bold">
                {config.symbol}{selectedPkg.price} USD
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-white/60 text-sm">到账星尘</span>
              <span className="text-gold font-bold">{selectedPkg.stardust.toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <p className="text-gold/50 text-xs mb-4">← 请先在上方选择充值套餐</p>
        )}
        <button
          disabled={!selectedPkg}
          className="w-full py-3 rounded-full font-semibold text-white bg-[#0070ba] hover:bg-[#005ea6] transition-colors disabled:opacity-30 flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
          </svg>
          PayPal 支付 {selectedPkg ? `${config.symbol}${selectedPkg.price}` : ""}
        </button>
      </div>

      {/* USDT 链上充值 */}
      <div className="card-glass p-6 relative overflow-hidden">
        {/* 赛博风格背景装饰 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/5 to-transparent pointer-events-none rounded-bl-full" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={16} className="text-cyan-400" />
            <span className="text-white/70 text-sm font-medium">
              赛博去中心化网络
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">
              TRC-20 / Arbitrum
            </span>
          </div>

          <p className="text-white/40 text-xs mb-4 leading-relaxed">
            向下方地址转入 USDT，完成转账后粘贴交易哈希，系统自动校验并发放星尘。
            汇率: <span className="text-gold">1 USDT = {cryptoRate} 星尘</span>
          </p>

          {/* 网络选择 */}
          <div className="flex gap-2 mb-4">
            {(["TRC20", "ARBITRUM"] as const).map(net => (
              <button
                key={net}
                onClick={() => setNetwork(net)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  network === net
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                    : "bg-white/5 text-white/40 border border-white/10 hover:border-white/20"
                }`}
              >
                {net === "TRC20" ? "TRC-20 (波场)" : "Arbitrum (EVM)"}
              </button>
            ))}
          </div>

          {/* 收款地址 */}
          {walletAddress ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
              <p className="text-white/30 text-[10px] mb-2 uppercase tracking-wider">收款地址</p>
              <div className="flex items-center gap-2">
                <code className="text-white/80 text-xs font-mono break-all flex-1 select-all">
                  {walletAddress}
                </code>
                <button
                  onClick={copyAddress}
                  className="flex-shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {copied ? (
                    <Check size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} className="text-white/40" />
                  )}
                </button>
              </div>
              <p className="text-amber-400/50 text-[10px] mt-2">
                ⚠️ 请确认转入 {network} 网络的 USDT，其他网络将无法到账
              </p>
            </div>
          ) : (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-4 text-center">
              <AlertCircle size={20} className="text-amber-400 mx-auto mb-2" />
              <p className="text-amber-300/60 text-xs">该网络收款地址暂未配置</p>
            </div>
          )}

          {/* TxID 输入 */}
          {!verifying && !verifyResult && (
            <>
              <div className="mb-4">
                <label className="text-white/40 text-[10px] mb-1.5 block uppercase tracking-wider">
                  交易哈希 TxID
                </label>
                <input
                  type="text"
                  value={txInput}
                  onChange={e => setTxInput(e.target.value.trim())}
                  placeholder={network === "TRC20"
                    ? "粘贴波场交易哈希 (如 a1b2c3...)"
                    : "粘贴 Arbitrum 交易哈希 (如 0xabc...)"
                  }
                  className="input-field text-xs font-mono"
                  spellCheck={false}
                />
              </div>
              <button
                onClick={handleVerifyTx}
                disabled={!txInput.trim() || !walletAddress}
                className="w-full py-3 rounded-full font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-30 flex items-center justify-center gap-2 text-sm"
              >
                <Zap size={16} /> 校准链上算力
              </button>
            </>
          )}

          {/* Loading 动画 */}
          {verifying && (
            <div className="text-center py-8 space-y-4">
              <div className="relative inline-block">
                <Loader2 size={48} className="animate-spin text-gold" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-gold rounded-full animate-pulse" />
                </div>
              </div>
              <p className="text-gold/80 text-sm font-serif animate-pulse">
                {loadingTip}
              </p>
              <p className="text-white/20 text-xs">
                正在与区块链节点建立连接…
              </p>
            </div>
          )}

          {/* 结果展示 */}
          {verifyResult && verifyResult.success && (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                <Check size={32} className="text-green-400" />
              </div>
              <p className="text-green-400 font-bold text-lg">校验通过</p>
              <p className="text-white/60 text-sm">
                到账 <span className="text-gold font-bold text-xl">{verifyResult.stardust_granted.toLocaleString()}</span> 颗星尘
              </p>
              <p className="text-white/30 text-xs">
                当前余额: {verifyResult.balance_after.toLocaleString()} 星尘
              </p>
              <button
                onClick={() => { setVerifyResult(null); setTxInput("") }}
                className="btn-gold-outline text-xs px-4 py-2"
              >
                继续充值
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  Main BillingDashboard
// ═════════════════════════════════════════════════════════════════════════════

export function BillingDashboard() {
  const { t } = useLanguage()
  const { user, refreshUser } = useAuth()
  const { region, switchRegion, isLoaded: regionLoaded } = useRegion()

  const [config, setConfig] = useState<GeoConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPkg, setSelectedPkg] = useState<StardustPackage | null>(null)
  const [balance, setBalance] = useState(0)

  const fetchBalance = useCallback(async () => {
    try {
      const { api } = await import("@/lib/api")
      const res = await api.get("/api/credits/balance")
      setBalance(res.data.balance)
    } catch {
      // fallback: use user store balance
      if (user) setBalance((user as any).stardust_balance || 0)
    }
  }, [user])

  // Fetch geo-config (with region override)
  const fetchConfig = useCallback(async (regionOverride?: "CN" | "GLOBAL") => {
    try {
      const override = regionOverride || (region === "overseas" ? "GLOBAL" : "CN")
      const cfg = await getGeoConfig(override)
      setConfig(cfg)
      // Auto-select popular package
      const popular = cfg.packages.find(p => p.popular)
      if (popular) setSelectedPkg(popular)
    } catch {
      // Fallback: assume domestic if geo-config fails
      setConfig({
        region: "CN",
        currency: "CNY",
        symbol: "￥",
        packages: [
          { id: "stardust_100", stardust: 100, price: 9.9, popular: false },
          { id: "stardust_500", stardust: 500, price: 39.9, popular: true },
          { id: "stardust_1000", stardust: 1000, price: 69.9, popular: false },
        ],
        channels: ["REDEEM", "AIFADIAN"],
      })
    }
  }, [region])

  useEffect(() => {
    if (!regionLoaded) return
    fetchConfig().finally(() => setLoading(false))
    fetchBalance()
  }, [regionLoaded, fetchConfig, fetchBalance])

  // Re-fetch config when region changes (from toggle)
  const handleRegionSwitch = async (newRegion: "domestic" | "overseas") => {
    switchRegion(newRegion)
    setLoading(true)
    const override = newRegion === "overseas" ? "GLOBAL" : "CN"
    await fetchConfig(override)
    setLoading(false)
  }

  const handleRefreshBalance = () => {
    fetchBalance()
    refreshUser()
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <SkeletonScreen />
      </div>
    )
  }

  if (!config) return null

  const isCN = config.region === "CN"

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 余额卡片 */}
      <BalanceCard balance={balance} />

      {/* ══════════ Region Toggle ══════════ */}
      <div className="flex items-center justify-center">
        <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full p-1">
          <motion.div
            className="absolute top-1 bottom-1 rounded-full bg-gold/15 border border-gold/25"
            layout
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              left: region === "domestic" ? "4px" : "50%",
              width: "calc(50% - 4px)",
            }}
          />
          <button
            onClick={() => handleRegionSwitch("domestic")}
            className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1.5
              ${region === "domestic" ? "text-gold" : "text-white/40 hover:text-white/60"}`}
          >
            <MapPin size={14} />
            国内 (CNY)
          </button>
          <button
            onClick={() => handleRegionSwitch("overseas")}
            className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1.5
              ${region === "overseas" ? "text-gold" : "text-white/40 hover:text-white/60"}`}
          >
            <Globe size={14} />
            海外 (USD)
          </button>
        </div>
      </div>

      {/* 套餐选择 */}
      <div>
        <div className="section-heading mb-4">
          <div className="bar" />
          <span className="text">
            选择充值套餐 — {isCN ? "人民币定价 CNY" : "美元定价 USD"}
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {config.packages.map(pkg => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              symbol={config.symbol}
              currency={config.currency}
              isSelected={selectedPkg?.id === pkg.id}
              onSelect={() => setSelectedPkg(pkg)}
            />
          ))}
        </div>
      </div>

      {/* 支付通道 */}
      <div className="gold-divider" />

      {isCN ? (
        <CNPanel config={config} onRefreshBalance={handleRefreshBalance} />
      ) : (
        <GlobalPanel
          config={config}
          selectedPkg={selectedPkg}
          onRefreshBalance={handleRefreshBalance}
        />
      )}
    </div>
  )
}
