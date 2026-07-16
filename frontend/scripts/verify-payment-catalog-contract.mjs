import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const modal = readFileSync(new URL("../src/components/payment/QRPaymentModal.tsx", import.meta.url), "utf8")
const api = readFileSync(new URL("../src/lib/api.ts", import.meta.url), "utf8")

assert(api.includes("export async function getPaymentCatalog"), "Frontend API must fetch the server payment catalog")
assert(modal.includes("getPaymentCatalog"), "Checkout modal must load the server payment catalog")
assert(modal.includes("catalog?.items[itemType]"), "Checkout modal must display the payable server quote")
assert(!modal.includes("const TIER_PRICES"), "Checkout modal must not define a competing client price table")
assert(!modal.includes("const UNLOCK_PRICES"), "Checkout modal must not hard-code report unlock prices")

console.log("payment catalog contract passed")
