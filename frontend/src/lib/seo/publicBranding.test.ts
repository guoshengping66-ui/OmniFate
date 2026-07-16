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

test("keeps one public brand across rendered source and metadata", () => {
  const legacyBrand = /Guanwo Fate OS|观我\s*Fate OS/
  const files = sourceFiles(fileURLToPath(new URL("../../", import.meta.url)))

  for (const file of files) {
    assert.doesNotMatch(readFileSync(file, "utf8"), legacyBrand, file)
  }
})
