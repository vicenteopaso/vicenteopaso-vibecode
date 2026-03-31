import { NextResponse } from "next/server";

import { logError } from "@/lib/error-logging";
import { getRulesConfig } from "@/lib/static-json";

export const dynamic = "force-static";

export async function GET(_request: Request) {
  try {
    return NextResponse.json(getRulesConfig(), {
      headers: {
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  } catch (error) {
    logError(error, {
      component: "api-rules-route",
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
