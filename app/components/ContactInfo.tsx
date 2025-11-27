"use client";

import type { FC } from "react";
import React from "react";

type ContactInfoVariant = "inline" | "dialog";

interface ContactInfoProps {
  variant?: ContactInfoVariant;
}

export const ContactInfo: FC<ContactInfoProps> = ({ variant = "inline" }) => {
  const baseClasses =
    "flex flex-col items-center justify-center gap-1 sm:flex-row sm:flex-wrap sm:gap-2";

  const variantClasses =
    variant === "inline"
      ? "mt-2 text-sm text-[color:var(--text-primary)]"
      : "mt-4 border-t border-[color:var(--border-subtle)] pt-3 text-[0.75rem] text-[color:var(--text-muted)]";

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      <a
        href="https://www.google.es/maps/@36.5965239,-4.5176446,16z"
        target="_blank"
        rel="noreferrer"
        className="hover:underline underline-offset-4"
      >
        Málaga, Spain
      </a>
      <span className="hidden sm:inline" aria-hidden="true">
        ·
      </span>
      <a
        href="tel:+34684005262"
        className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
      >
        +34 684 005 262
      </a>
      <span className="hidden sm:inline" aria-hidden="true">
        ·
      </span>
      <a
        href="mailto:vicente@opa.so"
        className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
      >
        vicente@opa.so
      </a>
    </div>
  );
};
