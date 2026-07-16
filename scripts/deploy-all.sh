#!/bin/bash
# ── deploy-all.sh — 一键部署所有优化到服务器 ──
# 在服务器上运行: bash scripts/deploy-all.sh
# 需要 root 权限

set -e

echo "╔══════════════════════════════════════════╗"
echo "║  Destiny Mirror — 一键部署优化           ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. 安装 Redis ──
echo "━━━ [1/6] 安装 Redis ━━━"
if command -v redis-server &> /dev/null; then
    echo "  ✅ Redis 已安装: $(redis-server --version 2>&1 | head -1)"
else
    echo "  ⏳ 安装 Redis..."
    if command -v dnf &> /dev/null; then
        dnf install -y redis
    elif command -v yum &> /dev/null; then
        yum install -y redis
    fi
    echo "  ✅ Redis 安装完成"
fi

# ── 2. 配置 Redis ──
echo ""
echo "━━━ [2/6] 配置 Redis ━━━"
REDIS_CONF="/etc/redis/redis.conf"
[ ! -f "$REDIS_CONF" ] && REDIS_CONF="/etc/redis.conf"

if [ -f "$REDIS_CONF" ]; then
    sed -i 's/^bind .*/bind 127.0.0.1/' "$REDIS_CONF"
    sed -i 's/^protected-mode .*/protected-mode no/' "$REDIS_CONF"
    grep -q '^maxmemory ' "$REDIS_CONF" || echo 'maxmemory 128mb' >> "$REDIS_CONF"
    grep -q '^maxmemory-policy ' "$REDIS_CONF" || echo 'maxmemory-policy allkeys-lru' >> "$REDIS_CONF"
    grep -q '^appendonly ' "$REDIS_CONF" || echo 'appendonly yes' >> "$REDIS_CONF"
    sed -i 's/^appendonly .*/appendonly yes/' "$REDIS_CONF"
fi

systemctl enable redis 2>/dev/null || true
systemctl restart redis

if redis-cli ping | grep -q PONG; then
    echo "  ✅ Redis 运行中"
else
    echo "  ❌ Redis 启动失败，请检查: systemctl status redis"
    exit 1
fi

# ── 3. 拉取最新代码 ──
echo ""
echo "━━━ [3/6] 拉取代码 ━━━"
cd /opt/OmniFate
git stash --include-untracked 2>/dev/null || true
git pull origin main
echo "  ✅ 代码已更新"

# ── 4. 配置 backend .env ──
echo ""
echo "━━━ [4/6] 配置后端环境变量 ━━━"
cd /opt/OmniFate/backend

# 添加 REDIS_URL（如果不存在）
if ! grep -q "REDIS_URL" .env 2>/dev/null; then
    echo "" >> .env
    echo "# ── Redis ──" >> .env
    echo "REDIS_URL=redis://localhost:6379/0" >> .env
    echo "  ✅ 已添加 REDIS_URL"
else
    # 更新已有的 REDIS_URL
    sed -i 's|^REDIS_URL=.*|REDIS_URL=redis://localhost:6379/0|' .env
    echo "  ✅ 已更新 REDIS_URL"
fi

# 添加 GOOGLE_CLIENT_ID（如果不存在）
if ! grep -q "GOOGLE_CLIENT_ID" .env 2>/dev/null; then
    echo "" >> .env
    echo "# ── Google OAuth ──" >> .env
    echo "GOOGLE_CLIENT_ID=" >> .env
    echo "  ⚠️  已添加 GOOGLE_CLIENT_ID 占位符，请稍后填入真实值"
fi

# ── 5. 重启后端 ──
echo ""
echo "━━━ [5/6] 重启后端 ━━━"
systemctl restart omnifate-backend
sleep 2

# 检查后端状态
if systemctl is-active --quiet omnifate-backend; then
    echo "  ✅ 后端运行中"
    # 检查 Redis 连接
    sleep 1
    journalctl -u omnifate-backend --no-pager -n 5 | grep -i redis && echo "  ✅ Redis 已连接" || echo "  ⚠️  Redis 连接状态未知"
