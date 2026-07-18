import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"
import { AI_SEARCH_CRAWLERS, createRobotsRules, PRIVATE_DISALLOW_PATHS, TRAINING_CRAWLERS } from "./crawlerPolicy.ts"

test("allows public AI search crawlers while retaining the no-training policy", () => {
  assert.deepEqual(AI_SEARCH_CRAWLERS, ["OAI-SearchBot", "OAI-AdsBot", "PerplexityBot", "ClaudeBot"])
  assert.ok(TRAINING_CRAWLERS.includes("GPTBot"))

  for (const crawler of AI_SEARCH_CRAWLERS) {
    const searchRule = createRobotsRules().find((rule) => rule.userAgent === crawler)
    assert.deepEqual(searchRule?.allow, ["/en/", "/zh/", "/sitemap.xml", "/llms.txt"])
    assert.ok(Array.isArray(searchRule?.disallow) && searchRule.disallow.includes("/en/account"))
  }

  const gptRule = createRobotsRules().find((rule) => rule.userAgent === "GPTBot")
  assert.deepEqual(gptRule?.disallow, ["/"])
})

test("blocks localized private routes for every non-training crawler", () => {
  const expectedPaths = ["/en/account", "/zh/account", "/en/checkout", "/zh/checkout", "/en/readings", "/zh/readings"]

  for (const path of expectedPaths) {
    assert.ok(PRIVATE_DISALLOW_PATHS.includes(path), `${path} must be disallowed`)
  }

  for (const rule of createRobotsRules().filter((rule) => rule.userAgent !== "GPTBot")) {
    assert.ok(Array.isArray(rule.disallow), `${String(rule.userAgent)} must have disallow paths`)
    assert.ok(rule.disallow.includes("/en/account"), `${String(rule.userAgent)} must disallow localized account routes`)
  }
})

test("marks personal and transactional route layouts as noindex", () => {
  const privateRoutes = ["account", "checkout", "credits", "login", "reading", "readings", "referral", "register"]
  const appDirectory = fileURLToPath(new URL("../../app/[locale]", import.meta.url))

  for (const route of privateRoutes) {
    const layout = readFileSync(join(appDirectory, route, "layout.tsx"), "utf8")
    assert.match(layout, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/, route)
  }
})
