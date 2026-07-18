import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return entry.name.endsWith(".test.ts") ? [] : [path]
  })
}

test("keeps legacy brands out of rendered public SEO sources", () => {
  const legacyBrand = /Destiny Engine|Profile Mirror|Guanwo|观我|命运引擎/i
  const files = [
    ...sourceFiles(fileURLToPath(new URL("../../app/[locale]", import.meta.url))),
    ...sourceFiles(fileURLToPath(new URL("../../components/templates", import.meta.url))),
  ]

  for (const file of files) {
    assert.doesNotMatch(readFileSync(file, "utf8"), legacyBrand, file)
  }
})
