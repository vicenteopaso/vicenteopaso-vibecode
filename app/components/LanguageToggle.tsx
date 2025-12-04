"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

import type { Locale } from "@/lib/i18n";
import { useTranslations } from "@/lib/i18n";

import { useLocale } from "./LocaleProvider";

/**
 * LanguageToggle component for switching between locales.
 *
 * Enables users to toggle between supported languages (EN/ES).
 * Uses Next.js router navigation to switch between locale routes (/en, /es).
 * Context + localStorage provides immediate UI feedback during navigation.
 */
export function LanguageToggle() {
  const t = useTranslations();
  const { locale, setLocale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const nextLocale: Locale = locale === "en" ? "es" : "en";

  const handleToggle = () => {
    setIsLoading(true);

    // Update context immediately for UI feedback
    setLocale(nextLocale);

    // Build new path with new locale
    // Current path might be /en/cv or /es/cv, we want to replace the locale
    const segments = pathname.split("/").filter(Boolean);
    const currentLocale = segments[0];

    // If the current path starts with a locale, replace it
    const newPath =
      currentLocale === "en" || currentLocale === "es"
        ? `/${nextLocale}${pathname.substring(currentLocale.length + 1)}`
        : `/${nextLocale}${pathname}`;

    // Navigate to new locale path
    router.push(newPath as `/${string}`);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className="inline-flex h-8 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] px-3 text-xs font-medium text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      aria-label={t("language.toggle")}
      title={`Switch to ${nextLocale.toUpperCase()}`}
    >
      {nextLocale.toUpperCase()}
    </button>
  );
}
