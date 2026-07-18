import assert from "node:assert/strict"
import test from "node:test"
import { NextRequest } from "next/server"
import { middleware } from "./middleware"

test("does not add generic alternate links to English-only editorial articles", () => {
  const request = new NextRequest("https://www.khanfate.com/en/blog/what-is-bazi", {
    headers: { "x-forwarded-proto": "https" },
  })

  const response = middleware(request)

  assert.equal(response.headers.has("link"), false)
})

test("permanently redirects the retired Major Arcana article to its current guide", () => {
  const cases = [
    ["https://www.khanfate.com/en/blog/tarot-major", "https://www.khanfate.com/en/blog/tarot-card-meanings-complete"],
    ["https://www.khanfate.com/blog/tarot-major", "https://www.khanfate.com/en/blog/tarot-card-meanings-complete"],
  ] as const

  for (const [url, expectedLocation] of cases) {
    const response = middleware(new NextRequest(url, { headers: { "x-forwarded-proto": "https" } }))
    assert.equal(response.status, 301, url)
    assert.equal(response.headers.get("location"), expectedLocation, url)
  }
})
