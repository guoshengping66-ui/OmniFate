"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { INTERNATIONAL_LOCATIONS } from "@/data/international-locations"

const CUSTOM_CITY = "__custom_city__"

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function LocationSelector({ value, onChange, placeholder }: Props) {
  const [country, setCountry] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [customCity, setCustomCity] = useState("")
  const [search, setSearch] = useState("")

  const countries = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return INTERNATIONAL_LOCATIONS
    return INTERNATIONAL_LOCATIONS.filter((item) =>
      item.name.toLowerCase().includes(q) ||
      item.states?.some((s) => s.name.toLowerCase().includes(q) || s.cities.some((c) => c.name.toLowerCase().includes(q))) ||
      item.cities?.some((c) => c.name.toLowerCase().includes(q)),
    )
  }, [search])

  const currentCountry = INTERNATIONAL_LOCATIONS.find((item) => item.name === country)
  const hasStates = Boolean(currentCountry?.states?.length)
  const currentState = hasStates ? currentCountry?.states?.find((item) => item.name === state) : null
  const cities = hasStates ? currentState?.cities || [] : currentCountry?.cities || []

  useEffect(() => {
    if (!value) return
    const parts = value.split("/").filter(Boolean)
    const nextCountry = INTERNATIONAL_LOCATIONS.find((item) => item.name === parts[0])

    if (!nextCountry) {
      setCountry("")
      setState("")
      setCity(CUSTOM_CITY)
      setCustomCity(value)
      return
    }

    setCountry(nextCountry.name)
    if (nextCountry.states?.length) {
      const nextState = nextCountry.states.find((item) => item.name === parts[1])
      setState(nextState?.name || "")
      const nextCity = nextState?.cities.find((item) => item.name === parts[2])
      setCity(nextCity?.name || (parts[2] ? CUSTOM_CITY : ""))
      setCustomCity(nextCity ? "" : parts[2] || "")
    } else {
      setState("")
      const nextCity = nextCountry.cities?.find((item) => item.name === parts[1])
      setCity(nextCity?.name || (parts[1] ? CUSTOM_CITY : ""))
      setCustomCity(nextCity ? "" : parts[1] || "")
    }
  }, [value])

  const emit = (nextCountry: string, nextState: string, nextCity: string, nextCustom = customCity) => {
    const selectedCountry = INTERNATIONAL_LOCATIONS.find((item) => item.name === nextCountry)
    const cityValue = nextCity === CUSTOM_CITY ? nextCustom.trim() : nextCity

    if (!selectedCountry) {
      onChange(cityValue)
      return
    }

    if (selectedCountry.states?.length) {
      onChange([nextCountry, nextState, cityValue].filter(Boolean).join("/"))
    } else {
      onChange([nextCountry, cityValue].filter(Boolean).join("/"))
    }
  }

  return (
    <div>
      <label className="label">
        Birth city
        <span className="ml-2 text-xs text-white/30">Select country or region</span>
      </label>

      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B1020] px-3 py-2">
          <Search className="h-4 w-4 text-white/35" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country or city"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>

        <div className={`grid grid-cols-1 gap-2 ${hasStates ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          <select
            value={country}
            onChange={(e) => {
              const next = e.target.value
              setCountry(next)
              setState("")
              setCity("")
              setCustomCity("")
              emit(next, "", "", "")
            }}
            className="input-field text-sm"
          >
            <option value="" className="bg-[#0f0f1a] text-white">Country / Region</option>
            {countries.map((item) => (
              <option key={item.name} value={item.name} className="bg-[#0f0f1a] text-white">
                {item.name}
              </option>
            ))}
          </select>

          {hasStates && (
            <select
              value={state}
              onChange={(e) => {
                const next = e.target.value
                setState(next)
                setCity("")
                setCustomCity("")
                emit(country, next, "", "")
              }}
              disabled={!country}
              className="input-field text-sm disabled:opacity-30"
            >
              <option value="" className="bg-[#0f0f1a] text-white">State / Province</option>
              {currentCountry!.states!.map((item) => (
                <option key={item.name} value={item.name} className="bg-[#0f0f1a] text-white">
                  {item.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={city}
            onChange={(e) => {
              const next = e.target.value
              setCity(next)
              setCustomCity("")
              emit(country, state, next, "")
            }}
            disabled={hasStates ? !state : !country}
            className="input-field text-sm disabled:opacity-30"
          >
            <option value="" className="bg-[#0f0f1a] text-white">City</option>
            {cities.map((item) => (
              <option key={item.name} value={item.name} className="bg-[#0f0f1a] text-white">
                {item.name}
              </option>
            ))}
            {(hasStates ? state : country) && (
              <option value={CUSTOM_CITY} className="bg-[#0f0f1a] text-white">
                Other city
              </option>
            )}
          </select>
        </div>

        {city === CUSTOM_CITY && (
          <input
            value={customCity}
            onChange={(e) => {
              const next = e.target.value
              setCustomCity(next)
              emit(country, state, CUSTOM_CITY, next)
            }}
            placeholder={placeholder || "Enter city, e.g. Kuala Lumpur"}
            className="input-field text-sm"
          />
        )}

        {value && (
          <p className="text-xs text-white/38">
            Selected: <span className="text-gold/75">{value}</span>
          </p>
        )}
      </div>
    </div>
  )
}
