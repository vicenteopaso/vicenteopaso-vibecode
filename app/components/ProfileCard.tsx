"use client";

import * as Avatar from "@radix-ui/react-avatar";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { useTranslations } from "@/lib/i18n";

import { CV_PDF_PATH } from "../config/cv";
import { DownloadIcon } from "./icons";
import { useLocale } from "./LocaleProvider";

interface ProfileCardProps {
  name: string;
  tagline: string;
  initials: string;
  align?: "left" | "right";
  showLinks?: boolean;
  showAvatar?: boolean;
  showSocialIcons?: boolean;
  showDownloadIcon?: boolean;
  sectionLinks?: Array<{ href: string; label: string }>;
}

const DARK_PORTRAITS = [
  `/assets/images/portrait_dark_01.png`,
  `/assets/images/portrait_dark_02.png`,
  `/assets/images/portrait_dark_03.png`,
];

const LIGHT_PORTRAITS = [
  `/assets/images/portrait_light_01.png`,
  `/assets/images/portrait_light_02.png`,
  `/assets/images/portrait_light_03.png`,
];

const socialIconClasses =
  "inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

function SocialIcons() {
  return (
    <>
      <a
        href="https://github.com/vicenteopaso/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub profile"
        className={socialIconClasses}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.58 2 12.26c0 4.51 2.87 8.33 6.84 9.68.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.36 1.12 2.94.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.18 9.18 0 0 1 12 6.34c.85 0 1.71.12 2.51.34 1.9-1.32 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.78-4.57 5.03.36.32.68.96.68 1.94 0 1.4-.01 2.53-.01 2.87 0 .27.18.6.69.49A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
          />
        </svg>
      </a>

      <a
        href="https://linkedin.com/in/vicenteopaso/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn profile"
        className={socialIconClasses}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M4.98 3.5C4.98 4.88 3.9 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.24 8.98h4.52V24H.24zM8.47 8.98h4.33v2.05h.06c.6-1.14 2.06-2.34 4.24-2.34 4.54 0 5.38 2.99 5.38 6.88V24h-4.52v-7.18c0-1.71-.03-3.91-2.38-3.91-2.38 0-2.75 1.86-2.75 3.78V24H8.47z"
          />
        </svg>
      </a>

      <a
        href="https://x.com/vicenteopaso/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X (Twitter) profile"
        className={socialIconClasses}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M18.25 2h3.01l-6.58 7.52L22 22h-6.19l-4.01-6.03L6.9 22H3.89l7.03-8.03L2 2h6.31l3.62 5.41L18.25 2Zm-1.06 17.99h1.67L7.89 3.92H6.09l11.1 16.07Z"
          />
        </svg>
      </a>
    </>
  );
}

