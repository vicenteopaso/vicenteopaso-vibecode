"use client";

import React, { useState } from "react";

import { useTranslations } from "@/lib/i18n";

/**
 * LanguageToggle component for switching between locales.
 *
 * Note: In Task 1, this is a placeholder/demo component that shows the UI for locale switching.
 * Full locale routing with /es paths will be implemented when the App Router structure
 * is updated to support dynamic [lang] segments in a future task.
 *
 * For now, this component:
 * - Shows EN/ES toggle in the UI
 * - Demonstrates the translation key usage
 * - Prepares the foundation for future locale routing
 */
export function LanguageToggle() {
  const t = useTranslations();
  const [showMessage, setShowMessage] = useState(false);
  
  // For now, we're always on English. Full routing will be added later.
  const currentLocale = "en";
  const nextLocale = currentLocale === "en" ? "es" : "en";

  const handleToggle = () => {
    // Placeholder: In future implementation, this will use Next.js router
    // to navigate to the locale-prefixed path (e.g., /es/cv)
    // eslint-disable-next-line no-console
    console.log(
      `Language toggle clicked. Would navigate to: /${nextLocale === "en" ? "" : nextLocale}`,
    );

    // Show a temporary non-blocking message
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 4000);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex h-8 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] px-3 text-xs font-medium text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        aria-label={t("language.toggle")}
        title={t("language.toggle")}
      >
        {nextLocale.toUpperCase()}
      </button>
      
      {showMessage && (
        <div
          role="status"
          aria-live="polite"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-3 text-xs text-[color:var(--text-primary)] shadow-lg"
        >
          Language switching to {nextLocale.toUpperCase()} will be fully
          implemented in Task 2. For now, all content is in English.
        </div>
      )}
    </div>
  );
}
