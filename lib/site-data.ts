// Static site data used by the brutalist v3 design (landing + CV)
// These values come from the approved design prototype and complement content/*/cv.json

import enSiteData from "@/i18n/en/site-data.json";
import esSiteData from "@/i18n/es/site-data.json";
import type { Locale } from "@/lib/i18n";

type SiteDataJson = typeof enSiteData;

const siteDataByLocale: Record<Locale, SiteDataJson> = {
  en: enSiteData,
  es: esSiteData as SiteDataJson,
};

/** Get locale-specific site data (TL;DR, Focus areas, Impact stats, TOC entries). */
export function getSiteData(locale: Locale = "en"): SiteDataJson {
  return siteDataByLocale[locale] ?? siteDataByLocale.en;
}

// Non-translatable brand list (proper names)
export const SITE_BRANDS = [
  "Nexthink", "EUROCONTROL", "Carlsberg", "Nokia",
  "General Motors", "NCAA", "Paulson Institute",
  "Hilton", "Anheuser-Busch", "T-Mobile",
] as const;

// Legacy exports kept for backwards-compat during migration
// TODO: Remove once all consumers use getSiteData(locale)
export const SITE_TLDR = enSiteData.tldr;
export const SITE_TLDR_LABELS = enSiteData.tldrLabels;
export const SITE_FOCUS = enSiteData.focus;
export const SITE_IMPACT = enSiteData.impact;
export const SITE_LANDING_TOC = enSiteData.landingToc;
export const CV_TOC = enSiteData.cvToc;
