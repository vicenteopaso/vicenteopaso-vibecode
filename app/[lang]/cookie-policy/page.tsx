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
    title: "Cookie Policy",
    description:
      "Cookie Policy for opa.so. Learn about the cookies we use and how we manage them in compliance with GDPR.",
    openGraph: {
      title: "Cookie Policy Vicente Opaso",
      description:
        "Cookie Policy for opa.so. Learn about the cookies we use and how we manage them.",
    },
  });
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function CookiePolicyPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });

  const filePath = path.join(
    process.cwd(),
    "content",
    locale,
    "cookie-policy.md",
  );
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const title =
    (data.title as string) || (data.name as string) || "Cookie Policy";

  return (
    <article className="section-card space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-[color:var(--text-primary)] sm:text-3xl">
          {title}
        </h1>
      </header>
      <div className="prose prose-invert prose-sm max-w-none sm:prose-base">
        <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
      </div>
    </article>
  );
}
