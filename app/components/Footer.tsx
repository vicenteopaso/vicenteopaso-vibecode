"use client";

import Link from "next/link";

import { CookiePolicyModal } from "./CookiePolicyModal";
import { PrivacyPolicyModal } from "./PrivacyPolicyModal";
import { TechStackModal } from "./TechStackModal";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[color:var(--border-subtle)] bg-[color:var(--bg-app)]/95">
      <div className="shell flex flex-col items-center justify-between gap-3 py-6 text-[0.75rem] text-[color:var(--text-muted)] lg:flex-row">
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
          <PrivacyPolicyModal />
          <span
            aria-hidden="true"
            className="text-[color:var(--border-subtle)]"
          >
            |
          </span>
          <CookiePolicyModal />
          <span
            aria-hidden="true"
            className="text-[color:var(--border-subtle)]"
          >
            |
          </span>
          <Link
            href="/accessibility"
            className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
          >
            Accessibility
          </Link>
          <span
            aria-hidden="true"
            className="text-[color:var(--border-subtle)]"
          >
            |
          </span>
          <TechStackModal />
        </div>
      </div>
    </footer>
  );
}
