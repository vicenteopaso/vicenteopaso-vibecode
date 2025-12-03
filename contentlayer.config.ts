import { defineDocumentType, makeSource } from "contentlayer/source-files";

export const Page = defineDocumentType(() => ({
  name: "Page",
  filePathPattern: `**/*.md`,
  contentType: "markdown",
  fields: {
    name: { type: "string", required: true },
    title: { type: "string", required: true },
    slug: { type: "string", required: true },
    tagline: { type: "string", required: false },
    initials: { type: "string", required: false },
    underhero: { type: "string", required: false },
    description: { type: "string", required: false },
  },
  computedFields: {
    // Extract locale from file path (e.g., "content/en/cv.md" -> "en")
    locale: {
      type: "string",
      resolve: (doc) => {
        // Assumes all content files are organized in locale subdirectories (en/, es/, etc.)
        // Files must be in content/<locale>/*.md format
        const supportedLocales = ["en", "es"];
        const locale = doc._raw.sourceFilePath.split("/")[0];
        return supportedLocales.includes(locale) ? locale : "en";
      },
    },
    // For the CV page (slug === "cv"), parse the markdown body as JSON
    // and expose it as a structured `cv` field via Contentlayer.
    cv: {
      type: "json",
      resolve: (doc) => {
        if (doc.slug !== "cv") return undefined;
        try {
          return JSON.parse(doc.body.raw);
        } catch {
          return undefined;
        }
      },
    },
  },
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Page],
  // Keep alias warning enabled unless tsconfig is configured
  // (we add the alias in tsconfig.json separately).
});
