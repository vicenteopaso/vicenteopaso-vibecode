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
  title: "Privacy Policy",
  description:
    "Privacy Policy for opa.so. Learn how we collect, use, and protect your personal data in compliance with GDPR and Spanish data protection regulations.",
  openGraph: {
    title: "Privacy Policy Vicente Opaso",
    description:
      "Privacy Policy for opa.so. Learn how we collect, use, and protect your personal data.",
  },
});

const markdownComponents: Components = {
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
  hr: () => (
    <hr className="my-8 border-t border-[color:var(--border-subtle)]" />
  ),
};

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
