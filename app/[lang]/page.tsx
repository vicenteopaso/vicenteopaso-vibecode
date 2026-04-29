import fs from "fs";
import matter from "gray-matter";
import type { Metadata } from "next";
import path from "path";

import { getLocaleFromParams } from "@/lib/i18n";
import {
  SITE_BRANDS,
  SITE_FOCUS,
  SITE_IMPACT,
  SITE_LANDING_TOC,
  SITE_TLDR,
  SITE_TLDR_LABELS,
} from "@/lib/site-data";
import { ogCacheVersion, siteConfig } from "@/lib/seo";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });
  return {
    openGraph: {
      type: "website",
      url: `${siteConfig.url}/${locale}`,
      title: siteConfig.name,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [{ url: `/${locale}/opengraph-image?v=${ogCacheVersion}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
      site: "@vicenteopaso",
      creator: "@vicenteopaso",
      images: [`/${locale}/opengraph-image?v=${ogCacheVersion}`],
    },
  };
}

// ─── Shared style helpers ─────────────────────────────────────────────────────

const mono: React.CSSProperties = { fontFamily: "var(--f-mono)" };
const big: React.CSSProperties = {
  fontFamily: "var(--f-sans)",
  fontWeight: 800,
  letterSpacing: "-0.045em",
};
const rule2: React.CSSProperties = { borderBottom: "2px solid var(--v3-fg)" };
const rule1: React.CSSProperties = { borderBottom: "1px solid var(--v3-rule)" };
const MAX_W = 1180;

// ─── Section heading: §NN ── LABEL ─────── ───────────────────────────────────
function SecHead({ n, label }: { n: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ ...mono, fontSize: 11, color: "var(--v3-accent)", letterSpacing: "0.14em" }}>
        §{n}
      </span>
      <span style={{ ...big, fontSize: 18, letterSpacing: "-0.015em" }}>{label}</span>
      <span style={{ flex: 1, height: 2, background: "var(--v3-fg)" }} />
    </div>
  );
}

// ─── A4 Hero: 2-col headline + TOC ───────────────────────────────────────────
function HeroA4() {
  return (
    <section style={{ padding: "64px 32px 32px", ...rule2, maxWidth: MAX_W, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
        {/* Left: headline + sub + CTAs */}
        <div>
          <div style={{ ...mono, fontSize: 11, color: "var(--v3-muted)", letterSpacing: "0.14em", marginBottom: 20 }}>
            ◈ VICENTE OPASO
          </div>
          <h1 style={{ ...big, fontSize: 80, lineHeight: 0.92, margin: 0 }}>
            Frontend<br />architecture.<br />
            <span style={{ color: "var(--v3-accent)" }}>Engineering</span><br />leadership.
          </h1>
          <p style={{ fontSize: 15, color: "var(--v3-muted)", marginTop: 24, maxWidth: 440, lineHeight: 1.65 }}>
            15+ years shipping composable web platforms, design systems, and the teams behind them.
            Málaga, ES · Remote-EU.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            <HeroBtn href="/en/cv" primary>READ CV ↗</HeroBtn>
            <HeroBtn href="#contact">VICENTE@OPA.SO</HeroBtn>
          </div>
        </div>

        {/* Right: TOC */}
        <div>
          <div style={{ ...mono, fontSize: 11, letterSpacing: "0.18em", color: "var(--v3-muted)", marginBottom: 12 }}>
            CONTENTS ————
          </div>
          <div style={{ border: "1px solid var(--v3-rule)" }}>
            {SITE_LANDING_TOC.map((entry, i) => (
              <a
                key={entry.n}
                href={`#${entry.t.toLowerCase().replace(/\s+/g, "-")}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr auto",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderBottom: i < SITE_LANDING_TOC.length - 1 ? "1px solid var(--v3-rule)" : "none",
                  color: "var(--v3-fg)",
                  textDecoration: "none",
                }}
              >
                <span style={{ ...mono, fontSize: 11, color: "var(--v3-accent)", letterSpacing: "0.1em" }}>
                  §{entry.n}
                </span>
                <span>
                  <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>{entry.t}</span>
                  <span style={{ fontSize: 13, color: "var(--v3-muted)", marginLeft: 12 }}>— {entry.s}</span>
                </span>
                <span style={{ ...mono, fontSize: 14, color: "var(--v3-muted)" }}>↓</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroBtn({
  children,
  primary,
  href,
}: {
  children: React.ReactNode;
  primary?: boolean;
  href: string;
}) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        background: primary ? "var(--v3-accent)" : "transparent",
        color: primary ? "#fff" : "var(--v3-fg)",
        border: primary ? "none" : "1px solid var(--v3-fg)",
        padding: "12px 20px",
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "var(--f-mono)",
        letterSpacing: "0.08em",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </a>
  );
}

