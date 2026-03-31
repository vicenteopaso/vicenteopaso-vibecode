import { NextResponse } from "next/server";

import { logError } from "@/lib/error-logging";
import { getSourcesConfig } from "@/lib/static-json";

export const dynamic = "force-static";

export async function GET(_request: Request) {
  try {
    return NextResponse.json(getSourcesConfig(), {
      headers: {
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  } catch (error) {
    logError(error, {
      component: "api-sources-route",
      action: "GET",
    });

    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      },
    );
  }
}
