import React from "react";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { ProfileCard } from "../components/ProfileCard";
import { GetInTouchSection } from "../components/GetInTouchSection";
import { ImpactCards } from "../components/ImpactCards";
import { GitHubIcon, LinkedInIcon, XIcon } from "../components/icons";

export const dynamic = "force-static";

// Default markdown rendering for most sections
const markdownComponents: Components = {
  ul: (props) => (
    <ul
      className="list-disc marker:text-[color:var(--secondary)] space-y-3 pl-5 text-sm text-[color:var(--text-primary)]"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="list-decimal marker:text-[color:var(--secondary)] space-y-3 pl-5 text-sm text-[color:var(--text-primary)]"
      {...props}
    />
  ),
  hr: () => (
    <hr className="my-8 border-t border-[color:var(--border-subtle)]" />
  ),
};

// Slightly larger, cardless typography for the Introduction copy
const introComponents: Components = {
  p: (props) => (
    <p
      className="text-base sm:text-lg leading-relaxed text-[color:var(--text-primary)]"
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className="list-disc marker:text-[color:var(--secondary)] space-y-2 pl-5 text-base sm:text-lg leading-relaxed text-[color:var(--text-primary)]"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="list-decimal marker:text-[color:var(--secondary)] space-y-2 pl-5 text-base sm:text-lg leading-relaxed text-[color:var(--text-primary)]"
      {...props}
    />
  ),
};

export default function AboutPage() {
  const filePath = path.join(process.cwd(), "content", "about.md");
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const name = (data.name as string) || "";
  const tagline = (data.tagline as string) || "";
  const initials = (data.initials as string) || "";

  // Split markdown content into sections using horizontal rules ("---")
  const sections = content
    .split(/^---$/m)
    .map((section) => section.trim())
    .filter(Boolean);

  const [introSection, ...otherSections] = sections;

  // Strip the "### Introduction" heading from the intro section so the
  // copy is titleless and can be rendered as plain body text.
  const introBody = introSection
    ? introSection.replace(/^###\s+[^\n]+\n*/i, "").trim()
    : "";

  return (
    <div className="space-y-6">
      <header className="section-card flex flex-col gap-6 sm:flex-row sm:items-center">
        <ProfileCard
          name={name}
          tagline={tagline}
          initials={initials}
          showSocialIcons
        />
      </header>

      {introBody && (
        <section className="space-y-4 py-3">
          <ReactMarkdown components={introComponents}>
            {introBody}
          </ReactMarkdown>
        </section>
      )}

      {/* Placeholder for dynamically displayed static content that will come after the intro */}

      {otherSections.map((section, index) => {
        const isImpactCardsSection = section
          .toLowerCase()
          .startsWith("### impact cards");

        if (isImpactCardsSection) {
          const lines = section.split("\n");
          const headingLineIndex = lines.findIndex((line) =>
            line.trim().toLowerCase().startsWith("### impact cards"),
          );

          const headingLine =
            headingLineIndex >= 0
              ? lines[headingLineIndex]
              : "### Impact Cards";

          const restMarkdown = lines
            .slice(headingLineIndex + 1)
            .join("\n")
            .trim();

          const cardBlocks = restMarkdown
            .split(/^\*\*\*$/m)
            .map((block) => block.trim())
            .filter(Boolean);

          const headingText = headingLine.replace(/^###\s*/i, "");

          return (
            <section key={index} aria-label={headingText} className="space-y-4">
              <ImpactCards cards={cardBlocks} />
            </section>
          );
        }

        return (
          <section key={index} className="section-card space-y-4">
            <ReactMarkdown components={markdownComponents}>
              {section}
            </ReactMarkdown>
          </section>
        );
      })}

      <GetInTouchSection />

      <div className="flex items-center justify-center gap-2">
        <a
          href="https://github.com/vicenteopaso/"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub profile"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <GitHubIcon className="h-4 w-4" />
        </a>

        <a
          href="https://linkedin.com/in/vicenteopaso/"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn profile"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <LinkedInIcon className="h-4 w-4" />
        </a>

        <a
          href="https://x.com/vicenteopaso/"
          target="_blank"
          rel="noreferrer"
          aria-label="X (Twitter) profile"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <XIcon className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
