import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import test from "node:test"

const here = dirname(fileURLToPath(import.meta.url))
const deployScript = readFileSync(resolve(here, "../deploy.sh"), "utf8")
const chunkRecovery = readFileSync(resolve(here, "../src/components/ui/ChunkRecovery.tsx"), "utf8")

test("deploy script copies public assets into the active standalone runtime", () => {
  assert.ok(!deployScript.includes("\r"), "deploy.sh must use Unix LF line endings on Linux hosts")
  assert.match(deployScript, /^STANDALONE="\.next\/standalone"$/m)
  assert.doesNotMatch(deployScript, /\.next\/standalone\/frontend/)
  assert.match(deployScript, /rsync -a --delete public\/ "\$STANDALONE\/public\//)
  assert.match(deployScript, /DEPLOY_PREBUILT/)
  assert.match(deployScript, /Prebuilt artifact is missing/)
})

test("deploy script retains existing static chunks for open browser sessions", () => {
  assert.doesNotMatch(deployScript, /rm -rf "\$STANDALONE\/\.next"/)
  assert.match(deployScript, /rsync -a \.next\/static\/ "\$STANDALONE\/\.next\/static\//)
  assert.doesNotMatch(deployScript, /rsync -a --delete \.next\/static\/ "\$STANDALONE\/\.next\/static\//)
})

test("chunk recovery retries independently for each missing asset", () => {
  assert.match(chunkRecovery, /STORAGE_KEY_PREFIX/)
  assert.match(chunkRecovery, /sessionStorage\.setItem\(retryKey\(message\), "1"\)/)
  assert.doesNotMatch(chunkRecovery, /const STORAGE_KEY =/)
})
