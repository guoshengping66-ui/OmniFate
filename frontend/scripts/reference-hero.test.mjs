import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"

const root = path.resolve(import.meta.dirname, "..")
const assetPath = path.join(root, "public/assets/reference-style/reference-hero-visual.png")
const manifestPath = path.join(root, "public/assets/reference-style/manifest.json")
const cssPath = path.join(root, "src/app/[locale]/globals.css")

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

test("reference asset remains public and decorative", () => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))
  assert.equal(
    manifest.assets["hero-visual"].file,
    "/assets/reference-style/reference-hero-visual.png",
  )
})

test("reference hero layout keeps the crop at native desktop dimensions", () => {
  const css = fs.readFileSync(cssPath, "utf8")
  assert.match(css, /\.ia-hero-reference-visual\s*\{/)
  assert.match(css, /max-width:\s*1264px/)
  assert.match(css, /pointer-events:\s*none/)
  assert.match(css, /\.ia-hero-copy\s*\{[\s\S]*?width:\s*min\(640px,\s*46vw\)/)
  assert.match(css, /\.ia-hero h1\s*\{[\s\S]*?max-width:\s*640px/)
  assert.match(css, /@media\s*\(max-width:\s*767px\)/)
})
