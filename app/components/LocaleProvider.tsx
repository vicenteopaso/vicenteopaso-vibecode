"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Locale } from "@/lib/i18n";
import { defaultLocale, locales } from "@/lib/i18n";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function persistLocale(locale: Locale) {
  localStorage.setItem("preferred-locale", locale);
  document.cookie = `preferred-locale=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
  document.documentElement.lang = locale;
}

export function LocaleProvider({
  initialLocale = defaultLocale,
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Keep client locale in sync with the active route locale across App Router navigations.
  useEffect(() => {
    setLocaleState(initialLocale);
    persistLocale(initialLocale);
  }, [initialLocale]);

  const setLocale = useCallback((newLocale: Locale) => {
    if (!locales.includes(newLocale)) return;
    setLocaleState(newLocale);
    persistLocale(newLocale);
  }, []);

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
