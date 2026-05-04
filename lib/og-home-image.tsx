import { ImageResponse } from "next/og";

import { getCvDescription, siteConfig } from "./seo";

type OgLocale = "en" | "es";

const size = {
  width: 1200,
  height: 630,
} as const;

const palette = {
  ink: "#0c0b09",
  cream: "#f0ebe1",
  red: "#cf201d",
  muted: "#8f897f",
  panelRule: "#cfc7bb",
  panelMuted: "#7d776f",
};

const ogLogoSrc =
  "data:image/png;base64,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";

const homeContentByLocale: Record<
  OgLocale,
  {
    navAbout: string;
    navContact: string;
    roleLabel: string;
    summaryLabel: string;
    summaryPrefix: string;
    highlightedWord: string;
    subtitle: string;
    basedLabel: string;
    statusLabel: string;
    status: string;
  }
> = {
  en: {
    navAbout: "ABOUT",
    navContact: "CONTACT",
    roleLabel: "FRONTEND ARCHITECT × ENG. MANAGER",
    summaryLabel: "TL;DR",
    summaryPrefix:
      "15 years shipping on the web. 10 in telecom before that. Currently open to my ",
    highlightedWord: "next challenge.",
    subtitle:
      "Web Engineering Manager & Frontend Architect — composable platforms, design systems, and the teams behind them.",
    basedLabel: "BASED",
    statusLabel: "STATUS",
    status: "Open to roles",
  },
  es: {
    navAbout: "PERFIL",
    navContact: "CONTACTO",
    roleLabel: "ARQUITECTO FRONTEND × GERENTE DE ING.",
    summaryLabel: "RESUMEN",
    summaryPrefix:
      "15 años creando para la web. 10 en telecom antes de eso. Actualmente abierto a mi ",
    highlightedWord: "próximo reto.",
    subtitle:
      "Gerente de Ingeniería Web y Arquitecto Frontend — plataformas componibles, design systems y los equipos detrás de ellas.",
    basedLabel: "BASE",
    statusLabel: "ESTADO",
    status: "Abierto a roles",
  },
};

