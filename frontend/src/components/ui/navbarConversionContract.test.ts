import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { fileURLToPath } from "node:url"

const navbar = readFileSync(fileURLToPath(new URL("./Navbar.tsx", import.meta.url)), "utf8")

test("keeps report generation primary and moves secondary desktop links into an accessible disclosure", () => {
  assert.match(navbar, /locale === "zh" \? "更多" : "More"/)
  assert.match(navbar, /aria-expanded=\{exploreOpen\}/)
  assert.ok(!navbar.includes('href={localeHref("/register")} className="btn-gold text-sm py-2 px-6"'))
  assert.match(navbar, /text-white\/80/)
})
