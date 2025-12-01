#!/bin/bash

# Vercel Ignored Build Step
# This script determines whether to skip a build based on the files changed in a commit.
# Return 0 to skip the build, return 1 to trigger a build.
#
# Vercel automatically sets the following environment variables:
# - VERCEL_GIT_PREVIOUS_SHA: The SHA of the previous commit
# - VERCEL_GIT_COMMIT_SHA: The SHA of the current commit
#
# Usage:
# - Set this script as the "Ignored Build Step" in Vercel project settings
# - Command: bash scripts/vercel-ignore-build.sh

set -e

echo "==> Vercel Build Skip Check"

# If we don't have git history (initial deployment), always build
if [[ -z "$VERCEL_GIT_PREVIOUS_SHA" ]]; then
  echo "No previous SHA found (initial deployment). Building."
  exit 1
fi

echo "Comparing $VERCEL_GIT_PREVIOUS_SHA to $VERCEL_GIT_COMMIT_SHA"

# Paths that should TRIGGER a build (code, dependencies, config)
BUILD_PATHS=(
  "app/"
  "lib/"
  "styles/"
  "public/"
  "content/"
  "scripts/"
  "package.json"
  "pnpm-lock.yaml"
  "next.config.mjs"
  "tailwind.config.js"
  "tsconfig.json"
  "contentlayer.config.ts"
  "postcss.config.js"
  ".eslintrc.json"
  ".prettierrc"
)

# Paths that should NOT trigger a build (documentation, config files that don't affect build output)
SKIP_PATHS=(
  "docs/"
  "test/"
  ".github/"
  "README.md"
  "CONTRIBUTING.md"
  "WARP.md"
  "LICENSE"
  "SECURITY.md"
  "SUPPORT.md"
  ".gitignore"
  ".prettierignore"
  ".eslintignore"
  ".nvmrc"
  "pnpm-workspace.yaml"
)

# Get list of changed files
CHANGED_FILES=$(git diff --name-only "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA")

if [[ -z "$CHANGED_FILES" ]]; then
  echo "No files changed. Skipping build."
  exit 0
fi

echo "Changed files:"
echo "$CHANGED_FILES"
echo ""

# Check if any build-triggering path was modified
for path in "${BUILD_PATHS[@]}"; do
  if echo "$CHANGED_FILES" | grep -q "^$path"; then
    echo "✓ Build-impacting path changed: $path"
    echo "Building."
    exit 1
  fi
done

# If we reach here, only non-build-impacting files changed
echo "✓ Only documentation or non-build-impacting files changed."
echo "Skipping build."
exit 0
