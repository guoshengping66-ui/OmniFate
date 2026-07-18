import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"))

test("uses the ESLint CLI for application source instead of the removed Next lint command", () => {
  assert.equal(pkg.scripts.lint, "eslint src")
})
