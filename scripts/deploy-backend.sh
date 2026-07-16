#!/bin/bash
# ============================================================
# 后端部署脚本 — 在阿里云网页终端中执行
# 用途：拉取最新代码，重建并重启后端 Docker 容器
# ============================================================

set -e

echo "=========================================="
echo "  命盘智镜 后端部署脚本"
echo "=========================================="

# 1. 定位项目目录
PROJECT_DIR=""
for dir in /root/destiny-platform /opt/destiny-platform /www/destiny-platform /home/*/destiny-platform ~/destiny-platform; do
  if [ -d "$dir/backend" ] && [ -f "$dir/docker-compose.yml" ]; then
    PROJECT_DIR="$dir"
    break
  fi
done

if [ -z "$PROJECT_DIR" ]; then
  echo "[ERROR] 未找到项目目录，请手动设置 PROJECT_DIR 变量"
  echo "  用法: PROJECT_DIR=/你的路径 bash deploy-backend.sh"
  exit 1
fi

echo "[1/5] 项目目录: $PROJECT_DIR"
cd "$PROJECT_DIR"

# 2. 拉取最新代码
echo "[2/5] 拉取最新代码..."
git fetch origin main
git reset --hard origin/main
echo "  当前版本: $(git log --oneline -1)"

# 3. 确认关键文件存在
echo "[3/5] 验证新文件..."
MISSING=0
for f in backend/api/routers/users.py backend/database/models.py backend/data/products.json frontend/src/components/shop/AddressForm.tsx; do
  if [ -f "$f" ]; then
    echo "  OK: $f"
  else
    echo "  MISSING: $f"
    MISSING=1
  fi
done
if [ $MISSING -eq 1 ]; then
  echo "[ERROR] 部分文件缺失，可能是代码未完整拉取"
  exit 1
fi

# 4. 重建并重启后端
echo "[4/5] 重建后端 Docker 容器..."
if docker compose version &>/dev/null; then
  docker compose down backend 2>/dev/null || true
  docker compose build backend --no-cache
  docker compose up -d backend
elif command -v docker-compose &>/dev/null; then
  docker-compose down backend 2>/dev/null || true
  docker-compose build backend --no-cache
  docker-compose up -d backend
else
  echo "[ERROR] 未找到 docker compose 或 docker-compose"
  exit 1
fi

# 5. 等待启动并验证
echo "[5/5] 等待后端启动..."
sleep 8

HEALTH=$(curl -s http://localhost:8002/health 2>/dev/null || echo '{"status":"error"}')
echo "  健康检查: $HEALTH"

# 检查新端点
ENDPOINTS=$(curl -s http://localhost:8002/openapi.json 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    paths = list(data.get('paths', {}).keys())
    new_eps = [p for p in paths if 'address' in p or 'tracking' in p or 'confirm-receive' in p or 'request-refund' in p]
    print(f'总端点: {len(paths)}  新增: {len(new_eps)}')
    for p in new_eps:
        print(f'  + {p}')
except:
    print('无法获取端点信息')
" 2>/dev/null)
echo "  $ENDPOINTS"

echo ""
echo "=========================================="
echo "  部署完成!"
echo "=========================================="
echo ""
echo "如果新端点未出现，查看日志排查："
echo "  docker compose logs --tail=50 backend"
echo "  # 或"
echo "  docker-compose logs --tail=50 backend"
