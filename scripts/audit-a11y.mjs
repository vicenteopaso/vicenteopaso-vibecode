#!/usr/bin/env node

/**
 * Lightweight but real accessibility audit script.
 *
 * What it does today:
 * - Walks a subset of the repo (app/ and nested components).
 * - Looks for usages of `next/image`'s `Image` component.
 * - Reports any `<Image />` usages that appear to be missing an `alt` prop.
 *
 * If any issues are found, the script exits with code 1 so it can be used as
 * a proper CI gate. The heuristics are intentionally simple and conservative
 * so they should not generate a lot of false positives.
 *
 * Future enhancements might include:
 * - Additional checks for landmarks, focus handling, etc.
 * - Integrating axe-core with Playwright for richer audits.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const TARGET_DIRS = ["app"];
const TARGET_EXTENSIONS = new Set([".tsx"]);

/**
 * Recursively collect files under a directory that match TARGET_EXTENSIONS.
 */
function collectFiles(dir, acc) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collectFiles(fullPath, acc);
      continue;
    }

    const ext = path.extname(entry.name);
    if (TARGET_EXTENSIONS.has(ext)) {
      acc.push(fullPath);
    }
  }

  return acc;
}

/**
 * Naive heuristic to find `<Image ... />` usages that appear to be missing `alt`.
 *
 * We keep this deliberately simple to avoid bringing in a JSX parser:
 * - Only runs in files that import from `next/image`.
 * - Scans for `<Image` occurrences and checks if `alt=` appears before the closing `>`.
 */
function findImageAltIssues(filePath) {
  const contents = fs.readFileSync(filePath, "utf8");

  if (!contents.includes("next/image")) {
    return [];
  }

  const lines = contents.split(/\r?\n/);
  const issues = [];

  lines.forEach((line, index) => {
    if (!line.includes("<Image")) return;

    // Collect the full tag in case it spans multiple lines.
    let tagText = line;
    let currentIndex = index;

    while (!tagText.includes(">") && currentIndex + 1 < lines.length) {
      currentIndex += 1;
      tagText += "\n" + lines[currentIndex];
    }

    const hasAlt = /\balt\s*=/.test(tagText);

    if (!hasAlt) {
      issues.push({
        line: index + 1,
        snippet: line.trim().slice(0, 200),
      });
    }
  });

  return issues;
}

function main() {
  console.log("Running basic accessibility checks...\n");

  const allFiles = [];
  for (const dir of TARGET_DIRS) {
    const absoluteDir = path.join(ROOT_DIR, dir);
    if (fs.existsSync(absoluteDir)) {
      collectFiles(absoluteDir, allFiles);
    }
  }

  const allIssues = [];

  for (const file of allFiles) {
    const issues = findImageAltIssues(file);
    if (issues.length > 0) {
      allIssues.push({ file, issues });
    }
  }

  if (allIssues.length === 0) {
    console.log(
      "✅ No obvious <Image /> alt attribute issues found (heuristic check).\n",
    );
    console.log(
      "Note: this is a limited audit. Consider integrating axe-core with Playwright for deeper coverage.",
    );
    process.exit(0);
  }

  console.log(
    "❌ Accessibility audit failed: potential issues detected with next/image <Image /> alt attributes:\n",
  );

  let totalIssues = 0;

  for (const { file, issues } of allIssues) {
    console.log(`- ${path.relative(ROOT_DIR, file)}`);
    for (const issue of issues) {
      totalIssues += 1;
      console.log(`  • Line ${issue.line}: possibly missing alt attribute`);
      console.log(`    Snippet: ${issue.snippet}`);
    }
    console.log("");
  }

  console.log(
    `Found ${totalIssues} potential <Image /> alt issue(s). ` +
      "This script now exits with code 1 so that accessibility regressions can break CI.",
  );

  process.exit(1);
}

main();
