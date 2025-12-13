#!/usr/bin/env node

/**
 * Check PR Tests - AI Guardrails
 *
 * This script verifies that changes to code files in `app/` or `lib/`
 * have corresponding test changes in `test/unit/`, `test/e2e/`, or `test/visual/`.
 *
 * Exit codes:
 * - 0: All checks passed or no code changes detected
 * - 1: Code changes without corresponding tests
 *
 * Usage:
 *   node scripts/check-pr-tests.mjs
 *
 * Environment variables:
 *   GITHUB_BASE_REF: Base branch for PR comparison (default: main)
 *   SKIP_TEST_CHECK: Set to 'true' to skip this check
 *                    Use only for emergency bypasses; not recommended for normal development
 *                    Consider using docs-only or config-only changes instead
 */

import { execSync } from "child_process";

// Configuration
const CODE_PATHS = ["app/", "lib/"];
const TEST_PATHS = ["test/unit/", "test/e2e/", "test/visual/"];
const EXCLUDED_EXTENSIONS = [".json", ".md", ".css", ".scss"];
const BASE_REF = process.env.GITHUB_BASE_REF || "main";

/**
 * Get list of changed files in the PR
 */
function getChangedFiles() {
  try {
    // In CI, we compare against the base branch
    // Locally, we compare against uncommitted changes
    let command;
    if (process.env.CI) {
      command = `git diff --name-only origin/${BASE_REF}...HEAD`;
    } else {
      // For local testing, show uncommitted changes
      command = "git diff --name-only HEAD";
      const uncommitted = execSync(command, { encoding: "utf-8" }).trim();
      if (uncommitted) {
        return uncommitted.split("\n").filter(Boolean);
      }
      // If no uncommitted changes, compare with main
      command = `git diff --name-only ${BASE_REF}...HEAD`;
    }

    const output = execSync(command, { encoding: "utf-8" }).trim();
    return output ? output.split("\n").filter(Boolean) : [];
  } catch (error) {
    console.error("Error getting changed files:", error.message);
    // If we can't determine changes, allow the check to pass
    return [];
  }
}

/**
 * Filter files to only include code files in monitored paths
 */
function filterCodeFiles(files) {
  return files.filter((file) => {
    // Check if file is in a code path
    const inCodePath = CODE_PATHS.some((path) => file.startsWith(path));
    if (!inCodePath) return false;

    // Exclude certain file types
    const hasExcludedExt = EXCLUDED_EXTENSIONS.some((ext) =>
      file.endsWith(ext),
    );
    if (hasExcludedExt) return false;

    // Include TypeScript/JavaScript files
    return file.match(/\.(ts|tsx|js|jsx)$/);
  });
}

/**
 * Filter files to only include test files
 */
function filterTestFiles(files) {
  return files.filter((file) => {
    return TEST_PATHS.some((path) => file.startsWith(path));
  });
}

/**
 * Check if there are test changes for the given code changes
 */
function hasTestChanges(codeFiles, testFiles) {
  if (codeFiles.length === 0) {
    return { passed: true, reason: "No code changes detected" };
  }

  if (testFiles.length > 0) {
    return {
      passed: true,
      reason: `Found ${testFiles.length} test file(s) changed`,
    };
  }

  return {
    passed: false,
    reason: "Code changes detected without corresponding test changes",
  };
}

/**
 * Main execution
 */
function main() {
  console.log("🔍 AI Guardrails: Checking PR test coverage...\n");

  // Allow skipping this check
  if (process.env.SKIP_TEST_CHECK === "true") {
    console.log("⏭️  Test check skipped (SKIP_TEST_CHECK=true)\n");
    process.exit(0);
  }

  // Get changed files
  const changedFiles = getChangedFiles();
  console.log(`📁 Total changed files: ${changedFiles.length}`);

  if (changedFiles.length === 0) {
    console.log("✅ No changes detected\n");
    process.exit(0);
  }

  // Filter code and test files
  const codeFiles = filterCodeFiles(changedFiles);
  const testFiles = filterTestFiles(changedFiles);

  console.log(
    `\n📝 Code files changed (${CODE_PATHS.join(", ")}): ${codeFiles.length}`,
  );
  if (codeFiles.length > 0) {
    codeFiles.forEach((file) => console.log(`   - ${file}`));
  }

  console.log(
    `\n🧪 Test files changed (${TEST_PATHS.join(", ")}): ${testFiles.length}`,
  );
  if (testFiles.length > 0) {
    testFiles.forEach((file) => console.log(`   - ${file}`));
  }

  // Check test coverage
  const result = hasTestChanges(codeFiles, testFiles);
  console.log(`\n${result.reason}`);

  if (!result.passed) {
    console.error(`\n❌ AI Guardrails Check Failed!`);
    console.error(
      `\nCode changes in ${CODE_PATHS.join(", ")} require accompanying tests in:`,
    );
    TEST_PATHS.forEach((path) => console.error(`   - ${path}`));
    console.error(`\nPlease add or update tests that cover your changes.`);
    console.error(
      `\nIf you believe this is a false positive (e.g., pure refactoring with no`,
    );
    console.error(
      `behavioral changes), you can set SKIP_TEST_CHECK=true, but document your`,
    );
    console.error(`reasoning in the PR description.`);
    console.error(`\nFor more information, see docs/TESTING.md`);
    process.exit(1);
  }

  console.log(`\n✅ AI Guardrails Check Passed!\n`);
  process.exit(0);
}

main();
