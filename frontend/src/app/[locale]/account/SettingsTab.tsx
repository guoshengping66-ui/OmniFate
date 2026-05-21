"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Eye, EyeOff, AlertTriangle, X } from "lucide-react"
import toast from "react-hot-toast"
import { updateProfile, changePassword, deleteAccount, type AuthUser } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

export default function SettingsTab({ user, refreshUser, t }: { user: AuthUser; refreshUser: () => Promise<void>; t: (key: string) => string }) {
  const router = useRouter()
  const { logout } = useAuth()
  const [displayName, setDisplayName] = useState(user.display_name || "")
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  // Delete account states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleting, setDeleting] = useState(false)

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
      router.push("/")
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? t("account.deleteFail"))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-lg text-gold">{t("account.settings")}</h2>

      {/* Edit Profile */}
      <div className="card-glass p-6">
        <h3 className="text-sm font-medium text-white/60 mb-4">{t("account.editProfile")}</h3>
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
            className="btn-gold px-6 py-2 text-sm flex items-center gap-2"
          >
            {savingProfile ? <Loader2 size={16} className="animate-spin" /> : null}
            {t("account.saveProfile")}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="card-glass p-6">
        <h3 className="text-sm font-medium text-white/60 mb-4">{t("account.changePassword")}</h3>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
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
            className="btn-gold px-6 py-2 text-sm flex items-center gap-2"
          >
            {savingPw ? <Loader2 size={16} className="animate-spin" /> : null}
            {t("account.changePassword")}
          </button>
        </div>
      </div>

      {/* Delete Account */}
      <div className="card-glass p-6 border border-red-500/10">
        <h3 className="text-sm font-medium text-red-400/80 mb-2">{t("account.deleteAccount")}</h3>
        <p className="text-white/30 text-xs mb-4">{t("account.deleteAccountDesc")}</p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-6 py-2 text-sm border border-red-500/30 text-red-400/80 rounded-xl hover:bg-red-500/10 transition-colors"
        >
          {t("account.deleteAccount")}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card-glass w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-400" />
                <h3 className="text-lg font-serif font-bold text-red-400">{t("account.deleteConfirmTitle")}</h3>
              </div>
              <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword("") }}
                className="text-white/30 hover:text-white/60">
                <X size={18} />
              </button>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">{t("account.deleteConfirmDesc")}</p>
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
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-white/50 text-sm hover:text-white/70 transition-colors"
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
