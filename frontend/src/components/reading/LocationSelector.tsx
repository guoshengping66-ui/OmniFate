"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { CHINA_REGIONS } from "@/data/china-regions"
import { INTERNATIONAL_LOCATIONS } from "@/data/international-locations"
import { ChevronDown, Search } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const CHINA_KEY = "China"
const CUSTOM_KEY = "__custom__"

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

// Group countries for the dropdown
const COUNTRY_GROUPS: { labelKey: string; codes: string[] }[] = [
  { labelKey: "new.groupNorthAmerica", codes: ["United States", "Canada", "Mexico"] },
  { labelKey: "new.groupEurope", codes: ["United Kingdom", "France", "Germany", "Netherlands", "Spain", "Italy", "Switzerland", "Sweden", "Norway", "Denmark", "Finland", "Portugal", "Ireland", "Belgium", "Austria", "Poland", "Greece", "Czech Republic", "Romania", "Hungary"] },
  { labelKey: "new.groupAsia", codes: ["Japan", "South Korea", "Singapore", "Thailand", "Malaysia", "Indonesia", "Philippines", "Vietnam", "India", "Taiwan", "Hong Kong"] },
  { labelKey: "new.groupOceania", codes: ["Australia", "New Zealand"] },
  { labelKey: "new.groupMiddleEast", codes: ["United Arab Emirates", "Saudi Arabia", "Israel", "Turkey"] },
  { labelKey: "new.groupSouthAmerica", codes: ["Brazil", "Argentina", "Chile", "Colombia", "Peru"] },
  { labelKey: "new.groupAfrica", codes: ["South Africa", "Egypt", "Nigeria", "Kenya"] },
]

