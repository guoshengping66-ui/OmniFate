import assert from "node:assert/strict"
import test from "node:test"
import { getProgrammaticLastModified } from "./sitemapDates.ts"

test("uses a stable release date for unchanged programmatic pages", () => {
  assert.equal(getProgrammaticLastModified().toISOString(), "2026-07-17T00:00:00.000Z")
})

test("does not replace a known article source date", () => {
  const published = new Date("2026-06-01T12:00:00.000Z")
  assert.equal(getProgrammaticLastModified(published).toISOString(), published.toISOString())
})
