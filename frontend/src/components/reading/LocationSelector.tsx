"use client"

import { useEffect, useRef, useState } from "react"
import { Check, MapPin, Search, X } from "lucide-react"
import { PlaceResult, searchPlaces } from "@/lib/api"
import { compactPlaces, nextCountryState, shouldSearchPlaces, toVerifiedSelection } from "./locationSelectorState"

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  locale?: "zh" | "en"
}

// A compact, curated starting point. Full text search continues to use the
// verified backend data, so this list never pretends to be a complete gazetteer.
const POPULAR_PLACES: PlaceResult[] = [
  ["Shanghai, China", "Shanghai", "CN", "China"], ["Beijing, China", "Beijing", "CN", "China"], ["Guangzhou, China", "Guangzhou", "CN", "China"], ["Shenzhen, China", "Shenzhen", "CN", "China"],
  ["Tokyo, Japan", "Tokyo", "JP", "Japan"], ["Osaka, Japan", "Osaka", "JP", "Japan"], ["Seoul, South Korea", "Seoul", "KR", "South Korea"],
  ["Singapore, Singapore", "Singapore", "SG", "Singapore"], ["Bangkok, Thailand", "Bangkok", "TH", "Thailand"], ["Kuala Lumpur, Malaysia", "Kuala Lumpur", "MY", "Malaysia"], ["Jakarta, Indonesia", "Jakarta", "ID", "Indonesia"], ["Manila, Philippines", "Manila", "PH", "Philippines"], ["Mumbai, India", "Mumbai", "IN", "India"], ["Delhi, India", "Delhi", "IN", "India"],
  ["New York City, United States", "New York City", "US", "United States"], ["Los Angeles, United States", "Los Angeles", "US", "United States"], ["San Francisco, United States", "San Francisco", "US", "United States"], ["Toronto, Canada", "Toronto", "CA", "Canada"], ["Vancouver, Canada", "Vancouver", "CA", "Canada"],
  ["London, United Kingdom", "London", "GB", "United Kingdom"], ["Paris, France", "Paris", "FR", "France"], ["Berlin, Germany", "Berlin", "DE", "Germany"], ["Rome, Italy", "Rome", "IT", "Italy"], ["Madrid, Spain", "Madrid", "ES", "Spain"], ["Amsterdam, Netherlands", "Amsterdam", "NL", "Netherlands"], ["Zurich, Switzerland", "Zurich", "CH", "Switzerland"],
  ["Sydney, Australia", "Sydney", "AU", "Australia"], ["Melbourne, Australia", "Melbourne", "AU", "Australia"], ["Auckland, New Zealand", "Auckland", "NZ", "New Zealand"],
  ["Dubai, United Arab Emirates", "Dubai", "AE", "United Arab Emirates"], ["Istanbul, Türkiye", "Istanbul", "TR", "Türkiye"], ["Riyadh, Saudi Arabia", "Riyadh", "SA", "Saudi Arabia"],
  ["São Paulo, Brazil", "São Paulo", "BR", "Brazil"], ["Mexico City, Mexico", "Mexico City", "MX", "Mexico"], ["Buenos Aires, Argentina", "Buenos Aires", "AR", "Argentina"], ["Johannesburg, South Africa", "Johannesburg", "ZA", "South Africa"], ["Cairo, Egypt", "Cairo", "EG", "Egypt"],
].map(([display_name, city, country_code, country]) => ({ id: `popular-${country_code}-${city}`, display_name, city, country_code, country, is_verified: false }))

const COUNTRY_OPTIONS = [["", "All countries"], ["CN", "China"], ["JP", "Japan"], ["KR", "South Korea"], ["SG", "Singapore"], ["US", "United States"], ["GB", "United Kingdom"], ["CA", "Canada"], ["AU", "Australia"], ["DE", "Germany"], ["FR", "France"]] as const

