import assert from "node:assert/strict"
import test from "node:test"
import { shouldClearShopCart } from "./checkoutReturn.ts"

test("clears only the cart belonging to a confirmed shop order", () => {
  assert.equal(shouldClearShopCart("success", "ORD123", "ORD123"), true)
  assert.equal(shouldClearShopCart("success", "ORD123", "ORD456"), false)
})

test("never clears a cart for cancelled or unknown payment returns", () => {
  assert.equal(shouldClearShopCart("cancelled", "ORD123", "ORD123"), false)
  assert.equal(shouldClearShopCart("success", null, "ORD123"), false)
  assert.equal(shouldClearShopCart("success", "ORD123", null), false)
})
