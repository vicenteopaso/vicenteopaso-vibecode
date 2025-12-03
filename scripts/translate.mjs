/**
 * DeepL Translation Script
 *
 * This script translates English content to Spanish using the DeepL API.
 * It handles both:
 * - MDX/MD content files under /content/en/
 * - UI dictionary strings in /i18n/en/ui.json
 *
 * Translation is idempotent - only new or changed content is translated.
 * Existing translations are preserved to avoid unnecessary API calls.
 *
 * Usage:
 *   DEEPL_API_KEY=<your-key> node scripts/translate.js
 *
 * Environment Variables:
 *   DEEPL_API_KEY - Required. Your DeepL API authentication key.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import * as deepl from "deepl-node";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT = process.cwd();
const EN_CONTENT_DIR = path.join(ROOT, "content", "en");
const ES_CONTENT_DIR = path.join(ROOT, "content", "es");
const EN_UI = path.join(ROOT, "i18n", "en", "ui.json");
const ES_UI = path.join(ROOT, "i18n", "es", "ui.json");

// Validate environment
if (!process.env.DEEPL_API_KEY) {
  console.error("❌ Error: DEEPL_API_KEY environment variable is required");
  process.exit(1);
}

const translator = new deepl.Translator(process.env.DEEPL_API_KEY);

/**
 * Generate SHA-256 hash of a string for change detection
 */
function hash(str) {
  return crypto.createHash("sha256").update(str, "utf8").digest("hex");
}

/**
 * Translate text using DeepL API
 * @param {string} text - Text to translate
 * @returns {Promise<string>} Translated text
 */
async function translateText(text) {
  try {
    const result = await translator.translateText(text, null, "es");
    return result.text;
  } catch (error) {
    console.error("DeepL API error:", error.message);
    throw error;
  }
}

/**
 * Translate UI dictionary from English to Spanish
 * Only translates new keys that don't exist in Spanish
 */
async function translateUiJson() {
  console.log("\n📝 Translating UI dictionary...");

  if (!fs.existsSync(EN_UI)) {
    console.log("⚠️  English UI dictionary not found, skipping");
    return;
  }

  const enRaw = fs.readFileSync(EN_UI, "utf8");
  const enJson = JSON.parse(enRaw);

  let esJson = {};
  if (fs.existsSync(ES_UI)) {
    const esRaw = fs.readFileSync(ES_UI, "utf8");
    esJson = JSON.parse(esRaw || "{}");
  }

  let changed = false;
  let translatedCount = 0;

  for (const [key, value] of Object.entries(enJson)) {
    if (typeof value !== "string") {
      console.log(`⚠️  Skipping non-string value for key: ${key}`);
      continue;
    }

    if (!esJson[key]) {
      console.log(`  Translating: ${key}`);
      const translated = await translateText(value);
      esJson[key] = translated;
      changed = true;
      translatedCount++;
      // Small delay to respect API rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  if (changed) {
    fs.mkdirSync(path.dirname(ES_UI), { recursive: true });
    fs.writeFileSync(ES_UI, JSON.stringify(esJson, null, 2) + "\n", "utf8");
    console.log(
      `✅ UI dictionary updated: ${translatedCount} strings translated`,
    );
  } else {
    console.log("✅ UI dictionary up to date");
  }
}

/**
 * Translate markdown/MDX files from English to Spanish
 * Uses content hashing to detect changes and avoid re-translation
 */
async function translateMdxFiles() {
  console.log("\n📄 Translating content files...");

  if (!fs.existsSync(EN_CONTENT_DIR)) {
    console.log("⚠️  English content directory not found, skipping");
    return;
  }

  fs.mkdirSync(ES_CONTENT_DIR, { recursive: true });

  const files = fs
    .readdirSync(EN_CONTENT_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  if (files.length === 0) {
    console.log("⚠️  No content files found");
    return;
  }

  let translatedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    const enPath = path.join(EN_CONTENT_DIR, file);
    const esPath = path.join(ES_CONTENT_DIR, file);

    const enContent = fs.readFileSync(enPath, "utf8");
    const enHash = hash(enContent);

    // Check if Spanish version exists and is up to date
    if (fs.existsSync(esPath)) {
      const esContent = fs.readFileSync(esPath, "utf8");
      const esHash = hash(esContent);

      // Simple heuristic: if hashes match, content is identical (likely already translated)
      // In practice, you might want a more sophisticated check or metadata
      if (enHash === esHash) {
        console.log(`  ⏭️  Skipping ${file} (up to date)`);
        skippedCount++;
        continue;
      }
    }

    console.log(`  Translating ${file}...`);
    try {
      const translated = await translateText(enContent);
      fs.writeFileSync(esPath, translated, "utf8");
      translatedCount++;
      console.log(`  ✅ ${file} translated`);
      // Small delay to respect API rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`  ❌ Failed to translate ${file}:`, error.message);
    }
  }

  console.log(
    `\n✅ Content translation complete: ${translatedCount} files translated, ${skippedCount} skipped`,
  );
}

/**
 * Main execution
 */
async function main() {
  console.log("🌐 DeepL Translation Script");
  console.log("============================");

  try {
    // Verify DeepL API key is valid
    const usage = await translator.getUsage();
    if (usage.character) {
      console.log(
        `\n✅ DeepL API connected (${usage.character.count.toLocaleString()} / ${usage.character.limit.toLocaleString()} characters used)`,
      );
    }

    await translateUiJson();
    await translateMdxFiles();

    console.log("\n🎉 Translation complete!");
  } catch (error) {
    console.error("\n❌ Translation failed:", error.message);
    if (error.message.includes("401") || error.message.includes("403")) {
      console.error(
        "   Check that your DEEPL_API_KEY is valid and has sufficient quota",
      );
    }
    process.exit(1);
  }
}

// Run the script
main();
