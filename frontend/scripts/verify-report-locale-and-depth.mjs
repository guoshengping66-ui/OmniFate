import { readFileSync } from "node:fs"

const reportSection = readFileSync(new URL("../src/components/reading/ReportSection.tsx", import.meta.url), "utf8")
const page = readFileSync(new URL("../src/app/[locale]/reading/[id]/page.tsx", import.meta.url), "utf8")

if (!reportSection.includes("defaultExpanded")) {
  throw new Error("Unlocked specialist reports need a full-detail default")
}
if (reportSection.includes("KEY {index + 1}")) {
  throw new Error("Hard-coded specialist labels must be localized")
}
if (!page.includes("defaultExpanded={isUnlocked}")) {
  throw new Error("Paid specialist view must open complete")
}
if (!page.includes("FreeReportSnapshot")) {
  throw new Error("Free report needs a value-led snapshot")
}
if (!page.includes("snapshot.sevenDayAction") || !page.includes("Your seven-day verification")) {
  throw new Error("Free report needs a personalized short action horizon")
}
if (!page.includes("canViewPaid && displayDimensionScores")) {
  throw new Error("Paid life curve gate must remain intact")
}
if (page.includes("FOCUS {index + 1}")) {
  throw new Error("Specialist focus cards must respect the selected locale")
}
if (!page.includes("<DecisionReportText\n                    content={data.master_detail")) {
  throw new Error("The paid decision report must remain rendered after localization")
}
