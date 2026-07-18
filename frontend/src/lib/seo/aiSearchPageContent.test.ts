import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("renders stable, visible citation answers from the shared AI reference data", async () => {
  const source = await readFile(new URL("../../app/[locale]/ai-search/page.tsx", import.meta.url), "utf8")

  assert.match(source, /id="citation-answers"/)
  assert.match(source, /Citation-ready answers/)
  assert.match(source, /AI_SEARCH_REFERENCE\.citationAnswers\.map/)
  assert.match(source, /id=\{answer\.id\}/)
  assert.match(source, /href=\{answer\.href\}/)
})
