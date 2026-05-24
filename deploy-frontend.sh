#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  命盘智镜 — 前端部署脚本 (服务器端)
# ══════════════════════════════════════════════════════════════════════════════
#  用法: bash deploy-frontend.sh
#  流程: git pull → npm install → npm run build → restart PM2
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
log "🔨 构建生产版本..."
NODE_ENV=production npm run build

# ── 4. 重启 PM2 进程 ────────────────────────────────────────────────────
log "🔄 重启前端服务..."
cd /opt/OmniFate
pm2 delete frontend 2>/dev/null || true
pm2 start ecosystem.config.js --only frontend
pm2 save

log "✅ 前端部署完成！"
echo ""
pm2 list | grep frontend
echo ""
log "🔗 前端: http://localhost:3000"
log "🔗 健康检查: curl -s http://localhost:3000 | head -1"
