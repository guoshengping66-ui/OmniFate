import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("renders visible public services from the shared AI reference data", async () => {
  const source = await readFile(new URL("./page.tsx", import.meta.url), "utf8")

  assert.match(source, /aria-labelledby="services-heading"/)
  assert.match(source, /Public services/)
  assert.match(source, /AI_SEARCH_REFERENCE\.services\.map/)
  assert.match(source, /href=\{service\.href\}/)
})
