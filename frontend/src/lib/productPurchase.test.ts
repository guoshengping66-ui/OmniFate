import assert from "node:assert/strict"
import test from "node:test"
import { getProductPurchaseActions } from "./productPurchase.ts"

test("uses an explicit checkout label for the primary report recommendation", () => {
  const actions = getProductPurchaseActions("en")

  assert.equal(actions.primary.intent, "add_and_checkout")
  assert.equal(actions.primary.label, "Add & checkout")
  assert.equal(actions.secondary.intent, "add_to_cart")
})

test("provides Chinese labels without changing the action intent", () => {
  const actions = getProductPurchaseActions("zh")

  assert.equal(actions.primary.intent, "add_and_checkout")
  assert.equal(actions.primary.label, "加入并结算")
  assert.equal(actions.secondary.label, "加入购物车")
})
