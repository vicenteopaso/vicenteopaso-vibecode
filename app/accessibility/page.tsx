import fs from "fs";
import matter from "gray-matter";
import type { Metadata } from "next";
import path from "path";
import React from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

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

const markdownComponents: Components = {
  h2: ({ children, ...props }) => (
    <h2
      className="mt-8 mb-4 text-2xl font-semibold text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mt-6 mb-3 text-xl font-semibold text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      className="mt-4 mb-2 text-lg font-semibold text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p
      className="mb-4 text-sm leading-relaxed text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="list-disc marker:text-[color:var(--secondary)] mb-4 space-y-2 pl-5 text-sm text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="list-decimal marker:text-[color:var(--secondary)] mb-4 space-y-2 pl-5 text-sm text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </ol>
  ),
  hr: () => (
    <hr className="my-8 border-t border-[color:var(--border-subtle)]" />
  ),
  a: ({ children, ...props }) => (
    <a
      className="font-medium text-[color:var(--link)] underline underline-offset-4 hover:text-[color:var(--link-hover)]"
      {...props}
    >
      {children}
    </a>
  ),
  strong: ({ children, ...props }) => (
    <strong
      className="font-semibold text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </strong>
  ),
  code: ({ children, ...props }) => (
    <code
      className="rounded-sm bg-[color:var(--code-bg)] px-1 py-0.5 font-mono text-xs text-[color:var(--code-text)]"
      {...props}
    >
      {children}
    </code>
  ),
};

export default function AccessibilityPage() {
  const filePath = path.join(process.cwd(), "content", "accessibility.md");
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
