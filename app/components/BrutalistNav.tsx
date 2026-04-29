"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { useLocale } from "./LocaleProvider";

export function BrutalistNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLocale();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const displayTheme = !mounted
    ? "dark"
    : (resolvedTheme === "light" || resolvedTheme === "dark" ? resolvedTheme : "dark");

  const toggleTheme = () =>
    setTheme(displayTheme === "dark" ? "light" : "dark");

  const switchLocale = () => {
    const next = locale === "en" ? "es" : "en";
    const safe = pathname || `/${locale}`;
    router.push(safe.replace(`/${locale}`, `/${next}`) as `/${string}`);
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    // exact match for home page; prefix match for sub-pages
    if (href === `/${locale}`) return pathname === href;
    return pathname.startsWith(href);
  };

  const navLinks = [
    { label: "ABOUT", href: `/${locale}` },
    { label: "CV",    href: `/${locale}/cv` },
    { label: "CONTACT", href: "#contact" },
  ];

  const s = {
    root: {
      display: "flex" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
      padding: "14px 32px",
      borderBottom: "2px solid var(--v3-fg)",
      fontFamily: "var(--f-mono)",
      fontSize: 11,
      letterSpacing: "0.12em",
      background: "var(--v3-bg)",
      color: "var(--v3-fg)",
      position: "sticky" as const,
      top: 0,
      zIndex: 50,
    },
  };

  return (
    <header style={s.root}>
      {/* Brand */}
      <div style={{ display: "flex", gap: 20, color: "var(--v3-muted)" }}>
        <a
          href={`/${locale}`}
          style={{ color: "var(--v3-fg)", fontWeight: 600, textDecoration: "none" }}
        >
          OPA.SO
        </a>
        <span>/V2026</span>
        <span>—</span>
        <span style={{ color: "var(--v3-accent)" }}>● MÁLAGA, ES</span>
      </div>

      {/* Primary nav */}
      <nav style={{ display: "flex", gap: 24, color: "var(--v3-muted)" }}>
        {navLinks.map((l) => (
          <a
            key={l.label}
            href={l.href}
            style={{
              color: isActive(l.href) ? "var(--v3-fg)" : "inherit",
              textDecoration: "none",
              fontWeight: isActive(l.href) ? 600 : 400,
              borderBottom: isActive(l.href) ? "2px solid var(--v3-accent)" : "none",
              paddingBottom: 2,
            }}
          >
            {l.label}
          </a>
        ))}
      </nav>

      {/* Right controls */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--v3-muted)" }}>
        <button
          type="button"
          onClick={switchLocale}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--f-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "var(--v3-muted)",
            padding: 0,
          }}
          aria-label="Switch language"
        >
          {locale === "en" ? "ES" : "EN"}
        </button>
        <span>·</span>
        <button
          type="button"
          onClick={toggleTheme}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--f-mono)",
            fontSize: 14,
            color: "var(--v3-muted)",
            padding: 0,
            lineHeight: 1,
          }}
          aria-label="Toggle theme"
        >
          {displayTheme === "dark" ? "☼" : "☾"}
        </button>
      </div>
    </header>
  );
}
