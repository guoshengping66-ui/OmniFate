import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

function templateFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith("Template.tsx"))
    .map((entry) => join(directory, entry.name))
}

test("uses the shared publisher helper in public article schemas", () => {
  const templateDirectory = fileURLToPath(new URL("../../components/templates", import.meta.url))
  const blogPage = fileURLToPath(new URL("../../app/[locale]/blog/page.tsx", import.meta.url))

  for (const file of [...templateFiles(templateDirectory), blogPage]) {
    assert.match(readFileSync(file, "utf8"), /createPublisherJsonLd/, file)
  }
})
