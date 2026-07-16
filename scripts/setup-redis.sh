#!/bin/bash
# ── setup-redis.sh — Install and configure Redis on CentOS/RHEL ──
# Run this on the server as root: bash scripts/setup-redis.sh

set -e

echo "=== Redis Installation & Configuration ==="

# 1. Install Redis
if command -v redis-server &> /dev/null; then
    echo "[OK] Redis already installed: $(redis-server --version)"
else
    echo "[...] Installing Redis..."
    # CentOS/RHEL 8+
    if command -v dnf &> /dev/null; then
        dnf install -y redis
    elif command -v yum &> /dev/null; then
        yum install -y redis
    else
        echo "[ERROR] No package manager found (dnf/yum). Install Redis manually."
        exit 1
    fi
    echo "[OK] Redis installed"
fi

# 2. Configure Redis for production
REDIS_CONF="/etc/redis/redis.conf"
if [ ! -f "$REDIS_CONF" ]; then
    REDIS_CONF="/etc/redis.conf"
fi

if [ -f "$REDIS_CONF" ]; then
    echo "[...] Configuring Redis..."

    # Bind to localhost only (security)
    sed -i 's/^bind .*/bind 127.0.0.1/' "$REDIS_CONF"

    # Disable protected-mode (we bind to localhost)
    sed -i 's/^protected-mode .*/protected-mode no/' "$REDIS_CONF"

    # Set maxmemory to 128MB (fits 2GB server)
    grep -q '^maxmemory ' "$REDIS_CONF" || echo 'maxmemory 128mb' >> "$REDIS_CONF"
    grep -q '^maxmemory-policy ' "$REDIS_CONF" || echo 'maxmemory-policy allkeys-lru' >> "$REDIS_CONF"

    # Enable AOF persistence for data durability
    grep -q '^appendonly ' "$REDIS_CONF" || echo 'appendonly yes' >> "$REDIS_CONF"
    sed -i 's/^appendonly .*/appendonly yes/' "$REDIS_CONF"

    echo "[OK] Redis configured"
else
    echo "[WARN] Redis config not found at $REDIS_CONF — using defaults"
fi

# 3. Start and enable Redis
echo "[...] Starting Redis..."
systemctl enable redis
systemctl restart redis

# 4. Verify
if redis-cli ping | grep -q PONG; then
    echo "[OK] Redis is running and responding to PING"
else
    echo "[ERROR] Redis not responding. Check: systemctl status redis"
    exit 1
fi

# 5. Show memory usage
echo ""
echo "=== Redis Status ==="
redis-cli info memory | grep -E "used_memory_human|maxmemory_human"
echo ""

# 6. Instructions for backend .env
echo "=== Next Steps ==="
echo "Add to backend/.env:"
echo "  REDIS_URL=redis://localhost:6379/0"
echo ""
echo "Then restart backend:"
echo "  systemctl restart omnifate-backend"
echo ""
echo "Verify Redis is used in backend logs:"
echo "  journalctl -u omnifate-backend -f | grep REDIS"
