"use client"

import { useState, useEffect, useRef } from "react"
import { CHINA_REGIONS } from "@/data/china-regions"
import { INTERNATIONAL_LOCATIONS } from "@/data/international-locations"
import { ChevronDown, Search } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const OTHER_COUNTRY = "__other__"
const INTL_CUSTOM = "__custom__"

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function LocationSelector({ value, onChange, placeholder }: Props) {
  const { t } = useLanguage()

  // ── China mode state ──
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")

  // ── International mode state ──
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [selectedIntlCity, setSelectedIntlCity] = useState("")
  const [isInternational, setIsInternational] = useState(false)

  // ── Free text fallback ──
  const [otherInput, setOtherInput] = useState("")

  // ── Search for country dropdown ──
  const [countrySearch, setCountrySearch] = useState("")
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const countrySearchRef = useRef<HTMLInputElement>(null)

  const currentCountry = INTERNATIONAL_LOCATIONS.find(c => c.name === selectedCountry)
  const hasStates = !!(currentCountry?.states && currentCountry.states.length > 0)
  const currentState = hasStates
    ? currentCountry!.states!.find(s => s.name === selectedState)
    : null

  // Cities list: from state if hasStates, else from country.cities
  const intlCities = hasStates
    ? currentState?.cities || []
    : currentCountry?.cities || []

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
    if (parts.length >= 1) {
      const country = INTERNATIONAL_LOCATIONS.find(c => c.name === parts[0])
      if (country) {
        setIsInternational(true)
        setSelectedCountry(parts[0])

        if (country.states && country.states.length > 0 && parts.length >= 3) {
          setSelectedState(parts[1])
          const state = country.states.find(s => s.name === parts[1])
          if (state) {
            const city = state.cities.find(c => c.name === parts[2])
            if (city) {
              setSelectedIntlCity(parts[2])
            } else {
              setSelectedIntlCity(INTL_CUSTOM)
              setOtherInput(parts[2])
            }
          }
        } else if (parts.length >= 2) {
          if (country.states && country.states.length > 0) {
            let found = false
            for (const state of country.states) {
              const city = state.cities.find(c => c.name === parts[1])
              if (city) {
                setSelectedState(state.name)
                setSelectedIntlCity(parts[1])
                found = true
                break
              }
            }
            if (!found) {
              setSelectedState("")
              setSelectedIntlCity(INTL_CUSTOM)
              setOtherInput(parts[1])
            }
          } else {
            const city = country.cities?.find(c => c.name === parts[1])
            if (city) {
              setSelectedIntlCity(parts[1])
            } else {
              setSelectedIntlCity(INTL_CUSTOM)
              setOtherInput(parts[1])
            }
          }
        }
        return
      }
    }

    // Free text (no match found)
    setIsInternational(true)
    setSelectedCountry("")
    setSelectedState("")
    setSelectedIntlCity(INTL_CUSTOM)
    setOtherInput(value)
  }, [value])

  const currentProvince = CHINA_REGIONS.find(p => p.name === selectedProvince)
  const currentCity = currentProvince?.children.find(c => c.name === selectedCity)

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

  const emitIntlValue = (country: string, state: string, city: string, customCity?: string) => {
    const countryObj = INTERNATIONAL_LOCATIONS.find(c => c.name === country)
    const hasStateLevel = countryObj?.states && countryObj.states.length > 0

    if (hasStateLevel) {
      if (state && city && city !== INTL_CUSTOM) {
        onChange(`${country}/${state}/${city}`)
      } else if (state && customCity) {
        onChange(`${country}/${state}/${customCity}`)
      } else if (country) {
        onChange(country)
      } else {
        onChange("")
      }
    } else {
      if (city && city !== INTL_CUSTOM) {
        onChange(`${country}/${city}`)
      } else if (customCity) {
        onChange(`${country}/${customCity}`)
      } else if (country) {
        onChange(country)
      } else {
        onChange("")
      }
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
      setSelectedState("")
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
    setSelectedState("")
    setSelectedIntlCity("")
    setCountrySearch("")
    setShowCountryDropdown(false)
    emitIntlValue(countryName, "", "")
  }

  const handleStateChange = (val: string) => {
    setSelectedState(val)
    setSelectedIntlCity("")
    emitIntlValue(selectedCountry, val, "")
  }

  const handleIntlCityChange = (val: string) => {
    if (val === INTL_CUSTOM) {
      setSelectedIntlCity(val)
      setOtherInput("")
      return
    }
    setSelectedIntlCity(val)
    setOtherInput("")
    emitIntlValue(selectedCountry, selectedState, val)
  }

  const handleCustomCityInput = (val: string) => {
    setOtherInput(val)
    if (val) {
      emitIntlValue(selectedCountry, selectedState, "", val)
    } else {
      onChange(selectedCountry || "")
    }
  }

  // ── Switch back to China ──
  const handleBackToChina = () => {
    setIsInternational(false)
    setSelectedProvince("")
    setSelectedCity("")
    setSelectedDistrict("")
    setSelectedCountry("")
    setSelectedState("")
    setSelectedIntlCity("")
    setOtherInput("")
    onChange("")
  }

  // ── Country dropdown blur ──
  const handleCountryDropdownBlur = () => {
    setTimeout(() => {
      setShowCountryDropdown(false)
      setCountrySearch("")
    }, 200)
  }

  // ── Preview value for display ──
  const displayPreview = () => {
    if (!value) return null
    return (
      <div className="text-xs text-parchment-400 mt-1">
        <span className="text-gold/60">{value}</span>
      </div>
    )
  }

  return (
    <div>
      <label className="label">
        {t("new.birthCity")}
        <span className="text-parchment-400 text-xs ml-2">{t("new.selectRegion")}</span>
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
              <option value="" className="bg-[#0f0f1a] text-white">{t("new.selectProvince")}</option>
              {CHINA_REGIONS.map(p => (
                <option key={p.name} value={p.name} className="bg-[#0f0f1a] text-white">
                  {p.name}
                </option>
              ))}
              <option value={OTHER_COUNTRY} className="bg-[#0f0f1a] text-white">{t("new.otherCountry")}</option>
            </select>

            {/* City */}
            <select
              value={selectedCity}
              onChange={e => handleCityChange(e.target.value)}
              disabled={!currentProvince}
              className="input-field text-sm disabled:opacity-30"
            >
              <option value="" className="bg-[#0f0f1a] text-white">{t("new.selectCity")}</option>
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
              <option value="" className="bg-[#0f0f1a] text-white">{t("new.selectDistrict")}</option>
              {currentCity?.children.map(d => (
                <option key={d.name} value={d.name} className="bg-[#0f0f1a] text-white">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {displayPreview()}
        </div>
      )}

      {/* ── International Mode ── */}
      {isInternational && (
        <div className="space-y-2">
          {/* Row 1: Country + State/City */}
          <div className={`grid grid-cols-1 ${hasStates ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-2`}>
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
                <span className={currentCountry ? "text-white truncate" : "text-parchment-400"}>
                  {currentCountry ? `${currentCountry.nameZh}` : t("new.selectRegion")}
                </span>
                <ChevronDown className={`w-4 h-4 text-parchment-400 transition-transform flex-shrink-0 ${showCountryDropdown ? "rotate-180" : ""}`} />
              </div>

              {showCountryDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-[#1a1a2e] border border-white/[0.06] rounded-lg shadow-xl max-h-72 overflow-hidden">
                  {/* Search input */}
                  <div className="sticky top-0 bg-[#1a1a2e] p-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 bg-[#0f0f1a] rounded-md px-2 py-1.5">
                      <Search className="w-3.5 h-3.5 text-parchment-400" />
                      <input
                        ref={countrySearchRef}
                        type="text"
                        value={countrySearch}
                        onChange={e => setCountrySearch(e.target.value)}
                        placeholder={t("new.searchCountry")}
                        className="bg-transparent text-sm text-white outline-none w-full placeholder:text-parchment-400"
                      />
                    </div>
                  </div>

                  {/* Country list */}
                  <div className="overflow-y-auto max-h-56 p-1">
                    {countrySearch ? (
                      filteredCountries.map(c => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleCountrySelect(c.name)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedCountry === c.name
                              ? "bg-gold/20 text-gold"
                              : "text-white hover:bg-white/[0.04]"
                          }`}
                        >
                          {c.nameZh} <span className="text-parchment-400 ml-1">{c.name}</span>
                        </button>
                      ))
                    ) : (
                      <>
                        <CountryGroup
                          label={t("new.groupAsia")}
                          countries={INTERNATIONAL_LOCATIONS.filter(c =>
                            ["Japan", "South Korea", "Singapore", "Thailand", "Malaysia",
                             "Indonesia", "Philippines", "Vietnam", "India"].includes(c.name)
                          )}
                          selected={selectedCountry}
                          onSelect={handleCountrySelect}
                        />
                        <CountryGroup
                          label={t("new.groupNorthAmerica")}
                          countries={INTERNATIONAL_LOCATIONS.filter(c =>
                            ["United States", "Canada", "Mexico"].includes(c.name)
                          )}
                          selected={selectedCountry}
                          onSelect={handleCountrySelect}
                        />
                        <CountryGroup
                          label={t("new.groupEurope")}
                          countries={INTERNATIONAL_LOCATIONS.filter(c =>
                            ["United Kingdom", "France", "Germany", "Netherlands",
                             "Spain", "Italy", "Switzerland"].includes(c.name)
                          )}
                          selected={selectedCountry}
                          onSelect={handleCountrySelect}
                        />
                        <CountryGroup
                          label={t("new.groupOceania")}
                          countries={INTERNATIONAL_LOCATIONS.filter(c =>
                            ["Australia", "New Zealand"].includes(c.name)
                          )}
                          selected={selectedCountry}
                          onSelect={handleCountrySelect}
                        />
                        <CountryGroup
                          label={t("new.groupMiddleEast")}
                          countries={INTERNATIONAL_LOCATIONS.filter(c =>
                            ["United Arab Emirates", "Saudi Arabia", "Israel"].includes(c.name)
                          )}
                          selected={selectedCountry}
                          onSelect={handleCountrySelect}
                        />
                        <CountryGroup
                          label={t("new.groupOther")}
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

            {/* State/Province selector (only for countries with states) */}
            {hasStates && (
              <select
                value={selectedState}
                onChange={e => handleStateChange(e.target.value)}
                disabled={!selectedCountry}
                className="input-field text-sm disabled:opacity-30"
              >
                <option value="" className="bg-[#0f0f1a] text-white">{t("new.selectState")}</option>
                {currentCountry!.states!.map(s => (
                  <option key={s.name} value={s.name} className="bg-[#0f0f1a] text-white">
                    {s.nameZh} {s.name}
                  </option>
                ))}
              </select>
            )}

            {/* City Selector */}
            <select
              value={selectedIntlCity}
              onChange={e => handleIntlCityChange(e.target.value)}
              disabled={hasStates ? !selectedState : !selectedCountry}
              className="input-field text-sm disabled:opacity-30"
            >
              <option value="" className="bg-[#0f0f1a] text-white">{t("new.selectCity")}</option>
              {intlCities.map(c => (
                <option key={c.name} value={c.name} className="bg-[#0f0f1a] text-white">
                  {c.nameZh} {c.name}
                </option>
              ))}
              {(hasStates ? selectedState : selectedCountry) && (
                <option value={INTL_CUSTOM} className="bg-[#0f0f1a] text-parchment-400">
                  {t("new.customCity")}
                </option>
              )}
            </select>
          </div>

          {/* Custom city input */}
          {selectedIntlCity === INTL_CUSTOM && (
            <div>
              <input
                type="text"
                value={otherInput}
                onChange={e => handleCustomCityInput(e.target.value)}
                placeholder={placeholder || t("new.customCityPlaceholder")}
                className="input-field text-sm"
              />
            </div>
          )}

          {/* Back to China button */}
          <button
            type="button"
            onClick={handleBackToChina}
            className="text-xs text-parchment-400 hover:text-gold/70 transition-colors flex items-center gap-1"
          >
            {t("new.backToChina")}
          </button>

          {displayPreview()}
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
      <div className="px-3 py-1 text-xs text-parchment-400 uppercase tracking-wider font-medium">
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
              : "text-white hover:bg-white/[0.04]"
          }`}
        >
          {c.nameZh} <span className="text-parchment-400 ml-1">{c.name}</span>
        </button>
      ))}
    </div>
  )
}