export function ProfileCard({
  name,
  tagline,
  initials,
  align = "left",
  showLinks = true,
  showAvatar = true,
  showSocialIcons = false,
  showDownloadIcon = false,
  sectionLinks,
}: ProfileCardProps) {
  const { resolvedTheme } = useTheme();
  const { locale } = useLocale();
  const t = useTranslations();
  const [hasImageError, setHasImageError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayTheme = !mounted
    ? "dark"
    : resolvedTheme === "light" || resolvedTheme === "dark"
      ? resolvedTheme
      : "dark";

  const photoList = displayTheme === "dark" ? DARK_PORTRAITS : LIGHT_PORTRAITS;

  useEffect(() => {
    if (!mounted) return;
    const list = displayTheme === "dark" ? DARK_PORTRAITS : LIGHT_PORTRAITS;
    if (list.length > 0) {
      // In Playwright runs, keep image deterministic (index 0)
      const index = process.env.PLAYWRIGHT
        ? 0
        : Math.floor(Math.random() * list.length);
      setPhotoIndex(index);
    }
  }, [mounted, displayTheme]);

  const photo = photoList[photoIndex] ?? photoList[0];

  const baseContainer =
    "flex w-full flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10";

  const containerClasses =
    align === "right"
      ? `${baseContainer} sm:justify-between`
      : `${baseContainer} sm:justify-between`;

  const textClasses =
    align === "right"
      ? "mt-4 space-y-3 text-center sm:mt-0 sm:text-right sm:ml-auto"
      : "mt-4 space-y-3 text-center sm:mt-0 sm:text-left";

  const actionsRowClasses =
    "mt-2 flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between";

  const linksRowClasses =
    "flex items-center justify-center gap-2 text-sm font-medium text-[color:var(--text-primary)] sm:justify-start";

  const socialRowClasses =
    "mt-3 flex items-center justify-center gap-2 sm:mt-0 sm:justify-end";

  const isCvHeader = showDownloadIcon && !showAvatar && !showLinks;

  const taglineLines = tagline
    .match(/[^.]+\.?/g)
    ?.map((line) => line.trim())
    .filter(Boolean) ?? [tagline];

  // On desktop, keep the avatar size but use a 4/8 (~1/3 / 2/3) split.
  const textWidthClasses = showAvatar ? "sm:basis-2/3" : "sm:flex-1";

  return (
    <section className={containerClasses}>
      {showAvatar && (
        <div className="flex justify-center sm:justify-start sm:basis-1/3">
          <Avatar.Root className="relative inline-flex aspect-square h-36 w-36 sm:h-48 sm:w-48 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-600 bg-slate-900 align-middle shadow-s pointer-events-none">
            {!hasImageError && (
              <Image
                src={photo}
                alt={`Portrait of ${name}`}
                fill
                sizes="(min-width: 640px) 12rem, 9rem"
                className="h-full w-full object-cover pointer-events-none"
                priority
                onError={() => setHasImageError(true)}
              />
            )}
            {hasImageError && (
              <Avatar.Fallback className="absolute inset-0 flex h-full w-full items-center justify-center text-3xl font-semibold text-[color:var(--accent)]">
                {initials}
              </Avatar.Fallback>
            )}
          </Avatar.Root>
        </div>
      )}
      <div className={`${textClasses} ${textWidthClasses}`}>
        {isCvHeader ? (
          <div className="space-y-4">
            {/* Name and Download Button Row - centered on mobile, row on desktop */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-5xl font-semibold tracking-tight text-[color:var(--text-primary)] text-center sm:text-left">
                {name}
              </h1>
              {showDownloadIcon && (
                <a
                  href={CV_PDF_PATH}
                  download
                  className="hidden shrink-0 items-center gap-1.5 rounded-full bg-[color:var(--accent)] px-4 py-2 text-xs font-semibold text-slate-50 shadow-md shadow-[color:var(--accent)]/30 transition hover:bg-[color:var(--accent-hover)] hover:shadow-lg hover:shadow-[color:var(--accent)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:inline-flex no-underline hover:no-underline"
                  aria-label="Download CV (PDF)"
                >
                  <DownloadIcon className="h-4 w-4" />
                  <span>{t("cv.downloadLabel")}</span>
                </a>
              )}
            </div>
            {/* Tagline Row - Full Width */}
            <div className="w-full">
              {taglineLines.map((line, idx) => (
                <p
                  key={idx}
                  className="text-xl font-semibold leading-tight text-[color:var(--secondary)] sm:text-2xl"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-5xl font-semibold tracking-tight text-[color:var(--text-primary)] sm:text-5xl">
              {name}
            </h1>
            <div className={`${showAvatar ? "max-w-2xl" : "w-full"}`}>
              {taglineLines.map((line, idx) => (
                <p
                  key={idx}
                  className="text-xl font-semibold leading-tight text-[color:var(--secondary)] sm:text-2xl"
                >
                  {line}
                </p>
              ))}
            </div>
          </>
        )}
        {(showLinks || showSocialIcons) && (
          <div className={actionsRowClasses}>
            {showLinks && (
              <div className={linksRowClasses}>
                {/* Mobile: button-style links (only on home page, not CV header) */}
                {!isCvHeader && (
                  <div className="flex w-full items-center gap-3 sm:hidden">
                    <Link
                      href={`/${locale}/cv`}
                      className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-full bg-[color:var(--accent)] px-4 py-2 text-xs font-semibold text-slate-50 shadow-md shadow-[color:var(--accent)]/30 transition-colors hover:bg-[color:var(--accent-hover)] hover:shadow-lg hover:shadow-[color:var(--accent)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 no-underline hover:!no-underline"
                    >
                      {t("cv.readLabel")}
                    </Link>
                    <a
                      href={CV_PDF_PATH}
                      download
                      className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 no-underline hover:!no-underline"
                    >
                      {t("cv.downloadLabel")}
                    </a>
                  </div>
                )}

                {/* Desktop: primary/secondary buttons */}
                <div className="hidden items-center gap-3 sm:flex sm:flex-nowrap">
                  <Link
                    href={`/${locale}/cv`}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[color:var(--accent)] px-4 py-2 text-xs font-semibold text-slate-50 shadow-md shadow-[color:var(--accent)]/30 transition-colors hover:bg-[color:var(--accent-hover)] hover:shadow-lg hover:shadow-[color:var(--accent)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 no-underline hover:!no-underline"
                  >
                    {t("cv.readLabel")}
                  </Link>
                  <a
                    href={CV_PDF_PATH}
                    download
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 no-underline hover:!no-underline"
                  >
                    {t("cv.downloadLabel")}
                  </a>
                </div>
              </div>
            )}

            {showSocialIcons && (
              <>
                {isCvHeader && (
                  <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:justify-between">
                    {sectionLinks && sectionLinks.length > 0 && (
                      <nav
                        aria-label="CV sections"
                        className="flex flex-wrap items-center justify-center text-xs text-[color:var(--text-primary)] sm:justify-start"
                      >
                        {sectionLinks.map((link, idx) => (
                          <span
                            key={link.href}
                            className="inline-flex items-center"
                          >
                            {idx > 0 && (
                              <span
                                aria-hidden="true"
                                className="px-2 text-[color:var(--text-muted)]"
                              >
                                |
                              </span>
                            )}
                            <a
                              href={link.href}
                              className="hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
                            >
                              {link.label}
                            </a>
                          </span>
                        ))}
                      </nav>
                    )}
                    {/* Download CV button for mobile, above social icons */}
                    {showDownloadIcon && (
                      <div className="flex w-full justify-center py-3 sm:hidden">
                        <a
                          href={CV_PDF_PATH}
                          download
                          className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent)] px-4 py-2 text-xs font-semibold text-slate-50 shadow-md shadow-[color:var(--accent)]/30 transition hover:bg-[color:var(--accent-hover)] hover:shadow-lg hover:shadow-[color:var(--accent)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 no-underline hover:!no-underline"
                          aria-label="Download CV (PDF)"
                        >
                          <DownloadIcon className="h-4 w-4" />
                          <span>{t("cv.downloadLabel")}</span>
                        </a>
                      </div>
                    )}
                    {/* Social Icons - centered on mobile, right-aligned on desktop */}
                    <div className="flex items-center justify-center gap-2 sm:justify-end">
                      <SocialIcons />
                    </div>
                  </div>
                )}

                {!isCvHeader && (
                  <div className={socialRowClasses}>
                    <SocialIcons />
                    {showDownloadIcon && (
                      <a
                        href={CV_PDF_PATH}
                        download
                        className="hidden aspect-square h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:inline-flex"
                        aria-label="Download CV (PDF)"
                        title="Download CV (PDF)"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path
                            fill="currentColor"
                            d="M12 3a1 1 0 0 1 1 1v9.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 8.293 11.293L10.586 13.586V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
