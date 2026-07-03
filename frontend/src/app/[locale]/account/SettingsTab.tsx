"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2, Eye, EyeOff, AlertTriangle, X, Globe, Baby, Bell, Shield,
  Trash2, Download, Info,
} from "lucide-react"
import toast from "react-hot-toast"
import { updateProfile, changePassword, deleteAccount, type AuthUser } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { clearReadingHistory } from "@/lib/readingHistory"
import type { Locale } from "@/i18n/config"

// ── LocalStorage Keys ──────────────────────────────────────────────────────
const BIRTH_DATA_KEY = "profile_mirror_birth_data"
const NOTIF_KEY = "profile_mirror_notifications"

interface BirthData {
  gender: string
  birth_year: number
  birth_month: number
  birth_day: number
  birth_hour: number
}

interface NotifPrefs {
  reportReady: boolean
  weeklyStatus: boolean
  promotions: boolean
}

function loadBirthData(): BirthData | null {
  try {
    const raw = localStorage.getItem(BIRTH_DATA_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveBirthData(data: BirthData) {
  localStorage.setItem(BIRTH_DATA_KEY, JSON.stringify(data))
}

function loadNotifPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(NOTIF_KEY)
    return raw ? JSON.parse(raw) : { reportReady: true, weeklyStatus: true, promotions: false }
  } catch { return { reportReady: true, weeklyStatus: true, promotions: false } }
}

function saveNotifPrefs(prefs: NotifPrefs) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs))
}

