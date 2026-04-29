import "../styles/globals.css";

import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
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
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0c0a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased" style={{ background: "var(--v3-bg)", color: "var(--v3-fg)" }}>
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
            <Script
              id="webmcp-polyfill"
              src="https://unpkg.com/@mcp-b/global@latest/dist/index.iife.js"
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
