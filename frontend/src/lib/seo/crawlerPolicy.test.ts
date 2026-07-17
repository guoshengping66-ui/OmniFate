import assert from "node:assert/strict"
import test from "node:test"
import {
  AI_SEARCH_CRAWLERS,
  TRAINING_CRAWLERS,
  createRobotsRules,
} from "./crawlerPolicy.ts"

test("allows public AI search crawlers while retaining the no-training policy", () => {
  assert.deepEqual(AI_SEARCH_CRAWLERS, ["OAI-SearchBot", "OAI-AdsBot", "PerplexityBot", "ClaudeBot"])
  assert.ok(TRAINING_CRAWLERS.includes("GPTBot"))

  for (const crawler of AI_SEARCH_CRAWLERS) {
    const searchRule = createRobotsRules().find((rule) => rule.userAgent === crawler)
    assert.deepEqual(searchRule?.allow, ["/en/", "/zh/", "/sitemap.xml", "/llms.txt"])
    assert.deepEqual(searchRule?.disallow, ["/account", "/checkout", "/readings", "/api/"])
  }

  const gptRule = createRobotsRules().find((rule) => rule.userAgent === "GPTBot")
  assert.deepEqual(gptRule?.disallow, ["/"])
})

test("keeps private and transactional routes disallowed for public crawlers", () => {
  const publicRule = createRobotsRules().find((rule) => rule.userAgent === "*")
  assert.deepEqual(publicRule?.disallow, ["/account", "/checkout", "/readings", "/api/"])
})
