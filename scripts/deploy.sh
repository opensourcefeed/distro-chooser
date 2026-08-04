#!/usr/bin/env bash
# Deploys distro-chooser: pushes source to main, builds, and publishes dist/ to
# the gh-pages branch via a sibling clone at ../distro-chooser.

REMOTE_URL="git@github.com:opensourcefeed/distro-chooser.git"
DEPLOY_DIR="../distro-chooser"

cd "$(dirname "$0")/.."

step() { echo "==> $*"; }

step "Checking git remote"
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "$REMOTE_URL"
  git branch -M main
fi

step "Committing source changes"
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "Deploy $(date '+%Y-%m-%d %H:%M:%S')"
else
  echo "Nothing to commit"
fi

step "Pushing to main (errors ignored)"
git push -u origin main || echo "warning: push to main failed, continuing"

set -euo pipefail

step "Building"
pnpm build

step "Preparing $DEPLOY_DIR"
if [ ! -d "$DEPLOY_DIR" ]; then
  git clone "$REMOTE_URL" "$DEPLOY_DIR"
fi

(
  cd "$DEPLOY_DIR"
  git fetch origin
  if git rev-parse --verify origin/gh-pages >/dev/null 2>&1; then
    git checkout -B gh-pages origin/gh-pages
  else
    git checkout --orphan gh-pages
    git rm -rf . >/dev/null 2>&1 || true
  fi
)

step "Syncing dist/ into $DEPLOY_DIR"
SHORT_SHA="$(git rev-parse --short HEAD)"
find "$DEPLOY_DIR" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -r dist/. "$DEPLOY_DIR/"

step "Committing and pushing gh-pages"
(
  cd "$DEPLOY_DIR"
  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "Deploy $(date '+%Y-%m-%d %H:%M:%S') from distro-chooser-src@${SHORT_SHA}"
    git push -u origin gh-pages
  else
    echo "Nothing to deploy"
  fi
)

step "Done"
