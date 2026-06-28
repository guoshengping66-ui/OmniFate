#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  命盘智镜 — 前端部署脚本 (服务器端)
# ══════════════════════════════════════════════════════════════════════════════
#  用法: bash deploy-frontend.sh
#  流程: git pull → npm install → npm run build → copy static → restart PM2
#  Deploy trigger: frontend recovery after server env repair
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
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log "📥 同步最新代码 (分支: $CURRENT_BRANCH)..."
git fetch origin "$CURRENT_BRANCH"
git reset --hard "origin/$CURRENT_BRANCH"

# ── 2. 安装依赖 (only if package.json changed) ──────────────────────────
cd /opt/OmniFate/frontend
CURRENT_PKG_HASH=$(md5sum package.json 2>/dev/null | awk '{print $1}')
SAVED_PKG_HASH=$(cat .last_pkg_hash 2>/dev/null || echo "")
if [ "$CURRENT_PKG_HASH" != "$SAVED_PKG_HASH" ]; then
  log "📦 安装依赖 (package.json changed)..."
  rm -rf node_modules
  npm install --prefer-offline 2>/dev/null || npm install
  echo "$CURRENT_PKG_HASH" > .last_pkg_hash
else
  log "📦 依赖未变化，跳过安装"
fi

# ── 3. 构建生产版本 ──────────────────────────────────────────────────────
log "🛑 停止前端服务..."
pm2 delete frontend 2>/dev/null || true
log "🧹 清理旧构建缓存..."
rm -rf .next
log "🔨 构建生产版本 (standalone)..."
NODE_ENV=production npm run build

# ── 4. 定位 standalone 目录 ────────────────────────────────────────────
STANDALONE_DIR=""
if [ -d ".next/standalone/frontend" ]; then
  STANDALONE_DIR=".next/standalone/frontend"
elif [ -f ".next/standalone/server.js" ]; then
  STANDALONE_DIR=".next/standalone"
else
  err "未找到 standalone 目录"
fi

# ── 5. 复制 static + public 到 standalone 目录 ──────────────────────────
log "📋 复制 static 文件到 standalone..."
rm -rf "$STANDALONE_DIR/.next/static"
mkdir -p "$STANDALONE_DIR/.next/static"
cp -r .next/static/* "$STANDALONE_DIR/.next/static/"
rm -rf "$STANDALONE_DIR/public"
cp -r public "$STANDALONE_DIR/public" 2>/dev/null || true

# ── 6. 验证 standalone 目录完整性 ──────────────────────────────────────
CHUNK_COUNT=$(find "$STANDALONE_DIR/.next/static/chunks" -name "*.js" 2>/dev/null | wc -l)
if [ "$CHUNK_COUNT" -lt 10 ]; then
  err "验证失败: standalone 目录只有 $CHUNK_COUNT 个 chunk 文件（预期 >10）"
fi
log "✅ 验证通过: standalone 目录有 $CHUNK_COUNT 个 chunk 文件"

PAGE_CHUNK=$(find "$STANDALONE_DIR/.next/static/chunks/app/[locale]" -maxdepth 1 -name "page-*.js" 2>/dev/null | head -1)
if [ -z "$PAGE_CHUNK" ]; then
  err "验证失败: standalone 目录缺少首页 page chunk!"
fi
log "✅ 首页 page chunk 验证通过: $(basename $PAGE_CHUNK)"

WEBPACK_CHUNK=$(find "$STANDALONE_DIR/.next/static/chunks" -name "webpack-*.js" 2>/dev/null | head -1)
if [ -z "$WEBPACK_CHUNK" ]; then
  err "验证失败: standalone 目录缺少 webpack chunk! 这会导致 JS 无法加载，页面无内容。"
fi
log "✅ Webpack chunk 验证通过: $(basename $WEBPACK_CHUNK)"

# ── 7. 重启 PM2 进程 ────────────────────────────────────────────────────
log "🔄 重启前端服务..."
cd /opt/OmniFate
pm2 delete frontend 2>/dev/null || true
pm2 start ecosystem.config.js --only frontend
pm2 save

# ── 8. 健康检查 + chunk 验证 ──────────────────────────────────────────────
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ]; then
  log "✅ 健康检查通过 (HTTP $HTTP_CODE)"
else
  warn "健康检查返回 HTTP $HTTP_CODE，可能需要手动检查"
fi

# Verify buildId matches
NEW_BUILD_ID=$(cat "$STANDALONE_DIR/.next/BUILD_ID" 2>/dev/null || echo "unknown")
API_BUILD_ID=$(curl -sk https://www.khanfate.com/api/version 2>/dev/null | python3 -c "import sys,json;print(json.load(sys.stdin).get('buildId',''))" 2>/dev/null || echo "")
log "   Build ID on disk: $NEW_BUILD_ID"
log "   Build ID from API: $API_BUILD_ID"

# Verify webpack chunk is accessible
NEW_WEBPACK=$(find "$STANDALONE_DIR/.next/static/chunks" -name "webpack-*.js" 2>/dev/null | head -1)
if [ -n "$NEW_WEBPACK" ]; then
  WEBPACK_NAME=$(basename "$NEW_WEBPACK")
  HTTP_CHECK=$(curl -sk "https://www.khanfate.com/_next/static/chunks/$WEBPACK_NAME" -o /dev/null -w "%{http_code}" 2>/dev/null)
  if [ "$HTTP_CHECK" = "200" ]; then
    log "✅ Webpack chunk 可访问: $WEBPACK_NAME (HTTP $HTTP_CHECK)"
  else
    warn "Webpack chunk 不可访问: $WEBPACK_NAME (HTTP $HTTP_CHECK)"
    warn "尝试强制重启 PM2..."
    pm2 delete frontend 2>/dev/null || true
    pm2 start ecosystem.config.js --only frontend
    pm2 save
    sleep 3
  fi
fi

log "✅ 前端部署完成！"
echo ""
pm2 list | grep frontend
echo ""
log "🔗 前端: http://localhost:3000"
