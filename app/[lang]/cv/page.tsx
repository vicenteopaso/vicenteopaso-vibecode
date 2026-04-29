import fs from "fs";
import matter from "gray-matter";
import type { Metadata } from "next";
import path from "path";

import { getLocaleFromParams } from "@/lib/i18n";
import { CV_TOC, SITE_IMPACT, SITE_TLDR } from "@/lib/site-data";
import { getCvDescription, ogCacheVersion, siteConfig } from "@/lib/seo";

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
  const description = getCvDescription(locale);
  return {
    title: "CV",
    description,
    openGraph: {
      type: "website",
      url: `${siteConfig.url}/${locale}/cv`,
      title: `${siteConfig.name} · CV`,
      description,
      siteName: siteConfig.name,
      images: [{ url: `/${locale}/cv/opengraph-image?v=${ogCacheVersion}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteConfig.name} · CV`,
      description,
      site: "@vicenteopaso",
      creator: "@vicenteopaso",
      images: [`/${locale}/cv/opengraph-image?v=${ogCacheVersion}`],
    },
  };
}

// ─── Types ─────────────────────────────────────────────────────────────────────
type Highlight = string | { title?: string; content: string };

type CvJson = {
  basics?: {
    name?: string;
    label?: string;
    summary?: string;
    highlights?: Highlight[];
  };
  work?: Array<{
    company: string;
    location?: string;
    positions: Array<{
      position: string;
      summary?: string;
      startDate?: string;
      endDate?: string;
      highlights?: Highlight[];
      skills?: string[];
    }>;
  }>;
  education?: Array<{
    institution: string;
    area?: string;
    studyType?: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills?: Array<{ name: string; level?: string; keywords?: string[] }>;
  languages?: Array<{ language: string; fluency?: string }>;
  references?: Array<{ name: string; reference: string }>;
  publications?: Array<{
    name: string;
    publisher?: string;
    releaseDate?: string;
    url?: string;
  }>;
};

// ─── Style helpers ─────────────────────────────────────────────────────────────
const mono: React.CSSProperties = { fontFamily: "var(--f-mono)" };
const big: React.CSSProperties = {
  fontFamily: "var(--f-sans)",
  fontWeight: 800,
  letterSpacing: "-0.045em",
};
const rule2: React.CSSProperties = { borderBottom: "2px solid var(--v3-fg)" };
const MAX_W = 900;

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

/** Strip HTML tags — used to clean reference names */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

/** Parse "Name | Role" reference name strings */
function parseRefName(raw: string): { name: string; role: string } {
  const clean = stripHtml(raw);
  const parts = clean.split("|").map((p) => p.trim());
  return { name: parts[0] ?? clean, role: parts[1] ?? "" };
}

// ─── CV Masthead ───────────────────────────────────────────────────────────────
function CvMasthead({ name, label }: { name: string; label: string }) {
  const meta = [
    ["LOCATION", "Málaga, ES · EU"],
    ["AVAILABILITY", "● Open to roles"],
    ["LANGUAGES", "EN · ES"],
    ["EXPERIENCE", "15+ yrs web · 10 yrs telecom"],
    ["UPDATED", "2026.04"],
  ] as const;

  return (
    <section style={{ padding: "56px 32px 32px", ...rule2 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 32, alignItems: "start" }}>
        {/* Headline */}
        <div>
          <div style={{ ...mono, fontSize: 11, color: "var(--v3-muted)", letterSpacing: "0.14em", marginBottom: 18 }}>
            ◈ CURRICULUM VITAE · v2026.04
          </div>
          <h1 style={{ ...big, fontSize: 72, lineHeight: 0.9, margin: 0 }}>
            {name.split(" ")[0]}<br />
            <span style={{ color: "var(--v3-accent)" }}>{name.split(" ").slice(1).join(" ")}</span>.
          </h1>
          <div style={{ fontSize: 16, fontWeight: 500, marginTop: 18, letterSpacing: "-0.005em" }}>
            {label}
          </div>
          <div style={{ fontSize: 14, color: "var(--v3-muted)", marginTop: 10, maxWidth: 440, lineHeight: 1.65 }}>
            15+ years delivering composable platforms, design systems, and developer experience.
            Currently leading web engineering at Nexthink.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
            <CvBtn href="/en/cv" primary>↓ DOWNLOAD PDF</CvBtn>
            <CvBtn href="#contact">✉ VICENTE@OPA.SO</CvBtn>
          </div>
        </div>

        {/* Portrait placeholder */}
        <div
          style={{
            background: "var(--v3-fg)",
            color: "var(--v3-bg)",
            aspectRatio: "4 / 5",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ ...mono, position: "absolute", top: 10, left: 10, right: 10, fontSize: 9, letterSpacing: "0.16em", opacity: 0.55, display: "flex", justifyContent: "space-between" }}>
            <span>VO · 2026</span><span>▢ 4:5</span>
          </div>
          <div style={{ position: "absolute", inset: 24, border: "1px dashed rgba(246,241,231,0.28)", display: "grid", placeItems: "center" }}>
            <div style={{ textAlign: "center" as const }}>
              <div style={{ ...big, fontSize: 72, color: "var(--v3-accent)", lineHeight: 1 }}>VO</div>
              <div style={{ ...mono, fontSize: 9, opacity: 0.5, letterSpacing: "0.18em", marginTop: 6 }}>PORTRAIT · PLACEHOLDER</div>
            </div>
          </div>
          <div style={{ ...mono, position: "absolute", bottom: 10, left: 10, right: 10, fontSize: 9, letterSpacing: "0.16em", opacity: 0.55, display: "flex", justifyContent: "space-between" }}>
            <span>MÁLAGA</span><span>36.7°N</span>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0, marginTop: 32, paddingTop: 18, borderTop: "1px solid var(--v3-rule)" }}>
        {meta.map(([k, v], i) => (
          <div key={k} style={{ paddingLeft: i > 0 ? 14 : 0, borderLeft: i > 0 ? "1px solid var(--v3-rule)" : "none" }}>
            <div style={{ ...mono, fontSize: 10, color: "var(--v3-muted)", letterSpacing: "0.14em", marginBottom: 6 }}>{k}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: k === "AVAILABILITY" ? "var(--v3-accent)" : "inherit" }}>{v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CvBtn({ children, primary, href }: { children: React.ReactNode; primary?: boolean; href: string }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        background: primary ? "var(--v3-accent)" : "transparent",
        color: primary ? "#fff" : "var(--v3-fg)",
        border: primary ? "none" : "1px solid var(--v3-fg)",
        padding: "10px 16px",
        fontSize: 11,
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

// ─── TOC ───────────────────────────────────────────────────────────────────────
function CvToc() {
  return (
    <section style={{ padding: "32px 32px", ...rule2 }}>
      <div style={{ ...mono, fontSize: 11, letterSpacing: "0.18em", color: "var(--v3-muted)", marginBottom: 12 }}>
        CONTENTS ————
      </div>
      <div style={{ border: "1px solid var(--v3-rule)" }}>
        {CV_TOC.map((entry, i) => (
          <a
            key={entry.n}
            href={`#cv-${entry.t.toLowerCase().replace(/\s+/g, "-")}`}
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr auto",
              alignItems: "center",
              padding: "14px 16px",
              borderBottom: i < CV_TOC.length - 1 ? "1px solid var(--v3-rule)" : "none",
              color: "var(--v3-fg)",
              textDecoration: "none",
            }}
          >
            <span style={{ ...mono, fontSize: 11, color: "var(--v3-accent)", letterSpacing: "0.1em" }}>§{entry.n}</span>
            <span>
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>{entry.t}</span>
              <span style={{ fontSize: 13, color: "var(--v3-muted)", marginLeft: 12 }}>— {entry.s}</span>
            </span>
            <span style={{ ...mono, fontSize: 14, color: "var(--v3-muted)" }}>↓</span>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── Impact marquee ─────────────────────────────────────────────────────────
function ImpactStrip() {
  return (
    <section style={{ ...rule2 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
        {SITE_IMPACT.map((x, i) => (
          <div key={i} style={{ padding: "32px 24px", borderRight: i < 3 ? "1px solid var(--v3-rule)" : "none" }}>
            <div style={{ ...big, fontSize: 56, color: i === 0 ? "var(--v3-accent)" : "var(--v3-fg)", lineHeight: 1 }}>{x.k}</div>
            <div style={{ ...mono, fontSize: 11, color: "var(--v3-muted)", marginTop: 10, lineHeight: 1.5, letterSpacing: "0.02em" }}>{x.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── §01 Summary ───────────────────────────────────────────────────────────────
function SummarySection({ summary }: { summary?: string }) {
  return (
    <section id="cv-summary" style={{ padding: "48px 32px", ...rule2 }}>
      <SecHead n="01" label="SUMMARY" />
      <div style={{ marginTop: 28 }}>
        {summary && (
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "var(--v3-fg)", margin: "0 0 24px", maxWidth: 720 }}>
            {summary.replace(/<[^>]+>/g, "")}
          </p>
        )}
        <div style={{ borderTop: "1px solid var(--v3-rule)", borderBottom: "1px solid var(--v3-rule)", padding: "14px 0 4px" }}>
          <div style={{ ...mono, fontSize: 10, color: "var(--v3-muted)", letterSpacing: "0.18em", marginBottom: 6 }}>
            TL;DR ————
          </div>
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {SITE_TLDR.map((t, i) => (
              <li key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr", alignItems: "baseline", padding: "8px 0", gap: 10 }}>
                <span style={{ ...mono, fontSize: 11, color: "var(--v3-accent)", letterSpacing: "0.08em" }}>0{i + 1}</span>
                <span style={{ fontSize: 14.5, letterSpacing: "-0.005em", lineHeight: 1.5 }}>{t}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ─── §02 Experience ─────────────────────────────────────────────────────────
type WorkEntry = {
  company: string;
  location?: string;
  positions: Array<{
    position: string;
    summary?: string;
    startDate?: string;
    endDate?: string;
    highlights?: Highlight[];
    skills?: string[];
  }>;
};

function ExperienceSection({ work }: { work: WorkEntry[] }) {
  return (
    <section id="cv-experience" style={{ padding: "48px 32px", ...rule2 }}>
      <SecHead n="02" label="EXPERIENCE" />
      <div style={{ marginTop: 24, border: "1px solid var(--v3-rule)" }}>
        {/* Header row */}
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 130px", padding: "10px 14px", borderBottom: "1px solid var(--v3-rule)", ...mono, fontSize: 10, letterSpacing: "0.14em", color: "var(--v3-muted)" }}>
          <span>YEARS</span><span>COMPANY · ROLE · DETAIL</span><span>LOCATION</span>
        </div>

        {work.map((company, ci) => (
          <div key={ci} style={{ borderBottom: ci < work.length - 1 ? "2px solid var(--v3-fg)" : "none" }}>
            {/* Company row */}
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 130px", padding: "14px 14px 10px", alignItems: "baseline", gap: 12, borderBottom: "1px solid var(--v3-rule)" }}>
              <span style={{ ...mono, fontSize: 10.5, color: "var(--v3-muted)", letterSpacing: "0.06em" }}>
                {company.positions[company.positions.length - 1]?.startDate?.slice(0, 4) ?? ""}
                {" – "}
                {company.positions[0]?.endDate ? company.positions[0].endDate.slice(0, 4) : "NOW"}
              </span>
              <span style={{ ...big, fontSize: 22, letterSpacing: "-0.02em" }}>{company.company}</span>
              <span style={{ ...mono, fontSize: 10.5, color: "var(--v3-muted)", letterSpacing: "0.06em" }}>
                {(company.location ?? "").toUpperCase()}
              </span>
            </div>

            {company.positions.map((role, ri) => {
              const isCurrent = !role.endDate;
              const highlights = (role.highlights ?? []).map((h) =>
                typeof h === "string" ? h : h.content
              );
              return (
                <div
                  key={ri}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr 130px",
                    padding: "14px 14px",
                    gap: 12,
                    borderBottom: ri < company.positions.length - 1 ? "1px dashed var(--v3-rule)" : "none",
                  }}
                >
                  <div style={{ ...mono, fontSize: 10, color: isCurrent ? "var(--v3-accent)" : "var(--v3-muted)", letterSpacing: "0.04em", lineHeight: 1.55 }}>
                    {role.startDate ?? ""}{"\n→\n"}{role.endDate ?? "Present"}
                    {isCurrent && <div style={{ marginTop: 4 }}>● CURRENT</div>}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 4 }}>{role.position}</div>
                    {role.summary && (
                      <div style={{ fontSize: 13.5, color: "var(--v3-muted)", lineHeight: 1.6, marginBottom: highlights.length ? 10 : 0 }}>
                        {role.summary.replace(/<[^>]+>/g, "")}
                      </div>
                    )}
                    {highlights.length > 0 && (
                      <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 4 }}>
                        {highlights.map((h, hi) => (
                          <li key={hi} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 6, fontSize: 13, lineHeight: 1.55 }}>
                            <span style={{ ...mono, color: "var(--v3-accent)" }}>→</span>
                            <span>{h.replace(/<[^>]+>/g, "")}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {role.skills && role.skills.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, marginTop: 10 }}>
                        {role.skills.map((s) => (
                          <span key={s} className="v3-chip">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── §03 Skills ─────────────────────────────────────────────────────────────
function SkillsSection({ skills }: { skills: Array<{ name: string; level?: string; keywords?: string[] }> }) {
  return (
    <section id="cv-skills" style={{ padding: "48px 32px", ...rule2 }}>
      <SecHead n="03" label="SKILLS" />
      <div style={{ marginTop: 24, border: "1px solid var(--v3-rule)", display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }}>
        {skills.map((g, i) => (
          <div
            key={g.name}
            style={{
              padding: "16px 18px",
              borderRight: i % 2 === 0 ? "1px solid var(--v3-rule)" : "none",
              borderBottom: i < skills.length - (skills.length % 2 === 0 ? 2 : 1) ? "1px solid var(--v3-rule)" : "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>{g.name}</span>
              {g.level && <span style={{ ...mono, fontSize: 9.5, color: "var(--v3-accent)", letterSpacing: "0.14em" }}>{g.level.toUpperCase()}</span>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5 }}>
              {(g.keywords ?? []).map((kw) => <span key={kw} className="v3-chip">{kw}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── §04 Education + Languages ─────────────────────────────────────────────
function EducationSection({
  education,
  languages,
}: {
  education: Array<{ institution: string; area?: string; studyType?: string; startDate?: string; endDate?: string }>;
  languages: Array<{ language: string; fluency?: string }>;
}) {
  return (
    <section id="cv-education" style={{ padding: "48px 32px", ...rule2 }}>
      <SecHead n="04" label="EDUCATION · LANGUAGES" />
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid var(--v3-rule)" }}>
        <div style={{ padding: "18px 18px", borderRight: "1px solid var(--v3-rule)" }}>
          <div style={{ ...mono, fontSize: 10, color: "var(--v3-muted)", letterSpacing: "0.18em", marginBottom: 10 }}>EDUCATION</div>
          {education.map((ed, i) => (
            <div key={i} style={{ marginBottom: i < education.length - 1 ? 16 : 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>{ed.institution}</div>
              {(ed.studyType || ed.area) && (
                <div style={{ fontSize: 13, color: "var(--v3-muted)", marginTop: 4 }}>
                  {[ed.studyType, ed.area].filter(Boolean).join(" in ")}
                </div>
              )}
              {(ed.startDate || ed.endDate) && (
                <div style={{ ...mono, fontSize: 10.5, color: "var(--v3-muted)", marginTop: 8, letterSpacing: "0.06em" }}>
                  {ed.startDate} → {ed.endDate}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding: "18px 18px" }}>
          <div style={{ ...mono, fontSize: 10, color: "var(--v3-muted)", letterSpacing: "0.18em", marginBottom: 10 }}>LANGUAGES</div>
          <div style={{ display: "grid", gap: 8 }}>
            {languages.map(({ language, fluency }) => (
              <div key={language} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 14 }}>
                <span style={{ fontWeight: 600 }}>{language}</span>
                {fluency && <span style={{ ...mono, fontSize: 10.5, color: "var(--v3-muted)", letterSpacing: "0.08em" }}>{fluency.toUpperCase()}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── §05 Publications ──────────────────────────────────────────────────────
function PublicationsSection({ publications }: { publications: Array<{ name: string; publisher?: string; releaseDate?: string; url?: string }> }) {
  return (
    <section id="cv-publications" style={{ padding: "48px 32px", ...rule2 }}>
      <SecHead n="05" label="PUBLICATIONS" />
      <div style={{ marginTop: 24, border: "1px solid var(--v3-rule)" }}>
        {publications.map((pub, i) => (
          <a
            key={i}
            href={pub.url ?? "#"}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr 80px",
              padding: "14px 14px",
              gap: 16,
              alignItems: "baseline",
              textDecoration: "none",
              color: "var(--v3-fg)",
              borderBottom: i < publications.length - 1 ? "1px solid var(--v3-rule)" : "none",
            }}
          >
            <span style={{ ...mono, fontSize: 11, color: "var(--v3-muted)", letterSpacing: "0.06em" }}>{pub.releaseDate ?? ""}</span>
            <span>
              <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.005em" }}>{pub.name}</span>
              {pub.publisher && (
                <span style={{ ...mono, fontSize: 10, color: "var(--v3-muted)", marginLeft: 10, letterSpacing: "0.12em" }}>
                  · {pub.publisher.toUpperCase()}
                </span>
              )}
            </span>
            <span style={{ ...mono, fontSize: 11, color: "var(--v3-accent)", textAlign: "right" as const, letterSpacing: "0.1em" }}>READ ↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── §06 References ────────────────────────────────────────────────────────
function ReferencesSection({ references }: { references: Array<{ name: string; reference: string }> }) {
  return (
    <section id="cv-references" style={{ padding: "48px 32px", ...rule2 }}>
      <SecHead n="06" label="REFERENCES" />
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid var(--v3-rule)" }}>
        {references.map((ref, i) => {
          const { name, role } = parseRefName(ref.name);
          const quote = ref.reference.replace(/<[^>]+>/g, "").slice(0, 220) + "…";
          return (
            <div
              key={i}
              style={{
                padding: "18px 18px",
                borderRight: i % 2 === 0 ? "1px solid var(--v3-rule)" : "none",
                borderBottom: i < 2 ? "1px solid var(--v3-rule)" : "none",
              }}
            >
              <div style={{ ...mono, fontSize: 10, color: "var(--v3-accent)", letterSpacing: "0.14em", marginBottom: 10 }}>
                ❝ REF · 0{i + 1}
              </div>
              <div style={{ fontSize: 13, color: "var(--v3-fg)", marginBottom: 14, lineHeight: 1.6 }}>{quote}</div>
              <div style={{ paddingTop: 10, borderTop: "1px solid var(--v3-rule)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.005em" }}>{name}</div>
                <div style={{ ...mono, fontSize: 10.5, color: "var(--v3-muted)", letterSpacing: "0.04em", marginTop: 2 }}>{role}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


// ─── End CTA ─────────────────────────────────────────────────────────────────
function EndCta() {
  return (
    <section
      id="contact"
      style={{
        background: "var(--v3-fg)",
        color: "var(--v3-bg)",
        padding: "40px 32px",
        borderBottom: "2px solid var(--v3-fg)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "end", gap: 24 }}>
        <div>
          <div style={{ ...mono, fontSize: 11, opacity: 0.55, letterSpacing: "0.18em", marginBottom: 12 }}>
            END OF DOCUMENT ————
          </div>
          <div style={{ ...big, fontSize: 56, lineHeight: 0.95 }}>
            Let&apos;s <span style={{ color: "var(--v3-accent)" }}>talk</span>.
          </div>
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 12, maxWidth: 520 }}>
            Best for engineering leadership, frontend architecture, or design system roles in Europe / remote.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          <a
            href="mailto:vicente@opa.so"
            style={{
              background: "var(--v3-accent)",
              color: "#fff",
              padding: "12px 20px",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "var(--f-mono)",
              letterSpacing: "0.08em",
              textDecoration: "none",
              textAlign: "center" as const,
            }}
          >
            ✉ VICENTE@OPA.SO
          </a>
          <a
            href="https://linkedin.com/in/vicenteopaso"
            target="_blank"
            rel="noreferrer"
            style={{
              background: "transparent",
              color: "var(--v3-bg)",
              border: "1px solid var(--v3-bg)",
              padding: "12px 20px",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "var(--f-mono)",
              letterSpacing: "0.08em",
              textDecoration: "none",
              textAlign: "center" as const,
            }}
          >
            ↗ /in/vicenteopaso
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function CVPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });

  // Frontmatter from cv.md (title, name)
  const metaPath = path.join(process.cwd(), "content", locale, "cv.md");
  const { data } = matter(fs.readFileSync(metaPath, "utf8"));

  // Structured data from cv.json
  let cv: CvJson = {};
  try {
    const jsonPath = path.join(process.cwd(), "content", locale, "cv.json");
    cv = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as CvJson;
  } catch {
    // Degrade gracefully
  }

  const name = (cv.basics?.name ?? (data.name as string) ?? "Vicente Opaso");
  const label = (cv.basics?.label ?? (data.tagline as string) ?? "Web Engineering Manager · Frontend Architect");

  return (
    <div className="v3-page" style={{ maxWidth: MAX_W, margin: "0 auto", width: "100%" }}>
      <CvMasthead name={name} label={label} />
      <CvToc />
      <ImpactStrip />
      <SummarySection summary={cv.basics?.summary} />
      {(cv.work?.length ?? 0) > 0 && <ExperienceSection work={cv.work!} />}
      {(cv.skills?.length ?? 0) > 0 && <SkillsSection skills={cv.skills!} />}
      {((cv.education?.length ?? 0) > 0 || (cv.languages?.length ?? 0) > 0) && (
        <EducationSection
          education={cv.education ?? []}
          languages={cv.languages ?? []}
        />
      )}
      {(cv.publications?.length ?? 0) > 0 && <PublicationsSection publications={cv.publications!} />}
      {(cv.references?.length ?? 0) > 0 && <ReferencesSection references={cv.references!} />}
      <EndCta />
    </div>
  );
}
