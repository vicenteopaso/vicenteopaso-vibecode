"use client";

import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ContactDialog } from "./ContactDialog";

const navLinkBase =
  "inline-flex h-8 items-center justify-center rounded-full px-3 text-sm font-medium leading-none text-[color:var(--text-primary)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

const navLinkActive =
  "bg-[color:var(--bg-elevated)] text-[color:var(--link)] hover:text-[color:var(--link)]";

export function NavigationMenu() {
  const pathname = usePathname();
  const isOnCvPage = pathname?.startsWith("/cv") ?? false;

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayTheme = !mounted
    ? "dark"
    : resolvedTheme === "light" || resolvedTheme === "dark"
      ? resolvedTheme
      : "dark";

  const logoSrc =
    displayTheme === "dark"
      ? "/assets/images/logo_dark.png"
      : "/assets/images/logo.png";

  const toggleTheme = () => {
    const nextTheme = displayTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <NavigationMenuPrimitive.Root className="relative flex w-full items-center justify-between gap-4">
      {/* Logo (left-aligned) */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold text-[color:var(--text-primary)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        <span className="relative h-8 w-8 overflow-hidden rounded-full bg-[color:var(--bg-elevated)]">
          <Image
            src={logoSrc}
            alt="Opaso logo"
            width={32}
            height={32}
            sizes="32px"
            className="h-full w-full object-contain"
            priority
          />
        </span>
      </Link>

      {/* Primary links + theme toggle (right-aligned) */}
      <NavigationMenuPrimitive.List className="flex items-center gap-3">
        <NavigationMenuPrimitive.Item>
          <Link
            href="/cv"
            className={clsx(navLinkBase, isOnCvPage && navLinkActive)}
            aria-current={isOnCvPage ? "page" : undefined}
          >
            CV
          </Link>
        </NavigationMenuPrimitive.Item>
        <NavigationMenuPrimitive.Item>
          <ContactDialog
            trigger={
              <button type="button" className={navLinkBase}>
                Contact
              </button>
            }
          />
        </NavigationMenuPrimitive.Item>
        <NavigationMenuPrimitive.Item>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-[0.7rem] text-[color:var(--text-primary)] shadow-sm transition-colors hover:border-[color:var(--link-hover)] hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            aria-label="Toggle color theme"
          >
            <span aria-hidden>{displayTheme === "dark" ? "☼" : "☾"}</span>
          </button>
        </NavigationMenuPrimitive.Item>
      </NavigationMenuPrimitive.List>

      {/* Indicator + viewport (kept minimal for now) */}
      <NavigationMenuPrimitive.Indicator className="pointer-events-none absolute -bottom-2 flex h-2 items-end justify-center overflow-hidden">
        <div className="h-1 w-8 rounded-full bg-[color:var(--accent)]" />
      </NavigationMenuPrimitive.Indicator>

      <NavigationMenuPrimitive.Viewport
        className={clsx(
          "pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-[var(--radix-navigation-menu-viewport-width)] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/95 shadow-2xl backdrop-blur",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-2",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2",
        )}
      />
    </NavigationMenuPrimitive.Root>
  );
}
