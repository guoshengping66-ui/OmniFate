# Treasure Hall Prescription Commerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework Treasure Hall into a profile-driven prescription commerce flow that turns report insights into explainable lifestyle product recommendations.

**Architecture:** Keep the existing Next.js shop routes and backend product APIs. Add a small frontend utility module for need paths, safe text rendering, and product fit metadata, then refactor `/shop`, product cards, and detail pages to consume those helpers.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, lucide-react, existing `@/lib/api` product types, existing cart and i18n contexts.

## Global Constraints

- Do not add a new backend recommendation engine in this slice.
- Reuse `/api/products`, `/api/products/match`, `match_score`, `match_reasons`, and product tag fields.
- Keep payment, checkout, inventory, and CJ Dropshipping behavior unchanged.
- Avoid guaranteed outcome claims; products are cultural and lifestyle recommendations.
- Build must pass with `cd frontend && npm run build`.
- Final implementation diff should stay limited to shop-related frontend files unless explicit data cleanup is added.

---

## File Structure

- Create `frontend/src/lib/treasureHall.ts`: pure helper functions and copy maps for need paths, safe localized text, category normalization, and product fit tags.
- Modify `frontend/src/app/[locale]/shop/page.tsx`: restructure shop page into prescription commerce sections, add need path filter, call match API with explanation when personalized.
- Modify `frontend/src/components/reading/ProductCard.tsx`: make cards explain product relevance through match tiers, reasons, and need tags.
- Modify `frontend/src/app/[locale]/shop/[id]/page.tsx`: improve detail page "why it fits", compliance trust copy, precautions visibility, and safe text rendering.

---

### Task 1: Treasure Hall Helper Module

**Files:**
- Create: `frontend/src/lib/treasureHall.ts`

**Interfaces:**
- Produces: `NeedPath`, `NEED_PATHS`, `isMojibakeText(value)`, `safeLocalizedText(primary, fallback)`, `getNeedTags(product, locale)`, `getMatchTier(score, locale)`, `normalizeProductCategory(category)`, `productMatchesNeed(product, needKey)`.
- Consumes: `Product` from `@/lib/api`.

- [ ] **Step 1: Create helper module**

Create `frontend/src/lib/treasureHall.ts` with:

