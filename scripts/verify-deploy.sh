#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  命盘智镜 — 部署验证脚本
# ══════════════════════════════════════════════════════════════════════════════
#  用法: bash scripts/verify-deploy.sh
#  用途: 验证前端和后端部署是否成功，包含所有最新代码
# ══════════════════════════════════════════════════════════════════════════════

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}✓${NC} $*"; }
fail() { echo -e "  ${RED}✗${NC} $*"; }
warn() { echo -e "  ${YELLOW}!${NC} $*"; }

FRONTEND="https://khanfate.com"
BACKEND="https://api.khanfate.com"
ERRORS=0

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  命盘智镜 — 部署验证"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ── 1. 后端健康检查 ─────────────────────────────────────────────
echo "1. 后端健康检查"
HEALTH=$(curl -s "$BACKEND/health" 2>/dev/null)
if echo "$HEALTH" | grep -q '"ok"'; then
  pass "后端运行正常"
else
  fail "后端健康检查失败: $HEALTH"
  ERRORS=$((ERRORS + 1))
fi

# ── 2. 后端 GZip 压缩 ──────────────────────────────────────────
echo ""
echo "2. 后端 GZip 压缩"
GZIP=$(curl -sI -H "Accept-Encoding: gzip, deflate" "$BACKEND/health" 2>/dev/null | grep -i "content-encoding")
if echo "$GZIP" | grep -qi "gzip"; then
  pass "GZip 压缩已启用"
else
  warn "GZip 压缩未启用 (后端可能未部署最新代码)"
fi

# ── 3. 前端页面检查 ─────────────────────────────────────────────
echo ""
echo "3. 前端页面"
for path in "/" "/about"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND$path" 2>/dev/null)
  if [ "$code" = "200" ]; then
    pass "$path → HTTP $code"
  else
    fail "$path → HTTP $code"
    ERRORS=$((ERRORS + 1))
  fi
done

# ── 4. 前端 JS chunks 包含最新功能 ──────────────────────────────
echo ""
echo "4. 前端代码验证"

# 获取 reading 页面的 chunk hash
READING_PAGE=$(curl -s "$FRONTEND/reading/test123" 2>/dev/null)
READING_CHUNK=$(echo "$READING_PAGE" | grep -o '/_next/static/chunks/app/reading/%5Bid%5D/page-[^"]*\.js' | head -1)
API_CHUNK=$(echo "$READING_PAGE" | grep -o '/_next/static/chunks/960-[^"]*\.js' | head -1)

if [ -n "$READING_CHUNK" ]; then
  pass "Reading page chunk: $(basename $READING_CHUNK)"

  # 检查 180s 超时 (minified as 18e4)
  TIMER=$(curl -s "$FRONTEND$READING_CHUNK" 2>/dev/null | grep -c '18e4')
  if [ "$TIMER" -gt 0 ]; then
    pass "180s stuck timer (18e4) 已部署"
  else
    fail "180s stuck timer (18e4) 未找到"
    ERRORS=$((ERRORS + 1))
  fi
else
  fail "无法获取 reading page chunk"
  ERRORS=$((ERRORS + 1))
fi

if [ -n "$API_CHUNK" ]; then
  pass "API client chunk: $(basename $API_CHUNK)"

  # 检查 sessionStorage 缓存
  CACHE=$(curl -s "$FRONTEND$API_CHUNK" 2>/dev/null | grep -c 'sessionStorage')
  if [ "$CACHE" -gt 0 ]; then
    pass "sessionStorage 缓存已部署"
  else
    fail "sessionStorage 缓存未找到"
    ERRORS=$((ERRORS + 1))
  fi

  # 检查 apiDirect
  DIRECT=$(curl -s "$FRONTEND$API_CHUNK" 2>/dev/null | grep -c 'apiDirect')
  if [ "$DIRECT" -gt 0 ]; then
    pass "apiDirect 直连已部署"
  else
    fail "apiDirect 直连未找到"
    ERRORS=$((ERRORS + 1))
  fi
else
  fail "无法获取 API client chunk"
  ERRORS=$((ERRORS + 1))
fi

# ── 5. API 端点检查 ─────────────────────────────────────────────
echo ""
echo "5. API 端点"

# Products (公开端点)
PROD_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND/api/products" 2>/dev/null)
if [ "$PROD_CODE" = "200" ]; then
  pass "GET /api/products → HTTP $PROD_CODE"
else
  fail "GET /api/products → HTTP $PROD_CODE"
  ERRORS=$((ERRORS + 1))
fi

# Credits (需要认证)
CRED_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND/api/credits/balance" 2>/dev/null)
if [ "$CRED_CODE" = "401" ]; then
  pass "GET /api/credits/balance → HTTP 401 (需要认证)"
else
  warn "GET /api/credits/balance → HTTP $CRED_CODE"
fi

# ── 6. 响应速度 ─────────────────────────────────────────────────
echo ""
echo "6. 响应速度"

START=$(date +%s%N 2>/dev/null || python3 -c "import time; print(int(time.time()*1000000000))")
curl -s "$BACKEND/health" > /dev/null 2>&1
END=$(date +%s%N 2>/dev/null || python3 -c "import time; print(int(time.time()*1000000000))")

# 计算毫秒 (兼容不同系统)
if command -v python3 &>/dev/null; then
  MS=$(python3 -c "print(f'{($END - $START) / 1000000:.0f}')" 2>/dev/null || echo "?")
else
  MS="?"
fi

if [ "$MS" != "?" ] && [ "$MS" -lt 1000 ]; then
  pass "后端响应: ${MS}ms"
elif [ "$MS" = "?" ]; then
  warn "无法计算响应时间"
else
  warn "后端响应较慢: ${MS}ms"
fi

# ── 总结 ────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════════"
if [ "$ERRORS" -eq 0 ]; then
  echo -e "  ${GREEN}所有检查通过!${NC}"
else
  echo -e "  ${RED}$ERRORS 项检查失败${NC}"
fi
echo "═══════════════════════════════════════════════════════════════"
echo ""

exit $ERRORS
