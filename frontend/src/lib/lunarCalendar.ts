/**
 * 农历/阳历转换工具
 * 基于 lunar-javascript 库 (6tail/lunar)
 */
import { Solar, Lunar, LunarMonth, LunarYear } from "lunar-javascript"

export type CalendarType = "solar" | "lunar"

export interface LunarDate {
  lunarYear: number
  lunarMonth: number   // 1-12, 正月=1, 腊月=12
  lunarDay: number
  isLeapMonth: boolean
}

export interface SolarDate {
  year: number
  month: number
  day: number
}

/** 农历月份名称 */
const LUNAR_MONTH_NAMES = [
  "正月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "冬月", "腊月",
]

/** 获取农历月份显示名（含闰月） */
export function getLunarMonthName(month: number, isLeap: boolean): string {
  const name = LUNAR_MONTH_NAMES[month - 1] || `${month}月`
  return isLeap ? `闰${name}` : name
}

/** 阳历 → 农历 */
export function solarToLunar(year: number, month: number, day: number): LunarDate {
  const solar = Solar.fromYmd(year, month, day)
  const lunar = solar.getLunar()
  return {
    lunarYear: lunar.getYear(),
    lunarMonth: lunar.getMonth(),
    lunarDay: lunar.getDay(),
    isLeapMonth: lunar.getMonth() < 0, // lunar-javascript 用负数表示闰月
  }
}

/** 农历 → 阳历 */
export function lunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number, isLeapMonth: boolean): SolarDate {
  // lunar-javascript 用负数表示闰月
  const month = isLeapMonth ? -lunarMonth : lunarMonth
  const lunar = Lunar.fromYmd(lunarYear, month, lunarDay)
  const solar = lunar.getSolar()
  return {
    year: solar.getYear(),
    month: solar.getMonth(),
    day: solar.getDay(),
  }
}

/** 获取某年某月的农历天数 */
export function getLunarMonthDays(year: number, month: number, isLeapMonth: boolean): number {
  const m = isLeapMonth ? -month : month
  const lunarMonth = LunarMonth.fromYm(year, m)
  return lunarMonth ? lunarMonth.getDayCount() : 30
}

/** 获取某年所有农历月份（含闰月） */
export function getLunarMonths(year: number): { month: number; isLeap: boolean; name: string }[] {
  const lunarYear = LunarYear.fromYear(year)
  const allMonths = lunarYear.getMonths()
  // getMonths() 包含前后年的月份，需过滤只保留该农历年的月份
  const result: { month: number; isLeap: boolean; name: string }[] = []
  for (const m of allMonths) {
    if (m.getYear() !== year) continue
    const monthVal = m.getMonth() // 负数表示闰月 (e.g. -5 = 闰五月)
    const month = Math.abs(monthVal)
    const isLeap = monthVal < 0
    result.push({
      month,
      isLeap,
      name: getLunarMonthName(month, isLeap),
    })
  }
  return result
}

/** 农历日期转字符串 */
export function lunarToDateStr(year: number, month: number, day: number, isLeapMonth: boolean): string {
  const monthName = getLunarMonthName(month, isLeapMonth)
  return `${year}年${monthName}${day}日`
}

/** 阳历日期转字符串 */
export function solarToDateStr(year: number, month: number, day: number): string {
  return `${year}年${month}月${day}日`
}

/** 中国天干地支年份 */
export function getGanZhiYear(year: number): string {
  const gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
  const zhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
  const ganIdx = ((year - 4) % 10 + 10) % 10
  const zhiIdx = ((year - 4) % 12 + 12) % 12
  return `${gan[ganIdx]}${zhi[zhiIdx]}`
}
