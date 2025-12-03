/**
 * Supported locales for the application.
 */
export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

/**
 * Default locale for the application.
 */
export const defaultLocale: Locale = "en";

/**
 * Check if a string is a valid locale.
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
