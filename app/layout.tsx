import "../styles/globals.css";

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import React from "react";

import { baseMetadata } from "../lib/seo";
import { AnalyticsWrapper } from "./components/AnalyticsWrapper";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Footer } from "./components/Footer";
import { GlobalErrorHandler } from "./components/GlobalErrorHandler";
import { Header } from "./components/Header";
import { LocaleProvider } from "./components/LocaleProvider";
import { SeoJsonLd } from "./components/SeoJsonLd";
import { ThemeProvider } from "./components/ThemeProvider";

const iconsCacheVersion = process.env.NEXT_PUBLIC_ICONS_CACHE_DATE ?? "1";

export const metadata: Metadata = baseMetadata({
  icons: {
    icon: [
      {
        url: `/assets/images/favicon-32x32.png?v=${iconsCacheVersion}`,
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: `/assets/images/favicon-16x16.png?v=${iconsCacheVersion}`,
        sizes: "16x16",
        type: "image/png",
      },
      { url: `/assets/images/favicon.ico?v=${iconsCacheVersion}` },
    ],
    apple: `/assets/images/apple-touch-icon.png?v=${iconsCacheVersion}`,
    shortcut: `/assets/images/favicon.ico?v=${iconsCacheVersion}`,
  },
  manifest: "/site.webmanifest",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider>
          <LocaleProvider>
            <GlobalErrorHandler />
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <Script
              id="cf-turnstile"
              src="https://challenges.cloudflare.com/turnstile/v0/api.js"
              strategy="afterInteractive"
            />
            <SeoJsonLd />
            <Header />
            <ErrorBoundary>
              <main
                id="main-content"
                className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8"
              >
                {children}
              </main>
            </ErrorBoundary>
            <Footer />
          </LocaleProvider>
        </ThemeProvider>
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
