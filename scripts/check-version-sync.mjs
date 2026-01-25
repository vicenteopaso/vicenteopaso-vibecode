#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const fixFromChangelog = args.includes("--fix-from-changelog");

function getTagVersion() {
  const ref = process.env.GITHUB_REF;
  let tag;

  if (ref && ref.startsWith("refs/tags/")) {
    tag = ref.slice("refs/tags/".length);
  } else {
    try {
      tag = execSync("git describe --tags --abbrev=0", { encoding: "utf8" }).trim();
    } catch {
      console.error(
        "Failed to determine latest tag. Ensure tags are fetched (git fetch --tags).",
      );
      process.exit(1);
    }
  }

  return tag.startsWith("v") ? tag.slice(1) : tag;
}

function getChangelogVersion() {
  let changelog;
  try {
    changelog = readFileSync(join(__dirname, "..", "CHANGELOG.md"), "utf8");
  } catch {
    console.error("CHANGELOG.md not found at repo root.");
    process.exit(1);
  }

  const match = changelog.match(/^## \[(\d+\.\d+\.\d+)]/m);
  if (!match) {
    console.error(
      'Could not find top-level version in CHANGELOG.md (expected line starting with "## [x.y.z]").',
    );
    process.exit(1);
  }

  return match[1];
}

const pkgPath = join(__dirname, "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const pkgVersion = pkg.version;
const changelogVersion = getChangelogVersion();

if (fixFromChangelog) {
  if (pkgVersion !== changelogVersion) {
    pkg.version = changelogVersion;
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
    console.log(
      `Updated package.json version from ${pkgVersion} to ${changelogVersion} based on CHANGELOG.md`,
    );
  } else {
    console.log(
      `No changes needed: package.json version already matches CHANGELOG.md (${pkgVersion})`,
    );
  }
  // In fix mode we do not consider tags; this is intended for PR auto-fix.
  process.exit(0);
}

const tagVersion = getTagVersion();

let ok = true;

if (pkgVersion !== tagVersion) {
  console.error(
    `Version mismatch between package.json and tag: package.json=${pkgVersion}, tag=${tagVersion}`,
  );
  ok = false;
}

if (pkgVersion !== changelogVersion) {
  console.error(
    `Version mismatch between package.json and CHANGELOG.md: package.json=${pkgVersion}, CHANGELOG=${changelogVersion}`,
  );
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log(
  `✅ Versions in sync: package.json=${pkgVersion}, tag=v${tagVersion}, CHANGELOG=${changelogVersion}`,
);
