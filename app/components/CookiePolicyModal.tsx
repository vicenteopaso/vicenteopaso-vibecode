"use client";

import * as Dialog from "@radix-ui/react-dialog";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

import { Modal } from "./Modal";

interface ContentResponse {
  title: string;
  body: string;
}

export function CookiePolicyModal() {
  const [content, setContent] = useState<ContentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const res = await fetch("/api/content/cookie-policy");
        if (!res.ok) {
          throw new Error("Failed to load cookie policy.");
        }
        const data = (await res.json()) as ContentResponse;
        if (isMounted) {
          setContent(data);
        }
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : "Failed to load cookie policy.";
        setError(message);
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const title = content?.title ?? "Cookie Policy";

  return (
    <Modal
      size="md"
      analyticsEventName="footer_cookie_policy_open"
      analyticsMetadata={{ location: "footer" }}
      trigger={
        <button
          type="button"
          className="cursor-pointer text-[color:var(--link)] underline-offset-4 hover:text-[color:var(--link-hover)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Cookie Policy
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
            <ReactMarkdown>{content.body}</ReactMarkdown>
          ) : (
            <p className="text-[color:var(--text-muted)]">Loading…</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Dialog.Close className="rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--bg-app)]/60 px-4 py-1.5 text-[0.8rem] text-[color:var(--text-primary)] shadow-sm transition hover:border-[color:var(--accent)]/40 hover:text-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
          Close
        </Dialog.Close>
      </div>
    </Modal>
  );
}
