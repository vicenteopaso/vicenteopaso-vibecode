import type { Metadata } from "next";

export const siteConfig = {
  name: "Vicente Opaso",
  domain: "opa.so",
  url: "https://opa.so",
  description:
    "Web Engineering Manager & Frontend Architect specializing in composable platforms, design systems and developer experience. View the CV, case studies and contact details for Vicente Opaso.",
};

export function baseMetadata(overrides: Partial<Metadata> = {}): Metadata {
  const base: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} — Engineering Leadership & Vibecode`,
      template: `%s — ${siteConfig.name}`,
    },
    description: siteConfig.description,
    openGraph: {
      type: "website",
      url: siteConfig.url,
      title: siteConfig.name,
      description: siteConfig.description,
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
      "Web Engineering Manager & Frontend Architect specializing in composable platforms, design systems and developer experience.",
  } as const;
}
