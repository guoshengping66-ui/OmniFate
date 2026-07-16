import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const asset = resolve(
  process.cwd(),
  process.env.HERO_ASSET_PATH ?? "public/assets/reference-style/reference-hero-atlas-right-v2.png",
);
if (!existsSync(asset) || statSync(asset).size < 100_000) {
  throw new Error("Expected a substantial right-atlas hero asset");
}

const png = readFileSync(asset);
const signature = "89504e470d0a1a0a";
if (png.length < 24 || png.subarray(0, 8).toString("hex") !== signature) {
  throw new Error("Expected the right-atlas hero asset to be a PNG");
}
if (png.subarray(12, 16).toString("ascii") !== "IHDR") {
  throw new Error("Expected the right-atlas hero asset to have an IHDR header");
}

const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
const aspectRatio = width / height;
if (width < 1200 || height < 675 || Math.abs(aspectRatio - 16 / 9) > 0.01) {
  throw new Error(`Expected a 16:9-ish landscape hero PNG, received ${width}x${height}`);
}

const component = readFileSync(
  resolve(process.cwd(), "src/components/marketing-growth/EasternHomeExperience.tsx"),
  "utf8",
);
if (!component.includes('src="/assets/reference-style/reference-hero-atlas-right-v2.png"')) {
  throw new Error("Homepage does not reference the preserved right-atlas asset");
}
