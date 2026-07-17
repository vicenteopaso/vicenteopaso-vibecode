import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";

import { ContentPageShell } from "@/app/components/ContentPageShell";
import { loadContentPage } from "@/lib/content";
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

  const { data, content } = loadContentPage(locale, "cookie-policy");

  return (
    <ContentPageShell>
      <article className="section-card space-y-4">
        <header>
          <h1 className="text-2xl font-bold text-[color:var(--text-primary)] sm:text-3xl">
            {data.title}
          </h1>
        </header>
        <div className="prose prose-invert prose-sm max-w-none sm:prose-base">
          <ReactMarkdown components={markdownComponents}>
            {content}
          </ReactMarkdown>
        </div>
      </article>
    </ContentPageShell>
  );
}
