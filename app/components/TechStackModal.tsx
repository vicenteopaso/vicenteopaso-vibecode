"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

import { markdownComponents } from "../../lib/markdown-components";
import { Modal } from "./Modal";

interface ContentResponse {
  title: string;
  body: string;
}

export function TechStackModal() {
  const [content, setContent] = useState<ContentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const res = await fetch("/api/content/tech-stack");
        if (!res.ok) {
          throw new Error("Failed to load tech stack.");
        }
        const data = (await res.json()) as ContentResponse;
        if (isMounted) {
          setContent(data);
        }
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : "Failed to load tech stack.";
        setError(message);
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const title = content?.title ?? "Tech Stack";

  return (
    <Modal
      size="md"
      analyticsEventName="footer_tech_stack_open"
      analyticsMetadata={{ location: "footer" }}
      trigger={
        <button
          type="button"
          className="cursor-pointer text-[color:var(--link)] underline-offset-4 hover:text-[color:var(--link-hover)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Tech Stack
        </button>
      }
    >
      <Dialog.Title className="text-base font-semibold tracking-tight">
        {title}
      </Dialog.Title>
      <div className="mt-3 max-h-[60vh] overflow-y-auto">
        <div className="prose prose-invert prose-sm max-w-none">
          {error ? (
            <p className="text-red-400">{error}</p>
          ) : content ? (
            <ReactMarkdown components={markdownComponents}>
              {content.body}
            </ReactMarkdown>
          ) : (
            <p className="text-[color:var(--text-muted)]">Loading…</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Dialog.Close className="rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-app)]/60 px-4 py-1.5 text-sm text-[color:var(--text-primary)] shadow-sm transition hover:border-[color:var(--accent)]/40 hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
          Close
        </Dialog.Close>
      </div>
    </Modal>
  );
}
