#!/bin/bash
set -e

# Check for mandatory commit message argument
if [ $# -eq 0 ]; then
    echo "Error: Commit message is required."
    echo "Usage: $0 <commit-message>"
    exit 1
fi

COMMIT_MSG="$*"

cd "$(dirname "$0")/.."

# Load NVM for npm/pnpm availability
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

TARGET="../distro-chooser"

echo "=== Building project ==="
pnpm build

echo "=== Copying build to $TARGET ==="

cp -r dist/* "$TARGET"/

echo "=== Committing & pushing current repo ==="
git add -A
git commit -m "$COMMIT_MSG" || echo "Nothing to commit"
git push origin

echo "=== Committing & pushing target repo ==="
cd "$TARGET"
git add -A
git commit -m "$COMMIT_MSG" || echo "Nothing to commit"
git push -u origin gh-pages

echo "=== Deployment complete ==="
