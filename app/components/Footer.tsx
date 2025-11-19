"use client";

import * as Dialog from "@radix-ui/react-dialog";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[color:var(--border-subtle)] bg-[color:var(--bg-app)]/95">
      <div className="shell flex flex-col items-center justify-between gap-3 py-6 text-[0.75rem] text-[color:var(--text-muted)] sm:flex-row">
        <p className="text-center sm:text-left">
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

        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="cursor-pointer text-[color:var(--link)] underline-offset-4 hover:text-[color:var(--link-hover)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Tech stack
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--bg-surface)]/95 p-6 text-[0.8rem] text-[color:var(--text-primary)] shadow-[0_18px_60px_rgba(15,23,42,0.9)] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/60">
              <Dialog.Title className="text-base font-semibold tracking-tight">
                Tech stack
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-[color:var(--text-muted)]">
                A quick look at what powers this site.
              </Dialog.Description>

              <div className="mt-4 space-y-3">
                <div>
                  <h3 className="text-xs font-semibold text-[color:var(--text-muted)]">
                    Framework & runtime
                  </h3>
                  <p className="mt-1">
                    Next.js App Router on Node.js (TypeScript, React 18).
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-[color:var(--text-muted)]">
                    Styling & UI
                  </h3>
                  <p className="mt-1">
                    Tailwind CSS v4, custom design tokens, and Radix UI
                    primitives.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-[color:var(--text-muted)]">
                    Content & data
                  </h3>
                  <p className="mt-1">Markdown/JSON content, Contentlayer.</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-[color:var(--text-muted)]">
                    Infra, tooling & workflow
                  </h3>
                  <p className="mt-1">
                    Deployed on Vercel with GitHub as the source of truth, plus
                    ESLint, Prettier, Vitest, and Playwright for quality — all
                    built and iterated on in Warp and Cursor.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-[color:var(--text-muted)]">
                    Links
                  </h3>
                  <ul className="mt-1 space-y-1">
                    <li>
                      <a
                        href="https://github.com/vicenteopaso/vicenteopaso-vibecode"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
                      >
                        GitHub repository
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://vercel.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[color:var(--link)] hover:text-[color:var(--link-hover)] hover:underline underline-offset-4"
                      >
                        Hosted on Vercel
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Dialog.Close className="rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-app)]/60 px-4 py-1.5 text-[0.8rem] text-[color:var(--text-primary)] shadow-sm transition hover:border-[color:var(--accent)]/40 hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Close
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </footer>
  );
}
