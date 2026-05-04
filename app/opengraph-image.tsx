import { createHomeOgImage, getOgHomeSize } from "../lib/og-home-image";

export const runtime = "edge";

export const size = getOgHomeSize();

export const contentType = "image/png";

export default async function Image() {
  return createHomeOgImage();
}
