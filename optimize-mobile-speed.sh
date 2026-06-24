#!/bin/bash
# ============================================================
# 一键优化移动端加载速度
# - nginx HTML 缓存（解决冷启动 5-10s 问题）
# - cron 保持服务器温热
# 用法: bash optimize-mobile-speed.sh
# ============================================================

set -e

echo "=== 移动端加载速度优化 ==="

# ── 1. 创建 nginx 缓存目录 ──
echo "[1/4] 创建 nginx 缓存目录..."
sudo mkdir -p /var/cache/nginx/html
sudo chown nginx:nginx /var/cache/nginx/html 2>/dev/null || true

# ── 2. 创建 nginx 缓存配置 ──
echo "[2/4] 配置 nginx HTML 缓存..."
sudo tee /etc/nginx/conf.d/html-cache.conf > /dev/null << 'NGINX_CONF'
# HTML 页面缓存 — 解决 Next.js 冷启动 5-10s 问题
# 缓存 10 秒，期间重复请求直接返回缓存，不等后端
proxy_cache_path /var/cache/nginx/html levels=1:2 keys_zone=html_cache:10m max_size=100m inactive=30s;

# 清除缓存（部署后手动执行）:
# sudo rm -rf /var/cache/nginx/html/* && sudo nginx -s reload
NGINX_CONF

# ── 3. 修改前端 location 块添加缓存 ──
# 备份原配置
FRONTEND_CONF="/etc/nginx/conf.d/frontend.conf"
if [ -f "$FRONTEND_CONF" ]; then
    sudo cp "$FRONTEND_CONF" "${FRONTEND_CONF}.bak.$(date +%Y%m%d%H%M%S)"
fi

# 检查是否已有缓存配置
if grep -q "proxy_cache html_cache" "$FRONTEND_CONF" 2>/dev/null; then
    echo "  → 缓存配置已存在，跳过"
else
    echo "  → 添加缓存配置到 $FRONTEND_CONF"

    # 在 server 块中找到 location / 并添加缓存
    # 如果没有 location /，在 server 块末尾添加
    if sudo grep -q "location /" "$FRONTEND_CONF"; then
        # 替换已有的 location / 块
        sudo sed -i '/location \/ {/,/}/c\
location / {\
    proxy_pass http://127.0.0.1:3000;\
    proxy_http_version 1.1;\
    proxy_set_header Upgrade $http_upgrade;\
    proxy_set_header Connection "upgrade";\
    proxy_set_header Host $host;\
    proxy_set_header X-Real-IP $remote_addr;\
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
    proxy_set_header X-Forwarded-Proto $scheme;\
    proxy_cache html_cache;\
    proxy_cache_valid 200 10s;\
    proxy_cache_valid 404 1m;\
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503;\
    add_header X-Cache-Status $upstream_cache_status;\
}' "$FRONTEND_CONF"
    else
        # 在 server 块的最后一个 } 之前插入
        sudo sed -i '/^}/i\
# HTML 页面缓存 — 解决冷启动延迟\
location / {\
    proxy_pass http://127.0.0.1:3000;\
    proxy_http_version 1.1;\
    proxy_set_header Upgrade $http_upgrade;\
    proxy_set_header Connection "upgrade";\
    proxy_set_header Host $host;\
    proxy_set_header X-Real-IP $remote_addr;\
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
    proxy_set_header X-Forwarded-Proto $scheme;\
    proxy_cache html_cache;\
    proxy_cache_valid 200 10s;\
    proxy_cache_valid 404 1m;\
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503;\
    add_header X-Cache-Status $upstream_cache_status;\
}' "$FRONTEND_CONF"
    fi
fi

# ── 4. 设置 cron 保持服务器温热 ──
echo "[3/4] 设置 cron 任务保持服务器温热..."
CRON_LINE="*/5 * * * * curl -s -o /dev/null http://127.0.0.1:3000/zh"
(crontab -l 2>/dev/null | grep -v "curl.*127.0.0.1:3000"; echo "$CRON_LINE") | crontab -
echo "  → Cron 任务已添加: 每 5 分钟 ping 前端"

# ── 5. 重载 nginx ──
echo "[4/4] 重载 nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "=== 优化完成 ==="
echo ""
echo "效果："
echo "  - HTML 页面缓存 10 秒，重复请求 < 0.1s"
echo "  - 服务器每 5 分钟自动 warm up，避免冷启动"
echo "  - 首次加载从 5-10s 降至 < 1s"
echo ""
echo "部署后清除缓存："
echo "  sudo rm -rf /var/cache/nginx/html/* && sudo nginx -s reload"
