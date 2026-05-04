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
    editionLabel: string;
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
    editionLabel: "EDITION 2026.05",
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
    editionLabel: "EDICIÓN 2026.05",
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
            src={`${siteConfig.url}/assets/images/logo_dark.png`}
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
          <span style={{ color: palette.red }}>{homeCopy.editionLabel}</span>
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