export function LocationSelector({ value, onChange, placeholder, locale = "en" }: Props) {
  const [query, setQuery] = useState("")
  const [items, setItems] = useState<PlaceResult[]>([])
  const [selected, setSelected] = useState<PlaceResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [manual, setManual] = useState(false)
  const [country, setCountry] = useState<string>()
  const [, setVerified] = useState(false)
  const request = useRef(0)
  const isZh = locale === "zh"
  const text = query.trim()

  useEffect(() => {
    if (!value || selected || manual) return
    setQuery(value)
  }, [value, selected, manual])

  useEffect(() => {
    const requestInput = shouldSearchPlaces(text, country)
    if (!requestInput || selected || manual) {
      setItems([])
      return
    }
    const id = ++request.current
    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const results = await searchPlaces(requestInput.query, locale, requestInput.country)
        if (id === request.current) setItems(results)
      } catch {
        if (id === request.current) setItems([])
      } finally {
        if (id === request.current) setLoading(false)
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [text, locale, country, selected, manual])

  const choose = (place: PlaceResult) => {
    const selection = toVerifiedSelection(place)
    setSelected(selection.place)
    setVerified(selection.verified)
    setQuery(selection.value)
    setItems([])
    onChange(selection.value)
  }

  const clear = () => {
    request.current += 1
    setSelected(null)
    setQuery("")
    setItems([])
    setManual(false)
    setVerified(false)
    onChange("")
  }

  const visibleItems = selected ? [] : (items.length > 0 ? items : (text.length < 2 ? compactPlaces(POPULAR_PLACES) : []))
  const manualLabel = isZh ? "找不到地点？手动填写" : "Can't find it? Enter manually"
  const listLabel = text.length < 2 ? (isZh ? "热门城市与国家" : "Popular places") : (isZh ? "搜索结果" : "Search results")

  return (
    <div className="space-y-2">
      <label className="label">
        {isZh ? "出生地点" : "Birthplace"}
        <span className="ml-2 text-xs text-white/30">{isZh ? "搜索城市、区县或国家" : "Search city, district, or country"}</span>
      </label>
      {!manual ? <>
        <select value={country || ""} onChange={(event) => {
          const state = nextCountryState({ items, country }, event.target.value || undefined)
          request.current += 1
          setCountry(state.country)
          setItems(state.items)
          setSelected(null)
          setVerified(false)
        }} className="location-country-select input-field w-full text-sm" aria-label={isZh ? "筛选国家" : "Filter country"}>
          {COUNTRY_OPTIONS.map(([code, name]) => <option key={code} value={code}>{isZh && !code ? "全部国家" : name}</option>)}
        </select>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input value={query} onChange={(event) => { setSelected(null); setQuery(event.target.value) }}
            placeholder={placeholder || (isZh ? "例如：杭州、New York、东京" : "e.g. Hangzhou, New York, Tokyo")}
            className="input-field w-full pl-10 pr-10 text-sm" autoComplete="off" />
          {query && <button type="button" onClick={clear} aria-label={isZh ? "清除地点" : "Clear location"} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white"><X size={16} /></button>}
        </div>
        {!selected && <p className="text-xs text-white/35">{text.length < 2 ? (isZh ? "可直接选择热门地点，或输入至少 2 个字符搜索全球地点" : "Choose a popular place or enter at least 2 characters to search globally") : (isZh ? "正在从全球地点库中搜索" : "Searching the global place directory")}</p>}
        {loading && <p className="text-xs text-cyan-100/60">{isZh ? "正在搜索地点…" : "Searching places…"}</p>}
        {visibleItems.length > 0 && <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0B1020] shadow-xl">
          <p className="px-4 pt-3 text-xs font-medium text-white/45">{listLabel}</p>
          <ul role="listbox">
            {visibleItems.map((place) => <li key={place.id}><button type="button" onClick={() => choose(place)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-white/[0.06]">
              <MapPin size={16} className="mt-0.5 shrink-0 text-gold/75" /><span><span className="block text-sm text-white/85">{place.display_name}</span><span className="mt-0.5 block text-xs text-white/38">{place.timezone || (place.is_verified ? (isZh ? "时区待确认" : "Timezone pending") : (isZh ? "常用地点，选择后可继续搜索精确地点" : "Popular place — search for a precise district if needed"))}</span></span>
            </button></li>)}
          </ul>
        </div>}
        {selected && <div className="flex items-start gap-3 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.05] p-3 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-emerald-200" /><div><p className="text-emerald-100/85">{selected.display_name}</p><p className="mt-1 text-xs text-white/50">{selected.timezone || (isZh ? "地点已选择" : "Place selected")}{selected.latitude != null && selected.longitude != null ? ` · ${selected.latitude.toFixed(4)}, ${selected.longitude.toFixed(4)}` : ""}</p></div></div>}
        <button type="button" onClick={() => { setManual(true); setItems([]); setQuery(value) }} className="text-xs text-gold/70 hover:text-gold">{manualLabel}</button>
      </> : <>
        <input value={query} onChange={(event) => { setQuery(event.target.value); onChange(event.target.value) }} placeholder={placeholder || (isZh ? "手动输入出生地点" : "Enter birthplace manually")} className="input-field w-full text-sm" />
        <p className="text-xs text-amber-100/55">{isZh ? "手动地点不会自动校验坐标与时区。" : "Manual entries cannot automatically verify coordinates or timezone."}</p>
        <button type="button" onClick={clear} className="text-xs text-gold/70 hover:text-gold">{isZh ? "返回地点搜索" : "Back to place search"}</button>
      </>}
    </div>
  )
}