// ─── Impact 4-stat strip ──────────────────────────────────────────────────────
function ImpactStrip() {
  return (
    <section style={{ ...rule2, maxWidth: MAX_W, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
        {SITE_IMPACT.map((x, i) => (
          <div
            key={i}
            style={{
              padding: "32px 24px",
              borderRight: i < 3 ? "1px solid var(--v3-rule)" : "none",
            }}
          >
            <div style={{ ...big, fontSize: 56, color: i === 0 ? "var(--v3-accent)" : "var(--v3-fg)", lineHeight: 1 }}>
              {x.k}
            </div>
            <div style={{ ...mono, fontSize: 11, color: "var(--v3-muted)", marginTop: 10, lineHeight: 1.5, letterSpacing: "0.02em" }}>
              {x.v}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── §01 TL;DR ───────────────────────────────────────────────────────────────
function TlDrSection() {
  return (
    <section id="tl-dr" style={{ ...rule2, maxWidth: MAX_W, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", ...rule1 }}>
        {/* Inverted sidebar */}
        <div style={{ background: "var(--v3-fg)", color: "var(--v3-bg)", padding: "32px 24px" }}>
          <div style={{ ...mono, fontSize: 11, opacity: 0.6, letterSpacing: "0.18em" }}>§01</div>
          <div style={{ ...big, fontSize: 48, lineHeight: 0.95, marginTop: 8 }}>
            TL;<span style={{ color: "var(--v3-accent)" }}>DR</span>
          </div>
          <div style={{ ...mono, fontSize: 11, opacity: 0.55, letterSpacing: "0.06em", marginTop: 14, lineHeight: 1.7 }}>
            the short version,<br />for people who<br />skim everything.
          </div>
        </div>

        {/* Numbered list */}
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {SITE_TLDR.map((t, i) => (
            <li
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr 80px",
                alignItems: "baseline",
                padding: "18px 24px",
                borderBottom: i < SITE_TLDR.length - 1 ? "1px solid var(--v3-rule)" : "none",
                gap: 16,
              }}
            >
              <span style={{ ...mono, fontSize: 11, color: "var(--v3-accent)", letterSpacing: "0.1em" }}>
                0{i + 1} —
              </span>
              <span style={{ fontSize: 19, letterSpacing: "-0.01em", lineHeight: 1.4, fontWeight: 500 }}>
                {t}
              </span>
              <span style={{ ...mono, fontSize: 10, color: "var(--v3-muted)", letterSpacing: "0.14em", textAlign: "right" as const }}>
                {SITE_TLDR_LABELS[i]}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ─── §02 What I Do ───────────────────────────────────────────────────────────
function FocusStrip() {
  return (
    <section id="what-i-do" style={{ padding: "48px 32px", ...rule2, maxWidth: MAX_W, margin: "0 auto", width: "100%" }}>
      <SecHead n="02" label="WHAT I DO" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0, marginTop: 24, border: "1px solid var(--v3-rule)" }}>
        {SITE_FOCUS.map((f, i) => (
          <div key={i} style={{ padding: "20px 18px", borderRight: i < 4 ? "1px solid var(--v3-rule)" : "none" }}>
            <div style={{ ...mono, fontSize: 10, color: "var(--v3-accent)", letterSpacing: "0.14em", marginBottom: 8 }}>
              0{i + 1}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.015em", marginBottom: 8, lineHeight: 1.2 }}>
              {f.h}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--v3-muted)", lineHeight: 1.55 }}>{f.b}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── §03 Experience table ─────────────────────────────────────────────────────
type WorkEntry = {
  company: string;
  location?: string;
  positions: Array<{
    position: string;
    startDate?: string;
    endDate?: string;
  }>;
};

function ExperienceTable({ work }: { work: WorkEntry[] }) {
  return (
    <section id="experience" style={{ padding: "48px 32px", ...rule2, maxWidth: MAX_W, margin: "0 auto", width: "100%" }}>
      <SecHead n="03" label="WHERE I'VE WORKED" />
      <div style={{ marginTop: 24, border: "1px solid var(--v3-rule)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr 200px 80px",
            padding: "10px 16px",
            borderBottom: "1px solid var(--v3-rule)",
            ...mono,
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--v3-muted)",
          }}
        >
          <span>DATES</span><span>ROLE · COMPANY</span><span>LOCATION</span>
          <span style={{ textAlign: "right" as const }}>→</span>
        </div>
        {work.map((company, ci) =>
          company.positions.map((role, ri) => {
            const isCurrent = !role.endDate || role.endDate === "Present";
            const dateStr = `${role.startDate ?? ""}–${isCurrent ? "NOW" : (role.endDate ?? "")}`;
            return (
              <div
                key={`${ci}-${ri}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "90px 1fr 200px 80px",
                  padding: "14px 16px",
                  borderBottom:
                    ci < work.length - 1 || ri < company.positions.length - 1
                      ? "1px solid var(--v3-rule)"
                      : "none",
                  alignItems: "center",
                }}
              >
                <span style={{ ...mono, fontSize: 11, color: isCurrent ? "var(--v3-accent)" : "var(--v3-muted)" }}>
                  {dateStr}
                </span>
                <span style={{ fontSize: 14 }}>
                  <span style={{ fontWeight: 600 }}>{role.position}</span>
                  <span style={{ color: "var(--v3-muted)" }}> · {company.company}</span>
                </span>
                <span style={{ ...mono, fontSize: 11, color: "var(--v3-muted)" }}>
                  {company.location ?? ""}
                </span>
                <a
                  href="/en/cv#experience"
                  style={{ ...mono, fontSize: 11, color: "var(--v3-fg)", textDecoration: "none", textAlign: "right" as const, letterSpacing: "0.1em" }}
                >
                  READ ↗
                </a>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

// ─── Brands inverted strip ────────────────────────────────────────────────────
function BrandsStrip() {
  return (
    <section
      style={{
        padding: "32px 32px",
        ...rule2,
        background: "var(--v3-fg)",
        color: "var(--v3-bg)",
        maxWidth: MAX_W,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div style={{ ...mono, fontSize: 10, letterSpacing: "0.18em", opacity: 0.6, marginBottom: 16 }}>
        BRANDS I'VE SHIPPED FOR —
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "8px 28px", alignItems: "baseline" }}>
        {SITE_BRANDS.map((b) => (
          <span key={b} style={{ ...big, fontSize: 32 }}>
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}

// ─── §04 Tech & Tools ────────────────────────────────────────────────────────
type SkillGroup = { name: string; level?: string; keywords?: string[] };

function StackGrid({ skills }: { skills: SkillGroup[] }) {
  return (
    <section id="tech-tools" style={{ padding: "48px 32px", ...rule2, maxWidth: MAX_W, margin: "0 auto", width: "100%" }}>
      <SecHead n="04" label="TECH & TOOLS" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
          marginTop: 24,
          border: "1px solid var(--v3-rule)",
        }}
      >
        {skills.map((g, i) => (
          <div
            key={g.name}
            style={{
              padding: "20px 18px",
              borderRight: i % 3 !== 2 ? "1px solid var(--v3-rule)" : "none",
              borderBottom:
                i < skills.length - (skills.length % 3 || 3)
                  ? "1px solid var(--v3-rule)"
                  : "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>{g.name}</span>
              {g.level && (
                <span style={{ ...mono, fontSize: 9, color: "var(--v3-accent)", letterSpacing: "0.14em" }}>
                  {g.level.toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ ...mono, fontSize: 11, color: "var(--v3-muted)", lineHeight: 1.75 }}>
              {(g.keywords ?? []).join(" · ")}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── §05 Contact ──────────────────────────────────────────────────────────────
function ContactBlock() {
  return (
    <section id="contact" style={{ padding: "56px 32px", ...rule2, maxWidth: MAX_W, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>
        {/* Left: info */}
        <div>
          <SecHead n="05" label="GET IN TOUCH" />
          <h2 style={{ ...big, fontSize: 64, lineHeight: 0.95, margin: "16px 0" }}>
            Let&apos;s<br /> <span style={{ color: "var(--v3-accent)" }}>talk</span>.
          </h2>
          <p style={{ fontSize: 14, color: "var(--v3-muted)", maxWidth: 380, lineHeight: 1.7, margin: 0 }}>
            Best for engineering leadership, frontend architecture, or design system roles in Europe / remote.
          </p>
          <div style={{ ...mono, fontSize: 11, color: "var(--v3-muted)", marginTop: 24, lineHeight: 1.9 }}>
            <div>→ vicente@opa.so</div>
            <div>→ linkedin.com/in/vicenteopaso</div>
            <div>→ github.com/vicenteopaso</div>
          </div>
        </div>

        {/* Right: form */}
        <form
          action="https://formspree.io/f/placeholder"
          method="POST"
          style={{ display: "grid", gap: 0, border: "1px solid var(--v3-rule)" }}
        >
          {(["NAME", "EMAIL", "SUBJECT"] as const).map((label) => (
            <label
              key={label}
              style={{
                display: "grid",
                gridTemplateColumns: "110px 1fr",
                borderBottom: "1px solid var(--v3-rule)",
                alignItems: "center",
              }}
            >
              <span style={{ ...mono, paddingLeft: 16, fontSize: 10, color: "var(--v3-muted)", letterSpacing: "0.14em" }}>
                {label}
              </span>
              <input
                name={label.toLowerCase()}
                style={{
                  background: "transparent",
                  border: "none",
                  borderLeft: "1px solid var(--v3-rule)",
                  padding: 14,
                  fontSize: 14,
                  fontFamily: "inherit",
                  color: "var(--v3-fg)",
                  outline: "none",
                }}
              />
            </label>
          ))}
          <label
            style={{
              display: "grid",
              gridTemplateColumns: "110px 1fr",
              borderBottom: "1px solid var(--v3-rule)",
              alignItems: "start",
            }}
          >
            <span style={{ ...mono, padding: "14px 0 14px 16px", fontSize: 10, color: "var(--v3-muted)", letterSpacing: "0.14em" }}>
              MESSAGE
            </span>
            <textarea
              name="message"
              rows={5}
              style={{
                background: "transparent",
                border: "none",
                borderLeft: "1px solid var(--v3-rule)",
                padding: 14,
                fontSize: 14,
                fontFamily: "inherit",
                color: "var(--v3-fg)",
                resize: "none",
                outline: "none",
              }}
            />
          </label>
          <div style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ ...mono, fontSize: 10, color: "var(--v3-muted)", letterSpacing: "0.1em" }}>
              TURNSTILE · FORMSPREE
            </span>
            <button
              type="submit"
              style={{
                background: "var(--v3-accent)",
                color: "#fff",
                border: "none",
                padding: "10px 18px",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "var(--f-mono)",
                letterSpacing: "0.08em",
                cursor: "pointer",
              }}
            >
              SEND →
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });

  // Load about.md for name/tagline
  const aboutPath = path.join(process.cwd(), "content", locale, "about.md");
  const aboutContents = fs.readFileSync(aboutPath, "utf8");
  const { data: aboutData } = matter(aboutContents);
  void aboutData; // currently unused — data comes from site-data.ts + cv.json

  // Load cv.json for work + skills
  let work: WorkEntry[] = [];
  let skills: SkillGroup[] = [];
  try {
    const cvPath = path.join(process.cwd(), "content", locale, "cv.json");
    const cv = JSON.parse(fs.readFileSync(cvPath, "utf8")) as {
      work?: WorkEntry[];
      skills?: SkillGroup[];
    };
    work = cv.work ?? [];
    skills = cv.skills ?? [];
  } catch {
    // Content not available in this locale — degrade gracefully
  }

  return (
    <div className="v3-page">
      <HeroA4 />
      <ImpactStrip />
      <TlDrSection />
      <FocusStrip />
      <ExperienceTable work={work} />
      <BrandsStrip />
      <StackGrid skills={skills} />
      <ContactBlock />
    </div>
  );
}
