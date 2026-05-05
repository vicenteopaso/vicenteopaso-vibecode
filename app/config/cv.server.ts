import "server-only";

import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type { Locale } from "@/lib/i18n";
import { defaultLocale } from "@/lib/i18n";

import { getCvDownloadFilename } from "./cv";

const PUBLIC_ASSETS_DIR = path.join(process.cwd(), "public", "assets");
const ONE_DAY_SECONDS = 60 * 60 * 24;
const defaultCvPdfFiles: Record<Locale, string> = {
  en: "Vicente-Opaso_CV_EN.pdf",
  es: "Vicente-Opaso_CV_ES.pdf",
};

function safePdfBasename(value: string): string {
  const basename = path.basename(value);
  if (basename !== value || basename.includes("..") || basename.includes("/")) {
    throw new Error(`Invalid CV PDF filename from environment: ${value}`);
  }
  return basename;
}

function resolveConfiguredFilename(envValue: string | undefined, fallback: string): string {
  if (!envValue) return fallback;
  try {
    return safePdfBasename(envValue);
  } catch {
    return fallback;
  }
}

const configuredCvPdfFiles: Partial<Record<Locale, string>> = {
  en: resolveConfiguredFilename(process.env.CV_PDF_FILE_EN, defaultCvPdfFiles.en),
  es: resolveConfiguredFilename(process.env.CV_PDF_FILE_ES, defaultCvPdfFiles.es),
};

function isPdf(filename: string): boolean {
  return filename.toLowerCase().endsWith(".pdf");
}

function isCvPdf(filename: string): boolean {
  return isPdf(filename) && filename.toLowerCase().includes("cv");
}

function isLegacyDefaultEnglishCvPdf(filename: string): boolean {
  const normalized = filename.toLowerCase();
  return (
    normalized.startsWith("vicente-opaso-cv") && normalized.endsWith(".pdf")
  );
}

function includesLocaleToken(filename: string, locale: Locale): boolean {
  const normalized = filename.toLowerCase();
  const separators = ["-", "_", "."];

  if (normalized === locale) return true;

  // Strip extension to also match e.g. "cv_en.pdf" → strip ".pdf" → "cv_en"
  const withoutExt = normalized.replace(/\.[^.]+$/, "");

  return separators.some(
    (separator) =>
      withoutExt.startsWith(`${locale}${separator}`) ||
      withoutExt.endsWith(`${separator}${locale}`) ||
      withoutExt.includes(`${separator}${locale}${separator}`) ||
      normalized.startsWith(`${locale}${separator}`) ||
      normalized.endsWith(`${separator}${locale}`) ||
      normalized.includes(`${separator}${locale}${separator}`),
  );
}

async function fileExists(absolutePath: string): Promise<boolean> {
  try {
    await access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function getPublicCvPdfFiles(): Promise<string[]> {
  const files = await readdir(PUBLIC_ASSETS_DIR);
  return files.filter(isCvPdf).sort();
}

async function findConfiguredFile(locale: Locale): Promise<string | null> {
  const configuredFile = configuredCvPdfFiles[locale];
  if (!configuredFile) return null;

  const absolutePath = path.join(PUBLIC_ASSETS_DIR, configuredFile);
  if (!absolutePath.startsWith(PUBLIC_ASSETS_DIR + path.sep) && absolutePath !== PUBLIC_ASSETS_DIR) {
    return null;
  }
  return (await fileExists(absolutePath)) ? configuredFile : null;
}

async function findLocaleSpecificFile(locale: Locale): Promise<string | null> {
  const files = await getPublicCvPdfFiles();
  const localizedMatch = files.find((file) =>
    includesLocaleToken(file, locale),
  );
  if (localizedMatch) return localizedMatch;

  if (locale === defaultLocale) {
    return files.find(isLegacyDefaultEnglishCvPdf) ?? files[0] ?? null;
  }

  return null;
}

export async function resolveCvPdfAsset(
  locale: Locale,
): Promise<{ absolutePath: string; fileName: string } | null> {
  const configuredFile =
    (await findConfiguredFile(locale)) ??
    (locale !== defaultLocale ? await findConfiguredFile(defaultLocale) : null);

  const discoveredFile =
    (await findLocaleSpecificFile(locale)) ??
    (locale !== defaultLocale
      ? await findLocaleSpecificFile(defaultLocale)
      : null);

  const fileName = configuredFile ?? discoveredFile;
  if (!fileName) return null;

  return {
    absolutePath: path.join(PUBLIC_ASSETS_DIR, fileName),
    fileName,
  };
}

export async function createCvPdfDownloadResponse(
  locale: Locale,
): Promise<Response> {
  const asset = await resolveCvPdfAsset(locale);
  if (!asset) {
    return new Response("CV PDF not found", { status: 404 });
  }

  const body = await readFile(asset.absolutePath);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${getCvDownloadFilename(locale)}"`,
      "Cache-Control": `public, max-age=${ONE_DAY_SECONDS}, s-maxage=31536000, stale-while-revalidate=60`,
      "X-Robots-Tag": "noindex",
    },
  });
}
