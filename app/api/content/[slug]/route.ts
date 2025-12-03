import fs from "fs";
import matter from "gray-matter";
import { NextResponse } from "next/server";
import path from "path";

const ALLOWED_SLUGS = new Set([
  "privacy-policy",
  "cookie-policy",
  "tech-stack",
]);

export const dynamic = "force-static";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  if (!ALLOWED_SLUGS.has(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "content", "en", `${slug}.md`);

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
