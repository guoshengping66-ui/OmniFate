import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import test from "node:test"

function readSource(relativePath: string) {
  const file = new URL(relativePath, import.meta.url)
  return existsSync(file) ? readFileSync(file, "utf8") : ""
}

const routeSource = readSource("../../app/[locale]/shop/page.tsx")
const clientSource = readSource("../../app/[locale]/shop/ShopClient.tsx")
const layoutSource = readSource("../../app/[locale]/shop/layout.tsx")

test("shop route declares a factual collection page and category list", () => {
  assert.doesNotMatch(routeSource, /^"use client"/)
  assert.match(routeSource, /CollectionPage/)
  assert.match(routeSource, /Lifestyle objects matched to your current state/)

  for (const category of ["Crystals", "Jewelry", "Incense", "Talismans"]) {
    assert.match(routeSource, new RegExp(category))
  }
})

test("interactive shop renders the server supplied heading in its hero", () => {
  assert.match(clientSource, /seoHero/)
  assert.match(clientSource, /\{seoHero\}/)
})

test("shop metadata keeps localized canonical alternates and public shopping intent", () => {
  assert.match(layoutSource, /Lifestyle Shop: Crystals, Jewelry & Incense/)
  assert.match(layoutSource, /\$\{base\}\/en\/shop/)
  assert.match(layoutSource, /\$\{base\}\/zh\/shop/)
})
