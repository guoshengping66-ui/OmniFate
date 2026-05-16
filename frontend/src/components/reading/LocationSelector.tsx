"use client"

import { useState, useEffect, useRef } from "react"
import { CHINA_REGIONS } from "@/data/china-regions"
import { INTERNATIONAL_LOCATIONS } from "@/data/international-locations"
import { ChevronDown, Search, Globe } from "lucide-react"

const OTHER_COUNTRY = "__other__"
const INTL_CUSTOM = "__custom__"

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function LocationSelector({ value, onChange, placeholder }: Props) {
  // ── China mode state ──
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")

  // ── International mode state ──
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedIntlCity, setSelectedIntlCity] = useState("")
  const [isInternational, setIsInternational] = useState(false)

  // ── Free text fallback ──
  const [otherInput, setOtherInput] = useState("")

  // ── Search for country dropdown ──
  const [countrySearch, setCountrySearch] = useState("")
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const countrySearchRef = useRef<HTMLInputElement>(null)

  // ── Determine mode from value ──
  useEffect(() => {
    if (!value) return
    const parts = value.split("/")

    // Check if it's a China location
    if (parts.length >= 1) {
      const prov = CHINA_REGIONS.find(p => p.name === parts[0])
      if (prov) {
        setIsInternational(false)
        setSelectedProvince(parts[0])
        if (parts.length >= 2) {
          const city = prov.children.find(c => c.name === parts[1])
          if (city) {
            setSelectedCity(parts[1])
            if (parts.length >= 3) {
              setSelectedDistrict(parts[2])
            }
          }
        }
        return
      }
    }

    // Check if it's an international location
    // Format: "Country/City" or just "Country"
    if (parts.length >= 2) {
      const country = INTERNATIONAL_LOCATIONS.find(c => c.name === parts[0])
      if (country) {
        setIsInternational(true)
        setSelectedCountry(parts[0])
        const city = country.cities.find(c => c.name === parts[1])
        if (city) {
          setSelectedIntlCity(parts[1])
        } else {
          // Custom city not in list
          setSelectedIntlCity(INTL_CUSTOM)
          setOtherInput(parts[1])
        }
        return
      }
    }

    // Free text (no match found)
    setIsInternational(true)
    setSelectedCountry("")
    setSelectedIntlCity(INTL_CUSTOM)
    setOtherInput(value)
  }, [value])

  const currentProvince = CHINA_REGIONS.find(p => p.name === selectedProvince)
  const currentCity = currentProvince?.children.find(c => c.name === selectedCity)
  const currentCountry = INTERNATIONAL_LOCATIONS.find(c => c.name === selectedCountry)

  // ── Filter countries by search ──
  const filteredCountries = INTERNATIONAL_LOCATIONS.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.nameZh.includes(countrySearch)
  )

  // ── Emit helpers ──
  const emitChinaValue = (province: string, city: string, district: string) => {
    if (province && city && district) {
      onChange(`${province}/${city}/${district}`)
    } else if (province && city) {
      onChange(`${province}/${city}`)
    } else if (province) {
      onChange(province)
    } else {
      onChange("")
    }
  }

  const emitIntlValue = (country: string, city: string) => {
    if (country && city && city !== INTL_CUSTOM) {
      onChange(`${country}/${city}`)
    } else if (country) {
      onChange(country)
    } else {
      onChange("")
    }
  }

  // ── China handlers ──
  const handleProvinceChange = (val: string) => {
    if (val === OTHER_COUNTRY) {
      setIsInternational(true)
      setSelectedProvince("")
      setSelectedCity("")
      setSelectedDistrict("")
      setSelectedCountry("")
      setSelectedIntlCity("")
      setOtherInput("")
      onChange("")
      return
    }
    setIsInternational(false)
    setSelectedProvince(val)
    setSelectedCity("")
    setSelectedDistrict("")
    emitChinaValue(val, "", "")
  }

  const handleCityChange = (val: string) => {
    setSelectedCity(val)
    setSelectedDistrict("")
    emitChinaValue(selectedProvince, val, "")
  }

  const handleDistrictChange = (val: string) => {
    setSelectedDistrict(val)
    emitChinaValue(selectedProvince, selectedCity, val)
  }

  // ── International handlers ──
  const handleCountrySelect = (countryName: string) => {
    setSelectedCountry(countryName)
    setSelectedIntlCity("")
    setCountrySearch("")
    setShowCountryDropdown(false)
    emitIntlValue(countryName, "")
  }

  const handleIntlCityChange = (val: string) => {
    if (val === INTL_CUSTOM) {
      setSelectedIntlCity(val)
      setOtherInput("")
      // Don't emit yet, wait for user to type
      return
    }
    setSelectedIntlCity(val)
    setOtherInput("")
    emitIntlValue(selectedCountry, val)
  }

  const handleCustomCityInput = (val: string) => {
    setOtherInput(val)
    if (selectedCountry && val) {
      onChange(`${selectedCountry}/${val}`)
    } else if (val) {
      onChange(val)
    } else {
      onChange("")
    }
  }

  // ── Switch back to China ──
  const handleBackToChina = () => {
    setIsInternational(false)
    setSelectedProvince("")
    setSelectedCity("")
    setSelectedDistrict("")
    setSelectedCountry("")
    setSelectedIntlCity("")
    setOtherInput("")
    onChange("")
  }

  // ── Clear search on dropdown close ──
  const handleCountryDropdownBlur = () => {
    setTimeout(() => {
      setShowCountryDropdown(false)
      setCountrySearch("")
    }, 200)
  }

  return (
    <div>
      <label className="label">
        出生城市
        <span className="text-white/30 text-xs ml-2">选择地区</span>
      </label>

      {/* ── China Mode ── */}
      {!isInternational && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Province */}
            <select
              value={selectedProvince}
              onChange={e => handleProvinceChange(e.target.value)}
              className="input-field text-sm"
            >
              <option value="" className="bg-[#0f0f1a] text-white">选择省份</option>
              {CHINA_REGIONS.map(p => (
                <option key={p.name} value={p.name} className="bg-[#0f0f1a] text-white">
                  {p.name}
                </option>
              ))}
              <option value={OTHER_COUNTRY} className="bg-[#0f0f1a] text-white">🌍 其他国家/地区</option>
            </select>

            {/* City */}
            <select
              value={selectedCity}
              onChange={e => handleCityChange(e.target.value)}
              disabled={!currentProvince}
              className="input-field text-sm disabled:opacity-30"
            >
              <option value="" className="bg-[#0f0f1a] text-white">选择城市</option>
              {currentProvince?.children.map(c => (
                <option key={c.name} value={c.name} className="bg-[#0f0f1a] text-white">
                  {c.name}
                </option>
              ))}
            </select>

            {/* District */}
            <select
              value={selectedDistrict}
              onChange={e => handleDistrictChange(e.target.value)}
              disabled={!currentCity}
              className="input-field text-sm disabled:opacity-30"
            >
              <option value="" className="bg-[#0f0f1a] text-white">选择区县</option>
              {currentCity?.children.map(d => (
                <option key={d.name} value={d.name} className="bg-[#0f0f1a] text-white">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProvince && value && (
            <div className="text-xs text-white/40">
              <span className="text-gold/60">{value}</span>
            </div>
          )}
        </div>
      )}

      {/* ── International Mode ── */}
      {isInternational && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Country Selector with search */}
            <div className="relative">
              <div
                onClick={() => {
                  setShowCountryDropdown(!showCountryDropdown)
                  if (!showCountryDropdown) {
                    setTimeout(() => countrySearchRef.current?.focus(), 100)
                  }
                }}
                className="input-field text-sm cursor-pointer flex items-center justify-between"
              >
                <span className={currentCountry ? "text-white" : "text-white/40"}>
                  {currentCountry ? `${currentCountry.nameZh} ${currentCountry.name}` : "选择国家/地区"}
                </span>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showCountryDropdown ? "rotate-180" : ""}`} />
              </div>

              {showCountryDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl max-h-72 overflow-hidden">
                  {/* Search input */}
                  <div className="sticky top-0 bg-[#1a1a2e] p-2 border-b border-white/10">
                    <div className="flex items-center gap-2 bg-[#0f0f1a] rounded-md px-2 py-1.5">
                      <Search className="w-3.5 h-3.5 text-white/30" />
                      <input
                        ref={countrySearchRef}
                        type="text"
                        value={countrySearch}
                        onChange={e => setCountrySearch(e.target.value)}
                        placeholder="搜索国家..."
                        className="bg-transparent text-sm text-white outline-none w-full placeholder:text-white/30"
                      />
                    </div>
                  </div>

                  {/* Country list */}
                  <div className="overflow-y-auto max-h-56 p-1">
                    {/* Region groups */}
                    {countrySearch ? (
                      // Flat filtered list
                      filteredCountries.map(c => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleCountrySelect(c.name)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedCountry === c.name
                              ? "bg-gold/20 text-gold"
                              : "text-white hover:bg-white/5"
                          }`}
                        >
                          {c.nameZh} <span className="text-white/40 ml-1">{c.name}</span>
                        </button>
                      ))
                    ) : (
                      // Grouped by region
                      <>
                        <CountryGroup
                          label="亚洲"
                          countries={INTERNATIONAL_LOCATIONS.filter(c =>
                            ["Japan", "South Korea", "Singapore", "Thailand", "Malaysia",
                             "Indonesia", "Philippines", "Vietnam", "India"].includes(c.name)
                          )}
                          selected={selectedCountry}
                          onSelect={handleCountrySelect}
                        />
                        <CountryGroup
                          label="北美"
                          countries={INTERNATIONAL_LOCATIONS.filter(c =>
                            ["United States", "Canada", "Mexico"].includes(c.name)
                          )}
                          selected={selectedCountry}
                          onSelect={handleCountrySelect}
                        />
                        <CountryGroup
                          label="欧洲"
                          countries={INTERNATIONAL_LOCATIONS.filter(c =>
                            ["United Kingdom", "France", "Germany", "Netherlands",
                             "Spain", "Italy", "Switzerland"].includes(c.name)
                          )}
                          selected={selectedCountry}
                          onSelect={handleCountrySelect}
                        />
                        <CountryGroup
                          label="大洋洲"
                          countries={INTERNATIONAL_LOCATIONS.filter(c =>
                            ["Australia", "New Zealand"].includes(c.name)
                          )}
                          selected={selectedCountry}
                          onSelect={handleCountrySelect}
                        />
                        <CountryGroup
                          label="中东"
                          countries={INTERNATIONAL_LOCATIONS.filter(c =>
                            ["United Arab Emirates", "Saudi Arabia", "Israel"].includes(c.name)
                          )}
                          selected={selectedCountry}
                          onSelect={handleCountrySelect}
                        />
                        <CountryGroup
                          label="南美 / 非洲 / 其他"
                          countries={INTERNATIONAL_LOCATIONS.filter(c =>
                            ["Brazil", "Argentina", "South Africa", "Egypt", "Russia", "Turkey"].includes(c.name)
                          )}
                          selected={selectedCountry}
                          onSelect={handleCountrySelect}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* City Selector */}
            <div>
              <select
                value={selectedIntlCity}
                onChange={e => handleIntlCityChange(e.target.value)}
                disabled={!selectedCountry}
                className="input-field text-sm disabled:opacity-30"
              >
                <option value="" className="bg-[#0f0f1a] text-white">选择城市</option>
                {currentCountry?.cities.map(c => (
                  <option key={c.name} value={c.name} className="bg-[#0f0f1a] text-white">
                    {c.nameZh} {c.name}
                  </option>
                ))}
                {selectedCountry && (
                  <option value={INTL_CUSTOM} className="bg-[#0f0f1a] text-white/50">
                    手动输入其他城市...
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* Custom city input */}
          {selectedIntlCity === INTL_CUSTOM && (
            <div>
              <input
                type="text"
                value={otherInput}
                onChange={e => handleCustomCityInput(e.target.value)}
                placeholder={placeholder || "请输入城市名称（如 San Jose）"}
                className="input-field text-sm"
              />
            </div>
          )}

          {/* Back to China button */}
          <button
            type="button"
            onClick={handleBackToChina}
            className="text-xs text-white/40 hover:text-gold/70 transition-colors flex items-center gap-1"
          >
            ← 选择中国地区
          </button>

          {/* Preview */}
          {value && (
            <div className="text-xs text-white/40">
              <span className="text-gold/60">{value}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Sub-component for grouped country list ──
function CountryGroup({
  label,
  countries,
  selected,
  onSelect,
}: {
  label: string
  countries: { name: string; nameZh: string }[]
  selected: string
  onSelect: (name: string) => void
}) {
  if (countries.length === 0) return null
  return (
    <div className="mb-1">
      <div className="px-3 py-1 text-[10px] text-white/25 uppercase tracking-wider font-medium">
        {label}
      </div>
      {countries.map(c => (
        <button
          key={c.name}
          type="button"
          onClick={() => onSelect(c.name)}
          className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
            selected === c.name
              ? "bg-gold/20 text-gold"
              : "text-white hover:bg-white/5"
          }`}
        >
          {c.nameZh} <span className="text-white/40 ml-1">{c.name}</span>
        </button>
      ))}
    </div>
  )
}
