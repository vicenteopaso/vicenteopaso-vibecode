import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { z } from "zod";

import type { Locale } from "@/lib/i18n";

/**
 * Frontmatter contract for `content/<locale>/<slug>.md`.
 * Mirrors the `Page` document type Contentlayer used to enforce
 * (name/title/slug required) before it was removed — this is the
 * replacement for that schema check now that pages read the
 * filesystem directly.
 */
export const pageFrontmatterSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  tagline: z.string().optional(),
  initials: z.string().optional(),
  underhero: z.string().optional(),
  description: z.string().optional(),
});

export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;

export interface ContentPage {
  data: PageFrontmatter;
  content: string;
}

/**
 * Reads and validates `content/<locale>/<slug>.md`. Throws if the file is
 * missing or its frontmatter doesn't satisfy the required fields — this
 * fails the build the same way Contentlayer's schema validation used to.
 */
export function loadContentPage(locale: Locale, slug: string): ContentPage {
  const filePath = path.join(process.cwd(), "content", locale, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const result = pageFrontmatterSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"} — ${issue.message}`)
      .join("; ");
    throw new Error(
      `Invalid frontmatter in content/${locale}/${slug}.md: ${issues}`,
    );
  }

  return { data: result.data, content };
}
