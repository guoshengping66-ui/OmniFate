#!/bin/bash
# ── verify-analytics.sh — Verify GA/Clarity analytics scripts load correctly ──
# Run on server: bash scripts/verify-analytics.sh

echo "╔══════════════════════════════════════════╗"
echo "║  Analytics Verification Script            ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# 1. Check nginx CSP header
echo "━━━ [1/4] Checking nginx CSP header ━━━"
CSP_HEADER=$(curl -sI https://www.khanfate.com/ 2>/dev/null | grep -i "content-security-policy")
if [ -n "$CSP_HEADER" ]; then
    echo "  ✅ CSP header found:"
    echo "     $CSP_HEADER"

    # Check for GA domains
    if echo "$CSP_HEADER" | grep -q "googletagmanager.com"; then
        echo "  ✅ google-analytics.com / googletagmanager.com in CSP"
    else
        echo "  ❌ google-analytics.com NOT in CSP — GA will be blocked!"
    fi

    if echo "$CSP_HEADER" | grep -q "clarity.ms"; then
        echo "  ✅ clarity.ms in CSP"
    else
        echo "  ❌ clarity.ms NOT in CSP — Clarity will be blocked!"
    fi

    if echo "$CSP_HEADER" | grep -q "google-analytics.com"; then
        echo "  ✅ google-analytics.com in CSP"
    else
        echo "  ❌ google-analytics.com NOT in CSP"
    fi
else
    echo "  ❌ No CSP header found — scripts may still be blocked by Cloudflare"
    echo "  💡 Go to Cloudflare → Caching → Purge Everything"
fi

# 2. Check page source for GA script
echo ""
echo "━━━ [2/4] Checking page source for analytics scripts ━━━"
PAGE_HTML=$(curl -s https://www.khanfate.com/ 2>/dev/null)

if echo "$PAGE_HTML" | grep -q "googletagmanager.com"; then
    echo "  ✅ Google Tag Manager script found in page"
else
    echo "  ❌ Google Tag Manager script NOT found"
    echo "  💡 Check frontend .env.local — NEXT_PUBLIC_GA_ID may be empty"
    # Show the relevant env var
    if [ -f "/opt/OmniFate/frontend/.env.local" ]; then
        GA_ID=$(grep "NEXT_PUBLIC_GA_ID" /opt/OmniFate/frontend/.env.local | cut -d= -f2)
        if [ -n "$GA_ID" ]; then
            echo "     NEXT_PUBLIC_GA_ID=$GA_ID"
        else
            echo "     ⚠️  NEXT_PUBLIC_GA_ID is empty in .env.local!"
        fi
    fi
fi

if echo "$PAGE_HTML" | grep -q "clarity.ms"; then
    echo "  ✅ Microsoft Clarity script found in page"
else
    echo "  ❌ Microsoft Clarity script NOT found"
    if [ -f "/opt/OmniFate/frontend/.env.local" ]; then
        CLARITY_ID=$(grep "NEXT_PUBLIC_CLARITY_ID" /opt/OmniFate/frontend/.env.local | cut -d= -f2)
        if [ -n "$CLARITY_ID" ]; then
            echo "     NEXT_PUBLIC_CLARITY_ID=$CLARITY_ID"
        else
            echo "     ⚠️  NEXT_PUBLIC_CLARITY_ID is empty in .env.local!"
        fi
    fi
fi

# 3. Check env vars are baked into the build
echo ""
echo "━━━ [3/4] Checking if GA ID is in built JS ━━━"
GA_ID=$(grep "NEXT_PUBLIC_GA_ID" /opt/OmniFate/frontend/.env.local 2>/dev/null | cut -d= -f2)
BUILD_JS=$(find /opt/OmniFate/frontend/.next -name "*.js" -exec grep -l "gtag" {} \; 2>/dev/null | head -3)

if [ -n "$BUILD_JS" ]; then
    echo "  ✅ gtag code found in built JS files:"
    for f in $BUILD_JS; do
        echo "     - $(basename $f)"
    done
else
    echo "  ❌ gtag code NOT found in build output"
    if [ -z "$GA_ID" ]; then
        echo "  💡 NEXT_PUBLIC_GA_ID is empty — set it in frontend/.env.local"
    else
        echo "  💡 Rebuild: cd /opt/OmniFate/frontend && npm run build && pm2 restart frontend"
    fi
fi

# 4. Check PM2 status
echo ""
echo "━━━ [4/4] Checking PM2 status ━━━"
pm2 list 2>/dev/null | head -10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Next steps:"
echo "  1. Set GA ID: edit /opt/OmniFate/frontend/.env.local"
echo "     NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX"
echo "  2. Set Clarity ID: NEXT_PUBLIC_CLARITY_ID=xxxxxx"
echo "  3. Rebuild: cd /opt/OmniFate/frontend && npm run build"
echo "  4. Restart: pm2 restart frontend"
echo "  5. Purge Cloudflare: Caching → Purge Everything"
echo "  6. Open https://www.khanfate.com/ in browser"
echo "  7. Check GA Realtime: analytics.google.com → Realtime"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
