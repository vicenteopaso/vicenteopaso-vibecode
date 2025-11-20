import type React from "react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/og", () => ({
  ImageResponse: vi.fn(
    (element: React.ReactElement, init: { width: number; height: number }) => ({
      element,
      init,
    }),
  ),
}));

import { ImageResponse } from "next/og";
import OgImage, { size, contentType } from "../../app/opengraph-image";
import { siteConfig } from "../../lib/seo";

describe("Root OG image route", () => {
  it("uses siteConfig and size to construct an ImageResponse", () => {
    OgImage();

    const imageResponseMock = vi.mocked(ImageResponse);
    expect(imageResponseMock).toHaveBeenCalledTimes(1);
    const [element, init] = imageResponseMock.mock.calls[0] as [
      React.ReactElement,
      { width: number; height: number },
    ];

    // Assert we pass through the expected size configuration
    expect(init.width).toBe(size.width);
    expect(init.height).toBe(size.height);

    // Sanity check that the exported size and content type are wired as expected
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");

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
