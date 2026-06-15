#!/bin/bash
# OmniFate Frontend Deployment Script
# Usage: bash deploy.sh

set -e

echo "=== OmniFate Frontend Deployment ==="

# Step 1: Clean previous build
echo "[1/5] Cleaning previous build..."
rm -rf .next

# Step 2: Build
echo "[2/5] Building Next.js..."
npm run build

# Step 3: Prepare standalone directory
echo "[3/5] Preparing standalone directory..."
STANDALONE=".next/standalone/frontend"

# Remove old .next in standalone and recreate
rm -rf "$STANDALONE/.next"
mkdir -p "$STANDALONE/.next"

# Use rsync to sync files (avoids cp interactive prompts on some systems)
echo "  Syncing static files..."
rsync -a --delete .next/static/ "$STANDALONE/.next/static/"

echo "  Syncing server files..."
rsync -a --delete .next/server/ "$STANDALONE/.next/server/"

# Copy individual manifest/build files
echo "  Copying manifest files..."
cp -f .next/BUILD_ID "$STANDALONE/.next/"
cp -f .next/build-manifest.json "$STANDALONE/.next/"
cp -f .next/prerender-manifest.json "$STANDALONE/.next/"
cp -f .next/routes-manifest.json "$STANDALONE/.next/"
cp -f .next/react-loadable-manifest.json "$STANDALONE/.next/"
cp -f .next/app-build-manifest.json "$STANDALONE/.next/"
cp -f .next/app-path-routes-manifest.json "$STANDALONE/.next/"

# Step 4: Copy public directory
echo "[4/5] Copying public directory..."
rsync -a --delete public/ "$STANDALONE/public/"

# Step 5: Restart PM2
echo "[5/5] Restarting PM2..."
pm2 restart frontend || su - admin -c "pm2 restart frontend"

echo "=== Deployment Complete ==="
echo "Frontend: https://khanfate.com"
