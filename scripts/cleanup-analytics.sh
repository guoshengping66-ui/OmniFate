#!/bin/bash
# ── cleanup-analytics.sh — 清理 GA/Clarity 分析相关配置 ──
# 在服务器上运行: bash scripts/cleanup-analytics.sh

set -e

echo "╔══════════════════════════════════════════╗"
echo "║  清理 Google Analytics & Clarity         ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. 拉取最新代码 ──
echo "━━━ [1/4] 拉取代码 ━━━"
cd /opt/OmniFate
git stash --include-untracked 2>/dev/null || true
git pull origin main
echo "  ✅ 代码已更新"

# ── 2. 清理 nginx CSP 头 ──
echo ""
echo "━━━ [2/4] 清理 nginx CSP ━━━"
NGINX_CONF="/etc/nginx/conf.d/frontend.conf"

if [ -f "$NGINX_CONF" ]; then
    # 删除 CSP 头（保留其他配置）
    sed -i '/add_header Content-Security-Policy/d' "$NGINX_CONF"
    echo "  ✅ 已删除 nginx CSP 头"

    # 测试配置
    nginx -t 2>/dev/null && echo "  ✅ nginx 配置测试通过" || echo "  ❌ nginx 配置有误"
    systemctl reload nginx
    echo "  ✅ nginx 已重载"
else
    echo "  ⚠️  nginx 配置文件不存在: $NGINX_CONF"
fi

# ── 3. 清理前端环境变量 ──
echo ""
echo "━━━ [3/4] 清理前端环境变量 ━━━"
ENV_LOCAL="/opt/OmniFate/frontend/.env.local"

if [ -f "$ENV_LOCAL" ]; then
    # 删除 GA 和 Clarity 相关行
    sed -i '/NEXT_PUBLIC_GA_ID/d' "$ENV_LOCAL"
    sed -i '/NEXT_PUBLIC_CLARITY_ID/d' "$ENV_LOCAL"
    echo "  ✅ 已清理 .env.local"
else
    echo "  ⚠️  .env.local 不存在"
fi

# ── 4. 重建前端 ──
echo ""
echo "━━━ [4/4] 重建前端 ━━━"
cd /opt/OmniFate/frontend
npm install --silent 2>/dev/null
npm run build

pm2 restart frontend
echo "  ✅ 前端已重启"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  ✅ 清理完成！                            ║"
echo "╠══════════════════════════════════════════╣"
echo "║  已移除:                                  ║"
echo "║  · Google Analytics 脚本                  ║"
echo "║  · Microsoft Clarity 脚本                 ║"
echo "║  · RouteTracker 组件                      ║"
echo "║  · nginx CSP 头                           ║"
echo "║  · 相关环境变量                           ║"
echo "╚══════════════════════════════════════════╝"
