import { readFileSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const read = path => readFileSync(join(root, path), "utf8")

const checks = [
  {
    file: "src/components/marketing-growth/EasternHomeExperience.tsx",
    text: "生成你的 AI 人生报告",
    label: "homepage hero carries the current report-first positioning",
  },
  {
    file: "src/components/brand/EasternDesign.tsx",
    text: "FiveDimensionOrbit",
    label: "shared Eastern AI design component exists",
  },
  {
    file: "src/components/dashboard/UserDashboard.tsx",
    text: "Daily Action Center",
    label: "signed-in dashboard is daily action centered",
  },
  {
    file: "src/app/[locale]/login/page.tsx",
    text: "Sign in to view daily action and reports.",
    label: "login page uses consumer-facing Inner Atlas copy",
  },
  {
    file: "src/app/[locale]/shop/page.tsx",
    text: "生活方式物件",
    label: "shop is positioned as lifestyle recommendations",
  },
]

const failures = []

for (const check of checks) {
  try {
    const content = read(check.file)
    if (!content.includes(check.text)) {
      failures.push(`${check.label}: missing "${check.text}" in ${check.file}`)
    }
  } catch (error) {
    failures.push(`${check.label}: cannot read ${check.file}`)
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"))
  process.exit(1)
}

console.log(`Guanwo redesign checks passed: ${checks.length}/${checks.length}`)
