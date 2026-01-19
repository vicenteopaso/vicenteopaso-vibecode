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
    title: "Privacy Policy",
    description:
      "Privacy Policy for opa.so. Learn how your data is collected, used, and protected.",
    openGraph: {
      title: "Privacy Policy · Vicente Opaso",
      description:
        "Privacy Policy for opa.so, detailing data collection, usage, and protection.",
    },
  });
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function PrivacyPolicyPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = getLocaleFromParams({ lang });

  const filePath = path.join(
    process.cwd(),
    "content",
    locale,
    "privacy-policy.md",
  );
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const title =
    (data.title as string) || (data.name as string) || "Privacy Policy";

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
