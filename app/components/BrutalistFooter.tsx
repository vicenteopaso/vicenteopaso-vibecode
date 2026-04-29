import React from "react";

const footerLinks = [
  { label: "Privacy Policy",        href: "/privacy-policy" },
  { label: "Cookie Policy",         href: "/cookie-policy" },
  { label: "Accessibility",         href: "/accessibility" },
  { label: "Technical Governance",  href: "/technical-governance" },
  { label: "Tech Stack",            href: "/tech-stack" },
];

export function BrutalistFooter() {
  return (
    <footer
      style={{
        padding: "24px 32px 28px",
        display: "grid",
        gap: 14,
        background: "var(--v3-bg)",
        color: "var(--v3-fg)",
        fontFamily: "var(--f-mono)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "var(--v3-muted)",
          letterSpacing: "0.14em",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span>
          © {new Date().getFullYear()} VICENTE OPASO · VIBECODED WITH ❤ AND{" "}
          <a
            href="https://app.warp.dev/referral/8X3W39"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--v3-accent)", textDecoration: "underline", textUnderlineOffset: 2 }}
          >
            WARP
          </a>{" "}
          AND{" "}
          <a
            href="https://cursor.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--v3-accent)", textDecoration: "underline", textUnderlineOffset: 2 }}
          >
            CURSOR
          </a>
          .
        </span>
        <span>BUILT WITH SDD ↗</span>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px 14px",
          alignItems: "center",
          borderTop: "1px solid var(--v3-rule)",
          paddingTop: 12,
        }}
      >
        {footerLinks.map((l, i) => (
          <React.Fragment key={l.href}>
            <a
              href={l.href}
              style={{
                fontSize: 10.5,
                color: "var(--v3-accent)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                letterSpacing: "0.06em",
                fontFamily: "var(--f-mono)",
              }}
            >
              {l.label}
            </a>
            {i < footerLinks.length - 1 && (
              <span style={{ fontSize: 10.5, color: "var(--v3-muted)", fontFamily: "var(--f-mono)" }}>|</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </footer>
  );
}
