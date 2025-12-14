"use client";

import Link from "next/link";

import { useTranslations } from "@/lib/i18n";

import { useLocale } from "./LocaleProvider";

export function Footer() {
  const year = new Date().getFullYear();
  const t = useTranslations();
  const { locale } = useLocale();

  return (
    <footer className="border-t border-[color:var(--border-subtle)] bg-[color:var(--bg-app)]/95">
      <div className="shell flex flex-col items-center justify-center gap-3 py-6 text-sm text-[color:var(--text-muted)]">
        <p className="text-center lg:text-left">
          {t("footer.copyright", {
            year,
            warp: (
              <a
                href="https://app.warp.dev/referral/8X3W39"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[color:var(--link-hover)]"
              >
                {t("footer.warp")}
              </a>
            ),
            cursor: (
              <a
                href="https://cursor.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[color:var(--link-hover)]"
              >
                {t("footer.cursor")}
              </a>
            ),
          })}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
          <Link
            href={`/${locale}/privacy-policy`}
            className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
          >
            {t("footer.privacyPolicy")}
          </Link>
          <span aria-hidden="true" className="text-[color:var(--text-muted)]">
            |
          </span>
          <Link
            href={`/${locale}/cookie-policy`}
            className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
          >
            {t("footer.cookiePolicy")}
          </Link>
          <span aria-hidden="true" className="text-[color:var(--text-muted)]">
            |
          </span>
          <Link
            href={`/${locale}/accessibility`}
            className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
          >
            {t("footer.accessibility")}
          </Link>
          <span aria-hidden="true" className="text-[color:var(--text-muted)]">
            |
          </span>
          <Link
            href={`/${locale}/technical-governance`}
            className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
          >
            {t("footer.technicalGovernance")}
          </Link>
          <span aria-hidden="true" className="text-[color:var(--text-muted)]">
            |
          </span>
          <Link
            href={`/${locale}/tech-stack`}
            className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
          >
            {t("footer.techStack")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
