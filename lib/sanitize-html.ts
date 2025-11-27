import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "ul",
  "ol",
  "li",
  "a",
  "span",
  "code",
];

const allowedAttributes: Record<string, string[]> = {
  a: ["href", "target", "rel"],
  span: ["aria-label"],
};

/**
 * Sanitize rich text coming from content/cv.md before rendering with
 * dangerouslySetInnerHTML. This is intentionally conservative to avoid XSS.
 */
export function sanitizeRichText(html: string | undefined | null): string {
  if (!html) return "";

  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
    // Disallow all styles and scripts by default.
    allowedStyles: {},
    disallowedTagsMode: "discard",
    transformTags: {
      a: (tagName, attribs) => {
        const next = { ...attribs };
        if (next.href && typeof next.href === "string") {
          // Best-effort guard against javascript: URLs.
          const trimmed = next.href.trim().toLowerCase();
          if (trimmed.startsWith("javascript:")) {
            delete next.href;
          }
        }

        if (next.target === "_blank") {
          next.rel = "noopener noreferrer";
        }

        return { tagName, attribs: next };
      },
    },
  });
}
