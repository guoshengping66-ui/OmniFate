import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(process.cwd(), "src/app/[locale]/globals.css"), "utf8");
const footer = readFileSync(resolve(process.cwd(), "src/components/ui/Footer.tsx"), "utf8");
const required = [
  "--day-page",
  "--day-surface",
  "--day-ink",
  'html.day-theme [class*="bg-black"]',
  'html.day-theme [class*="bg-slate"]',
  "@media (max-width: 767px)",
  "min-height: 44px",
];

for (const token of required) {
  if (!css.includes(token)) throw new Error(`Missing responsive theme contract: ${token}`);
}

if (!css.includes("html.day-theme .site-footer-surface")) {
  throw new Error("Missing explicit day-theme footer surface rule");
}
if (!footer.includes("site-footer-surface")) {
  throw new Error("Footer does not expose a themed surface hook");
}
if (footer.includes('className="relative z-10 mt-24"')) {
  throw new Error("Footer leaves a transparent top margin that can expose the dark page background");
}
if (!footer.includes('className="site-footer-surface bg-[#020617] pt-24"')) {
  throw new Error("Footer must own its spacing inside the themed surface");
}
