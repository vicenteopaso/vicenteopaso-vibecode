import React from "react";
import { ImageResponse } from "next/og";
import { siteConfig } from "../lib/seo";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  const title = siteConfig.name;
  const subtitle =
    "Web Engineering Manager & Frontend Architect · Design Systems, Developer Experience, and Composable platforms";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 96px",
          background:
            "radial-gradient(circle at top left, #0f172a 0, #020617 40%, #000 100%)",
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
              background: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(148, 163, 184, 0.5)",
              fontSize: 20,
              color: "#e5e7eb",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 9999,
                background: "#38bdf8",
              }}
            />
            <span>Engineering leadership, design systems & DX</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h1
              style={{
                fontSize: 72,
                letterSpacing: -1.5,
                fontWeight: 700,
                color: "#f9fafb",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: 28,
                maxWidth: "48rem",
                lineHeight: 1.4,
                color: "#cbd5f5",
              }}
            >
              {subtitle}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#94a3b8",
          }}
        >
          <span>{siteConfig.domain}</span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: "9999px",
                background:
                  "radial-gradient(circle at 30% 30%, #38bdf8, #22c55e 60%, #a855f7 100%)",
                boxShadow: "0 0 32px rgba(56, 189, 248, 0.5)",
              }}
            />
            <span>opa.so</span>
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
