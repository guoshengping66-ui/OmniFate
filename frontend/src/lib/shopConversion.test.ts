import assert from "node:assert/strict"
import test from "node:test"
import { getShopActionCopy, getShopShelfProducts } from "./shopConversion.ts"

test("uses a clear add-to-bag label for the storefront", () => {
  const copy = getShopActionCopy("en")

  assert.equal(copy.addToBag, "Add to bag")
  assert.equal(copy.addedToBag, "Added to bag")
  assert.equal(copy.viewDetails, "View details")
})

test("provides Chinese storefront actions without changing the shopper intent", () => {
  const copy = getShopActionCopy("zh")

  assert.equal(copy.addToBag, "\u52a0\u5165\u8d2d\u7269\u888b")
  assert.equal(copy.viewDetails, "\u67e5\u770b\u8be6\u60c5")
})

test("keeps the recommendation shelf focused without mutating its catalog source", () => {
  const products = [{ id: "one" }, { id: "two" }, { id: "three" }, { id: "four" }] as never[]

  const shelf = getShopShelfProducts(products)

  assert.deepEqual(shelf.map((product: { id: string }) => product.id), ["one", "two", "three"])
  assert.equal(products.length, 4)
})
