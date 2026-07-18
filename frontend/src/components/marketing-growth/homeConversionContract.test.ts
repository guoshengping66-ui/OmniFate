import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { fileURLToPath } from "node:url"

const home = readFileSync(fileURLToPath(new URL("./EasternHomeExperience.tsx", import.meta.url)), "utf8")

test("sets a clear three-step expectation beneath the homepage report action", () => {
  assert.match(home, /journeyCue:/)
  assert.match(home, /className="ia-journey-cue"/)
  assert.match(home, /Choose your focus\. Receive your analysis\. Review your next move\./)
})
