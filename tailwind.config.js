/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          app: "var(--bg-app)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
          muted: "var(--bg-muted)",
        },
        text: {
          primary: "var(--text-primary)",
          muted: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          muted: "var(--secondary-muted)",
        },
        border: {
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        link: {
          DEFAULT: "var(--link)",
          hover: "var(--link-hover)",
        },
      },
      boxShadow: {
        page: "var(--shadow-page-card)",
        "skip-link": "var(--shadow-skip-link)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        "4xl": "var(--radius-4xl)",
        full: "var(--radius-full)",
      },
      fontSize: {
        body: [
          "var(--font-size-body)",
          { lineHeight: "var(--line-height-body)" },
        ],
        small: "var(--font-size-small)",
        code: "var(--font-size-code)",
      },
      transitionDuration: {
        fast: "var(--transition-fast)",
        "impact-in": "var(--transition-impact-in)",
        "impact-out": "var(--transition-impact-out)",
      },
      spacing: {
        // Map a subset of the Tailwind spacing scale to CSS variables
        0: "0px",
        1: "0.25rem",
        2: "0.5rem",
        3: "0.75rem",
        4: "1rem",
        6: "1.5rem",
        8: "2rem",
        10: "2.5rem",
        12: "3rem",
      },
    },
  },
};
