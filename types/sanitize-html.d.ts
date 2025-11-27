declare module "sanitize-html" {
  // Minimal type surface used in this project; we don't need full typings.
  export interface IOptions {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    allowedStyles?: Record<string, never>;
    disallowedTagsMode?: string;
    transformTags?: Record<
      string,
      (
        tagName: string,
        attribs: Record<string, string>,
      ) => { tagName: string; attribs: Record<string, string> }
    >;
  }

  export default function sanitizeHtml(
    dirty: string,
    options?: IOptions,
  ): string;
}
