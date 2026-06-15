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

# Copy all .next files except standalone itself
echo "  Copying static files..."
cp -r .next/static "$STANDALONE/.next/"

echo "  Copying server files..."
cp -r .next/server "$STANDALONE/.next/"

echo "  Copying manifest files..."
cp .next/BUILD_ID "$STANDALONE/.next/"
cp .next/build-manifest.json "$STANDALONE/.next/"
cp .next/prerender-manifest.json "$STANDALONE/.next/"
cp .next/routes-manifest.json "$STANDALONE/.next/"
cp .next/react-loadable-manifest.json "$STANDALONE/.next/"
cp .next/app-build-manifest.json "$STANDALONE/.next/"
cp .next/app-path-routes-manifest.json "$STANDALONE/.next/"

# Step 4: Copy public directory
echo "[4/5] Copying public directory..."
rm -rf "$STANDALONE/public"
cp -r public "$STANDALONE/"

# Step 5: Restart PM2
echo "[5/5] Restarting PM2..."
su - admin -c "pm2 restart frontend"

echo "=== Deployment Complete ==="
echo "Frontend: https://khanfate.com"
