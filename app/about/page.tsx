import fs from "fs";
import matter from "gray-matter";
import path from "path";
import React from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

import { GetInTouchSection } from "../components/GetInTouchSection";
import { GitHubIcon, LinkedInIcon, XIcon } from "../components/icons";
import { ImpactCards } from "../components/ImpactCards";
import { ProfileCard } from "../components/ProfileCard";

export const dynamic = "force-static";

// Default markdown rendering for most sections
const markdownComponents: Components = {
  h3: (props) => (
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h2
      className="text-xl font-semibold text-[color:var(--text-primary)]"
      {...props}
    />
  ),
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
    ? introSection.replace(/^#{1,6}\s+[^\n]+\n*/i, "").trim()
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

      {(() => {
        const renderedSections: React.ReactNode[] = [];

        for (let index = 0; index < otherSections.length; index += 1) {
          const section = otherSections[index];
          const trimmedLower = section.trim().toLowerCase();

          const isImpactCardsSection =
            trimmedLower.startsWith("### impact cards");

          if (isImpactCardsSection) {
            const lines = section.split("\n");
            const headingLineIndex = lines.findIndex((line) =>
              line.trim().toLowerCase().startsWith("### impact cards"),
            );

            const headingLine =
              headingLineIndex >= 0
                ? lines[headingLineIndex]
                : "### Impact Cards";

            const firstCardBody = lines
              .slice(headingLineIndex + 1)
              .join("\n")
              .trim();

            let cardBlocks: string[] = [];

            if (firstCardBody) {
              cardBlocks.push(firstCardBody);
            }

            // Collect subsequent non-heading sections as additional cards.
            let nextIndex = index + 1;
            while (nextIndex < otherSections.length) {
              const candidate = otherSections[nextIndex];
              const candidateTrimmed = candidate.trimStart();

              if (/^#{1,6}\s/.test(candidateTrimmed)) {
                break;
              }

              if (candidateTrimmed) {
                cardBlocks.push(candidateTrimmed);
              }

              nextIndex += 1;
            }

            // Fallback: support legacy "***" separators within a single block.
            if (cardBlocks.length === 1 && cardBlocks[0].includes("***")) {
              cardBlocks = cardBlocks[0]
                .split(/^\*\*\*$/m)
                .map((block) => block.trim())
                .filter(Boolean);
            }

            const headingText = headingLine.replace(/^###\s*/i, "");

            renderedSections.push(
              <section
                key={`impact-${index}`}
                aria-label={headingText}
                className="space-y-4"
              >
                <ImpactCards cards={cardBlocks} />
              </section>,
            );

            // Skip the card sections we just consumed.
            index = nextIndex - 1;
            continue;
          }

          renderedSections.push(
            <section key={index} className="section-card space-y-4">
              <ReactMarkdown components={markdownComponents}>
                {section}
              </ReactMarkdown>
            </section>,
          );
        }

        return renderedSections;
      })()}

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
