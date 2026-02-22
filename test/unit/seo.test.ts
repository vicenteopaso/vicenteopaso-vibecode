import { describe, expect, it, vi } from "vitest";

describe("seo utilities", () => {
  it("returns localized CV description", async () => {
    const { getCvDescription } = await import("../../lib/seo");
    expect(getCvDescription("es")).toMatch("Roles Seleccionados");
    expect(getCvDescription("en")).toMatch("Selected Technical Leadership");
  });

  it("builds base metadata and applies overrides", async () => {
    const { baseMetadata, siteConfig } = await import("../../lib/seo");
    const metadata = baseMetadata({ title: "Custom Title" });

    expect(metadata.description).toBe(siteConfig.description);
    expect(metadata.openGraph?.url).toBe(siteConfig.url);
    expect(metadata.title).toBe("Custom Title");
  });

  it("uses default og cache version when env is unset", async () => {
    const originalEnv = process.env.NEXT_PUBLIC_OG_CACHE_DATE;
    delete process.env.NEXT_PUBLIC_OG_CACHE_DATE;
    vi.resetModules();

    const { baseMetadata } = await import("../../lib/seo");
    const metadata = baseMetadata();
    const images = metadata.openGraph?.images as { url: string }[];

    expect(images[0].url).toContain("v=1");

    if (originalEnv) {
      process.env.NEXT_PUBLIC_OG_CACHE_DATE = originalEnv;
    }
  });

  it("uses env-provided og cache version", async () => {
    const originalEnv = process.env.NEXT_PUBLIC_OG_CACHE_DATE;
    process.env.NEXT_PUBLIC_OG_CACHE_DATE = "123";
    vi.resetModules();

    const { baseMetadata } = await import("../../lib/seo");
    const metadata = baseMetadata();
    const images = metadata.openGraph?.images as { url: string }[];

    expect(images[0].url).toContain("v=123");

    if (originalEnv) {
      process.env.NEXT_PUBLIC_OG_CACHE_DATE = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_OG_CACHE_DATE;
    }
  });

  it("returns website and person JSON-LD", async () => {
    const { getWebsiteJsonLd, getPersonJsonLd, siteConfig } =
      await import("../../lib/seo");

    const website = getWebsiteJsonLd();
    expect(website["@type"]).toBe("WebSite");
    expect(website.url).toBe(siteConfig.url);

    const person = getPersonJsonLd();
    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe(siteConfig.name);
    expect(person.sameAs.length).toBeGreaterThan(0);
  });

  it("returns CV JSON-LD and publications", async () => {
    const { getCvJsonLd, getPublicationsJsonLd } =
      await import("../../lib/seo");

    const cv = getCvJsonLd();
    expect(cv["@type"]).toBe("ProfilePage");
    expect(cv.mainEntity["@type"]).toBe("Person");

    const publications = getPublicationsJsonLd();
    expect(publications.itemListElement.length).toBeGreaterThanOrEqual(3);
    expect(publications.itemListElement[0].position).toBe(1);
  });

  it("returns skills JSON-LD taxonomy", async () => {
    const { getSkillsJsonLd } = await import("../../lib/seo");
    const skills = getSkillsJsonLd();

    expect(skills["@type"]).toBe("ItemList");
    expect(skills.itemListElement.length).toBeGreaterThan(0);
    expect(skills.itemListElement[0].item["@type"]).toBe("DefinedTerm");
  });
});
