import React from "react";
import type { Components } from "react-markdown";

/**
 * Shared markdown component configuration for react-markdown.
 * Used across policy pages, technical documentation, and other markdown-rendered content.
 *
 * Provides consistent styling and accessibility for:
 * - Headings (h2, h3, h4)
 * - Paragraphs
 * - Lists (ul, ol)
 * - Links
 * - Code blocks
 * - Strong/bold text
 * - Horizontal rules
 */
export const markdownComponents: Components = {
  h2: ({ children, ...props }) => (
    <h2
      className="mt-8 mb-4 text-2xl font-semibold text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mt-6 mb-3 text-xl font-semibold text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      className="mt-4 mb-2 text-lg font-semibold text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p
      className="mb-4 text-sm leading-relaxed text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="list-disc marker:text-[color:var(--secondary)] mb-4 space-y-2 pl-5 text-sm text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="list-decimal marker:text-[color:var(--secondary)] mb-4 space-y-2 pl-5 text-sm text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </ol>
  ),
  hr: () => (
    <hr className="my-8 border-t border-[color:var(--border-subtle)]" />
  ),
  a: ({ children, ...props }) => (
    <a
      className="font-medium text-[color:var(--link)] underline underline-offset-4 hover:text-[color:var(--link-hover)]"
      {...props}
    >
      {children}
    </a>
  ),
  strong: ({ children, ...props }) => (
    <strong
      className="font-semibold text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </strong>
  ),
  code: ({ children, ...props }) => (
    <code
      className="rounded-sm bg-[color:var(--code-bg)] px-1 py-0.5 font-mono text-xs text-[color:var(--code-text)]"
      {...props}
    >
      {children}
    </code>
  ),
};

/**
 * Variant for about page sections: maps h3 to h2 with smaller styling
 */
export const aboutPageComponents: Components = {
  ...markdownComponents,
  // Tighten top spacing for section headings within About page cards
  h2: (props) => (
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h2
      className="mb-4 text-2xl font-semibold text-[color:var(--text-primary)]"
      {...props}
    />
  ),
  h3: (props) => (
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h2
      className="text-xl font-semibold text-[color:var(--text-primary)]"
      {...props}
    />
  ),
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
};

/**
 * Variant for about page intro section: larger typography without card styling
 */
export const introComponents: Components = {
  p: (props) => (
    <p
      className="text-base sm:text-lg leading-relaxed text-[color:var(--text-primary)]"
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className="list-disc marker:text-[color:var(--secondary)] space-y-2 pl-5 text-base sm:text-lg leading-relaxed text-[color:var(--text-primary)]"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="list-decimal marker:text-[color:var(--secondary)] space-y-2 pl-5 text-base sm:text-lg leading-relaxed text-[color:var(--text-primary)]"
      {...props}
    />
  ),
};
