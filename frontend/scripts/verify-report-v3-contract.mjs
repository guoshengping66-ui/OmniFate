import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const page = readFileSync(new URL("../src/app/[locale]/reading/[id]/page.tsx", import.meta.url), "utf8")
const types = readFileSync(new URL("../src/types/report.ts", import.meta.url), "utf8")
const component = readFileSync(new URL("../src/components/reading/DecisionReport.tsx", import.meta.url), "utf8")

assert(page.includes('parsed?.report_type === "decision_report_v3"'), "page must render only the versioned decision report")
assert(page.includes('decisionReport.status === "recovering"'), "recovering reports must show a controlled state instead of raw content")
assert(!page.includes("const visualCards = sections.slice(0, 3)"), "legacy text must not infer card meaning from position")
assert(!page.includes("const roadmap = sections.slice(3, 6)"), "legacy text must not infer an action route from position")
assert(!page.includes("const offsets: Record<string, number>"), "display scores must equal source scores")
assert(types.includes('report_type: "decision_report_v3"'), "client type must require v3")
assert(component.includes('data.timeline.length > 0'), "timeline must be hidden when no source-bound timeline exists")
assert(component.includes('dim.score !== null'), "dimensions without evidence must not render a score bar")

console.log("report v3 contract passed")
