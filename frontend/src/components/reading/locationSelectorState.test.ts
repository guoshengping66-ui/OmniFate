import assert from "node:assert/strict"
import test from "node:test"
import { compactPlaces, manualSelection, nextCountryState, shouldSearchPlaces, toVerifiedSelection } from "./locationSelectorState.ts"

const tokyo = {
  id: "tokyo-jp",
  display_name: "Tokyo, Japan",
  city: "Tokyo",
  country: "Japan",
  country_code: "JP",
  is_verified: true,
}

test("search only starts after two characters and keeps the country code", () => {
  assert.deepEqual(shouldSearchPlaces("To", "JP"), { query: "To", country: "JP" })
  assert.equal(shouldSearchPlaces("T", "JP"), null)
})

test("verified selection preserves the backend standard display name", () => {
  assert.deepEqual(toVerifiedSelection(tokyo), { value: "Tokyo, Japan", verified: true, place: tokyo })
})

test("country changes clear stale candidates and manual entries remain unverified", () => {
  assert.deepEqual(nextCountryState({ items: [tokyo], country: "JP" }, "US"), { items: [], country: "US" })
  assert.deepEqual(manualSelection("My hometown"), { value: "My hometown", verified: false })
})

test("compact suggestions keep at most six distinct locations", () => {
  const places = Array.from({ length: 8 }, (_, index) => ({ ...tokyo, id: String(index), display_name: `City ${index}` }))
  assert.equal(compactPlaces(places).length, 6)
})
