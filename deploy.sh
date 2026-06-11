#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  命盘智镜 — 一键部署脚本 (PM2)
# ══════════════════════════════════════════════════════════════════════════════
#  用法:
#    bash deploy.sh           — 拉取代码 + 构建前端 + 重启所有服务
#    bash deploy.sh frontend  — 仅构建前端 + 重启前端
#    bash deploy.sh backend   — 仅重启后端
#    bash deploy.sh nginx     — 仅更新 nginx 配置
#    bash deploy.sh restart   — 重启所有服务 (不重新构建)
#    bash deploy.sh logs      — 查看 PM2 日志
#    bash deploy.sh status    — 查看服务状态
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[DEPLOY]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

cd /opt/OmniFate
ACTION="${1:-all}"

# ── Git pull ──────────────────────────────────────────────────────────────────
if [[ "$ACTION" != "logs" && "$ACTION" != "status" ]]; then
    log "📥 拉取最新代码..."
    git pull origin main
fi

# ── Frontend ──────────────────────────────────────────────────────────────────
if [[ "$ACTION" == "frontend" || "$ACTION" == "all" ]]; then
    log "🔨 构建前端..."
    cd frontend
    npm ci 2>/dev/null || npm install --legacy-peer-deps
    rm -rf .next
    NODE_ENV=production npx next build
    cd ..

    # Standalone server uses __dirname (server.js dir) to find .next/static.
    # PM2 CWD is /opt/OmniFate/frontend, but server.js is at
    # .next/standalone/frontend/server.js — so __dirname = .next/standalone/frontend/.
    # Create symlinks so the standalone server can find .next/static and .next/server.
    STANDALONE_DIR="/opt/OmniFate/frontend/.next/standalone/frontend"
    mkdir -p "$STANDALONE_DIR/.next"
    # Remove existing dirs/symlinks first (cp -r may have left real dirs)
    rm -rf "$STANDALONE_DIR/.next/static" "$STANDALONE_DIR/.next/server" "$STANDALONE_DIR/public"
    ln -sf /opt/OmniFate/frontend/.next/static "$STANDALONE_DIR/.next/static"
    ln -sf /opt/OmniFate/frontend/.next/server "$STANDALONE_DIR/.next/server"
    ln -sf /opt/OmniFate/frontend/public "$STANDALONE_DIR/public"

    log "🔄 重启前端..."
    pm2 restart frontend 2>/dev/null || pm2 start ecosystem.config.js --only frontend
    log "✔ 前端已重启"
fi

# ── Backend ───────────────────────────────────────────────────────────────────
if [[ "$ACTION" == "backend" || "$ACTION" == "all" ]]; then
    log "🔄 重启后端..."
    pm2 restart backend 2>/dev/null || pm2 start ecosystem.config.js --only backend
    log "✔ 后端已重启"
fi

# ── Nginx ─────────────────────────────────────────────────────────────────────
if [[ "$ACTION" == "nginx" || "$ACTION" == "all" ]]; then
    log "🔧 更新 nginx 配置..."
    NGINX_CONF="/etc/nginx/conf.d/frontend.conf"
    if [ -f "$NGINX_CONF" ]; then
        sudo cp "$NGINX_CONF" "${NGINX_CONF}.bak"
    fi
    if [ -f nginx-khanfate.conf ]; then
        sudo cp nginx-khanfate.conf "$NGINX_CONF"
        sudo nginx -t && sudo systemctl reload nginx
        log "✔ nginx 已更新"
    else
        warn "nginx-khanfate.conf 不存在，跳过"
    fi
fi

# ── Restart only ──────────────────────────────────────────────────────────────
if [[ "$ACTION" == "restart" ]]; then
    log "🔄 重启所有服务..."
    pm2 restart frontend backend
fi

# ── Logs ──────────────────────────────────────────────────────────────────────
if [[ "$ACTION" == "logs" ]]; then
    pm2 logs --lines 50 --nostream
    exit 0
fi

# ── Status ────────────────────────────────────────────────────────────────────
if [[ "$ACTION" == "status" ]]; then
    pm2 list
    exit 0
fi

# ── Health check ──────────────────────────────────────────────────────────────
log "🏥 健康检查..."
pm2 save 2>/dev/null
sleep 2

FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo "000")
BACKEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8003/health 2>/dev/null || echo "000")

echo ""
echo "  前端 (3000): $FRONTEND"
echo "  后端 (8003): $BACKEND"
echo ""

if [[ "$FRONTEND" =~ ^2 || "$FRONTEND" == "307" ]]; then
    log "✔ 前端正常"
else
    warn "⚠ 前端异常 (HTTP $FRONTEND)"
fi

if [[ "$BACKEND" =~ ^2 || "$BACKEND" == "422" || "$BACKEND" == "405" ]]; then
    log "✔ 后端正常"
else
    warn "⚠ 后端异常 (HTTP $BACKEND)"
fi

log "✅ 部署完成！"