```ts
import type { Product } from "@/lib/api"

export type TreasureLocale = "zh" | "en"

export interface NeedPath {
  key: string
  label: Record<TreasureLocale, string>
  description: Record<TreasureLocale, string>
  tags: string[]
  elements: string[]
  planets: string[]
}

export const NEED_PATHS: NeedPath[] = [
  {
    key: "wealth-stability",
    label: { zh: "财富稳定", en: "Wealth stability" },
    description: { zh: "适合关注财务节奏、事业根基和长期安全感的人。", en: "For financial rhythm, career grounding, and long-term security." },
    tags: ["#财务重启", "#财务低潮", "#积极心态", "#FinancialRenewal", "#FinancialDownturn", "#PositiveMindset"],
    elements: ["earth", "metal"],
    planets: ["sun", "jupiter"],
  },
  {
    key: "relationship-repair",
    label: { zh: "关系修复", en: "Relationship repair" },
    description: { zh: "适合沟通卡住、关系紧张或需要柔和支持的人。", en: "For blocked communication, tense relationships, and softer support." },
    tags: ["#人际关系", "#沟通障碍", "#表达困难", "#Relationships", "#ExpressionDifficulty", "#Communication"],
    elements: ["water", "wood", "fire"],
    planets: ["venus", "mercury", "moon"],
  },
  {
    key: "motivation-execution",
    label: { zh: "行动力提升", en: "Motivation and execution" },
    description: { zh: "适合动力不足、职业挑战、创作瓶颈和执行力低潮。", en: "For low momentum, career challenges, creative blocks, and execution dips." },
    tags: ["#动力提升", "#职业挑战", "#创作瓶颈", "#MotivationBoost", "#CareerChallenge", "#CreativeBlock"],
    elements: ["fire", "wood"],
    planets: ["mars", "sun"],
  },
  {
    key: "emotional-calm",
    label: { zh: "情绪安定", en: "Emotional calm" },
    description: { zh: "适合压力管理、内在成长、睡眠和安静反思。", en: "For stress management, inner growth, rest, and quiet reflection." },
    tags: ["#平静需求", "#平静心神", "#压力管理", "#NeedForCalm", "#MentalPeace", "#StressManagement"],
    elements: ["water", "metal"],
    planets: ["moon", "neptune"],
  },
  {
    key: "communication-expression",
    label: { zh: "表达沟通", en: "Communication and expression" },
    description: { zh: "适合会议、表达、社交紧张和自信表达。", en: "For meetings, expression, social tension, and confident communication." },
    tags: ["#表达困难", "#社交恐惧", "#沟通障碍", "#ExpressionDifficulty", "#SocialAnxiety", "#Communication"],
    elements: ["water", "wood"],
    planets: ["mercury"],
  },
  {
    key: "space-cleansing",
    label: { zh: "空间净化", en: "Space cleansing" },
    description: { zh: "适合居家、办公、冥想空间的日常清理和安定。", en: "For home, work, and meditation space clearing." },
    tags: ["#净化空间", "#空间净化", "#SpacePurification", "#MentalPeace"],
    elements: ["metal", "water"],
    planets: ["moon"],
  },
  {
    key: "protection-conflict",
    label: { zh: "防护化冲", en: "Protection and conflict reduction" },
    description: { zh: "适合冲突模式、人际干扰、挑战阶段和边界感不足。", en: "For conflict patterns, interpersonal noise, challenging phases, and boundaries." },
    tags: ["#冲突模式", "#防护", "#挑战阶段", "#ConflictPattern", "#Protection", "#ChallengingPhase"],
    elements: ["water", "metal"],
    planets: ["saturn", "mars"],
  },
]

export function isMojibakeText(value?: string | null): boolean {
  if (!value) return false
  return /[�]|[鈺愨晲]|[馃]|[涓-龥]{0}[\u0080-\u00ff]/.test(value)
}

export function safeLocalizedText(primary?: string | null, fallback?: string | null): string {
  if (primary && !isMojibakeText(primary)) return primary
  if (fallback && !isMojibakeText(fallback)) return fallback
  return ""
}

export function normalizeProductCategory(category?: string | null): string {
  if (!category) return "other"
  if (category === "accessory") return "talisman"
  return category
}

export function getMatchTier(score: number | null | undefined, locale: string): string {
  const isZh = locale === "zh"
  if (score == null || score <= 0) return isZh ? "精选" : "Curated"
  if (score >= 10) return isZh ? "高度匹配" : "High match"
  if (score >= 7) return isZh ? "强推荐" : "Strong fit"
  if (score >= 4) return isZh ? "可参考" : "Good fit"
  return isZh ? "轻匹配" : "Light fit"
}

export function getNeedTags(product: Product, locale: string): string[] {
  const isEn = locale === "en"
  const source = isEn
    ? (product.keyword_tags_en || product.keyword_tags || [])
    : (product.keyword_tags || [])
  return source.filter(tag => !isMojibakeText(tag)).slice(0, 2)
}

export function productMatchesNeed(product: Product, needKey: string): boolean {
  const need = NEED_PATHS.find(item => item.key === needKey)
  if (!need) return true
  const productTags = [
    ...(product.keyword_tags || []),
    ...(product.keyword_tags_en || []),
    ...(product.wuxing_tags || []),
    ...(product.astro_tags || []),
  ].map(item => String(item).toLowerCase())
  return [
    ...need.tags,
    ...need.elements,
    ...need.planets,
  ].some(tag => productTags.includes(String(tag).toLowerCase()))
}
```

- [ ] **Step 2: Run TypeScript-facing build check**

Run: `cd frontend && npm run build`

Expected: build may fail later on pages not yet updated only if imports are unused; this helper alone should not introduce type errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/treasureHall.ts
git commit -m "feat: add treasure hall recommendation helpers"
```

---

### Task 2: Shop Page Prescription Structure

**Files:**
- Modify: `frontend/src/app/[locale]/shop/page.tsx`

**Interfaces:**
- Consumes: `NEED_PATHS`, `productMatchesNeed`, `normalizeProductCategory` from `@/lib/treasureHall`.
- Produces: Need path filter state `activeNeed`, filtered product list, prescription copy sections.

- [ ] **Step 1: Update imports**

Add imports:

```ts
import { NEED_PATHS, normalizeProductCategory, productMatchesNeed } from "@/lib/treasureHall"
```

- [ ] **Step 2: Add need-path state**

Inside `ShopContent`, after `activeSeries`:

```ts
const [activeNeed, setActiveNeed] = useState("")
```

- [ ] **Step 3: Request explanations for personalized matches**

Change the `matchProducts` call payload:

```ts
const matched = await matchProducts({
  weakness_tags: weaknessTags,
  top_k: 20,
  include_explain: true,
}, locale)
```

- [ ] **Step 4: Filter by need and normalized category**

Replace the `products` `useMemo` with:

```ts
const products = useMemo(() => {
  return allProducts.filter(p => {
    const seriesMatch = !activeSeries || normalizeProductCategory(p.category) === activeSeries
    const needMatch = !activeNeed || productMatchesNeed(p, activeNeed)
    return seriesMatch && needMatch
  })
}, [allProducts, activeSeries, activeNeed])
```

- [ ] **Step 5: Add prescription copy**

Add these keys to the existing `copy` object:

```ts
prescriptionTitle: isZh ? "你的当下处方" : "Your current prescription",
prescriptionDesc: isZh
  ? "根据报告标签、五维弱项和近期趋势，把洞察转化为具体生活方式动作。"
  : "Report tags, weaker dimensions, and current trends become concrete lifestyle actions.",
