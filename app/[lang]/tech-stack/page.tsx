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
    title: "Tech Stack",
    description:
      "Complete technology stack and tooling overview for opa.so. Built with Next.js 15, React 18, TypeScript, Tailwind CSS v4, and modern development tools.",
    openGraph: {
      title: "Tech Stack Vicente Opaso",
      description: "Complete technology stack and tooling overview for opa.so.",
    },
  });
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function TechStackPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });

  const filePath = path.join(process.cwd(), "content", locale, "tech-stack.md");
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const title = (data.title as string) || (data.name as string) || "Tech Stack";

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
