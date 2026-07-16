import { readFileSync } from "node:fs";
const card = readFileSync(new URL("../src/components/reading/EnergyIDCard.tsx", import.meta.url), "utf8");
const report = readFileSync(new URL("../src/app/[locale]/reading/[id]/page.tsx", import.meta.url), "utf8");

const paid = "isUnlocked || isDetailedUnlocked";
if (card.includes("QRCodeSVG") || card.includes("card-flip-back") || card.includes("QrCode")) {
  throw new Error("Five-dimension card still contains QR flip behavior");
}
if (!card.includes("five-dimension-energy-card")) {
  throw new Error("Five-dimension card does not expose its intended report surface");
}
if (!report.includes("<LifeKLineChart") || !report.includes(paid)) {
  throw new Error("Life curve is missing from the paid report path");
}
if (!report.includes("free-report-summary")) {
  throw new Error("Free report does not retain a concise summary surface");
}
