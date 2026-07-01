#!/usr/bin/env bash
# Optimize first-page latency for the self-hosted frontend.
#
# What this does:
# - Creates an nginx proxy cache zone for short-lived HTML caching.
# - Patches the frontend nginx config in an idempotent way.
# - Adds a cron warmup request to reduce cold-start latency.
# - Validates nginx and verifies MISS -> HIT behavior.
#
# Usage:
#   sudo bash optimize-mobile-speed.sh
#
# Optional environment variables:
#   FRONTEND_CONF=/etc/nginx/conf.d/frontend.conf
#   WARMUP_URL=https://127.0.0.1/zh
#   FRONTEND_UPSTREAM=http://127.0.0.1:3000
#   CACHE_TTL=10s

set -euo pipefail

FRONTEND_CONF="${FRONTEND_CONF:-/etc/nginx/conf.d/frontend.conf}"
WARMUP_URL="${WARMUP_URL:-https://127.0.0.1/zh}"
FRONTEND_UPSTREAM="${FRONTEND_UPSTREAM:-http://127.0.0.1:3000}"
CACHE_TTL="${CACHE_TTL:-10s}"
CACHE_CONF="/etc/nginx/conf.d/html-cache.conf"
CACHE_DIR="/var/cache/nginx/html"
MARKER_BEGIN="# BEGIN destiny-platform html cache"
MARKER_END="# END destiny-platform html cache"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root: sudo bash optimize-mobile-speed.sh" >&2
  exit 1
fi

if [ ! -f "$FRONTEND_CONF" ]; then
  echo "Frontend nginx config not found: $FRONTEND_CONF" >&2
  exit 1
fi

echo "== Mobile latency optimization =="
echo "Config: $FRONTEND_CONF"
echo "Warmup: $WARMUP_URL"

echo "[1/5] Creating nginx cache directory"
mkdir -p "$CACHE_DIR"
chown nginx:nginx "$CACHE_DIR" 2>/dev/null || chown www-data:www-data "$CACHE_DIR" 2>/dev/null || true

echo "[2/5] Writing cache zone config"
cat > "$CACHE_CONF" <<NGINX_CONF
# Short-lived HTML cache for repeated mobile page loads.
proxy_cache_path $CACHE_DIR levels=1:2 keys_zone=html_cache:10m max_size=100m inactive=30s use_temp_path=off;
NGINX_CONF

echo "[3/5] Patching frontend nginx config"
backup="${FRONTEND_CONF}.bak.$(date +%Y%m%d%H%M%S)"
cp "$FRONTEND_CONF" "$backup"
echo "Backup: $backup"

python3 - "$FRONTEND_CONF" "$FRONTEND_UPSTREAM" "$CACHE_TTL" "$MARKER_BEGIN" "$MARKER_END" <<'PY'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
upstream = sys.argv[2]
cache_ttl = sys.argv[3]
marker_begin = sys.argv[4]
marker_end = sys.argv[5]

text = path.read_text()

block = f"""
    {marker_begin}
    # Short-lived HTML cache. Do not cache auth/API/static requests.
    location ~* ^/(?!_next/|api/|favicon|logo|og|robots\\.txt|manifest\\.json).*$ {{
        proxy_pass {upstream};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header CF-IPCountry $http_cf_ipcountry;
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;

        proxy_ignore_headers Cache-Control Set-Cookie Expires;
        proxy_hide_header Set-Cookie;
        proxy_cache html_cache;
        proxy_cache_valid 200 {cache_ttl};
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_bypass $http_upgrade $cookie_session $http_authorization;
        proxy_no_cache $cookie_session $http_authorization;

        add_header X-Cache-Status $upstream_cache_status always;
    }}
    {marker_end}
"""

pattern = re.compile(
    rf"\n\s*{re.escape(marker_begin)}.*?{re.escape(marker_end)}\n",
    re.S,
)
text = pattern.sub("\n", text)

server_re = re.compile(r"server\s*\{")
candidates = []
for match in server_re.finditer(text):
    depth = 0
    end = None
    for i in range(match.end() - 1, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                end = i
                break
    if end is None:
        continue
    body = text[match.start():end + 1]
    score = 0
    if upstream in body:
        score += 10
    if "server_name api." in body:
        score -= 20
    if "server_name" in body and "api." not in body:
        score += 2
    candidates.append((score, match.start(), end))

if not candidates:
    raise SystemExit("Could not find a complete server block")

score, start, end = max(candidates, key=lambda item: item[0])
if score < 1:
    raise SystemExit("Could not identify the frontend server block")

server_body = text[start:end + 1]
generic_location = re.search(
    r"\n\s*location\s+~\*\s+\^/\(\?![^{}]+?\)\.\*\$\s*\{",
    server_body,
)
if generic_location:
    insert_at = start + generic_location.start()
else:
    insert_at = end

text = text[:insert_at] + "\n" + block + text[insert_at:]

path.write_text(text)
PY

echo "[4/5] Installing cron warmup"
cron_line="*/5 * * * * curl -sk -o /dev/null '$WARMUP_URL'"
(crontab -l 2>/dev/null | grep -vF "$WARMUP_URL" || true; echo "$cron_line") | crontab -

echo "[5/5] Reloading nginx and verifying cache"
rm -rf "$CACHE_DIR"/*
nginx -t
systemctl reload nginx

first="$(curl -skI "$WARMUP_URL" 2>/dev/null | awk 'tolower($1)=="x-cache-status:" {gsub(/\r/,"",$2); print $2; exit}')"
second="$(curl -skI "$WARMUP_URL" 2>/dev/null | awk 'tolower($1)=="x-cache-status:" {gsub(/\r/,"",$2); print $2; exit}')"

echo "First request:  ${first:-missing X-Cache-Status}"
echo "Second request: ${second:-missing X-Cache-Status}"

if [ "$first" = "MISS" ] && [ "$second" = "HIT" ]; then
  echo "Done: nginx HTML cache is active."
else
  echo "Warning: cache verification did not return MISS -> HIT. Check nginx location precedence and upstream headers." >&2
  exit 2
fi