needTitle: isZh ? "按当前需求选择" : "Choose by current need",
needDesc: isZh
  ? "没有报告也可以先按需求浏览；完成画像后，排序会更贴近你的状态。"
  : "Browse by need before a report. After profiling, ranking becomes more personal.",
allNeeds: isZh ? "全部需求" : "All needs",
```

- [ ] **Step 6: Add need path filter UI before category filter**

Insert before the existing `Series Filter` block:

```tsx
<ScrollReveal>
  <div className="mb-8">
    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="font-serif text-xl text-gold">{copy.needTitle}</h2>
        <p className="mt-1 text-sm leading-relaxed text-white/40">{copy.needDesc}</p>
      </div>
    </div>
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => setActiveNeed("")}
        className={`shrink-0 border px-4 py-2 text-xs transition-colors ${
          activeNeed === "" ? "border-gold/40 bg-gold/10 text-gold" : "border-white/10 bg-white/[0.025] text-white/45 hover:border-gold/25 hover:text-gold/80"
        }`}
      >
        {copy.allNeeds}
      </button>
      {NEED_PATHS.map(need => (
        <button
          key={need.key}
          onClick={() => setActiveNeed(need.key)}
          className={`shrink-0 border px-4 py-2 text-left transition-colors ${
            activeNeed === need.key ? "border-gold/40 bg-gold/10 text-gold" : "border-white/10 bg-white/[0.025] text-white/45 hover:border-gold/25 hover:text-gold/80"
          }`}
        >
          <span className="block text-xs font-medium">{need.label[isZh ? "zh" : "en"]}</span>
          <span className="mt-0.5 block max-w-[220px] text-[10px] leading-relaxed text-white/30">{need.description[isZh ? "zh" : "en"]}</span>
        </button>
      ))}
    </div>
  </div>
</ScrollReveal>
```

- [ ] **Step 7: Update personalized recommendation heading copy**

In the AI Recommendation block, change the surrounding heading to use `copy.prescriptionTitle` and `copy.prescriptionDesc` while keeping `AIRecommendHero`.

- [ ] **Step 8: Verify**

Run: `cd frontend && npm run build`

Expected: build exits 0 and includes `/[locale]/shop` in the route table.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/app/[locale]/shop/page.tsx
git commit -m "feat: restructure treasure hall prescription shop"
```

---

### Task 3: Product Card Decision Support

**Files:**
- Modify: `frontend/src/components/reading/ProductCard.tsx`

**Interfaces:**
- Consumes: `getMatchTier`, `getNeedTags`, `safeLocalizedText` from `@/lib/treasureHall`.
- Produces: cards with match tier, safer text, clearer recommendation reasons.

- [ ] **Step 1: Update imports**

Add:

```ts
import { getMatchTier, getNeedTags, safeLocalizedText } from "@/lib/treasureHall"
```

- [ ] **Step 2: Replace product name and short pitch resolution**

Inside `ProductCard`, replace `productName` and add:

```ts
const productName = safeLocalizedText(isEn ? product.name_en : product.name, product.name) || product.name
const shortPitch = safeLocalizedText(isEn ? product.short_pitch_en : product.short_pitch, product.short_pitch)
const needTags = useMemo(() => getNeedTags(product, locale), [product, locale])
const matchTier = useMemo(() => getMatchTier(product.match_score, locale), [product.match_score, locale])
```

- [ ] **Step 3: Upgrade badge copy**

Replace the existing AI badge content:

```tsx
<Zap size={9} className="fill-gold/40" />
{matchTier}
```

- [ ] **Step 4: Render short pitch safely**

Replace the `product.short_pitch` block with:

```tsx
{shortPitch && (
  <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-white/35">
    {shortPitch}
  </p>
)}
```

- [ ] **Step 5: Render need tags for non-personalized cards**

Replace the keyword tag block with:

```tsx
{!hasMatch && needTags.length > 0 && (
  <div className="mb-3 flex flex-wrap gap-1">
    {needTags.map(tag => (
      <span key={tag} className="rounded-full bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white/30">
        {tag}
      </span>
    ))}
  </div>
)}
```

- [ ] **Step 6: Verify**

Run: `cd frontend && npm run build`

