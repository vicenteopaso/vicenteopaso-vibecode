#!/usr/bin/env node

/**
 * Basic internal link validator.
 *
 * What it does (for now):
 * - Scans markdown files in 'content/' for markdown links like '[text](/path)'.
 * - Treats links starting with '/' as internal routes.
 * - Derives valid routes from routes like 'app/cv/page.tsx' which map to '/cv'.
 * - Reports any internal links that do not map to a known route.
 *
 * This is intentionally lightweight and fast so it can be run locally or in CI.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const appDir = path.join(repoRoot, "app");
const contentDir = path.join(repoRoot, "content");

function getMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getMarkdownFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(entryPath);
    }
  }

  return files;
}

function getKnownRoutes(appDirectory) {
  const routes = new Set(["/"]); // Root route

  if (!fs.existsSync(appDirectory)) {
    return routes;
  }

  const entries = fs.readdirSync(appDirectory, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const dirName = entry.name;

    // Skip special directories like API routes
    if (dirName === "api") continue;

    const pagePath = path.join(appDirectory, dirName, "page.tsx");

    if (fs.existsSync(pagePath)) {
      routes.add("/" + dirName);
    }
  }

  return routes;
}

function extractInternalLinks(markdown) {
  const links = new Set();

  // Simple markdown link regex: [text](/path)
  const linkRegex = /\[[^\]]+\]\((\/[^)#\s]+)(?:#[^)]+)?\)/g;
  let match;

  while ((match = linkRegex.exec(markdown)) !== null) {
    const href = match[1];

    // Only consider root-relative links (e.g. "/cv", "/contact")
    if (href.startsWith("/")) {
      links.add(href.replace(/\/$/, ""));
    }
  }

  return Array.from(links);
}

function main() {
  const mdFiles = getMarkdownFiles(contentDir);
  const knownRoutes = getKnownRoutes(appDir);

  if (mdFiles.length === 0) {
    console.log("No markdown files found under content/; nothing to validate.");
    process.exit(0);
  }

  let errorCount = 0;

  for (const filePath of mdFiles) {
    const contents = fs.readFileSync(filePath, "utf8");
    const links = extractInternalLinks(contents);

    for (const link of links) {
      const normalized = link === "/" ? "/" : link.replace(/\/$/, "");

      if (!knownRoutes.has(normalized)) {
        console.error(filePath + ": unknown internal link -> " + link);
        errorCount += 1;
      }
    }
  }

  if (errorCount > 0) {
    console.error("\nLink validation failed: " + errorCount + " broken internal link(s) found.");
    process.exit(1);
  }

  console.log("All internal markdown links point to known routes.");
}

main();
