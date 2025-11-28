module.exports = {
  ci: {
    collect: {
      // Start the dev server before running Lighthouse
      startServerCommand: "pnpm build && pnpm start",
      startServerReadyPattern: "Ready",
      startServerReadyTimeout: 60000,
      // URLs to audit
      url: [
        "http://localhost:3000",
        "http://localhost:3000/cv",
      ],
      numberOfRuns: 3, // Run Lighthouse multiple times and average the results
      settings: {
        // Lighthouse settings
        preset: "desktop",
        // Use Playwright's Chromium if available (for local dev container)
        chromePath:
          process.env.CHROME_PATH ||
          (process.env.HOME
            ? `${process.env.HOME}/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome`
            : undefined),
        throttling: {
          // Use moderate throttling for CI
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        // Skip certain audits that may be flaky in CI
        skipAudits: ["uses-http2"],
      },
    },
    assert: {
      // Define thresholds for each category
      // Note: Set to current baseline scores to prevent regressions
      // These should be incrementally improved over time
      assertions: {
        "categories:performance": ["warn", { minScore: 0.7 }],
        "categories:accessibility": ["warn", { minScore: 0.7 }],
        "categories:best-practices": ["warn", { minScore: 0.7 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        // Additional specific assertions for critical metrics
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],
        "speed-index": ["warn", { maxNumericValue: 3000 }],
        // Accessibility-specific assertions (warnings to track issues)
        "color-contrast": "warn",
        "html-has-lang": "error",
        "meta-viewport": "error",
        "document-title": "error",
        // SEO-specific assertions
        "meta-description": "error",
        "link-text": "error",
        "is-crawlable": "error",
        "robots-txt": "warn",
      },
    },
    upload: {
      // Store results for comparison (can be extended with LHCI server)
      target: "temporary-public-storage",
      // If you set up a Lighthouse CI server, configure it here:
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: process.env.LHCI_TOKEN,
    },
  },
};
