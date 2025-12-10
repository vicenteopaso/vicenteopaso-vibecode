import type { Metadata } from "next";

export const siteConfig = {
  name: "Vicente Opaso",
  domain: "opa.so",
  url: "https://opa.so",
  description:
    "Web Engineering Manager & Frontend Architect specializing in Composable Platforms, Design Systems and Developer Experience (DevEx). View the CV and contact details for Vicente Opaso.",
};

/**
 * Standardized description for CV-related Open Graph metadata.
 * Used in CV page metadata and OG image generation.
 * @param locale - The locale to use for the description
 * @returns Localized CV description
 */
export function getCvDescription(locale: string): string {
  return locale === "es"
    ? "Roles Seleccionados de Liderazgo Técnico: Experiencia del Desarrollador (DevEx), Impacto en Ingeniería de Software, y Liderazgo en Design Systems."
    : "Selected Technical Leadership Roles: Developer Experience (DevEx), Software Engineering Impact, and Design Systems Leadership.";
}

export const ogCacheVersion = process.env.NEXT_PUBLIC_OG_CACHE_DATE ?? "1";

export function baseMetadata(overrides: Partial<Metadata> = {}): Metadata {
  const base: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name}  Software Engineering Leader & Frontend Architect`,
      template: `%s  ${siteConfig.name}`,
    },
    description: siteConfig.description,
    openGraph: {
      type: "website",
      url: siteConfig.url,
      title: siteConfig.name,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: `/opengraph-image?v=${ogCacheVersion}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
      site: "@vicenteopaso",
      creator: "@vicenteopaso",
      images: [`/opengraph-image?v=${ogCacheVersion}`],
    },
  };

  return { ...base, ...overrides };
}

export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
  } as const;
}

export function getPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: siteConfig.url,
    jobTitle:
      "Web Engineering Manager & Frontend Architect specializing in Composable Platforms, Design Systems and Developer Experience (DevEx).",
  } as const;
}
