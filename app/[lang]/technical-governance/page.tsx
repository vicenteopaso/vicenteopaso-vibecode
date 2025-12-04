import fs from "fs";
import matter from "gray-matter";
import type { Metadata } from "next";
import path from "path";
import React from "react";
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
    title: "Technical Governance",
    description:
      "How Spec-Driven Development (SDD) and documentation-first engineering shaped this project, enabling AI-assisted development with governance-driven architecture.",
    openGraph: {
      title: "Technical Governance Vicente Opaso",
      description:
        "How Spec-Driven Development and documentation-first engineering enabled AI-assisted development.",
    },
  });
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function TechnicalGovernancePage({ params }: PageProps) {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });

  const filePath = path.join(
    process.cwd(),
    "content",
    locale,
    "technical-governance.md",
  );
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const title =
    (data.title as string) || (data.name as string) || "Technical Governance";

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
