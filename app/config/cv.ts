import type { Locale } from "@/lib/i18n";

const pdfCacheVersion = process.env.NEXT_PUBLIC_PDF_CACHE_DATE ?? "1";

const CV_PDF_BY_LOCALE: Record<
  Locale,
  { path: string; filename: string }
> = {
  en: {
    path: "/assets/vicente-opaso-cv-en-v5.2g.pdf",
    filename: "vicente-opaso-cv-en-v5.2g.pdf",
  },
  es: {
    path: "/assets/vicente-opaso-cv-es-v5.2g.pdf",
    filename: "vicente-opaso-cv-es-v5.2g.pdf",
  },
};

export function getCvPdfAsset(locale: Locale = "en") {
  const pdf = CV_PDF_BY_LOCALE[locale] ?? CV_PDF_BY_LOCALE.en;

  return {
    href: `${pdf.path}?v=${pdfCacheVersion}`,
    downloadName: pdf.filename,
  };
}
