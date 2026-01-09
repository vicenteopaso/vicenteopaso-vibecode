import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { locales } from "./lib/i18n/locales";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const acceptLanguage = request.headers.get("accept-language") || "";
  const detectedLocale = acceptLanguage.toLowerCase().startsWith("es")
    ? "es"
    : "en";

  const url = request.nextUrl.clone();
  // Ensure no trailing slash for root redirects
  const newPathname =
    pathname === "/" ? `/${detectedLocale}` : `/${detectedLocale}${pathname}`;
  url.pathname = newPathname;
  return NextResponse.redirect(url, { status: 307 });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets|fonts|.*\\..*|robots.txt|sitemap.xml|site.webmanifest).*)",
  ],
};
