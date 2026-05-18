"use client"
import { useState, useEffect } from "react"
import { MapPin, X, Check, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress,
  type Address, type AddressFormData,
} from "@/lib/api"
import { CHINA_REGIONS } from "@/data/china-regions"

interface AddressFormProps {
  onSelect?: (address: Address) => void
  selectedId?: string | null
}

export function AddressForm({ onSelect, selectedId }: AddressFormProps) {
  const { t, locale } = useLanguage()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [country, setCountry] = useState("CN")
  const [province, setProvince] = useState("")
  const [city, setCity] = useState("")
  const [district, setDistrict] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [phone, setPhone] = useState("")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [isDefault, setIsDefault] = useState(false)

  const isChina = country === "CN"

  // Cascading selectors for China
  const provinces = CHINA_REGIONS.map(p => p.name)
  const cities = isChina && province
    ? (CHINA_REGIONS.find(p => p.name === province)?.children || []).map(c => c.name)
    : []
  const districts = isChina && province && city
    ? (CHINA_REGIONS.find(p => p.name === province)?.children || [])
        .find(c => c.name === city)?.children || []
    : []

  useEffect(() => {
    loadAddresses()
  }, [])

  // Reset city/district when province changes
  useEffect(() => { setCity(""); setDistrict("") }, [province])
  useEffect(() => { setDistrict("") }, [city])

  async function loadAddresses() {
    try {
      const addrs = await getAddresses()
      setAddresses(addrs)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setCountry("CN"); setProvince(""); setCity(""); setDistrict("")
    setRecipientName(""); setPhone(""); setAddressLine1(""); setAddressLine2("")
    setPostalCode(""); setIsDefault(false); setEditingId(null)
  }

  function startEdit(addr: Address) {
    setEditingId(addr.id)
    setCountry(addr.country)
    setProvince(addr.province || "")
    setCity(addr.city || "")
    setDistrict(addr.district || "")
    setRecipientName(addr.recipient_name)
    setPhone(addr.phone)
    setAddressLine1(addr.address_line1)
    setAddressLine2(addr.address_line2 || "")
    setPostalCode(addr.postal_code || "")
    setIsDefault(addr.is_default)
    setShowForm(true)
  }

  async function handleSave() {
    if (!recipientName.trim() || !phone.trim() || !addressLine1.trim()) {
      toast.error(t("address.fillRequired"))
      return
    }
    if (isChina && (!province || !city || !district)) {
      toast.error(t("address.fillRegion"))
      return
    }

    const data: AddressFormData = {
      recipient_name: recipientName.trim(),
      phone: phone.trim(),
      country,
      province: isChina ? province : null,
      city: isChina ? city : null,
      district: isChina ? district : null,
      address_line1: addressLine1.trim(),
      address_line2: addressLine2.trim() || null,
      postal_code: postalCode.trim() || null,
      is_default: isDefault,
    }

    setSaving(true)
    try {
      if (editingId) {
        const updated = await updateAddress(editingId, data)
        setAddresses(prev => prev.map(a => a.id === editingId ? updated : a))
      } else {
        const created = await createAddress(data)
        setAddresses(prev => [created, ...prev])
      }
      setShowForm(false)
      resetForm()
      toast.success(editingId ? t("address.updated") : t("address.created"))
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t("address.saveFail"))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAddress(id)
      setAddresses(prev => prev.filter(a => a.id !== id))
      toast.success(t("address.deleted"))
    } catch {
      toast.error(t("address.deleteFail"))
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await setDefaultAddress(id)
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })))
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Address list */}
      {addresses.length > 0 && !showForm && (
        <div className="space-y-2">
          {addresses.map(addr => (
            <div
              key={addr.id}
              onClick={() => onSelect?.(addr)}
              className={`card-glass p-4 cursor-pointer transition-all ${
                selectedId === addr.id
                  ? "border-gold/40 bg-gold/5"
                  : "hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/80 text-sm font-medium">{addr.recipient_name}</span>
                    <span className="text-white/40 text-xs">{addr.phone}</span>
                    {addr.is_default && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-gold/10 text-gold rounded border border-gold/20">
                        {t("address.default")}
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-xs truncate">
                    {addr.country === "CN"
                      ? `${addr.province} ${addr.city} ${addr.district} ${addr.address_line1}`
                      : `${addr.country} ${addr.address_line1}`
                    }
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2" onClick={e => e.stopPropagation()}>
                  {selectedId === addr.id && (
                    <Check size={16} className="text-gold" />
                  )}
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/5" onClick={e => e.stopPropagation()}>
                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[10px] text-white/30 hover:text-gold transition-colors"
                  >
                    {t("address.setDefault")}
                  </button>
                )}
                <button
                  onClick={() => startEdit(addr)}
                  className="text-[10px] text-white/30 hover:text-gold transition-colors"
                >
                  {t("common.edit")}
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-[10px] text-white/30 hover:text-red-400 transition-colors"
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add button or form */}
      {!showForm ? (
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="w-full p-3 rounded-xl border border-dashed border-white/15 text-white/30 text-sm hover:border-gold/30 hover:text-gold/60 transition-all flex items-center justify-center gap-2"
        >
          <MapPin size={14} />
          {addresses.length > 0 ? t("address.addNew") : t("address.addFirst")}
        </button>
      ) : (
        <div className="card-glass p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm font-medium">
              {editingId ? t("address.edit") : t("address.new")}
            </span>
            <button onClick={() => { setShowForm(false); resetForm() }} className="text-white/30 hover:text-white/60">
              <X size={16} />
            </button>
          </div>

          {/* Country selector */}
          <div>
            <label className="text-white/40 text-[10px] mb-1 block">{t("address.country")}</label>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:border-gold/30 focus:outline-none"
            >
              <option value="CN" className="bg-[#0f0f1a] text-white">{locale === "en" ? "China" : "中国"}</option>
              <option value="US" className="bg-[#0f0f1a] text-white">United States</option>
              <option value="CA" className="bg-[#0f0f1a] text-white">Canada</option>
              <option value="GB" className="bg-[#0f0f1a] text-white">United Kingdom</option>
              <option value="AU" className="bg-[#0f0f1a] text-white">Australia</option>
              <option value="JP" className="bg-[#0f0f1a] text-white">Japan</option>
              <option value="KR" className="bg-[#0f0f1a] text-white">South Korea</option>
              <option value="SG" className="bg-[#0f0f1a] text-white">Singapore</option>
              <option value="MY" className="bg-[#0f0f1a] text-white">Malaysia</option>
              <option value="TH" className="bg-[#0f0f1a] text-white">Thailand</option>
              <option value="OTHER" className="bg-[#0f0f1a] text-white">{locale === "en" ? "Other" : "其他"}</option>
            </select>
          </div>

          {/* China cascading selectors */}
          {isChina && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-white/40 text-[10px] mb-1 block">{t("address.province")}</label>
                <select
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-2 text-xs text-white/80 focus:border-gold/30 focus:outline-none"
                >
                  <option value="" className="bg-[#0f0f1a] text-white">{t("address.select")}</option>
                  {provinces.map(p => <option key={p} value={p} className="bg-[#0f0f1a] text-white">{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/40 text-[10px] mb-1 block">{t("address.city")}</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  disabled={!province}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-2 text-xs text-white/80 focus:border-gold/30 focus:outline-none disabled:opacity-30"
                >
                  <option value="" className="bg-[#0f0f1a] text-white">{t("address.select")}</option>
                  {cities.map(c => <option key={c} value={c} className="bg-[#0f0f1a] text-white">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/40 text-[10px] mb-1 block">{t("address.district")}</label>
                <select
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  disabled={!city}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-2 text-xs text-white/80 focus:border-gold/30 focus:outline-none disabled:opacity-30"
                >
                  <option value="" className="bg-[#0f0f1a] text-white">{t("address.select")}</option>
                  {districts.map(d => <option key={d.name} value={d.name} className="bg-[#0f0f1a] text-white">{d.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Name + Phone */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-white/40 text-[10px] mb-1 block">{t("address.name")}</label>
              <input
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:border-gold/30 focus:outline-none"
                placeholder={t("address.namePlaceholder")}
              />
            </div>
            <div>
              <label className="text-white/40 text-[10px] mb-1 block">{t("address.phone")}</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:border-gold/30 focus:outline-none"
                placeholder={t("address.phonePlaceholder")}
              />
            </div>
          </div>

          {/* Address line 1 */}
          <div>
            <label className="text-white/40 text-[10px] mb-1 block">{t("address.detail")}</label>
            <input
              value={addressLine1}
              onChange={e => setAddressLine1(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:border-gold/30 focus:outline-none"
              placeholder={t("address.detailPlaceholder")}
            />
          </div>

          {/* Address line 2 + Postal code */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-white/40 text-[10px] mb-1 block">{t("address.detail2")}</label>
              <input
                value={addressLine2}
                onChange={e => setAddressLine2(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:border-gold/30 focus:outline-none"
                placeholder={t("address.detail2Placeholder")}
              />
            </div>
            <div>
              <label className="text-white/40 text-[10px] mb-1 block">{t("address.postalCode")}</label>
              <input
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:border-gold/30 focus:outline-none"
                placeholder="100000"
              />
            </div>
          </div>

          {/* Default checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={e => setIsDefault(e.target.checked)}
              className="accent-gold w-3.5 h-3.5"
            />
            <span className="text-white/50 text-xs">{t("address.setDefault")}</span>
          </label>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-gold w-full py-2.5 flex items-center justify-center gap-2 text-sm"
          >
            {saving ? (
              <><Loader2 size={14} className="animate-spin" /> {t("common.loading")}</>
            ) : (
              <><Check size={14} /> {t("common.save")}</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
