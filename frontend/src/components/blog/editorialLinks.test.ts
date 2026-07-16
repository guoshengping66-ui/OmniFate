import assert from "node:assert/strict"
import test from "node:test"
import { getEditorialLinks } from "./editorialLinks.ts"

test("uses only explicit editorial article IDs in declared order", () => {
  const result = getEditorialLinks(["b", "a", "missing"], new Map([["a", { id: "a" }], ["b", { id: "b" }]]))
  assert.deepEqual(result.map((article) => article.id), ["b", "a"])
})
