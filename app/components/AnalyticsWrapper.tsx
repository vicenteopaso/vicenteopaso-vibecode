"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect, useState } from "react";

export function AnalyticsWrapper() {
  const [shouldRender, setShouldRender] = useState<boolean>(true);

  useEffect(() => {
    // Check if we're in a test environment by looking for common test indicators
    const isTest =
      // Playwright sets this via window object in tests
      typeof window !== "undefined" &&
      ((window.navigator as Navigator & { webdriver?: boolean }).webdriver ===
        true ||
        (window as Window & { __PLAYWRIGHT__?: boolean }).__PLAYWRIGHT__ ===
          true ||
        // Check if running in headless browser (common in tests)
        /HeadlessChrome/.test(window.navigator.userAgent));

    if (isTest) {
      setShouldRender(false);
    }
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
