import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { locales } from "./lib/i18n/locales";

/**
 * Middleware to handle locale-based routing and redirects.
 *
 * - Redirects non-locale-prefixed paths to the appropriate locale based on Accept-Language header.
 * - Spanish-locale browsers are redirected to `/es/*` paths.
 * - All other browsers are redirected to `/en/*` paths.
 * - Preserves user's manual locale choice for paths that already include a locale prefix.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
  url.pathname = pathname === "/" ? `/${targetLocale}` : `/${targetLocale}${pathname}`;
  return NextResponse.redirect(url);
}

/**
 * Configure which paths the middleware should run on.
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
     */
    "/((?!_next/static|_next/image|favicon.ico|assets|fonts|api).*)",
  ],
};
