import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { locales } from "./lib/i18n/locales";

// Block common attack vectors and bot probes
const SUSPICIOUS_PATTERNS = [
  "/wp-login.php",
  "/wp-admin",
  "/xmlrpc.php",
  "/wp-content",
  "/wp-includes",
  "/.env",
  "/.git",
  "/admin",
  "/phpmyadmin",
  "/administrator",
  "/user/login",
  "/sites/default",
  "/config.php",
  "/typo3",
  "/cgi-bin",
] as const;

type Locale = (typeof locales)[number];
const defaultLocale: Locale = "en";

/**
 * Determine the best locale for the request:
 * 1. User's stored cookie preference (set when manually switching language)
 * 2. Browser's Accept-Language header
 * 3. Default locale (en)
 */
function detectLocale(req: NextRequest): Locale {
  // 1. Stored preference cookie
  const cookieLocale = req.cookies?.get("preferred-locale")?.value;
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale as Locale;
  }

  // 2. Accept-Language header
  const langHeader = req.headers.get("accept-language") ?? "";
  const preferredLangs = langHeader
    .split(",")
    .map((item) => {
      const parts = item.trim().split(";");
      const lang = (parts[0] ?? "").trim().toLowerCase().slice(0, 2);
      const qPart = parts.find((p) => /^\s*q\s*=/i.test(p));
      const q = qPart ? parseFloat(qPart.replace(/^\s*q\s*=\s*/i, "")) : 1;
      return { lang, q: Number.isFinite(q) ? q : 0 };
    })
    .sort((a, b) => b.q - a.q)
    .map(({ lang }) => lang);

  for (const lang of preferredLangs) {
    const match = (locales as readonly string[]).find((l) => l === lang);
    if (match) return match as Locale;
  }

  // 3. Default
  return defaultLocale;
}

/**
 * Proxy to handle locale-based routing and redirects.
 *
 * - Redirects non-locale-prefixed paths to the appropriate locale.
 * - Priority: stored cookie preference → Accept-Language header → default (en)
 * - Preserves user's manual locale choice for paths that already include a locale prefix.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/cv/download") {
    return NextResponse.next();
  }

  // Redirect localized sitemap requests to root sitemap
  if (
    pathname === "/en/sitemap.xml" ||
    pathname === "/es/sitemap.xml" ||
    pathname === "/en/sitemap-0.xml" ||
    pathname === "/es/sitemap-0.xml" ||
    pathname === "/en/news_sitemap.xml" ||
    pathname === "/es/news_sitemap.xml"
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/sitemap.xml";
    return NextResponse.redirect(url, { status: 301 });
  }

  if (SUSPICIOUS_PATTERNS.some((pattern) => pathname.startsWith(pattern))) {
    return new NextResponse(null, { status: 404 });
  }

  // If locale is already in the path, continue without modification
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    // Forward the active locale as a request header so the root layout can set
    // the HTML lang attribute server-side (avoids SSR/hydration mismatch).
    const activeLocale =
      (locales.find(
        (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`,
      ) as Locale | undefined) ?? defaultLocale;
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-locale", activeLocale);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Detect locale and redirect
  const targetLocale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname =
    pathname === "/" ? `/${targetLocale}` : `/${targetLocale}${pathname}`;
  return NextResponse.redirect(url, { status: 307 });
}

/**
 * Configure which paths the proxy should run on.
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets|fonts|sitemap-0.xml|news_sitemap.xml|opengraph-image|.*\\..*|robots.txt|sitemap.xml|site.webmanifest).*)",
  ],
};
