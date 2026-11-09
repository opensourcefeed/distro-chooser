#!/usr/bin/env bash
# Builds the site and publishes it to the gh-pages checkout in ../distro-chooser.
#
# - Runs data validation, unit tests and type-checking before building.
# - Replaces the target's contents with dist/, so assets from old builds don't
#   pile up (only .git, .nojekyll and CNAME are preserved).
# - Never commits or pushes this source repo. Commit and push your source
#   changes yourself; the deploy commit records the source commit it was built from.
set -euo pipefail

if [ $# -eq 0 ]; then
    echo "Error: Commit message is required."
    echo "Usage: $0 <commit-message>"
    exit 1
fi

COMMIT_MSG="$*"

cd "$(dirname "$0")/.."

# Load NVM for node/pnpm availability
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

TARGET="../distro-chooser"
TARGET_BRANCH="gh-pages"

# ── Pre-flight checks ───────────────────────────────────────────────────────
if [ ! -d "$TARGET/.git" ]; then
    echo "Error: $TARGET is not a git checkout."
    exit 1
fi

CURRENT_TARGET_BRANCH="$(git -C "$TARGET" branch --show-current)"
if [ "$CURRENT_TARGET_BRANCH" != "$TARGET_BRANCH" ]; then
    echo "Error: $TARGET is on branch '$CURRENT_TARGET_BRANCH', expected '$TARGET_BRANCH'."
    exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
    echo "Warning: the source repo has uncommitted changes; the deployed build will not match any commit."
fi

SOURCE_REV="$(git rev-parse --short HEAD)"

echo "=== Validating data ==="
pnpm run validate:all

echo "=== Running tests ==="
pnpm test

echo "=== Type-checking ==="
pnpm run check

echo "=== Building project ==="
pnpm build

echo "=== Replacing $TARGET contents with dist/ ==="
if [ ! -f dist/index.html ]; then
    echo "Error: dist/index.html is missing; refusing to replace the deployed site."
    exit 1
fi
find "$TARGET" -mindepth 1 -maxdepth 1 \
    ! -name '.git' ! -name '.nojekyll' ! -name 'CNAME' \
    -exec rm -rf {} +
cp -R dist/. "$TARGET"/

# GitHub Pages must not run Jekyll over the _astro/ directory.
touch "$TARGET/.nojekyll"

echo "=== Committing & pushing $TARGET ($TARGET_BRANCH) ==="
cd "$TARGET"
git add -A
if git diff --cached --quiet; then
    echo "Nothing changed in the build; nothing to deploy."
else
    git commit -m "$COMMIT_MSG" -m "Built from source commit $SOURCE_REV"
    git push -u origin "$TARGET_BRANCH"
fi

echo "=== Deployment complete ==="
