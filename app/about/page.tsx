import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { ProfileCard } from "../components/ProfileCard";
import { GetInTouchSection } from "../components/GetInTouchSection";

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

export default function AboutPage() {
  const filePath = path.join(process.cwd(), "content", "about.md");
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const name = (data.name as string) || "";
  const tagline = (data.tagline as string) || "";
  const initials = (data.initials as string) || "";

  return (
    <div className="space-y-6">
      <header className="section-card flex flex-col gap-6 sm:flex-row sm:items-center">
        <ProfileCard
          name={name}
          tagline={tagline}
          initials={initials}
          showSocialIcons
        />
      </header>

      <main className="section-card space-y-4">
        <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
      </main>

      <GetInTouchSection />

      <div className="flex items-center justify-center gap-2">
        <a
          href="https://github.com/vicenteopaso/"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub profile"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.58 2 12.26c0 4.51 2.87 8.33 6.84 9.68.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.36 1.12 2.94.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.18 9.18 0 0 1 12 6.34c.85 0 1.71.12 2.51.34 1.9-1.32 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.78-4.57 5.03.36.32.68.96.68 1.94 0 1.4-.01 2.53-.01 2.87 0 .27.18.6.69.49A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
            />
          </svg>
        </a>

        <a
          href="https://linkedin.com/in/vicenteopaso/"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn profile"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M4.98 3.5C4.98 4.88 3.9 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.24 8.98h4.52V24H.24zM8.47 8.98h4.33v2.05h.06c.6-1.14 2.06-2.34 4.24-2.34 4.54 0 5.38 2.99 5.38 6.88V24h-4.52v-7.18c0-1.71-.03-3.91-2.38-3.91-2.38 0-2.75 1.86-2.75 3.78V24H8.47z"
            />
          </svg>
        </a>

        <a
          href="https://x.com/vicenteopaso/"
          target="_blank"
          rel="noreferrer"
          aria-label="X (Twitter) profile"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M18.25 2h3.01l-6.58 7.52L22 22h-6.19l-4.01-6.03L6.9 22H3.89l7.03-8.03L2 2h6.31l3.62 5.41L18.25 2Zm-1.06 17.99h1.67L7.89 3.92H6.09l11.1 16.07Z"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
