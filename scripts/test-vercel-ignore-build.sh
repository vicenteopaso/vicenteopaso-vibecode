#!/bin/bash

# Test suite for vercel-ignore-build.sh
# This script validates various scenarios to ensure the build skip logic works correctly

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEST_SCRIPT="$PROJECT_ROOT/scripts/vercel-ignore-build.sh"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run a test
run_test() {
  local test_name="$1"
  local expected_exit_code="$2"
  local prev_sha="$3"
  local curr_sha="$4"
  
  echo -e "${YELLOW}Testing: $test_name${NC}"
  
  export VERCEL_GIT_PREVIOUS_SHA="$prev_sha"
  export VERCEL_GIT_COMMIT_SHA="$curr_sha"
  
  # Capture output and exit code
  set +e
  output=$(bash "$TEST_SCRIPT" 2>&1)
  actual_exit_code=$?
  set -e
  
  if [ $actual_exit_code -eq $expected_exit_code ]; then
    echo -e "${GREEN}✓ PASS${NC} - Exit code: $actual_exit_code (expected: $expected_exit_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗ FAIL${NC} - Exit code: $actual_exit_code (expected: $expected_exit_code)"
    echo "Output:"
    echo "$output"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  
  echo ""
}

echo "========================================"
echo "Vercel Build Skip Logic - Test Suite"
echo "========================================"
echo ""

cd "$PROJECT_ROOT"

# Test 0: Validate sed pattern escaping logic
echo "========================================"
echo "Test 0: Sed Pattern Escaping"
echo "========================================"
echo "Testing that the sed pattern correctly escapes special regex metacharacters..."
echo ""

# Test paths with various special characters
test_sed_pattern() {
  local test_path="$1"
  local description="$2"
  
  # Use the exact sed pattern from vercel-ignore-build.sh
  local escaped=$(printf '%s\n' "$test_path" | sed 's|[][\.*^$/]|\\&|g')
  
  # Verify the escaped pattern matches the original
  if echo "$test_path" | grep -qE "^${escaped}\$"; then
    echo -e "${GREEN}✓ PASS${NC} - $description: '$test_path' -> '$escaped'"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC} - $description: '$test_path' escaped to '$escaped' but doesn't match"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

# Test various special characters that might appear in file paths
test_sed_pattern "app/" "Directory with slash"
test_sed_pattern "lib/" "Another directory"
test_sed_pattern "test.config.js" "File with dots"
test_sed_pattern "file.test.ts" "File with multiple dots"
test_sed_pattern "[special].txt" "File with brackets"
test_sed_pattern "test-[version].json" "File with brackets in middle"
test_sed_pattern "path/to/file.js" "Nested path with slashes"
test_sed_pattern "test*pattern.md" "File with asterisk"
test_sed_pattern "test^marker.txt" "File with caret"
test_sed_pattern 'test$var.sh' "File with dollar sign"

echo ""
echo "Sed pattern escaping tests completed."
echo ""

# Ensure we have git history
if ! git rev-parse HEAD~1 >/dev/null 2>&1; then
  echo -e "${RED}Error: Need at least 2 commits in git history to run tests${NC}"
  exit 1
fi

# Get some actual commit SHAs for realistic testing
CURRENT_SHA=$(git rev-parse HEAD)
PREVIOUS_SHA=$(git rev-parse HEAD~1)

echo "Using commits from actual git history:"
echo "  Previous: $PREVIOUS_SHA"
echo "  Current:  $CURRENT_SHA"
echo ""

# Test 1: No previous SHA (initial deployment)
echo "Test 1: Initial deployment (no previous SHA)"
run_test "Initial deployment should build" 1 "" "$CURRENT_SHA"

# Test 2: No changed files (same commit)
echo "Test 2: No changes (comparing same commit)"
run_test "No changes should skip" 0 "$CURRENT_SHA" "$CURRENT_SHA"

# Test 3: Build-triggering paths
echo "Test 3: Build-triggering changes"

# We'll simulate by using actual history
# Get files changed between HEAD~1 and HEAD
CHANGED_FILES=$(git diff --name-only "$PREVIOUS_SHA" "$CURRENT_SHA")

# Patterns below are aligned with BUILD_PATHS in vercel-ignore-build.sh for accuracy.
if echo "$CHANGED_FILES" | grep -qE '^(app/|lib/|styles/|public/|content/|scripts/|package\.json|pnpm-lock\.yaml|next\.config\.mjs|tailwind\.config\.js|postcss\.config\.js|tsconfig\.json|vitest\.config\.ts|playwright\.config\.ts)$'; then
  echo "  Current commit has build-triggering changes"
elif echo "$CHANGED_FILES" | grep -qE '^(docs/|test/|\.github/|README\.md|CONTRIBUTING\.md)$'; then
  echo "  Current commit has only doc changes"
  run_test "Documentation changes should skip" 0 "$PREVIOUS_SHA" "$CURRENT_SHA"
else
  echo "  No files changed or unrecognized pattern"
  run_test "Empty or unrecognized changes" 0 "$PREVIOUS_SHA" "$CURRENT_SHA"
fi

# Test 4: Verify script handles missing git diff gracefully
echo "Test 4: Invalid commit SHA handling"
run_test "Invalid SHAs should handle gracefully" 1 "invalid_sha_123" "$CURRENT_SHA"

echo "========================================"
echo "Test Results"
echo "========================================"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed!${NC}"
  exit 1
fi
