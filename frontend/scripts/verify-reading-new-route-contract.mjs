import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const source = readFileSync(
  new URL("../src/app/[locale]/reading/[id]/page.tsx", import.meta.url),
  "utf8",
)

assert.match(
  source,
  /import NewReadingPage from "\.\.\/new\/page"/,
  "The dynamic reading route must be able to render the new-reading form as a fallback.",
)
assert.match(
  source,
  /if \(id === "new"\) return <NewReadingPage \/>/,
  "The literal /reading/new path must never be treated as a report session id.",
)

console.log("reading/new route contract verified")
