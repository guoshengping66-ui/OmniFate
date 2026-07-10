import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"

const root = path.resolve(import.meta.dirname, "..")
const assetPath = path.join(root, "public/assets/reference-style/reference-hero-visual.png")
const manifestPath = path.join(root, "public/assets/reference-style/manifest.json")

function readPngDimensions(buffer) {
  assert.equal(buffer.subarray(0, 8).toString("hex"), "89504e470d0a1a0a")
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

test("reference hero asset matches its declared crop", () => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))
  const dimensions = readPngDimensions(fs.readFileSync(assetPath))

  assert.deepEqual(manifest.assets["hero-visual"].sourceBox, [640, 64, 1904, 957])
  assert.deepEqual(dimensions, { width: 1264, height: 893 })
  assert.equal(manifest.assets["hero-visual"].role, "decorative")
})
