import fs from "fs";
import matter from "gray-matter";
import type { Metadata } from "next";
import path from "path";
import ReactMarkdown from "react-markdown";

import { getLocaleFromParams } from "@/lib/i18n";

import { markdownComponents } from "../../../lib/markdown-components";
import { baseMetadata } from "../../../lib/seo";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return baseMetadata({
    title: "Accessibility Statement",
    description:
      "Our commitment to web accessibility and WCAG 2.1 AA conformance. Learn about accessibility features, testing practices, and how to report issues.",
    openGraph: {
      title: "Accessibility Statement Vicente Opaso",
      description:
        "Our commitment to web accessibility and WCAG 2.1 AA conformance.",
    },
  });
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function AccessibilityPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });

  const filePath = path.join(
    process.cwd(),
    "content",
    locale,
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
