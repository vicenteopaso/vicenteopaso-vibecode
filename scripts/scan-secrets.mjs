#!/usr/bin/env node

/**
 * Secrets Scanner
 * 
 * Scans files for potential secrets and sensitive data patterns.
 * This is a lightweight security check to prevent accidental secret commits.
 * 
 * Usage:
 *   node scripts/scan-secrets.mjs                    # Scan all tracked files
 *   node scripts/scan-secrets.mjs --changed          # Scan only changed files (git diff)
 *   node scripts/scan-secrets.mjs file1.js file2.ts  # Scan specific files
 * 
 * Exit codes:
 *   0 - No secrets found
 *   1 - Secrets detected or scan error
 */

import { execSync } from "child_process";
import { existsSync, readFileSync, statSync } from "fs";

// Patterns that indicate potential secrets
// Note: Patterns use backreferences (\1) to ensure opening and closing quotes match
const SECRET_PATTERNS = [
  // API Keys and Tokens
  {
    // Matches: "api_key" = "abc123..." or 'apikey': 'xyz789...' (quotes must match via \1)
    pattern: /(['"`])(?:api[_-]?key|apikey|api[_-]?secret)\1\s*[:=]\s*['"`][a-zA-Z0-9_-]{20,}['"`]/gi,
    description: "API key assignment",
  },
  {
    // Matches: "password" = "secret123" or 'secret': 'pass456' (quotes must match via \1)
    pattern: /(['"`])(?:secret|password|passwd|pwd)\1\s*[:=]\s*['"`][^\s'"`]{8,}['"`]/gi,
    description: "Password/secret assignment",
  },
  {
    pattern: /(['"`])Bearer\s+[a-zA-Z0-9_.]{20,}['"`]/g,
    description: "Bearer token",
  },
  // GitHub tokens
  {
    pattern: /\bghp_[a-zA-Z0-9]{36,}\b/g,
    description: "GitHub Personal Access Token",
  },
  {
    pattern: /\bghs_[a-zA-Z0-9]{36,}\b/g,
    description: "GitHub OAuth Token",
  },
  {
    pattern: /\bgho_[a-zA-Z0-9]{36,}\b/g,
    description: "GitHub OAuth Access Token",
  },
  // OpenAI keys
  {
    pattern: /\bsk-[a-zA-Z0-9]{20,}\b/g,
    description: "OpenAI API Key",
  },
  // AWS keys
  {
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    description: "AWS Access Key ID",
  },
  // Slack tokens
  {
    pattern: /\bxox[baprs]-[0-9a-zA-Z]{10,}\b/g,
    description: "Slack token",
  },
  // Generic high-entropy hex strings (potential secrets) - 128+ chars to reduce false positives
  {
    // Matches: "abc123def456..." or 'fedcba987654...' (128+ hex chars, quotes must match via \1)
    pattern: /(['"`])[a-f0-9]{128,}\1/gi,
    description: "Very long hexadecimal string (potential secret)",
  },
  // Private keys
  {
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
    description: "Private key",
  },
];

// Files/paths to always ignore
const IGNORE_PATTERNS = [
  ".env.example",
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  ".git/",
  "node_modules/",
  ".next/",
  ".contentlayer/",
  "coverage/",
  "dist/",
  "build/",
  ".turbo/",
  // Binary and media files
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  // This file can contain examples
  "scan-secrets.mjs",
];

// Known false positives (allow these exact matches)
const ALLOWLIST = [
  // Example/placeholder values in documentation
  "your-api-key-here",
  "your_api_key",
  "INSERT_API_KEY_HERE",
  "REPLACE_WITH_YOUR_KEY",
  // Test fixtures
  "test-secret-key",
  "mock-api-key",
  "fake-token-12345",
];

function shouldIgnoreFile(filePath) {
  return IGNORE_PATTERNS.some((pattern) => filePath.includes(pattern));
}

function isAllowlisted(content) {
  return ALLOWLIST.some((allowed) =>
    content.toLowerCase().includes(allowed.toLowerCase())
  );
}

function scanFile(filePath) {
  try {
    if (!existsSync(filePath)) {
      return [];
    }

    const stats = statSync(filePath);
    if (!stats.isFile()) {
      return [];
    }

    if (shouldIgnoreFile(filePath)) {
      return [];
    }

    const content = readFileSync(filePath, "utf-8");
    const findings = [];

    for (const { pattern, description } of SECRET_PATTERNS) {
      const matches = content.matchAll(new RegExp(pattern.source, pattern.flags));

      for (const match of matches) {
        const matchedText = match[0];

        // Skip if allowlisted
        if (isAllowlisted(matchedText)) {
          continue;
        }

        // Calculate line number
        const beforeMatch = content.substring(0, match.index);
        const lineNumber = beforeMatch.split("\n").length;

        // Get context (the line containing the match)
        const lines = content.split("\n");
        const contextLine = lines[lineNumber - 1] || "";

        findings.push({
          file: filePath,
          line: lineNumber,
          pattern: description,
          context: contextLine.trim().substring(0, 100), // Limit context length
        });
      }
    }

    return findings;
  } catch (error) {
    console.error(`Error scanning ${filePath}: ${error.message}`);
    return [];
  }
}

function getFilesToScan(args) {
  // If specific files provided as arguments
  if (args.length > 0 && !args.includes("--changed")) {
    return args.filter((f) => !f.startsWith("--"));
  }

  // If --changed flag, scan only changed files in git
  if (args.includes("--changed")) {
    try {
      // Get all changed files (staged and unstaged)
      // Use HEAD~1..HEAD for CI environments with shallow clones
      let changed = "";
      let staged = "";

      try {
        changed = execSync("git diff --name-only HEAD", {
          encoding: "utf-8",
        }).trim();
      } catch {
        // Fallback for CI: compare against previous commit
        try {
          changed = execSync("git diff --name-only HEAD~1 HEAD", {
            encoding: "utf-8",
          }).trim();
        } catch {
          // No changes detectable
          changed = "";
        }
      }

      try {
        staged = execSync("git diff --cached --name-only", {
          encoding: "utf-8",
        }).trim();
      } catch {
        // No staged changes
        staged = "";
      }

      const allChanged = [
        ...changed.split("\n").filter(Boolean),
        ...staged.split("\n").filter(Boolean),
      ];

      return [...new Set(allChanged)];
    } catch (error) {
      console.error("Error getting changed files:", error.message);
      console.error(
        "Falling back to scanning all tracked files. Use specific file paths if needed."
      );
      // Fallback to scanning all files if git operations fail
      try {
        const files = execSync("git ls-files", { encoding: "utf-8" }).trim();
        return files.split("\n").filter(Boolean);
      } catch {
        return [];
      }
    }
  }

  // Default: scan all tracked files
  try {
    const files = execSync("git ls-files", { encoding: "utf-8" }).trim();
    return files.split("\n").filter(Boolean);
  } catch (error) {
    console.error("Error listing git files:", error.message);
    return [];
  }
}

function main() {
  const args = process.argv.slice(2);
  const files = getFilesToScan(args);

  if (files.length === 0) {
    console.log("No files to scan.");
    process.exit(0);
  }

  console.log(`Scanning ${files.length} files for potential secrets...\n`);

  const allFindings = [];

  for (const file of files) {
    const findings = scanFile(file);
    allFindings.push(...findings);
  }

  if (allFindings.length === 0) {
    console.log("✓ No potential secrets detected.");
    process.exit(0);
  }

  // Report findings
  console.error("✗ Potential secrets detected:\n");

  // Group by file
  const findingsByFile = {};
  for (const finding of allFindings) {
    if (!findingsByFile[finding.file]) {
      findingsByFile[finding.file] = [];
    }
    findingsByFile[finding.file].push(finding);
  }

  for (const [file, findings] of Object.entries(findingsByFile)) {
    console.error(`  ${file}:`);
    for (const finding of findings) {
      console.error(`    Line ${finding.line}: ${finding.pattern}`);
      console.error(`      ${finding.context}`);
    }
    console.error();
  }

  console.error(`Total: ${allFindings.length} potential secret(s) found.`);
  console.error("\nIf these are false positives, consider:");
  console.error("  1. Moving sensitive patterns to environment variables");
  console.error("  2. Adding exceptions to the ALLOWLIST in scan-secrets.mjs");
  console.error("  3. Using placeholder values like 'your-api-key-here'\n");

  process.exit(1);
}

main();
