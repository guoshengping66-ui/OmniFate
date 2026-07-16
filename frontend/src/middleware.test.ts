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