Expected: build exits 0.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/reading/ProductCard.tsx
git commit -m "feat: clarify treasure hall product cards"
```

---

### Task 4: Product Detail Trust And Fit Sections

**Files:**
- Modify: `frontend/src/app/[locale]/shop/[id]/page.tsx`

**Interfaces:**
- Consumes: `getNeedTags`, `safeLocalizedText`, `normalizeProductCategory` from `@/lib/treasureHall`.
- Produces: stronger "why it fits" and compliance sections with safe localized copy.

- [ ] **Step 1: Update imports**

Add:

```ts
import { getNeedTags, normalizeProductCategory, safeLocalizedText } from "@/lib/treasureHall"
```

- [ ] **Step 2: Normalize category label lookup**

Change category label rendering to use:

```ts
const normalizedCategory = normalizeProductCategory(product.category)
```

Then use:

```tsx
{CATEGORY_LABELS[normalizedCategory] || normalizedCategory}
```

- [ ] **Step 3: Add safe localized fields after product null guard**

After `if (!product) { ... }`, add:

```ts
const productName = safeLocalizedText(locale === "en" ? product.name_en : product.name, product.name) || product.name
const shortPitch = safeLocalizedText(locale === "en" ? product.short_pitch_en : product.short_pitch, product.short_pitch)
const description = safeLocalizedText(locale === "en" ? product.description_en : product.description, product.description)
const efficacy = safeLocalizedText(locale === "en" ? product.efficacy_en : product.efficacy, product.efficacy)
const usage = safeLocalizedText(locale === "en" ? product.usage_en : product.usage, product.usage)
const precautions = safeLocalizedText(locale === "en" ? product.precautions_en : product.precautions, product.precautions)
const needTags = getNeedTags(product, locale)
```

- [ ] **Step 4: Replace direct localized field rendering**

Use:

```tsx
{productName}
{shortPitch}
{description}
{efficacy}
{usage}
{precautions}
```

instead of repeated ternaries for those same fields.

- [ ] **Step 5: Strengthen "AI Profile Match" panel**

Replace the current AI match panel body with:

```tsx
<p className="text-sm leading-relaxed text-white/45">
  {isZh
    ? "这件物品适合把报告里的趋势提醒转化为具体生活方式动作。推荐判断会参考你的画像标签、五行状态、近期课题和商品适用场景。"
    : "This item turns report insight into a concrete lifestyle action. Fit is judged by profile tags, element state, current themes, and the item's use case."}
</p>
<div className="mt-3 flex flex-wrap gap-1.5">
  {[
    ...needTags,
    ...(product.wuxing_tags || []),
    ...(product.astro_tags || []),
  ].slice(0, 6).map(tag => (
    <span key={tag} className="rounded-full border border-gold/15 bg-gold/[0.06] px-2 py-1 text-[10px] text-gold/62">
      {tag}
    </span>
  ))}
</div>
```

- [ ] **Step 6: Add compliance trust block before reviews**

Insert before reviews:

```tsx
<NarrativeSection className="narrative-block border-amber-500/15">
  <div className="mb-3 flex items-center gap-2">
    <Shield size={16} className="text-amber-300/70" />
    <h2 className="text-lg font-serif text-amber-200/80">{isZh ? "理性选择说明" : "Responsible guidance"}</h2>
  </div>
  <p className="text-sm leading-relaxed text-white/42">
    {isZh
      ? "藏宝阁商品属于文化创意与生活方式建议，不承诺医疗、财务、关系或心理结果。请结合自身情况、预算和使用禁忌理性选择。"
      : "Treasure Hall items are cultural and lifestyle recommendations. They do not promise medical, financial, relationship, or psychological outcomes. Choose rationally based on your needs, budget, and precautions."}
  </p>
</NarrativeSection>
```

- [ ] **Step 7: Verify**

Run: `cd frontend && npm run build`

Expected: build exits 0 and product detail route remains dynamic.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/[locale]/shop/[id]/page.tsx
git commit -m "feat: improve treasure hall product detail trust"
```

---

## Final Verification

- [ ] Run full build:

```bash
cd frontend && npm run build
```

Expected: exit 0.

- [ ] Inspect generated routes in output:

Expected route table includes:

```text
/[locale]/shop
/[locale]/shop/[id]
```

- [ ] Run git checks:

```bash
git status --short
git diff --check
```

Expected: no unstaged changes after final commit; `git diff --check` exits 0 before final commit.

---

## Self-Review

Spec coverage:

- Profile-driven prescription positioning: Tasks 2, 3, and 4.
- Need paths: Tasks 1 and 2.
- Product card explanation: Task 3.
- Detail page fit, usage, precautions, specs, compliance: Task 4.
- Reuse existing matching backend: Task 2.
- Data governance: Task 1 adds safe rendering; full catalog rewrite remains out of scope.
- Build verification: each task plus final verification.

Placeholder scan:

- No unresolved placeholders or undefined helper names.

Type consistency:

- All helper names consumed in Tasks 2-4 are produced in Task 1.
- Product fields match the existing `Product` interface names used in current shop files.
