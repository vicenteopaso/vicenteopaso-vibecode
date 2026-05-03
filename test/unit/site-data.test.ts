import { describe, expect, it } from "vitest";

import {
  CV_TOC,
  getSiteData,
  SITE_BRANDS,
  SITE_FOCUS,
  SITE_IMPACT,
  SITE_TLDR,
  SITE_TLDR_LABELS,
} from "../../lib/site-data";

describe("site data helpers", () => {
  it("returns English site data by default", () => {
    const data = getSiteData();

    expect(data.tldr).toEqual(SITE_TLDR);
    expect(data.tldrLabels).toEqual(SITE_TLDR_LABELS);
    expect(data.focus).toEqual(SITE_FOCUS);
    expect(data.impact).toEqual(SITE_IMPACT);
    expect(data.cvToc).toEqual(CV_TOC);
  });

  it("returns Spanish site data when requested", () => {
    const data = getSiteData("es");

    expect(data.cvToc.length).toBeGreaterThan(0);
    expect(data.tldr.length).toBeGreaterThan(0);
  });

  it("falls back to English site data for unsupported locales", () => {
    const data = getSiteData("fr" as never);

    expect(data.tldr).toEqual(SITE_TLDR);
    expect(data.cvToc).toEqual(CV_TOC);
  });

  it("keeps the exported brand list intact", () => {
    expect(SITE_BRANDS).toContain("Nexthink");
    expect(SITE_BRANDS).toContain("Nokia");
  });
});
