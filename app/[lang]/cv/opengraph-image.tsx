import { ImageResponse } from "next/og";

import type { Locale } from "../../../lib/i18n/locales";
import { cvDescription, siteConfig } from "../../../lib/seo";

export const runtime = "edge";
export const revalidate = 3600; // 1 hour

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type Props = {
  params: Promise<{ lang: Locale }>;
};

export default async function Image({ params }: Props) {
  const { lang } = await params;
  const title = `${siteConfig.name} · CV`;
  const badge = lang === "es" ? "Currículum Vitae" : "Curriculum Vitae";
  const footer =
    lang === "es"
      ? "Experiencia · Habilidades · Publicaciones · Referencias"
      : "Experience · Skills · Publications · References";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 96px",
        background:
          "radial-gradient(circle at top left, #020617 0, #020617 40%, #020617 100%)",
        color: "#e5e7eb",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 14px",
            borderRadius: 9999,
            background: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(148, 163, 184, 0.6)",
            fontSize: 20,
            color: "#e5e7eb",
            textTransform: "uppercase",
            letterSpacing: 3,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              background: "#38bdf8",
            }}
          />
          <span>{badge}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h1
            style={{
              fontSize: 68,
              letterSpacing: -1.5,
              fontWeight: 700,
              color: "#f9fafb",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 26,
              maxWidth: "50rem",
              lineHeight: 1.4,
              color: "#cbd5f5",
            }}
          >
            {cvDescription}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 22,
          color: "#94a3b8",
        }}
      >
        <span>{footer}</span>
        <span>{siteConfig.domain}/cv</span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
