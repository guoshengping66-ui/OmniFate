import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const rootLayout = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8")

test("uses Inner Atlas AI for the installed web-app title", () => {
  assert.match(rootLayout, /appleWebApp:[\s\S]*title: "Inner Atlas AI"/)
})
