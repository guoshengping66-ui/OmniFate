import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const aboutPage = readFileSync(new URL("./page.tsx", import.meta.url), "utf8")

test("uses the shared Inner Atlas AI organization schema on the About page", () => {
  assert.match(aboutPage, /createOrganizationJsonLd/)
  assert.doesNotMatch(aboutPage, /Guanwo Fate OS/)
})
