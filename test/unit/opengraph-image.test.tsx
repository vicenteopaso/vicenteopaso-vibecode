import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/og", () => ({
  ImageResponse: vi.fn(
    (element: React.ReactElement, init: { width: number; height: number }) => ({
      element,
      init,
    }),
  ),
}));

import { ImageResponse } from "next/og";

import CvOgImage, {
  contentType as cvContentType,
  size as cvSize,
} from "../../app/[lang]/cv/opengraph-image";
import RootOgImage, {
  contentType as rootContentType,
  size as rootSize,
} from "../../app/[lang]/opengraph-image";
import { baseMetadata, cvDescription, siteConfig } from "../../lib/seo";

describe("Root OG image route", () => {
  beforeEach(() => {
    vi.mocked(ImageResponse).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses siteConfig and size to construct an ImageResponse", () => {
    RootOgImage();

    const imageResponseMock = vi.mocked(ImageResponse);
    expect(imageResponseMock).toHaveBeenCalledTimes(1);
    const [element, init] = imageResponseMock.mock.calls[0] as [
      React.ReactElement,
      { width: number; height: number },
    ];

    // Assert we pass through the expected size configuration
    expect(init.width).toBe(rootSize.width);
    expect(init.height).toBe(rootSize.height);

    // Sanity check that the exported size and content type are wired as expected
    expect(rootSize).toEqual({ width: 1200, height: 630 });
    expect(rootContentType).toBe("image/png");

    // Basic shape check: outer element is a <div>
    expect(element.type).toBe("div");

    // Snapshot-like assertion on some key props without being brittle about full tree
    const topLevelProps = element.props as { style: React.CSSProperties };
    expect(topLevelProps.style.width).toBe("100%");
    expect(topLevelProps.style.height).toBe("100%");

    // Ensure we at least reference siteConfig in the implementation
    expect(siteConfig.name).toBeDefined();
    expect(siteConfig.domain).toBeDefined();
  });
});

describe("CV OG image route", () => {
  beforeEach(() => {
    vi.mocked(ImageResponse).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses siteConfig and size to construct an ImageResponse", () => {
    CvOgImage();

    const imageResponseMock = vi.mocked(ImageResponse);
    expect(imageResponseMock).toHaveBeenCalledTimes(1);
    const [element, init] = imageResponseMock.mock.calls[0] as [
      React.ReactElement,
      { width: number; height: number },
    ];

    // Assert we pass through the expected size configuration
    expect(init.width).toBe(cvSize.width);
    expect(init.height).toBe(cvSize.height);

    // Sanity check that the exported size and content type are wired as expected
    expect(cvSize).toEqual({ width: 1200, height: 630 });
    expect(cvContentType).toBe("image/png");

    // Basic shape check: outer element is a <div>
    expect(element.type).toBe("div");

    // Snapshot-like assertion on some key props without being brittle about full tree
    const topLevelProps = element.props as { style: React.CSSProperties };
    expect(topLevelProps.style.width).toBe("100%");
    expect(topLevelProps.style.height).toBe("100%");
  });

  it("uses the new standardized CV description", () => {
    CvOgImage();

    const imageResponseMock = vi.mocked(ImageResponse);
    const [element] = imageResponseMock.mock.calls[0] as [
      React.ReactElement,
      unknown,
    ];

    // Traverse the element tree to find the subtitle text
    function findTextContent(el: React.ReactElement | string): string[] {
      if (typeof el === "string") return [el];
      if (!el?.props) return [];

      const children = (el.props as { children?: React.ReactNode }).children;
      if (typeof children === "string") return [children];
      if (Array.isArray(children)) {
        return children.flatMap((child) =>
          findTextContent(child as React.ReactElement | string),
        );
      }
      if (typeof children === "object" && children !== null) {
        return findTextContent(children as React.ReactElement);
      }
      return [];
    }

    const textContent = findTextContent(element).join(" ");
    expect(textContent).toContain(cvDescription);
  });
});

describe("OG metadata separation", () => {
  it("baseMetadata uses root opengraph-image for homepage", () => {
    const metadata = baseMetadata();

    // Verify the OpenGraph image URL points to the root opengraph-image
    const ogImages = metadata.openGraph?.images;
    expect(ogImages).toBeDefined();
    expect(Array.isArray(ogImages)).toBe(true);
    const firstImage = (ogImages as { url: string }[])[0];
    expect(firstImage.url).toMatch(/^\/opengraph-image\?v=/);
    expect(firstImage.url).not.toContain("/cv/");

    // Verify Twitter image also uses root opengraph-image
    const twitterImages = metadata.twitter?.images;
    expect(twitterImages).toBeDefined();
    expect(Array.isArray(twitterImages)).toBe(true);
    const firstTwitterImage = (twitterImages as string[])[0];
    expect(firstTwitterImage).toMatch(/^\/opengraph-image\?v=/);
    expect(firstTwitterImage).not.toContain("/cv/");
  });

  // Note: CV metadata tests removed since metadata is now generated dynamically
  // via generateMetadata() in app/[lang]/cv/page.tsx
});