else
    echo "  ❌ 后端启动失败，请检查: journalctl -u omnifate-backend -n 20"
fi

# ── 6. 重建并重启前端 ──
echo ""
echo "━━━ [6/6] 重建前端 ━━━"
cd /opt/OmniFate/frontend

# A full Next.js build is memory intensive on the production host. Refuse a
# concurrent deployment instead of letting two build workers starve the site.
exec 9>/tmp/omnifate-frontend-build.lock
if ! flock -n 9; then
    echo "Another frontend build is already running; aborting this deployment."
    exit 1
fi

# 配置前端 .env.local
if [ ! -f .env.local ]; then
    touch .env.local
fi

# 添加 GA ID（占位符）
if ! grep -q "NEXT_PUBLIC_GA_ID" .env.local 2>/dev/null; then
    echo "" >> .env.local
    echo "# ── Analytics ──" >> .env.local
    echo "NEXT_PUBLIC_GA_ID=" >> .env.local
    echo "NEXT_PUBLIC_CLARITY_ID=" >> .env.local
    echo "  ⚠️  已添加分析工具占位符，请稍后填入真实值"
fi

echo "  ⏳ npm install..."
npm install --silent 2>/dev/null

echo "  ⏳ npm run build..."
NEXT_LOW_MEMORY_BUILD=1 NODE_OPTIONS=--max-old-space-size=768 npm run build

# PM2 runs the standalone server. Next.js does not include static/public
# files in that directory automatically, so keep its runtime assets in sync
# with the HTML and manifests produced by this build.
STANDALONE_DIR=".next/standalone"
if [ ! -f "$STANDALONE_DIR/server.js" ]; then
    echo "Standalone server was not produced by the frontend build."
    exit 1
fi

rm -rf "$STANDALONE_DIR/.next/static" "$STANDALONE_DIR/public"
mkdir -p "$STANDALONE_DIR/.next/static"
tar cf - -C .next/static . | tar xf - -C "$STANDALONE_DIR/.next/static"
cp -a public "$STANDALONE_DIR/public"

for manifest in BUILD_ID build-manifest.json prerender-manifest.json required-server-files.json; do
    if [ -f ".next/$manifest" ]; then
        cp -f ".next/$manifest" "$STANDALONE_DIR/.next/$manifest"
    fi
done

if ! find "$STANDALONE_DIR/.next/static/chunks" -name 'webpack-*.js' -type f -print -quit | grep -q .; then
    echo "Standalone static assets are incomplete after sync."
    exit 1
fi

pm2 restart frontend
echo "  ✅ 前端已重启"

# ── 完成 ──
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  ✅ 部署完成！                           ║"
echo "╠══════════════════════════════════════════╣"
echo "║                                          ║"
echo "║  还需手动配置的环境变量:                  ║"
echo "║                                          ║"
echo "║  1. Google Analytics (可选):              ║"
echo "║     analytics.google.com → 创建资源       ║"
echo "║     编辑 frontend/.env.local              ║"
echo "║     NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX       ║"
echo "║     pm2 restart frontend                 ║"
echo "║                                          ║"
echo "║  2. Microsoft Clarity (可选):             ║"
echo "║     clarity.microsoft.com → 添加项目      ║"
echo "║     编辑 frontend/.env.local              ║"
echo "║     NEXT_PUBLIC_CLARITY_ID=xxx           ║"
echo "║     pm2 restart frontend                 ║"
echo "║                                          ║"
echo "║  3. Google 登录 (可选):                   ║"
echo "║     console.cloud.google.com             ║"
echo "║     创建 OAuth 2.0 客户端 ID              ║"
echo "║     编辑 backend/.env                     ║"
echo "║     GOOGLE_CLIENT_ID=xxx.apps.google...  ║"
echo "║     systemctl restart omnifate-backend   ║"
echo "║                                          ║"
echo "╚══════════════════════════════════════════╝"
