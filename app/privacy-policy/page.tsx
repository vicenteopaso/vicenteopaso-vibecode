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
  title: "Privacy Policy",
  description:
    "Privacy Policy for opa.so. Learn how we collect, use, and protect your personal data in compliance with GDPR and Spanish data protection regulations.",
  openGraph: {
    title: "Privacy Policy Vicente Opaso",
    description:
      "Privacy Policy for opa.so. Learn how we collect, use, and protect your personal data.",
  },
});

export default function PrivacyPolicyPage() {
  const filePath = path.join(process.cwd(), "content", "privacy-policy.md");
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
