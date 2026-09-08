#!/usr/bin/env bash
# Builds the app and force-pushes the output to the gh-pages branch.
# Run from the tail-history/ directory: ./deploy-pages.sh

set -euo pipefail

echo "Building..."
BUILD_BASE=/tyunis/tail-history/ npm run build:pages

echo "Preparing gh-pages commit..."
cp dist/index.html dist/404.html
touch dist/.nojekyll

cd dist
git init -q
git checkout -b gh-pages
git add -A
git commit -q -m "deploy: $(date -u '+%Y-%m-%d %H:%M UTC')"
git remote add origin git@git.viasat.com:tyunis/tail-history.git
git push origin gh-pages --force
cd ..

rm -rf dist/.git
echo "Done — site is live on the gh-pages branch."
