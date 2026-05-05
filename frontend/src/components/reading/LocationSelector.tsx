"use client"

import { useState, useEffect } from "react"
import { CHINA_REGIONS } from "@/data/china-regions"

const OTHER_COUNTRY = "__other__"

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function LocationSelector({ value, onChange, placeholder }: Props) {
  const isOtherCountry = value !== "" && !CHINA_REGIONS.some(p =>
    value.startsWith(p.name)
  )

  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [otherInput, setOtherInput] = useState("")

  // Parse initial value
  useEffect(() => {
    if (!value) return
    const parts = value.split("/")
    if (parts.length >= 1) {
      const prov = CHINA_REGIONS.find(p => p.name === parts[0])
      if (prov) {
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
      } else {
        setOtherInput(value)
      }
    }
  }, [value])

  const currentProvince = CHINA_REGIONS.find(p => p.name === selectedProvince)
  const currentCity = currentProvince?.children.find(c => c.name === selectedCity)

  const emitValue = (province: string, city: string, district: string) => {
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

  const handleProvinceChange = (val: string) => {
    if (val === OTHER_COUNTRY) {
      setSelectedProvince("")
      setSelectedCity("")
      setSelectedDistrict("")
      setOtherInput("")
      onChange("")
      return
    }
    setSelectedProvince(val)
    setSelectedCity("")
    setSelectedDistrict("")
    emitValue(val, "", "")
  }

  const handleCityChange = (val: string) => {
    setSelectedCity(val)
    setSelectedDistrict("")
    emitValue(selectedProvince, val, "")
  }

  const handleDistrictChange = (val: string) => {
    setSelectedDistrict(val)
    emitValue(selectedProvince, selectedCity, val)
  }

  const handleOtherInput = (val: string) => {
    setOtherInput(val)
    onChange(val)
  }

  return (
    <div>
      <label className="label">
        出生城市
        <span className="text-white/30 text-xs ml-2">选择省份/城市/区县</span>
      </label>

      {isOtherCountry || (!selectedProvince && !otherInput && value) ? (
        <div className="space-y-2">
          <input
            type="text"
            value={otherInput || value}
            onChange={e => handleOtherInput(e.target.value)}
            placeholder={placeholder || "请输入国家或城市名称"}
            className="input-field"
          />
          <button
            type="button"
            onClick={() => {
              setOtherInput("")
              setSelectedProvince("")
              setSelectedCity("")
              setSelectedDistrict("")
              onChange("")
            }}
            className="text-xs text-gold/70 hover:text-gold transition-colors"
          >
            ← 选择中国地区
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Province */}
            <select
              value={selectedProvince}
              onChange={e => handleProvinceChange(e.target.value)}
              className="input-field text-sm"
            >
              <option value="">选择省份</option>
              {CHINA_REGIONS.map(p => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
              <option value={OTHER_COUNTRY}>其他国家/地区</option>
            </select>

            {/* City */}
            <select
              value={selectedCity}
              onChange={e => handleCityChange(e.target.value)}
              disabled={!currentProvince}
              className="input-field text-sm disabled:opacity-30"
            >
              <option value="">选择城市</option>
              {currentProvince?.children.map(c => (
                <option key={c.name} value={c.name}>
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
              <option value="">选择区县</option>
              {currentCity?.children.map(d => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProvince && (
            <div className="text-xs text-white/40">
              {value && (
                <span className="text-gold/60">{value}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
