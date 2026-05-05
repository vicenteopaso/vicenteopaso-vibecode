import { createCvPdfDownloadResponse } from "@/app/config/cv.server";
import { isValidLocale } from "@/lib/i18n";

export async function GET(
  _request: Request,
  context: { params: Promise<{ lang: string }> },
) {
  const { lang } = await context.params;

  if (!isValidLocale(lang)) {
    return new Response("Not found", { status: 404 });
  }

  return createCvPdfDownloadResponse(lang);
}
