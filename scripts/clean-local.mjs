#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const MACOS_SIDE_CAR_PREFIX = "._";
const MACOS_TRASH_BASENAMES = new Set([".DS_Store"]);

/**
 * Comprehensive list of build artifacts, caches, and generated files to clean.
 * Organized by category for clarity.
 */
const targets = [
  // Next.js build outputs
  ".next",
  "out",
  "build",

  // Next.js and tooling caches
  ".turbo",

  // Contentlayer generated files
  ".contentlayer",

  // Vercel deployment artifacts
  ".vercel",

  // Test outputs and coverage
  "coverage",
  "playwright-report",
  "test-results",
  "blob-report",

  // Lock files
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",

  // TypeScript build info
  "*.tsbuildinfo",
  "next-env.d.ts",

  // Dependencies
  "node_modules",
  ".pnp",
  ".pnp.js",

  // pnpm specific

  // Editor/OS artifacts
  ".DS_Store",
];

let removed = 0;
let skipped = 0;

function removePath(targetPath, label) {
  try {
    fs.rmSync(targetPath, { recursive: true, force: true });
    console.log(`  ✓ Removed ${label}`);
    removed++;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ Failed to remove ${label}: ${message}`);
  }
}

function isMacOsOrICloudJunk(fileName) {
  return (
    MACOS_TRASH_BASENAMES.has(fileName) ||
    fileName.startsWith(MACOS_SIDE_CAR_PREFIX) ||
    fileName.endsWith(".icloud")
  );
}

function getCanonicalDuplicateFileName(fileName) {
  const duplicateMatch = /^(.+) \d+((\.[^.]+(?:\.[^.]+)*)?)$/.exec(fileName);
  if (!duplicateMatch) {
    return null;
  }

  return `${duplicateMatch[1]}${duplicateMatch[2]}`;
}

function removeMacOsAndICloudJunk(currentDir) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === "node_modules") {
      continue;
    }

    const entryPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      removeMacOsAndICloudJunk(entryPath);
      continue;
    }

    if (isMacOsOrICloudJunk(entry.name)) {
      const relativePath = path.relative(root, entryPath) || entry.name;
      removePath(entryPath, `${relativePath} (macOS/iCloud artifact)`);
      continue;
    }

    const canonicalName = getCanonicalDuplicateFileName(entry.name);
    if (!canonicalName) {
      continue;
    }

    const canonicalPath = path.join(currentDir, canonicalName);
    if (!fs.existsSync(canonicalPath)) {
      continue;
    }

    const relativePath = path.relative(root, entryPath) || entry.name;
    removePath(entryPath, `${relativePath} (duplicate numbered file)`);
  }
}

console.log("🧹 Cleaning local environment...\n");

console.log("🗑️  Removing macOS/iCloud junk files...\n");
removeMacOsAndICloudJunk(root);

console.log("\n🧹 Removing local build artifacts and caches...\n");

for (const target of targets) {
  // Handle glob patterns for files like *.tsbuildinfo
  if (target.includes("*")) {
    const dir =
      path.dirname(target) === "."
        ? root
        : path.join(root, path.dirname(target));
    const pattern = path.basename(target);
    const regex = new RegExp(
      "^" +
        pattern
          .replace(/[.+^${}()|[\\\]]/g, "\\$&") // Escape regex metacharacters except *
          .replace(/\*/g, ".*") + // Replace * with .*
        "$",
    );

    try {
      const files = fs.readdirSync(dir);
      const matches = files.filter((f) => regex.test(f));

      if (matches.length > 0) {
        for (const match of matches) {
          const filePath = path.join(dir, match);
          removePath(filePath, match);
        }
      }
    } catch {
      // Directory doesn't exist, skip silently
    }
  } else {
    const targetPath = path.join(root, target);
    if (fs.existsSync(targetPath)) {
      try {
        const stats = fs.statSync(targetPath);
        const type = stats.isDirectory() ? "directory" : "file";
        removePath(targetPath, `${target} (${type})`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`  ✗ Failed to remove ${target}: ${message}`);
      }
    } else {
      skipped++;
    }
  }
}

console.log(`\n✨ Clean complete!`);
console.log(`   Removed: ${removed} item(s)`);
console.log(`   Skipped: ${skipped} item(s) (not found)\n`);

if (removed > 0) {
  console.log("💡 Next steps:");
  console.log("   Run 'pnpm install' to reinstall dependencies");
  console.log("   Run 'pnpm build' to rebuild the project");
}
