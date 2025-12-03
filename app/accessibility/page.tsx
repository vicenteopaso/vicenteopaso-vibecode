import fs from "fs";
import matter from "gray-matter";
import type { Metadata } from "next";
import path from "path";
import React from "react";
import ReactMarkdown from "react-markdown";

import { markdownComponents } from "../../lib/markdown-components";
import { baseMetadata } from "../../lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = baseMetadata({
  title: "Accessibility Statement",
  description:
    "Our commitment to web accessibility and WCAG 2.1 AA conformance. Learn about accessibility features, testing practices, and how to report issues.",
  openGraph: {
    title: "Accessibility Statement Vicente Opaso",
    description:
      "Our commitment to web accessibility and WCAG 2.1 AA conformance.",
  },
});

export default function AccessibilityPage() {
  const filePath = path.join(
    process.cwd(),
    "content",
    "en",
    "accessibility.md",
  );
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const title =
    (data.title as string) ||
    (data.name as string) ||
    "Accessibility Statement";

  return (
    <article className="section-card space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[color:var(--text-primary)] sm:text-3xl">
          {title}
        </h1>
        {data.description && (
          <p className="mt-2 text-base text-[color:var(--text-muted)]">
            {data.description as string}
          </p>
        )}
      </header>
      <div className="prose prose-sm max-w-none sm:prose-base">
        <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
      </div>
    </article>
  );
}
