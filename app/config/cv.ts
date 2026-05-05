import type { Locale } from "@/lib/i18n";

export const DEFAULT_CV_DOWNLOAD_PATH = "/cv/download";

export function getCvDownloadPath(locale: Locale): `/${Locale}/cv/download` {
  return `/${locale}/cv/download`;
}

export function getCvDownloadFilename(locale: Locale): string {
  return `vicente-opaso-cv-${locale}.pdf`;
}
