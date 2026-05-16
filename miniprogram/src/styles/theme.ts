// ═══════════════════════════════════════════════════════════════════════════
// 共享设计 Token — 统一卡片、按钮、颜色系统
// ═══════════════════════════════════════════════════════════════════════════

export const gold = "#C9A84C"
export const goldRgb = "201,168,76"
export const bgColor = "#1A0F2E"

// ── 卡片样式 ──

/** 基础玻璃卡片 — 半透明毛玻璃 */
export const cardGlass = {
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1rpx solid rgba(255,255,255,0.08)",
  borderRadius: "28rpx",
  boxShadow: "0 8rpx 32rpx rgba(0,0,0,0.4), inset 0 1rpx 0 rgba(255,255,255,0.06)",
}

/** 高亮卡片 — 用于主要内容卡片（人格卡、CTA） */
export const cardElevated = {
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1rpx solid rgba(255,255,255,0.12)",
  borderRadius: "28rpx",
  boxShadow: "0 0 0 1rpx rgba(255,255,255,0.04), 0 8rpx 32rpx rgba(0,0,0,0.35), 0 0 80rpx rgba(201,168,76,0.06)",
}

// ── 按钮样式 ──

/** 金色主按钮 — 实体渐变 */
export const btnGold = {
  background: "linear-gradient(135deg, #C9A84C 0%, #E8CB7A 40%, #C9A84C 80%)",
  color: "#0A0A0A",
  borderRadius: "999rpx",
  fontWeight: "700" as const,
  boxShadow: "0 4rpx 16rpx rgba(201,168,76,0.3), 0 0 40rpx rgba(201,168,76,0.1)",
}

/** 金色描边按钮 — outline 风格 */
export const btnGoldOutline = {
  backgroundColor: "transparent",
  border: `1rpx solid rgba(${goldRgb},0.4)`,
  color: gold,
  borderRadius: "999rpx",
  fontWeight: "600" as const,
}

// ── 分割线 ──
export const goldSeparatorLine = {
  height: "1rpx",
  background: `linear-gradient(to right, transparent, rgba(${goldRgb},0.3), transparent)`,
}
