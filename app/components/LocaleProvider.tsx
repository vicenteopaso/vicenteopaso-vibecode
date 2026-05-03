"use client";

import { useParams } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

import type { Locale } from "@/lib/i18n";
import { defaultLocale, locales } from "@/lib/i18n";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  // Sync locale with URL params and storage
  useEffect(() => {
    const urlLocale = (params?.lang as Locale) || defaultLocale;
    if (locales.includes(urlLocale)) {
      setLocaleState(urlLocale);
      localStorage.setItem("preferred-locale", urlLocale);
      // Set cookie so proxy.ts can respect user's manual selection
      document.cookie = `preferred-locale=${urlLocale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
      // Keep the <html lang> attribute in sync for accessibility/SEO
      document.documentElement.lang = urlLocale;
    }
    setMounted(true);
  }, [params?.lang]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("preferred-locale", newLocale);
    document.cookie = `preferred-locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    document.documentElement.lang = newLocale;
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    return { locale: defaultLocale, setLocale: () => {} };
  }
  return context;
}
