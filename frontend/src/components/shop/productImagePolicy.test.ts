import assert from "node:assert/strict"
import test from "node:test"
import { getProductImagePolicy } from "./productImagePolicy.ts"

test("uses the rendered width and eager loading for a priority shelf image", () => {
  assert.deepEqual(getProductImagePolicy("sm", true), {
    sizes: "64px",
    loading: "eager",
  })
})

test("keeps catalog images lazy and constrained to their rendered width", () => {
  assert.deepEqual(getProductImagePolicy("md", false), {
    sizes: "80px",
    loading: "lazy",
  })
})