// ── Toggle Switch ──────────────────────────────────────────────────────────
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
        enabled ? "bg-gold/40" : "bg-white/10"
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all duration-200 ${
        enabled ? "translate-x-5 bg-gold" : "translate-x-0 bg-white/40"
      }`} />
    </button>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function SettingsTab({ user, refreshUser, t }: { user: AuthUser; refreshUser: () => Promise<void>; t: (key: string) => string }) {
  const router = useRouter()
  const { logout } = useAuth()
  const { locale, setLocale, localeHref } = useLanguage()

  // Profile state
  const [displayName, setDisplayName] = useState(user.display_name || "")
  const [savingProfile, setSavingProfile] = useState(false)

  // Password state
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleting, setDeleting] = useState(false)

  // Birth info state
  const [birthData, setBirthData] = useState<BirthData | null>(null)
  const [editingBirth, setEditingBirth] = useState(false)
  const [birthForm, setBirthForm] = useState<BirthData>({ gender: "male", birth_year: 1990, birth_month: 1, birth_day: 1, birth_hour: 12 })

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({ reportReady: true, weeklyStatus: true, promotions: false })

  // Local history cleared flag
  const [historyCleared, setHistoryCleared] = useState(false)

  useEffect(() => {
    const bd = loadBirthData()
    if (bd) {
      setBirthData(bd)
      setBirthForm(bd)
    }
    setNotifPrefs(loadNotifPrefs())
  }, [])

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      await updateProfile(displayName)
      await refreshUser()
      toast.success(t("account.profileSaved"))
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? t("account.profileSaveFail"))
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.error(t("account.fillPasswords"))
      return
    }
    if (newPassword.length < 8) {
      toast.error(t("auth.passwordMin6"))
      return
    }
    if (newPassword !== confirmPw) {
      toast.error(t("auth.passwordMismatch"))
      return
    }
    setSavingPw(true)
    try {
      await changePassword(oldPassword, newPassword)
      toast.success(t("account.passwordChanged"))
      setOldPassword("")
      setNewPassword("")
      setConfirmPw("")
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? t("account.passwordChangeFail"))
    } finally {
      setSavingPw(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error(t("account.deleteConfirmPassword"))
      return
    }
    setDeleting(true)
    try {
      await deleteAccount(deletePassword)
      toast.success(t("account.deleteSuccess"))
      logout()
      router.push(localeHref("/"))
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? t("account.deleteFail"))
    } finally {
      setDeleting(false)
    }
  }

  const handleSaveBirth = () => {
    try {
      saveBirthData(birthForm)
      setBirthData(birthForm)
      setEditingBirth(false)
      toast.success(t("account.birthSaved"))
    } catch {
      toast.error(t("account.birthSaveFail"))
    }
  }

  const handleClearHistory = () => {
    clearReadingHistory()
    setHistoryCleared(true)
    toast.success(t("account.clearLocalHistoryDone"))
  }

  const handleNotifToggle = (key: keyof NotifPrefs) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(updated)
    saveNotifPrefs(updated)
  }

  const LANGUAGES: { locale: Locale; label: string; flag: string }[] = [
    { locale: "zh", label: "中文", flag: "🇨🇳" },
    { locale: "en", label: "English", flag: "🇺🇸" },
  ]

  const HOURS = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-lg text-gold">{t("account.settings")}</h2>

      {/* ── Language Preference ─────────────────────────────────────────── */}
      <div className="card-solid p-6">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={16} className="text-gold/60" />
          <h3 className="text-sm font-medium text-parchment-400">{t("account.language")}</h3>
        </div>
        <p className="text-parchment-400 text-xs mb-4">{t("account.languageDesc")}</p>
        <div className="flex gap-2">
          {LANGUAGES.map(l => (
            <button
              key={l.locale}
              onClick={() => setLocale(l.locale)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${
                locale === l.locale
                  ? "bg-gold/10 text-gold border border-gold/30"
                  : "bg-white/[0.03] text-parchment-400 border border-white/[0.08] hover:text-parchment-400"
              }`}
            >
              <span className="text-base">{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Edit Profile ───────────────────────────────────────────────── */}
      <div className="card-solid p-6">
        <h3 className="text-sm font-medium text-parchment-400 mb-4">{t("account.editProfile")}</h3>
        <div className="space-y-4">
          <div>
            <label className="label">{t("account.emailLabel")}</label>
            <input type="email" value={user.email} disabled className="input-field opacity-50 cursor-not-allowed" />
          </div>
          <div>
            <label className="label">{t("auth.displayName")}</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={t("auth.displayNamePlaceholder")}
              className="input-field"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="btn-primary px-6 py-2 text-sm flex items-center gap-2"
          >
            {savingProfile ? <Loader2 size={16} className="animate-spin" /> : null}
            {t("account.saveProfile")}
          </button>
        </div>
      </div>

      {/* ── Birth Info ─────────────────────────────────────────────────── */}
      <div className="card-solid p-6">
        <div className="flex items-center gap-2 mb-1">
          <Baby size={16} className="text-gold/60" />
          <h3 className="text-sm font-medium text-parchment-400">{t("account.birthInfo")}</h3>
        </div>
        <p className="text-parchment-400 text-xs mb-4">{t("account.birthInfoDesc")}</p>

        {!editingBirth && birthData ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/[0.03] rounded-lg p-3">
                <p className="text-parchment-400 text-xs mb-1">{t("account.gender")}</p>
                <p className="text-parchment-300 text-sm">{birthData.gender === "male" ? t("account.genderMale") : t("account.genderFemale")}</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <p className="text-parchment-400 text-xs mb-1">{t("account.birthYear")}</p>
                <p className="text-parchment-300 text-sm">{birthData.birth_year}</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <p className="text-parchment-400 text-xs mb-1">{t("account.birthMonth")}</p>
                <p className="text-parchment-300 text-sm">{birthData.birth_month}</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <p className="text-parchment-400 text-xs mb-1">{t("account.birthDay")}</p>
                <p className="text-parchment-300 text-sm">{birthData.birth_day}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="bg-white/[0.03] rounded-lg p-3 flex-1 mr-3">
                <p className="text-parchment-400 text-xs mb-1">{t("account.birthHour")}</p>
                <p className="text-parchment-300 text-sm">{birthData.birth_hour}:00</p>
              </div>
              <button
                onClick={() => setEditingBirth(true)}
                className="px-4 py-2.5 rounded-xl border border-white/15 text-parchment-400 text-sm hover:text-parchment-300 transition-colors"
              >
                {t("account.editProfile")}
              </button>
            </div>
          </div>
        ) : editingBirth ? (
          <div className="space-y-4">
            <div>
              <label className="label">{t("account.gender")}</label>
              <div className="flex gap-2">
                {(["male", "female"] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setBirthForm({ ...birthForm, gender: g })}
                    className={`flex-1 py-2.5 rounded-xl text-sm transition-all ${
                      birthForm.gender === g
                        ? "bg-gold/10 text-gold border border-gold/30"
                        : "bg-white/[0.03] text-parchment-400 border border-white/[0.08]"
                    }`}
                  >
                    {g === "male" ? t("account.genderMale") : t("account.genderFemale")}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">{t("account.birthYear")}</label>
                <input
                  type="number"
                  value={birthForm.birth_year}
                  onChange={e => setBirthForm({ ...birthForm, birth_year: +e.target.value })}
                  className="input-field"
                  min={1900}
                  max={2100}
                />
              </div>
              <div>
                <label className="label">{t("account.birthMonth")}</label>
                <input
                  type="number"
                  value={birthForm.birth_month}
                  onChange={e => setBirthForm({ ...birthForm, birth_month: +e.target.value })}
                  className="input-field"
                  min={1}
                  max={12}
                />
              </div>
              <div>
                <label className="label">{t("account.birthDay")}</label>
                <input
                  type="number"
                  value={birthForm.birth_day}
                  onChange={e => setBirthForm({ ...birthForm, birth_day: +e.target.value })}
                  className="input-field"
                  min={1}
                  max={31}
                />
              </div>
            </div>
            <div>
              <label className="label">{t("account.birthHour")}</label>
              <select
                value={birthForm.birth_hour}
                onChange={e => setBirthForm({ ...birthForm, birth_hour: +e.target.value })}
                className="input-field"
              >
                {HOURS.map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setEditingBirth(false); if (birthData) setBirthForm(birthData) }}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-parchment-400 text-sm hover:text-parchment-300 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button onClick={handleSaveBirth} className="btn-primary flex-1 py-2.5 text-sm">
                {t("account.saveProfile")}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-parchment-400 text-sm mb-3">{t("account.noBirthInfo")}</p>
            <button
              onClick={() => setEditingBirth(true)}
              className="btn-primary px-6 py-2 text-sm"
            >
              {t("account.birthInfoHint")}
            </button>
          </div>
        )}
      </div>

      {/* ── Notification Preferences ────────────────────────────────────── */}
      <div className="card-solid p-6">
        <div className="flex items-center gap-2 mb-1">
          <Bell size={16} className="text-gold/60" />
          <h3 className="text-sm font-medium text-parchment-400">{t("account.notifications")}</h3>
        </div>
        <p className="text-parchment-400 text-xs mb-4">{t("account.notificationsDesc")}</p>
        <div className="space-y-4">
          {([
            { key: "reportReady" as const, label: t("account.notifyReportReady"), desc: t("account.notifyReportReadyDesc") },
            { key: "weeklyStatus" as const, label: t("account.notifyWeeklyFortune"), desc: t("account.notifyWeeklyFortuneDesc") },
            { key: "promotions" as const, label: t("account.notifyPromotions"), desc: t("account.notifyPromotionsDesc") },
          ]).map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <p className="text-parchment-400 text-sm">{item.label}</p>
                <p className="text-parchment-400 text-xs">{item.desc}</p>
              </div>
              <Toggle enabled={notifPrefs[item.key]} onToggle={() => handleNotifToggle(item.key)} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Data & Privacy ─────────────────────────────────────────────── */}
      <div className="card-solid p-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-gold/60" />
          <h3 className="text-sm font-medium text-parchment-400">{t("account.dataPrivacy")}</h3>
        </div>
        <p className="text-parchment-400 text-xs mb-4">{t("account.dataPrivacyDesc")}</p>
        <div className="space-y-4">
          {/* Clear local history */}
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <p className="text-parchment-400 text-sm">{t("account.clearLocalHistory")}</p>
              <p className="text-parchment-400 text-xs">{t("account.clearLocalHistoryDesc")}</p>
            </div>
            <button
              onClick={handleClearHistory}
              disabled={historyCleared}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                historyCleared
                  ? "text-parchment-400 border border-white/[0.06] cursor-not-allowed"
                  : "text-red-400/80 border border-red-500/20 hover:bg-red-500/10"
              }`}
            >
              <Trash2 size={12} />
              {historyCleared ? t("account.clearLocalHistoryDone") : t("account.clearLocalHistory")}
            </button>
          </div>

          <div className="border-t border-white/5" />

          {/* Export data */}
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <p className="text-parchment-400 text-sm">{t("account.exportData")}</p>
              <p className="text-parchment-400 text-xs">{t("account.exportDataDesc")}</p>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-parchment-400 border border-white/[0.06]">
              <Download size={12} />
              {t("account.exportDataHint")}
            </span>
          </div>

          <div className="border-t border-white/5" />

          {/* Data retention */}
          <div className="flex items-start gap-2">
            <Info size={14} className="text-parchment-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-parchment-400 text-xs">{t("account.dataRetention")}</p>
              <p className="text-parchment-400 text-xs mt-1 leading-relaxed">{t("account.dataRetentionDesc")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Change Password ─────────────────────────────────────────────── */}
      <div className="card-solid p-6">
        <h3 className="text-sm font-medium text-parchment-400 mb-4">{t("account.changePassword")}</h3>
        <div className="space-y-4">
          <div>
            <label className="label">{t("account.currentPassword")}</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder={t("account.currentPasswordPlaceholder")}
              className="input-field"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="label">{t("auth.newPassword")}</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder2")}
                className="input-field pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment-400 hover:text-parchment-400"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">{t("auth.confirmPassword")}</label>
            <input
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder={t("auth.confirmPasswordPlaceholder")}
              className="input-field"
              autoComplete="new-password"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={savingPw}
            className="btn-primary px-6 py-2 text-sm flex items-center gap-2"
          >
            {savingPw ? <Loader2 size={16} className="animate-spin" /> : null}
            {t("account.changePassword")}
          </button>
        </div>
      </div>

      {/* ── Delete Account ──────────────────────────────────────────────── */}
      <div className="card-solid p-6 border border-red-500/10">
        <h3 className="text-sm font-medium text-red-400/80 mb-2">{t("account.deleteAccount")}</h3>
        <p className="text-parchment-400 text-xs mb-4">{t("account.deleteAccountDesc")}</p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-6 py-2 text-sm border border-red-500/30 text-red-400/80 rounded-xl hover:bg-red-500/10 transition-colors"
        >
          {t("account.deleteAccount")}
        </button>
      </div>

      {/* ── Delete Confirmation Modal ──────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card-solid w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-400" />
                <h3 className="text-lg font-serif font-bold text-red-400">{t("account.deleteConfirmTitle")}</h3>
              </div>
              <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword("") }}
                className="text-parchment-400 hover:text-parchment-400">
                <X size={18} />
              </button>
            </div>
            <p className="text-parchment-400 text-sm leading-relaxed">{t("account.deleteConfirmDesc")}</p>
            <div>
              <label className="label">{t("account.deleteConfirmPassword")}</label>
              <input
                type="password"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                placeholder={t("account.currentPasswordPlaceholder")}
                className="input-field"
                autoFocus
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeletePassword("") }}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-parchment-400 text-sm hover:text-parchment-300 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || !deletePassword}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
                {t("account.deleteAccount")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
