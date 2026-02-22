export const CONTENT_SLUGS = [
  "about",
  "accessibility",
  "cookie-policy",
  "privacy-policy",
  "tech-stack",
  "technical-governance",
] as const;

export const ALLOWED_CONTENT_SLUGS = new Set(CONTENT_SLUGS);
