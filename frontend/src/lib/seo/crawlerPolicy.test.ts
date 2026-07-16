import assert from "node:assert/strict"
import test from "node:test"
import {
  AI_SEARCH_CRAWLERS,
  TRAINING_CRAWLERS,
  createRobotsRules,
} from "./crawlerPolicy.ts"

test("allows ChatGPT search while retaining the no-training policy", () => {
  assert.ok(AI_SEARCH_CRAWLERS.includes("OAI-SearchBot"))
  assert.ok(TRAINING_CRAWLERS.includes("GPTBot"))

  const gptRule = createRobotsRules().find((rule) => rule.userAgent === "GPTBot")
  assert.deepEqual(gptRule?.disallow, ["/"])
})

test("keeps private and transactional routes disallowed for public crawlers", () => {
  const publicRule = createRobotsRules().find((rule) => rule.userAgent === "*")
  assert.deepEqual(publicRule?.disallow, ["/account", "/checkout", "/readings", "/api/"])
})
