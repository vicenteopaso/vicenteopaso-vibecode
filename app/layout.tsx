import "../styles/globals.css";

import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";
import React from "react";

import { baseMetadata } from "../lib/seo";
import { AnalyticsWrapper } from "./components/AnalyticsWrapper";
import { BrutalistFooter } from "./components/BrutalistFooter";
import { BrutalistNav } from "./components/BrutalistNav";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { GlobalErrorHandler } from "./components/GlobalErrorHandler";
import { LocaleProvider } from "./components/LocaleProvider";
import { SeoJsonLd } from "./components/SeoJsonLd";
import { ThemeProvider } from "./components/ThemeProvider";
import { WebMcpInit } from "./components/WebMcpInit";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const iconsCacheVersion = process.env.NEXT_PUBLIC_ICONS_CACHE_DATE ?? "1";

export const metadata: Metadata = baseMetadata({
  icons: {
    icon: [
      {
        url: `/favicon.svg?v=${iconsCacheVersion}`,
        type: "image/svg+xml",
      },
      {
        url: `/favicon.ico?v=${iconsCacheVersion}`,
      },
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
    ],
    apple: `/apple-touch-icon.png?v=${iconsCacheVersion}`,
    shortcut: `/favicon.ico?v=${iconsCacheVersion}`,
  },
  manifest: "/site.webmanifest",
  other: {
    "msapplication-config": "/browserconfig.xml",
    "msapplication-TileColor": "#0d0c0a",
  },
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f1e7" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0c0a" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the locale forwarded by proxy.ts via the x-locale request header.
  // This allows SSR to emit the correct <html lang> without a client-side fix.
  const headersList = await headers();
  const locale = headersList.get("x-locale") ?? "en";

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body
        className="flex min-h-screen flex-col antialiased"
        style={{ background: "var(--v3-bg)", color: "var(--v3-fg)" }}
      >
        <ThemeProvider>
          <LocaleProvider initialLocale={locale as "en" | "es"}>
            <GlobalErrorHandler />
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <Script
              id="cf-turnstile"
              src="https://challenges.cloudflare.com/turnstile/v0/api.js"
              strategy="afterInteractive"
            />
            <Script
              id="webmcp-polyfill"
              src="https://unpkg.com/@mcp-b/global@2.2.0/dist/index.iife.js"
              integrity="sha384-jyZCmImLqKAc1cMBR6ywp/DUtANftm05MVpAvhlBYCmr+H/7W8IUP5FjRdEf6X41"
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
            <SeoJsonLd />
            <BrutalistNav />
            <ErrorBoundary>
              <main id="main-content" className="flex-1 w-full flex flex-col">
                {children}
              </main>
            </ErrorBoundary>
            <BrutalistFooter />
            <WebMcpInit />
          </LocaleProvider>
        </ThemeProvider>
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
