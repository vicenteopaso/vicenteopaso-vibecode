export function Footer() {
  return (
    <footer className="border-t border-[color:var(--border-subtle)] bg-[color:var(--bg-app)]/95">
      <div className="shell py-6">
        <p className="text-center text-xs text-[color:var(--text-muted)]">
          © {new Date().getFullYear()} Vicente Opaso. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
