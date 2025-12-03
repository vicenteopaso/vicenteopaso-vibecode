"use client";

import { useParams } from "next/navigation";

import type { TranslationKey, UITranslations } from "./getTranslations";
import { getTranslations } from "./getTranslations";
import type { Locale } from "./locales";
import { defaultLocale } from "./locales";

/**
 * Hook to access translations for the current locale.
 *
 * Returns a function that resolves a translation key to a string.
 * Supports simple string interpolation for dynamic values.
 *
 * @example
 * const t = useTranslations();
 * return <p>{t("nav.contact")}</p>;
 *
 * @example
 * const t = useTranslations();
 * return <p>{t("contact.countdownMessage", { seconds: 5, secondsLabel: "seconds" })}</p>;
 */
export function useTranslations() {
  const params = useParams();
  // Extract locale from URL params, default to "en"
  const locale = (params?.lang as Locale) || defaultLocale;

  // Use the server-side getTranslations function
  return getTranslations(locale);
}

export type { Locale, TranslationKey, UITranslations };
