import type { Route } from "next";
import Link from "next/link";

export const dynamic = "force-static";

export default function NotFound() {
  return (
    <section
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "var(--f-mono)",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "3rem", margin: 0 }}>404</h1>
      <p style={{ marginTop: "1rem" }}>Page not found.</p>
      <Link
        href={"/" as Route}
        style={{ marginTop: "1.5rem", textDecoration: "underline" }}
      >
        Go home
      </Link>
    </section>
  );
}
