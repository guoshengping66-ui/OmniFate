#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  命盘智镜 — 前端部署脚本 (服务器端)
# ══════════════════════════════════════════════════════════════════════════════
#  用法: bash deploy-frontend.sh
#  流程: git pull → npm install → npm run build → copy static → restart PM2
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[FRONTEND]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ── 1. 同步最新代码 ────────────────────────────────────────────────────────
cd /opt/OmniFate
log "📥 同步最新代码..."
git fetch origin main
git reset --hard origin/main

# ── 2. 安装依赖 ──────────────────────────────────────────────────────────
cd /opt/OmniFate/frontend
log "📦 安装依赖..."
npm ci --production=false 2>/dev/null || npm install

# ── 3. 构建生产版本 ──────────────────────────────────────────────────────
log "🔨 清理旧构建缓存..."
rm -rf .next
log "🔨 构建生产版本..."
NODE_ENV=production npm run build

# ── 4. 复制静态文件到 standalone 目录（关键步骤！）─────────────────────────
# ⚠️ 必须先删除旧目录，否则 cp -r 会嵌套导致 static/static/chunks
log "📋 复制静态文件到 standalone 目录..."
rm -rf .next/standalone/frontend/.next/static
cp -r .next/static .next/standalone/frontend/.next/static
rm -rf .next/standalone/frontend/public
cp -r public .next/standalone/frontend/public 2>/dev/null || true

# ── 5. 验证 standalone 目录完整性 ────────────────────────────────────────
CHUNK_COUNT=$(find .next/standalone/frontend/.next/static/chunks -name "*.js" 2>/dev/null | wc -l)
if [ "$CHUNK_COUNT" -lt 10 ]; then
  err "验证失败: standalone 目录只有 $CHUNK_COUNT 个 chunk 文件（预期 >10）"
fi
log "✅ 验证通过: standalone 目录有 $CHUNK_COUNT 个 chunk 文件"

# 🔑 关键验证: webpack chunk 必须存在
WEBPACK_CHUNK=$(find .next/standalone/frontend/.next/static/chunks -name "webpack-*.js" 2>/dev/null | head -1)
if [ -z "$WEBPACK_CHUNK" ]; then
  err "验证失败: standalone 目录缺少 webpack chunk! 这会导致 JS 无法加载，页面无内容。"
fi
log "✅ Webpack chunk 验证通过: $(basename $WEBPACK_CHUNK)"

# ── 6. 重启 PM2 进程 ────────────────────────────────────────────────────
log "🔄 重启前端服务..."
cd /opt/OmniFate
pm2 delete frontend 2>/dev/null || true
pm2 start ecosystem.config.js --only frontend
pm2 save

# ── 7. 健康检查 ──────────────────────────────────────────────────────────
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ]; then
  log "✅ 健康检查通过 (HTTP $HTTP_CODE)"
else
  warn "健康检查返回 HTTP $HTTP_CODE，可能需要手动检查"
fi

log "✅ 前端部署完成！"
echo ""
pm2 list | grep frontend
echo ""
log "🔗 前端: http://localhost:3000"
