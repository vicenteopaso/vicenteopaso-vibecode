import type { Locale } from "../../lib/i18n/locales";
import { createHomeOgImage, getOgHomeSize } from "../../lib/og-home-image";

export const runtime = "nodejs";

// Cache forever — invalidation is handled by bumping NEXT_PUBLIC_OG_CACHE_DATE
// (see ogCacheVersion in lib/seo.ts), which is appended to the image URL as a
// version query string.
export const revalidate = false;

export const size = getOgHomeSize();

export const contentType = "image/png";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function Image({ params }: Props) {
  const { lang } = await params;
  return createHomeOgImage(lang, "dark");
}
