"use client";

import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[color:var(--border-subtle)] bg-[color:var(--bg-app)]/95">
      <div className="shell flex flex-col items-center justify-center gap-3 py-6 text-sm text-[color:var(--text-muted)]">
        <p className="text-center lg:text-left">
          © {year} Vicente Opaso. Vibecoded with ♥️ and{" "}
          <a
            href="https://warp.dev"
            target="_blank"
            rel="noreferrer"
            className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
          >
            Warp
          </a>{" "}
          and{" "}
          <a
            href="https://cursor.com"
            target="_blank"
            rel="noreferrer"
            className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
          >
            Cursor
          </a>
          .
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
          <Link
            href="/privacy-policy"
            className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          <span aria-hidden="true" className="text-[color:var(--text-muted)]">
            |
          </span>
          <Link
            href="/cookie-policy"
            className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
          >
            Cookie Policy
          </Link>
          <span aria-hidden="true" className="text-[color:var(--text-muted)]">
            |
          </span>
          <Link
            href="/accessibility"
            className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
          >
            Accessibility
          </Link>
          <span aria-hidden="true" className="text-[color:var(--text-muted)]">
            |
          </span>
          <Link
            href="/technical-governance"
            className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
          >
            Technical Governance
          </Link>
          <span aria-hidden="true" className="text-[color:var(--text-muted)]">
            |
          </span>
          <Link
            href="/tech-stack"
            className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
          >
            Tech Stack
          </Link>
        </div>
      </div>
    </footer>
  );
}
