import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const page = readFileSync(new URL("../src/app/[locale]/reading/[id]/page.tsx", import.meta.url), "utf8")
const chatBox = readFileSync(new URL("../src/components/reading/ChatBox.tsx", import.meta.url), "utf8")
const zh = readFileSync(new URL("../src/i18n/zh.json", import.meta.url), "utf8")
const en = readFileSync(new URL("../src/i18n/en.json", import.meta.url), "utf8")

assert(page.includes("relationshipType={data.relationship_type}"), "Relationship reports must pass their type to follow-up questions")
assert(page.includes("Relationship Deep Dive"), "Paid relationship reports need a clear deep-dive title")
assert(page.includes("关系深度档案"), "Paid relationship reports need a localized deep-dive title")
assert(chatBox.includes("relationshipType?: string"), "Follow-up chat needs relationship context")
assert(chatBox.includes("RELATIONSHIP_QUICK"), "Follow-up chat needs scenario-aware quick questions")
assert(zh.includes("基于本报告的重点追问"), "Chinese follow-up copy is missing")
assert(en.includes("Follow-up on This Report"), "English follow-up copy is missing")

for (const state of ['"idle"', '"loading"', '"success"', '"empty"', '"error"']) {
  assert(page.includes(state), `Missing report shop state ${state}`)
}
assert(page.includes('setShopStatus("error")'), "Report shop errors must be visible")
assert(page.includes("retryShopMatch"), "Report shop needs a manual retry")
assert(page.includes("data.recommended_products"), "Saved report recommendations must be used")
assert(page.includes("ProductCardFallback"), "Report shop needs a product-card fallback")
