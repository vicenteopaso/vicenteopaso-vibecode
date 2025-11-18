import { defineDocumentType, makeSource } from "contentlayer/source-files";

export const Page = defineDocumentType(() => ({
  name: "Page",
  filePathPattern: `*.md`,
  contentType: "markdown",
  fields: {
    name: { type: "string", required: true },
    title: { type: "string", required: true },
    slug: { type: "string", required: true },
    tagline: { type: "string", required: false },
    initials: { type: "string", required: false },
  },
  computedFields: {
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
