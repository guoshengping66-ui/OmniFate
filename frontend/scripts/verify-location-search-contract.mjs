import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const selector = readFileSync(new URL("../src/components/reading/LocationSelector.tsx", import.meta.url), "utf8")
const api = readFileSync(new URL("../src/lib/api.ts", import.meta.url), "utf8")

assert(selector.includes("searchPlaces"), "selector must query the global place API")
assert(selector.includes("至少 2 个字符") || selector.includes("at least 2 characters"), "selector must explain the search threshold")
assert(!selector.includes("INTERNATIONAL_LOCATIONS"), "selector must not bundle a partial city catalogue")
assert(selector.includes("timezone"), "selected place must display its timezone")
assert(api.includes("export async function searchPlaces"), "client API must expose place search")

console.log("location search contract passed")
