import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const navbar = readFileSync(new URL("../src/components/ui/Navbar.tsx", import.meta.url), "utf8")
const footer = readFileSync(new URL("../src/components/ui/Footer.tsx", import.meta.url), "utf8")
const reading = readFileSync(new URL("../src/app/[locale]/reading/new/page.tsx", import.meta.url), "utf8")

assert(navbar.includes('label: t("nav.reading")'), "Navbar must localize the report CTA")
assert(navbar.includes('label: t("nav.pricing")'), "Navbar must localize pricing")
assert(footer.includes('aria-label={t("footer.newsletterEmail")}'), "Newsletter email field needs an accessible label")
assert(footer.includes('aria-label={t("footer.subscribe")}'), "Newsletter submit control needs an accessible label")
assert(!footer.includes('t("footer.icp")'), "Do not publish an ICP placeholder as a filing link")
assert(reading.includes('toast.error(t("new.imageTypeError"))'), "Image type validation must be localized")
assert(reading.includes('toast.error(t("new.imageSizeError"))'), "Image size validation must be localized")
assert(reading.includes('t("new.localSaveNotice")'), "Reading form must disclose 24-hour local browser storage")

console.log("public UI contract passed")