function renderBrandedOgImage({
  locale,
  eyebrow,
  titleFirstLine,
  titleSecondLine,
  subtitle,
  panelLabel,
  panelPrefix,
  panelHighlight,
  bottomLeftLabel,
  bottomLeftValue,
  bottomRightLabel,
  bottomRightValue,
}: {
  locale: OgLocale;
  eyebrow: string;
  titleFirstLine: string;
  titleSecondLine: string;
  subtitle: string;
  panelLabel: string;
  panelPrefix: string;
  panelHighlight: string;
  bottomLeftLabel: string;
  bottomLeftValue: string;
  bottomRightLabel: string;
  bottomRightValue: string;
}) {
  const homeCopy = homeContentByLocale[locale];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: palette.ink,
        color: palette.cream,
        fontFamily:
          '"Arial", "Helvetica Neue", Helvetica, ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "28px 32px 18px",
          borderBottom: `2px solid ${palette.cream}`,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          fontSize: 17,
          color: palette.muted,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- next/image is not available inside next/og ImageResponse markup */}
          <img
            src={ogLogoSrc}
            alt="Opaso logo"
            width={46}
            height={46}
            style={{ display: "flex" }}
          />
          <span>/V2026</span>
          <span>—</span>
          <span style={{ color: palette.red }}>● MÁLAGA, ES</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span>{homeCopy.navAbout}</span>
          <span>·</span>
          <span>CV</span>
          <span>·</span>
          <span>{homeCopy.navContact}</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          gap: 34,
          padding: "40px 32px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            paddingRight: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: 16,
              color: palette.muted,
              marginBottom: 28,
            }}
          >
            <span style={{ color: palette.red }}>{eyebrow}</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 0.84,
              letterSpacing: "-0.06em",
              fontWeight: 800,
              marginBottom: 28,
            }}
          >
            <span style={{ fontSize: 118, color: palette.cream }}>
              {titleFirstLine}
            </span>
            <span style={{ fontSize: 126, color: palette.red }}>
              {titleSecondLine}
            </span>
          </div>

          <p
            style={{
              margin: 0,
              maxWidth: 700,
              fontSize: 26,
              lineHeight: 1.4,
              letterSpacing: "-0.04em",
              color: palette.cream,
              fontWeight: 600,
            }}
          >
            {subtitle}
          </p>
        </div>

        <div
          style={{
            width: 382,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "22px 22px 20px",
            background: palette.cream,
            color: palette.ink,
            minHeight: 420,
            marginTop: -2,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <span
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: 16,
                color: palette.panelMuted,
              }}
            >
              {panelLabel}
            </span>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                columnGap: 8,
                rowGap: 6,
                fontSize: 26,
                lineHeight: 1.38,
                letterSpacing: "-0.04em",
                fontWeight: 600,
              }}
            >
              <span>{panelPrefix.trim()}</span>
              <span style={{ color: palette.red }}>{panelHighlight}</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              paddingTop: 16,
              borderTop: `1px solid ${palette.panelRule}`,
            }}
          >
            <div style={{ display: "flex", gap: 44 }}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <span
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    fontSize: 14,
                    color: palette.panelMuted,
                  }}
                >
                  {bottomLeftLabel}
                </span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>
                  {bottomLeftValue}
                </span>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <span
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    fontSize: 14,
                    color: palette.panelMuted,
                  }}
                >
                  {bottomRightLabel}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 18,
                    fontWeight: 700,
                    color: palette.red,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "999px",
                      background: palette.red,
                    }}
                  />
                  <span>{bottomRightValue.replace(/^●\s*/, "")}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 32px 22px",
          borderTop: `2px solid ${palette.cream}`,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontSize: 15,
          color: palette.muted,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ color: palette.cream, fontWeight: 700 }}>
            {siteConfig.domain}
          </span>
          <span>—</span>
          <span>vicente@opa.so</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span>EST. 2001</span>
          <span>|</span>
          <span style={{ color: palette.red }}>EDITION 2026.05</span>
        </div>
      </div>
    </div>,
    size,
  );
}

export function getDefaultOgLocale(): OgLocale {
  return "en";
}

export function getOgHomeSize() {
  return size;
}

export function createHomeOgImage(locale: OgLocale = "en") {
  const copy = homeContentByLocale[locale];

  return renderBrandedOgImage({
    locale,
    eyebrow: copy.roleLabel,
    titleFirstLine: "Vicente",
    titleSecondLine: "Opaso.",
    subtitle: copy.subtitle,
    panelLabel: copy.summaryLabel,
    panelPrefix: copy.summaryPrefix,
    panelHighlight: copy.highlightedWord,
    bottomLeftLabel: copy.basedLabel,
    bottomLeftValue: "Málaga, ES",
    bottomRightLabel: copy.statusLabel,
    bottomRightValue: `● ${copy.status}`,
  });
}

export function createCvOgImage(locale: OgLocale = "en") {
  const description = getCvDescription(locale);
  const isEs = locale === "es";

  return renderBrandedOgImage({
    locale,
    eyebrow: isEs ? "CURRÍCULUM VITAE × PERFIL" : "CURRICULUM VITAE × PROFILE",
    titleFirstLine: "Vicente",
    titleSecondLine: "Opaso.",
    subtitle: description,
    panelLabel: isEs ? "ENFOQUE" : "FOCUS",
    panelPrefix: isEs
      ? "Experiencia, liderazgo técnico y sistemas de diseño para "
      : "Experience, technical leadership, and design systems for ",
    panelHighlight: isEs ? "equipos globales." : "global teams.",
    bottomLeftLabel: isEs ? "SECCIÓN" : "SECTION",
    bottomLeftValue: isEs ? "Experiencia y skills" : "Experience & skills",
    bottomRightLabel: isEs ? "DOCUMENTO" : "DOCUMENT",
    bottomRightValue: isEs ? "● CV activo" : "● Live CV",
  });
}
