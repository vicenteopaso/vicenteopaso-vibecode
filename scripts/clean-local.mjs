#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const targets = [
  ".next",
  ".turbo",
  ".contentlayer",
  ".vercel",
  "coverage",
  "playwright-report",
  "test-results",
  "node_modules",
];

for (const rel of targets) {
  const targetPath = path.join(root, rel);
  if (fs.existsSync(targetPath)) {
    console.log(`Removing ${rel} ...`);
    fs.rmSync(targetPath, { recursive: true, force: true });
  } else {
    console.log(`Skipping ${rel} (not found)`);
  }
}

console.log(
  "Local clean complete. You may want to reinstall deps with `pnpm install`.",
);
