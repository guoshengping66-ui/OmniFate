import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { resolve } from "node:path"
import test from "node:test"

test("does not let a public robots file shadow the source-controlled robots route", () => {
  assert.equal(existsSync(resolve(process.cwd(), "public/robots.txt")), false)
})
