import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const layoutSource = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8")

test("uses a locale-prefixed dynamic OG image URL", () => {
  assert.match(layoutSource, /url: `\$\{SITE_URL\}\/\$\{locale\}\/og-image`/)
})
