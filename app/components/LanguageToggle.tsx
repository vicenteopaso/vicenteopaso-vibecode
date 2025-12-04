"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

import type { Locale } from "@/lib/i18n";
import { useTranslations } from "@/lib/i18n";

/**
 * LanguageToggle component for switching between locales.
 *
 * Enables users to toggle between supported languages (EN/ES).
 * Uses Next.js router navigation to switch between locale routes (/en, /es).
 * Reads locale directly from pathname for reliability.
 */
export function LanguageToggle() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // Extract locale from pathname (always starts with /en or /es)
  // Fallback to /en if pathname is undefined (e.g., in tests)
  const pathSegments = (pathname || "/en").split("/").filter(Boolean);
  const currentLocale = (
    pathSegments[0] === "en" || pathSegments[0] === "es"
      ? pathSegments[0]
      : "en"
  ) as Locale;
  const nextLocale: Locale = currentLocale === "en" ? "es" : "en";

  const handleToggle = async () => {
    setIsLoading(true);

    try {
      // Replace the locale in the pathname
      // pathname is like /en, /en/cv, /es, /es/cv
      const safePath = pathname || "/en";
      const newPath = safePath.replace(`/${currentLocale}`, `/${nextLocale}`);

      // Navigate to new locale path
      await router.push(newPath as `/${string}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className="inline-flex h-8 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] px-3 text-xs font-medium text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
      aria-label={t("language.toggle")}
      title={`Switch to ${nextLocale.toUpperCase()}`}
    >
      {nextLocale.toUpperCase()}
    </button>
  );
}
