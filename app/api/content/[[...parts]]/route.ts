import fs from "fs";
import matter from "gray-matter";
import { NextResponse } from "next/server";
import path from "path";

import { isValidLocale } from "@/lib/i18n";

import { ALLOWED_CONTENT_SLUGS } from "../shared";

export const dynamic = "force-static";

type Params = {
  parts?: string[];
};

export async function GET(
  _request: Request,
  context: { params: Promise<Params> },
) {
  const { parts } = await context.params;

  if (!parts || parts.length === 0 || parts.length > 2) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [first, second] = parts;
  const lang = parts.length === 2 ? first : "en";
  const slug = parts.length === 2 ? second : first;

  if (!slug || !ALLOWED_CONTENT_SLUGS.has(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isValidLocale(lang)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "content", lang, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  return NextResponse.json({
    title: (data.title as string) ?? (data.name as string) ?? slug,
    body: content,
  });
}
