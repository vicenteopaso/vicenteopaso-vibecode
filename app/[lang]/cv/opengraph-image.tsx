import type { Locale } from "../../../lib/i18n/locales";
import { createCvOgImage, getOgHomeSize } from "../../../lib/og-home-image";

export const runtime = "edge";
export const revalidate = 3600; // 1 hour

export const size = getOgHomeSize();

export const contentType = "image/png";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function Image({ params }: Props) {
  const { lang } = await params;
  return createCvOgImage(lang);
}
