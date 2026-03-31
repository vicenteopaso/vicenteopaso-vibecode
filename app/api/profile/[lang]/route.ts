import { NextResponse } from "next/server";

import { logError } from "@/lib/error-logging";
import { isValidLocale } from "@/lib/i18n";
import { getCanonicalProfile } from "@/lib/profile";

export const dynamic = "force-static";

export async function GET(
  _request: Request,
  context: { params: Promise<{ lang: string }> },
) {
  const { lang } = await context.params;

  if (!isValidLocale(lang)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const profile = getCanonicalProfile(lang);
    return NextResponse.json(profile);
  } catch (error) {
    logError(error, {
      component: "api-profile-route",
      action: "GET",
      metadata: { lang },
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
