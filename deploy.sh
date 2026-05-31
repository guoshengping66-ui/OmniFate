#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  命盘智镜 — 一键部署脚本
# ══════════════════════════════════════════════════════════════════════════════
#  用法:
#    首次部署:  bash deploy.sh
#    更新部署:  bash deploy.sh update
#    查看日志:  bash deploy.sh logs
#    重启服务:  bash deploy.sh restart
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[DEPLOY]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ── 前置检查 ─────────────────────────────────────────────────────────────────
command -v docker >/dev/null 2>&1 || err "Docker 未安装。请先安装: https://docs.docker.com/engine/install/"

if [ ! -f backend/.env ]; then
    err "backend/.env 不存在！请先复制并填写:\n  cp backend/.env.example backend/.env\n  nano backend/.env"
fi

# 检查必填项
source backend/.env 2>/dev/null || true
[ -z "${SECRET_KEY:-}" ] && err "SECRET_KEY 未填写"
[ -z "${JWT_SECRET_KEY:-}" ] && err "JWT_SECRET_KEY 未填写"
[ -z "${DATABASE_URL:-}" ] && err "DATABASE_URL 未填写"
[ -z "${OPENAI_API_KEY:-}" ] && err "OPENAI_API_KEY 未填写"
[ -z "${CRON_SECRET:-}" ] && err "CRON_SECRET 未填写"

# ── 功能选择 ─────────────────────────────────────────────────────────────────
ACTION="${1:-deploy}"

case "$ACTION" in
    deploy|up)
        log "🚀 开始部署..."

        # 拉取最新代码
        if [ -d .git ]; then
            log "📥 拉取最新代码..."
            git pull origin main
        fi

        # 构建并启动
        log "🔨 构建 Docker 镜像..."
        docker compose build --no-cache

        log "🚀 启动服务..."
        docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

        log "✅ 部署完成！"
        echo ""
        log "📋 服务状态:"
        docker compose ps
        echo ""
        log "🔗 前端: http://localhost:3000"
        log "🔗 后端: http://localhost:8003"
        log "🔗 健康检查: http://localhost:8003/health"
        ;;

    update)
        log "🔄 更新部署..."
        git pull origin main
        docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
        log "✅ 更新完成！"
        docker compose ps
        ;;

    logs)
        docker compose logs -f --tail=50
        ;;

    restart)
        log "🔄 重启服务..."
        docker compose restart
        docker compose ps
        ;;

    stop)
        log "⏹️  停止服务..."
        docker compose -f docker-compose.yml -f docker-compose.prod.yml down
        ;;

    status)
        docker compose ps
        ;;

    *)
        echo "用法: bash deploy.sh [deploy|update|logs|restart|stop|status]"
        echo ""
        echo "  deploy  — 首次部署 (构建 + 启动)"
        echo "  update  — 更新部署 (拉取代码 + 重建)"
        echo "  logs    — 查看日志"
        echo "  restart — 重启服务"
        echo "  stop    — 停止服务"
        echo "  status  — 查看状态"
        exit 1
        ;;
esac
