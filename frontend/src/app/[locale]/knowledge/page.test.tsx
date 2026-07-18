import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("renders the knowledge hub as an H1 and publishes matching collection schema", async () => {
  const source = await readFile(new URL("./page.tsx", import.meta.url), "utf8")

  assert.match(source, /headingTag="h1"/)
  assert.match(source, /createPublisherJsonLd/)
  assert.match(source, /"@id": `https:\/\/www\.khanfate\.com\/\$\{locale\}\/knowledge#collection`/)
  assert.match(source, /"inLanguage": isZh \? "zh-CN" : "en"/)
  assert.match(source, /"publisher": createPublisherJsonLd\(\)/)
})
