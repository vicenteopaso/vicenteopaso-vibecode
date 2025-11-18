import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "../styles/globals.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ThemeProvider } from "./components/ThemeProvider";
import { SeoJsonLd } from "./components/SeoJsonLd";
import { baseMetadata } from "../lib/seo";

export const metadata: Metadata = baseMetadata({
  icons: {
    icon: [
      {
        url: "/assets/images/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/assets/images/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      { url: "/assets/images/favicon.ico" },
    ],
    apple: "/assets/images/apple-touch-icon.png",
    shortcut: "/assets/images/favicon.ico",
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
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <Script
            id="cf-turnstile"
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="afterInteractive"
          />
          <SeoJsonLd />
          <Header />
          <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
