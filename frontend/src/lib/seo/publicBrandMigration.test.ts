import assert from "node:assert/strict"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, extname, join, resolve } from "node:path"
import test from "node:test"

const here = dirname(fileURLToPath(import.meta.url))
const retiredBrand = /Inner Atlas AI|Inner Atlas/
const searchableExtensions = new Set([".ts", ".tsx", ".json", ".svg"])

function collectPublicSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return collectPublicSources(path)
    if (entry.name.includes(".test.") || !searchableExtensions.has(extname(entry.name))) return []
    return [path]
  })
}

const roots = [
  resolve(here, "../../app/[locale]"),
  resolve(here, "../../data/seo"),
  resolve(here, "../../lib/seo"),
  resolve(here, "../../i18n"),
]

const publicSourceFiles = [
  ...roots.flatMap(collectPublicSources),
  resolve(here, "../../app/layout.tsx"),
  resolve(here, "../../../public/manifest.json"),
  resolve(here, "../../../public/og-image.svg"),
].filter(existsSync)

const publicSource = publicSourceFiles
  .map((path) => `\n--- ${path}\n${readFileSync(path, "utf8")}`)
  .join("")

test("defines KhanFate as the central public SEO brand", () => {
  const brandSource = resolve(here, "brand.ts")
  assert.ok(existsSync(brandSource), "expected the SEO brand module to exist")
  assert.match(readFileSync(brandSource, "utf8"), /SEO_BRAND_NAME\s*=\s*"KhanFate"/)
})

test("does not expose the retired brand in public SEO and GEO source", () => {
  assert.ok(publicSourceFiles.length > 10, "expected public discovery files to be scanned")
  assert.doesNotMatch(publicSource, retiredBrand)
})
