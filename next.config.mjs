import { withContentlayer } from "next-contentlayer";
import { withSentryConfig } from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: Next.js, Cloudflare Turnstile, inline Next/scripts
      "script-src 'self' https://challenges.cloudflare.com 'unsafe-inline'",
      // Styles from self + inline (for Next.js style tags and Tailwind)
      "style-src 'self' 'unsafe-inline'",
      // Images from this origin or inlined as data URIs
      "img-src 'self' data:",
      // Fonts from self or inlined
      "font-src 'self' data:",
      // Allow Turnstile frames
      "frame-src https://challenges.cloudflare.com",
      // XHR/fetch endpoints
      "connect-src 'self' https://challenges.cloudflare.com https://formspree.io",
      // Where forms can POST to
      "form-action 'self' https://formspree.io",
      // Disallow changing base URL
      "base-uri 'self'",
      // Clickjacking protection (also see X-Frame-Options below)
      "frame-ancestors 'none'",
      // Enforce HTTPS for subresources when possible
      "upgrade-insecure-requests",
      // Note: Trusted Types enforcement is disabled for now because
      // Next.js and some dev tooling still use innerHTML/script.src
      // without providing TrustedHTML/TrustedScriptURL objects.
      // When the framework/tooling supports Trusted Types, you can
      // reintroduce directives like:
      //   require-trusted-types-for 'script'; trusted-types nextjs#bundler;
    ].join("; "),
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "geolocation=(), microphone=(), camera=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  turbopack: {},
  productionBrowserSourceMaps: true,
  async headers() {
    if (!isProd) {
      // In development, avoid setting CSP and other security headers so
      // that tooling, extensions, and dev-only scripts don't trigger
      // noisy console errors or interfere with DX.
      return [];
    }

    const oneDaySeconds = 60 * 60 * 24;

    return [
      // Global security headers
      {
        source: "/(.*)",
        headers: securityHeaders,
      },

      // CV PDF: strong edge cache, 1-day browser cache
      {
        source: "/assets/vicente-opaso-cv-2025.pdf",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${oneDaySeconds}, s-maxage=31536000, stale-while-revalidate=60`,
          },
        ],
      },

      // Other static assets: long-lived, immutable
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // Fonts: long-lived, immutable
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

// Sentry configuration options
// See: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const sentryWebpackPluginOptions = {
  // Suppress all Sentry warnings and errors during the build
  silent: true,

  // Organization and project for uploading source maps
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token is required for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Source maps configuration
  sourcemaps: {
    // Automatically delete source maps after upload to avoid exposing them to users
    // This will default to true in future SDK versions
    deleteSourcemapsAfterUpload: true,

    // Disable source map generation if no auth token is provided
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },

  // Additional configuration options
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
};

// Only apply Sentry config if the minimum required env vars are set
// This prevents build warnings when Sentry is not configured
const shouldUseSentry =
  process.env.SENTRY_DSN ||
  process.env.NEXT_PUBLIC_SENTRY_DSN ||
  process.env.SENTRY_AUTH_TOKEN;

export default shouldUseSentry
  ? withSentryConfig(withContentlayer(nextConfig), sentryWebpackPluginOptions)
  : withContentlayer(nextConfig);
