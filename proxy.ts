import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { locales } from "./lib/i18n/locales";

/**
 * Proxy to handle locale-based routing and redirects.
 *
 * - Redirects non-locale-prefixed paths to the appropriate locale based on Accept-Language header.
 * - Spanish-locale browsers are redirected to `/es/*` paths.
 * - All other browsers are redirected to `/en/*` paths.
 * - Preserves user's manual locale choice for paths that already include a locale prefix.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
    return NextResponse.redirect(url, {
      status: 301,
    });
  }

  // Block common attack vectors and bot probes
  const suspiciousPatterns = [
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
  ];

  if (suspiciousPatterns.some((pattern) => pathname.startsWith(pattern))) {
    return new NextResponse(null, { status: 404 });
  }

  // Check if the pathname already includes a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  // If locale is already in the path, continue without modification
  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Handle all paths without locale prefix for automatic language detection
  const langHeader = req.headers.get("accept-language") || "";
  const preferredLang = langHeader.split(",")[0]?.slice(0, 2);

  // Redirect Spanish-locale browsers to /es, others to /en
  const targetLocale = preferredLang === "es" ? "es" : "en";
  const url = req.nextUrl.clone();
  // Handle root path specially to avoid double slash
  url.pathname =
    pathname === "/" ? `/${targetLocale}` : `/${targetLocale}${pathname}`;
  return NextResponse.redirect(url, { status: 307 });
}

/**
 * Configure which paths the proxy should run on.
 * We want to run on all paths except static files and API routes.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (files in /public)
     * - API routes
     * - Next.js metadata routes (opengraph-image, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|assets|fonts|robots.txt|sitemap.xml|sitemap-0.xml|site.webmanifest|opengraph-image).*)",
  ],
};
