import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import test from "node:test"

const here = dirname(fileURLToPath(import.meta.url))
const deployScript = readFileSync(resolve(here, "../deploy.sh"), "utf8")

test("deploy script copies public assets into the active standalone runtime", () => {
  assert.match(deployScript, /^STANDALONE="\.next\/standalone"$/m)
  assert.doesNotMatch(deployScript, /\.next\/standalone\/frontend/)
  assert.match(deployScript, /rsync -a --delete public\/ "\$STANDALONE\/public\//)
})
