import { NextResponse } from "next/server";

export const dynamic = "force-static";

function getPreferredProfileLocale(request: Request): "en" | "es" {
  const langHeader = request.headers.get("accept-language") || "";
  const preferredLang = langHeader.split(",")[0]?.slice(0, 2) || "";

  return preferredLang === "es" ? "es" : "en";
}

export async function GET(request: Request) {
  const locale = getPreferredProfileLocale(request);
  const url = new URL(request.url);
  url.pathname = `/api/profile/${locale}`;

  return NextResponse.redirect(url, { status: 307 });
}
