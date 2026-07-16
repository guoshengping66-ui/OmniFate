import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const selector = readFileSync(new URL("../src/components/reading/LocationSelector.tsx", import.meta.url), "utf8")
const page = readFileSync(new URL("../src/app/[locale]/reading/new/page.tsx", import.meta.url), "utf8")

assert(selector.includes('locale?: "zh" | "en"'), "LocationSelector must accept the active locale")
assert(selector.includes("POPULAR_PLACES"), "LocationSelector must offer mainstream places before a search")
assert(selector.includes('["Shanghai, China", "Shanghai", "CN", "China"]'), "Popular places must include Shanghai")
assert(selector.includes('["New York City, United States", "New York City", "US", "United States"]'), "Popular places must include New York City")
assert(selector.includes("searchPlaces(requestInput.query, locale, requestInput.country)"), "Typed searches must use the verified backend place search and preserve the country filter")
assert(selector.includes("const visibleItems = selected ? [] : (items.length > 0 ? items : (text.length < 2 ? compactPlaces(POPULAR_PLACES) : []))"), "Popular places must only appear before a query returns results")
assert.equal((page.match(/locale=\{locale === "zh" \? "zh" : "en"\}/g) || []).length, 2, "Both birth-location forms must pass their locale")

console.log("location selector contract passed")
