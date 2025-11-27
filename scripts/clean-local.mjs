#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

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

console.log("🧹 Cleaning local environment...\n");

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
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // Escape regex metacharacters
          .replace(/\\\*/g, ".*") + // Replace escaped * with .*
        "$"
    );

    try {
      const files = fs.readdirSync(dir);
      const matches = files.filter((f) => regex.test(f));

      if (matches.length > 0) {
        for (const match of matches) {
          const filePath = path.join(dir, match);
          try {
            fs.rmSync(filePath, { recursive: true, force: true });
            console.log(`  ✓ Removed ${match}`);
            removed++;
          } catch (err) {
            console.error(`  ✗ Failed to remove ${match}: ${err.message}`);
          }
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
        fs.rmSync(targetPath, { recursive: true, force: true });
        console.log(`  ✓ Removed ${target} (${type})`);
        removed++;
      } catch (err) {
        console.error(`  ✗ Failed to remove ${target}: ${err.message}`);
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
