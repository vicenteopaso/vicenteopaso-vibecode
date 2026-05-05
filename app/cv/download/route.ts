import { createCvPdfDownloadResponse } from "@/app/config/cv.server";

export async function GET() {
  return createCvPdfDownloadResponse("en");
}
