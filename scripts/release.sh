#!/bin/bash
set -e

# Usage: pnpm release [patch|minor|major|v0.2.1]

BUMP="${1:-patch}"

if [[ "$BUMP" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  VERSION="${BUMP#v}"
  pnpm version "$VERSION" --no-git-tag-version
else
  pnpm version "$BUMP" --no-git-tag-version
fi

VERSION=$(jq -r .version package.json)
TAG="v$VERSION"

git add package.json
git commit -m "chore: release $TAG"
git tag "$TAG"
git push origin main --tags

echo "Creating GitHub Release $TAG..."
gh release create "$TAG" \
  --title "$TAG" \
  --generate-notes \
  --verify-tag

echo "Release $TAG published. Workflow triggered."