export function LocationSelector({ value, onChange, placeholder }: Props) {
  const { t } = useLanguage()

  // Selected values
  const [country, setCountry] = useState("")
  const [province, setProvince] = useState("")
  const [city, setCity] = useState("")
  const [district, setDistrict] = useState("")
  const [state, setState] = useState("")
  const [customInput, setCustomInput] = useState("")

  // UI state
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isChina = country === CHINA_KEY

  const countryObj = INTERNATIONAL_LOCATIONS.find(c => c.name === country)
  const hasStates = !!(countryObj?.states && countryObj.states.length > 0)
  const currentState = hasStates ? countryObj!.states!.find(s => s.name === state) : null
  const cities = hasStates ? (currentState?.cities || []) : (countryObj?.cities || [])

  // China cascading
  const chinaProvince = CHINA_REGIONS.find(p => p.name === province)
  const chinaCity = chinaProvince?.children.find(c => c.name === city)

  // Filtered countries for search
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return INTERNATIONAL_LOCATIONS
    const q = countrySearch.toLowerCase()
    return INTERNATIONAL_LOCATIONS.filter(c =>
      c.name.toLowerCase().includes(q) || c.nameZh.includes(q)
    )
  }, [countrySearch])

  // Parse existing value on mount
  useEffect(() => {
    if (!value) return
    const parts = value.split("/")
    if (parts.length === 0) return

    // Try China first
    const prov = CHINA_REGIONS.find(p => p.name === parts[0])
    if (prov) {
      setCountry(CHINA_KEY)
      setProvince(parts[0])
      if (parts[1]) {
        const c = prov.children.find(x => x.name === parts[1])
        if (c) {
          setCity(parts[1])
          if (parts[2]) setDistrict(parts[2])
        }
      }
      return
    }

    // Try international
    const ctry = INTERNATIONAL_LOCATIONS.find(c => c.name === parts[0])
    if (ctry) {
      setCountry(parts[0])
      if (ctry.states && ctry.states.length > 0 && parts[1]) {
        setState(parts[1])
        if (parts[2]) {
          const st = ctry.states.find(s => s.name === parts[1])
          const found = st?.cities.find(x => x.name === parts[2])
          if (found) setCity(parts[2])
          else { setCity(CUSTOM_KEY); setCustomInput(parts[2]) }
        }
      } else if (parts[1]) {
        const found = ctry.cities?.find(x => x.name === parts[1])
        if (found) setCity(parts[1])
        else { setCity(CUSTOM_KEY); setCustomInput(parts[1]) }
      }
      return
    }

    // Free text
    setCountry("")
    setCity(CUSTOM_KEY)
    setCustomInput(value)
  }, [value])

  // Close dropdown on outside click
  useEffect(() => {
    if (!showCountryDropdown) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false)
        setCountrySearch("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showCountryDropdown])

  // Emit helpers
  const emit = () => {
    if (!country) { onChange(customInput || ""); return }
    if (isChina) {
      const parts = [province, city, district].filter(Boolean)
      onChange(parts.join("/"))
    } else if (hasStates) {
      if (state && city && city !== CUSTOM_KEY) onChange(`${country}/${state}/${city}`)
      else if (state && customInput) onChange(`${country}/${state}/${customInput}`)
      else if (state) onChange(`${country}/${state}`)
      else onChange(country)
    } else {
      if (city && city !== CUSTOM_KEY) onChange(`${country}/${city}`)
      else if (customInput) onChange(`${country}/${customInput}`)
      else onChange(country)
    }
  }

  const handleCountrySelect = (name: string) => {
    setCountry(name)
    setProvince(""); setCity(""); setDistrict("")
    setState(""); setCustomInput("")
    setShowCountryDropdown(false)
    setCountrySearch("")
    onChange(name === CHINA_KEY ? "" : name)
  }

  // Group countries not in any group
  const groupedCodes = new Set(COUNTRY_GROUPS.flatMap(g => g.codes))
  const otherCountries = INTERNATIONAL_LOCATIONS.filter(c => !groupedCodes.has(c.name))

  return (
    <div>
      <label className="label">{t("new.birthCity")}</label>

      <div className="space-y-2">
        {/* Row 1: Country */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => {
              setShowCountryDropdown(!showCountryDropdown)
              if (!showCountryDropdown) setTimeout(() => searchRef.current?.focus(), 100)
            }}
            className="input-field text-sm cursor-pointer flex items-center justify-between"
          >
            <span className={country ? "text-white" : "text-white/40"}>
              {country ? (isChina ? t("new.chinaLabel") : countryObj?.nameZh || country) : t("new.selectCountry")}
            </span>
            <ChevronDown className={`w-4 h-4 text-white/40 transition-transform flex-shrink-0 ${showCountryDropdown ? "rotate-180" : ""}`} />
          </div>

          {showCountryDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl max-h-80 overflow-hidden">
              <div className="sticky top-0 bg-[#1a1a2e] p-2 border-b border-white/10 z-10">
                <div className="flex items-center gap-2 bg-[#0f0f1a] rounded-md px-2 py-1.5">
                  <Search className="w-3.5 h-3.5 text-white/30" />
                  <input ref={searchRef} type="text" value={countrySearch}
                    onChange={e => setCountrySearch(e.target.value)}
                    placeholder={t("new.searchCountry")}
                    className="bg-transparent text-sm text-white outline-none w-full placeholder:text-white/30" />
                </div>
              </div>

              <div className="overflow-y-auto max-h-64 p-1">
                {countrySearch ? (
                  filteredCountries.map(c => (
                    <CountryOption key={c.name} country={c} selected={country === c.name} onSelect={handleCountrySelect} />
                  ))
                ) : (
                  <>
                    {/* China first */}
                    <div className="px-3 py-1 text-[10px] text-white/25 uppercase tracking-wider">China</div>
                    <CountryOption key="china" country={{ name: CHINA_KEY, nameZh: t("new.chinaLabel") }} selected={isChina} onSelect={handleCountrySelect} />

                    {COUNTRY_GROUPS.map(group => {
                      const items = INTERNATIONAL_LOCATIONS.filter(c => group.codes.includes(c.name))
                      if (!items.length) return null
                      return (
                        <div key={group.labelKey}>
                          <div className="px-3 py-1 text-[10px] text-white/25 uppercase tracking-wider mt-1">{t(group.labelKey)}</div>
                          {items.map(c => (
                            <CountryOption key={c.name} country={c} selected={country === c.name} onSelect={handleCountrySelect} />
                          ))}
                        </div>
                      )
                    })}
                    {otherCountries.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-[10px] text-white/25 uppercase tracking-wider mt-1">{t("new.groupOther")}</div>
                        {otherCountries.map(c => (
                          <CountryOption key={c.name} country={c} selected={country === c.name} onSelect={handleCountrySelect} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Row 2: China cascading OR International state+city */}
        {isChina && (
          <div className="grid grid-cols-3 gap-2">
            <select value={province} onChange={e => { setProvince(e.target.value); setCity(""); setDistrict(""); if (!e.target.value) onChange("") }}
              className="input-field text-sm">
              <option value="">{t("new.selectProvince")}</option>
              {CHINA_REGIONS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
            <select value={city} onChange={e => { setCity(e.target.value); setDistrict("") }}
              disabled={!province} className="input-field text-sm disabled:opacity-30">
              <option value="">{t("new.selectCity")}</option>
              {chinaProvince?.children.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <select value={district} onChange={e => { setDistrict(e.target.value); emit() }}
              disabled={!city} className="input-field text-sm disabled:opacity-30">
              <option value="">{t("new.selectDistrict")}</option>
              {chinaCity?.children.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
          </div>
        )}

        {!isChina && country && (
          <div className={`grid ${hasStates ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
            {hasStates && (
              <select value={state} onChange={e => { setState(e.target.value); setCity(""); setCustomInput(""); emit() }}
                className="input-field text-sm">
                <option value="">{t("new.selectState")}</option>
                {countryObj!.states!.map(s => <option key={s.name} value={s.name}>{s.nameZh} {s.name}</option>)}
              </select>
            )}
            <select value={city} onChange={e => {
              setCity(e.target.value)
              if (e.target.value !== CUSTOM_KEY) { setCustomInput(""); emit() }
            }} disabled={hasStates ? !state : false}
              className="input-field text-sm disabled:opacity-30">
              <option value="">{t("new.selectCity")}</option>
              {cities.map(c => <option key={c.name} value={c.name}>{c.nameZh} {c.name}</option>)}
              {(hasStates ? state : country) && <option value={CUSTOM_KEY}>{t("new.otherCity")}</option>}
            </select>
          </div>
        )}

        {/* Custom city input */}
        {city === CUSTOM_KEY && (
          <input type="text" value={customInput}
            onChange={e => { setCustomInput(e.target.value); emit() }}
            placeholder={placeholder || t("new.customCityPlaceholder")}
            className="input-field text-sm" />
        )}

        {/* Preview */}
        {value && (
          <div className="text-xs text-white/40">
            <span className="text-gold/60">{value}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function CountryOption({ country, selected, onSelect }: {
  country: { name: string; nameZh: string }
  selected: boolean
  onSelect: (name: string) => void
}) {
  return (
    <button type="button" onClick={() => onSelect(country.name)}
      className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
        selected ? "bg-gold/20 text-gold" : "text-white hover:bg-white/5"
      }`}>
      {country.nameZh} <span className="text-white/40 ml-1">{country.name}</span>
    </button>
  )
}
