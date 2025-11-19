import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ProfileCard } from "../components/ProfileCard";
import { ReferencesCarousel } from "../components/ReferencesCarousel";
import { GetInTouchSection } from "../components/GetInTouchSection";
import { CV_PDF_PATH } from "../config/cv";

type Highlight = {
  title?: string;
  content: string;
};

type RawHighlight = string | Highlight;

type CvJson = {
  basics: {
    name: string;
    label?: string;
    summary?: string;
    highlights?: RawHighlight[];
  };
  work: Array<{
    company: string;
    location?: string;
    positions: Array<{
      position: string;
      summary?: string;
      startDate?: string;
      endDate?: string;
      highlights?: RawHighlight[];
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
  skills?: Array<{
    name: string;
    level?: string;
    keywords?: string[];
  }>;
  languages?: Array<{
    language: string;
    fluency?: string;
  }>;
  interests?: Array<{
    name: string;
    keywords?: string[];
  }>;
  references?: Array<{
    name: string;
    reference: string;
  }>;
  publications?: Array<{
    name: string;
    publisher?: string;
    releaseDate?: string;
    url?: string;
  }>;
};

function HtmlBlock({ html }: { html?: string }) {
  if (!html) return null;
  return (
    <div
      className="space-y-2 text-sm leading-relaxed text-[color:var(--text-primary)] sm:text-[0.95rem]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function normalizeHighlights(highlights?: RawHighlight[]): Highlight[] {
  if (!highlights) return [];
  return highlights.map((item) =>
    typeof item === "string" ? { content: item } : item,
  );
}

export default function CVPage() {
  const filePath = path.join(process.cwd(), "content", "cv.md");
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const title = (data.title as string) || "CV";
  const tagline = (data.tagline as string) || "";

  let cv: CvJson | null = null;
  try {
    cv = JSON.parse(content) as CvJson;
  } catch {
    cv = null;
  }

  if (!cv) {
    return (
      <div className="section-card space-y-4">
        <h1 className="text-3xl font-bold text-[color:var(--text-primary)] sm:text-4xl">
          {title}
        </h1>
        {tagline && (
          <p className="text-base text-[color:var(--text-muted)] sm:text-lg">
            {tagline}
          </p>
        )}
        <p className="text-xs text-red-400 sm:text-sm">
          CV data could not be loaded. Please check that the JSON body in
          <code className="ml-1">content/cv.md</code> is valid.
        </p>
      </div>
    );
  }

  const work = cv.work ?? [];

  const basics = cv.basics ?? { name: "", label: "" };
  const profileName = basics.name || (data.name as string) || title;
  const profileTagline = basics.label || tagline;

  function getInitials(fullName: string): string {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return (parts[0][0] ?? "").toUpperCase();
    const first = parts[0][0] ?? "";
    const last = parts[parts.length - 1][0] ?? "";
    return `${first}${last}`.toUpperCase();
  }

  const profileInitials = getInitials(profileName);

  const sectionLinks = [
    work.length > 0 ? { href: "#experience", label: "Experience" } : null,
    cv.skills && cv.skills.length > 0
      ? { href: "#skills", label: "Skills" }
      : null,
    cv.education && cv.education.length > 0
      ? { href: "#education", label: "Education" }
      : null,
    cv.languages && cv.languages.length > 0
      ? { href: "#languages", label: "Languages" }
      : null,
    cv.publications && cv.publications.length > 0
      ? { href: "#publications", label: "Publications" }
      : null,
    cv.interests && cv.interests.length > 0
      ? { href: "#interests", label: "Interests" }
      : null,
    cv.references && cv.references.length > 0
      ? { href: "#references", label: "References" }
      : null,
  ].filter((link): link is { href: string; label: string } => link !== null);

  return (
    <div id="cv-top" className="space-y-6 scroll-mt-28">
      <header className="section-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <ProfileCard
            name={profileName}
            tagline={profileTagline}
            initials={profileInitials}
            align="left"
            showLinks={false}
            showAvatar={false}
            showSocialIcons
            showDownloadIcon
            sectionLinks={sectionLinks}
          />
        </div>
        <div className="mt-4 flex justify-center sm:hidden">
          <a
            href={CV_PDF_PATH}
            download
            className="text-sm font-medium text-[color:var(--link)] hover:text-[color:var(--link-hover)]"
          >
            Download CV
          </a>
        </div>
      </header>

      <section id="summary" className="section-card space-y-4 scroll-mt-28">
        {cv.basics?.summary && <HtmlBlock html={cv.basics.summary} />}
        {normalizeHighlights(cv.basics?.highlights).length > 0 && (
          <div className="mt-3 mx-auto">
            <ul className="list-disc marker:text-[color:var(--secondary)] space-y-3 pl-5 text-sm text-[color:var(--text-primary)]">
              {normalizeHighlights(cv.basics?.highlights).map((h, idx) => (
                <li key={idx} className="space-y-1">
                  {h.title && (
                    <div
                      className="font-semibold text-[color:var(--text-primary)]"
                      dangerouslySetInnerHTML={{ __html: h.title }}
                    />
                  )}
                  {h.content && <HtmlBlock html={h.content} />}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {work.length > 0 && (
        <section
          id="experience"
          className="section-card group space-y-4 scroll-mt-28"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
              Experience
            </h2>
            <a
              href="#cv-top"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[0.7rem] text-[color:var(--text-muted)] opacity-0 shadow-sm transition-opacity hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="Back to top"
            >
              ↑
            </a>
          </div>
          <div className="space-y-8 text-sm text-[color:var(--text-primary)]">
            {work.map((company) => (
              <article key={company.company} className="space-y-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <p className="font-semibold text-[color:var(--text-primary)]">
                      {company.company}
                    </p>
                    {company.location && (
                      <p className="text-xs text-[color:var(--text-muted)] sm:text-sm">
                        {company.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {company.positions?.map((role, idx) => (
                    <div
                      key={`${company.company}-${role.position}-${idx}`}
                      className="space-y-1"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                        <p className="font-medium text-[color:var(--text-primary)]">
                          {role.position}
                        </p>
                        {(role.startDate || role.endDate) && (
                          <p className="text-xs uppercase tracking-wide text-[color:var(--text-muted)]">
                            {role.startDate}
                            {role.startDate || role.endDate ? " – " : ""}
                            {role.endDate || "Present"}
                          </p>
                        )}
                      </div>

                      {role.summary && <HtmlBlock html={role.summary} />}

                      {normalizeHighlights(role.highlights).length > 0 && (
                        <ul className="mt-2 list-disc marker:text-[color:var(--secondary)] space-y-1 pl-5">
                          {normalizeHighlights(role.highlights).map((h, i) => (
                            <li key={i}>
                              <HtmlBlock html={h.content} />
                            </li>
                          ))}
                        </ul>
                      )}

                      {role.skills && role.skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {role.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-[color:var(--border-subtle)] px-3 py-1 text-xs text-[color:var(--text-primary)]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {cv.education && cv.education.length > 0 && (
        <section
          id="education"
          className="section-card group space-y-4 scroll-mt-28"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
              Education
            </h2>
            <a
              href="#cv-top"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[0.7rem] text-[color:var(--text-muted)] opacity-0 shadow-sm transition-opacity hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="Back to top"
            >
              ↑
            </a>
          </div>
          <div className="space-y-3 text-sm text-[color:var(--text-primary)]">
            {cv.education.map((ed) => (
              <div key={`${ed.institution}-${ed.area}`} className="space-y-1">
                <p className="font-semibold text-[color:var(--text-primary)]">
                  {ed.institution}
                </p>
                <p className="text-[color:var(--text-primary)]">
                  {[ed.studyType, ed.area].filter(Boolean).join(" in ")}
                </p>
                {(ed.startDate || ed.endDate) && (
                  <p className="text-xs uppercase tracking-wide text-[color:var(--text-muted)]">
                    {ed.startDate}
                    {ed.startDate || ed.endDate ? " – " : ""}
                    {ed.endDate}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {cv.languages && cv.languages.length > 0 && (
        <section
          id="languages"
          className="section-card group space-y-4 scroll-mt-28"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
              Languages
            </h2>
            <a
              href="#cv-top"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[0.7rem] text-[color:var(--text-muted)] opacity-0 shadow-sm transition-opacity hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="Back to top"
            >
              ↑
            </a>
          </div>
          <ul className="space-y-1 text-sm text-[color:var(--text-primary)] marker:text-[color:var(--secondary)]">
            {cv.languages.map((lang) => (
              <li key={lang.language}>
                <span className="font-semibold text-[color:var(--text-primary)]">
                  {lang.language}
                </span>
                <span className="text-[color:var(--text-muted)]">
                  {lang.fluency ? ` — ${lang.fluency}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {cv.skills && cv.skills.length > 0 && (
        <section
          id="skills"
          className="section-card group space-y-4 scroll-mt-28"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
              Skills
            </h2>
            <a
              href="#cv-top"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[0.7rem] text-[color:var(--text-muted)] opacity-0 shadow-sm transition-opacity hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="Back to top"
            >
              ↑
            </a>
          </div>
          <div className="space-y-3 text-sm text-[color:var(--text-primary)]">
            {cv.skills.map((group) => (
              <div key={group.name} className="space-y-1">
                <p className="font-semibold text-[color:var(--text-primary)]">
                  {group.name}
                  {group.level ? ` · ${group.level}` : ""}
                </p>
                {group.keywords && (
                  <div className="flex flex-wrap gap-2">
                    {group.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full border border-[color:var(--border-subtle)] px-3 py-1 text-xs text-[color:var(--text-primary)]"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {cv.publications && cv.publications.length > 0 && (
        <section
          id="publications"
          className="section-card group space-y-4 scroll-mt-28"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
              Publications
            </h2>
            <a
              href="#cv-top"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[0.7rem] text-[color:var(--text-muted)] opacity-0 shadow-sm transition-opacity hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="Back to top"
            >
              ↑
            </a>
          </div>
          <ul className="list-disc marker:text-[color:var(--secondary)] space-y-3 pl-5 text-sm text-[color:var(--text-primary)]">
            {cv.publications.map((pub) => (
              <li key={pub.name} className="space-y-1">
                <div>
                  {pub.url ? (
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[color:var(--link)] hover:underline"
                    >
                      {pub.name}
                    </a>
                  ) : (
                    <span className="font-semibold text-[color:var(--text-primary)]">
                      {pub.name}
                    </span>
                  )}
                </div>
                {(pub.publisher || pub.releaseDate) && (
                  <div className="text-[color:var(--text-muted)]">
                    {pub.publisher && <span>{pub.publisher}</span>}
                    {pub.publisher && pub.releaseDate && <span> · </span>}
                    {pub.releaseDate && <span>{pub.releaseDate}</span>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {cv.interests && cv.interests.length > 0 && (
        <section
          id="interests"
          className="section-card group space-y-4 scroll-mt-28"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
              Interests
            </h2>
            <a
              href="#cv-top"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[0.7rem] text-[color:var(--text-muted)] opacity-0 shadow-sm transition-opacity hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="Back to top"
            >
              ↑
            </a>
          </div>
          <div className="space-y-3 text-sm text-[color:var(--text-primary)]">
            {cv.interests.map((interest) => (
              <div key={interest.name} className="space-y-1">
                <p className="font-semibold text-[color:var(--text-primary)]">
                  {interest.name}
                </p>
                {interest.keywords && (
                  <p className="text-[color:var(--text-muted)]">
                    {interest.keywords.join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {cv.references && cv.references.length > 0 && (
        <section
          id="references"
          className="section-card group space-y-4 scroll-mt-28"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
              References
            </h2>
            <a
              href="#cv-top"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[0.7rem] text-[color:var(--text-muted)] opacity-0 shadow-sm transition-opacity hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="Back to top"
            >
              ↑
            </a>
          </div>
          <ReferencesCarousel references={cv.references} />
        </section>
      )}

      <GetInTouchSection />

      <div className="flex items-center justify-center gap-2">
        <a
          href="https://github.com/vicenteopaso/"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub profile"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.58 2 12.26c0 4.51 2.87 8.33 6.84 9.68.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.36 1.12 2.94.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.18 9.18 0 0 1 12 6.34c.85 0 1.71.12 2.51.34 1.9-1.32 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.78-4.57 5.03.36.32.68.96.68 1.94 0 1.4-.01 2.53-.01 2.87 0 .27.18.6.69.49A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
            />
          </svg>
        </a>

        <a
          href="https://linkedin.com/in/vicenteopaso/"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn profile"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M4.98 3.5C4.98 4.88 3.9 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.24 8.98h4.52V24H.24zM8.47 8.98h4.33v2.05h.06c.6-1.14 2.06-2.34 4.24-2.34 4.54 0 5.38 2.99 5.38 6.88V24h-4.52v-7.18c0-1.71-.03-3.91-2.38-3.91-2.38 0-2.75 1.86-2.75 3.78V24H8.47z"
            />
          </svg>
        </a>

        <a
          href="https://x.com/vicenteopaso/"
          target="_blank"
          rel="noreferrer"
          aria-label="X (Twitter) profile"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M18.25 2h3.01l-6.58 7.52L22 22h-6.19l-4.01-6.03L6.9 22H3.89l7.03-8.03L2 2h6.31l3.62 5.41L18.25 2Zm-1.06 17.99h1.67L7.89 3.92H6.09l11.1 16.07Z"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
