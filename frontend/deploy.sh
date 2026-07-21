#!/bin/bash
# OmniFate Frontend Deployment Script
# Usage: bash deploy.sh
# Deployment workflow trigger marker.

set -e

echo "=== OmniFate Frontend Deployment ==="

# Step 1: Build locally, or verify a prebuilt artifact on the server.
# Production deploys must use DEPLOY_PREBUILT=1 so a constrained server never
# runs a memory-intensive Next.js build.
if [ "${DEPLOY_PREBUILT:-0}" = "1" ]; then
  echo "[1/5] Using uploaded prebuilt artifact..."
  if [ ! -f .next/standalone/server.js ] || [ ! -d .next/static ]; then
    echo "Prebuilt artifact is missing (.next/standalone/server.js or .next/static)."
    exit 1
  fi
else
  echo "[1/5] Cleaning previous build..."
  rm -rf .next
  echo "[2/5] Building Next.js locally..."
  npm run build
fi

# Step 3: Prepare standalone directory
echo "[3/5] Preparing standalone directory..."
STANDALONE=".next/standalone"

# Remove old .next in standalone and recreate
rm -rf "$STANDALONE/.next"
mkdir -p "$STANDALONE/.next"

# Use rsync to sync files (avoids cp interactive prompts on some systems)
echo "  Syncing static files..."
rsync -a --delete .next/static/ "$STANDALONE/.next/static/"

echo "  Syncing server files..."
rsync -a --delete .next/server/ "$STANDALONE/.next/server/"

# Copy individual manifest/build files (use rsync to avoid root alias cp='cp -i')
echo "  Copying manifest files..."
rsync -a .next/BUILD_ID "$STANDALONE/.next/"
rsync -a .next/build-manifest.json "$STANDALONE/.next/"
rsync -a .next/prerender-manifest.json "$STANDALONE/.next/"
rsync -a .next/routes-manifest.json "$STANDALONE/.next/"
rsync -a .next/react-loadable-manifest.json "$STANDALONE/.next/"
rsync -a .next/app-build-manifest.json "$STANDALONE/.next/"
rsync -a .next/app-path-routes-manifest.json "$STANDALONE/.next/"
rsync -a .next/required-server-files.json "$STANDALONE/.next/"

# Step 4: Copy public directory
echo "[4/5] Copying public directory..."
rsync -a --delete public/ "$STANDALONE/public/"

# Step 5: Restart PM2
echo "[5/5] Restarting PM2..."
pm2 restart frontend || su - admin -c "pm2 restart frontend"

echo "=== Deployment Complete ==="
echo "Frontend: https://khanfate.com"
