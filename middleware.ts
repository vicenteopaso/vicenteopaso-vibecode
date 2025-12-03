import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { locales } from "./lib/i18n/locales";

/**
 * Middleware to handle locale-based routing and redirects.
 *
 * - Redirects Spanish-locale browsers from `/` to `/es` on first visit.
 * - Preserves user's manual locale choice after initial redirect.
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

  // Only handle the root path for automatic language detection
  if (pathname === "/") {
    const langHeader = req.headers.get("accept-language") || "";
    const preferredLang = langHeader.split(",")[0]?.slice(0, 2);

    // Redirect Spanish-locale browsers to /es
    if (preferredLang === "es") {
      const url = req.nextUrl.clone();
      url.pathname = "/es";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
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
