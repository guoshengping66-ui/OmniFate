import { readFileSync } from "node:fs";

const api = readFileSync(new URL("../src/lib/api.ts", import.meta.url), "utf8");
const chart = readFileSync(new URL("../src/components/reading/LifeKLineChart.tsx", import.meta.url), "utf8");
const reading = readFileSync(new URL("../src/app/[locale]/reading/[id]/page.tsx", import.meta.url), "utf8");

for (const typeName of [
  "AnnualForecastSignal",
  "AnnualForecastMonth",
  "AnnualForecastKeyNode",
  "AnnualForecast",
]) {
  if (!api.includes(`interface ${typeName}`)) {
    throw new Error(`Missing frontend annual forecast type: ${typeName}`);
  }
}

if (!api.includes("annual_forecast?: AnnualForecast | null")) {
  throw new Error("AnalysisResponse does not expose the optional annual forecast");
}

if (!chart.includes("annualForecast: AnnualForecast") || !chart.includes("annualForecast.months")) {
  throw new Error("LifeKLineChart does not render backend annual forecast months");
}

if (!chart.includes("signal.summary") || !chart.includes("annualForecast.key_nodes")) {
  throw new Error("LifeKLineChart does not expose signal summaries and key nodes");
}

if (/Math\.(sin|cos|random)\b/.test(chart) || chart.includes("buildRhythmPoints")) {
  throw new Error("LifeKLineChart still synthesizes a client-side curve");
}

if (!reading.includes("canViewPaid && data.annual_forecast") || !reading.includes("annualForecast={data.annual_forecast}")) {
  throw new Error("Paid reading route does not pass the backend annual forecast to the chart");
}

if (!reading.includes("isUnlocked || isDetailedUnlocked")) {
  throw new Error("Annual curve no longer preserves the report unlock gate");
}
