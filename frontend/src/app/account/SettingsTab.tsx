"use client"
import { useState } from "react"
import { Loader2, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import { updateProfile, changePassword, type AuthUser } from "@/lib/api"

export default function SettingsTab({ user, refreshUser, t }: { user: AuthUser; refreshUser: () => Promise<void>; t: (key: string) => string }) {
  const [displayName, setDisplayName] = useState(user.display_name || "")
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

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
    if (newPassword.length < 6) {
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
    </div>
  )
}
