"use client";

import React, { useEffect, useState } from "react";

type Reference = {
  name: string;
  reference: string;
};

interface ReferencesCarouselProps {
  references: Reference[];
  intervalMs?: number;
}

function HtmlBlock({ html }: { html?: string }) {
  if (!html) return null;
  return (
    <div
      className="space-y-2 text-sm text-[color:var(--text-primary)]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function ReferencesCarousel({
  references,
  intervalMs = 12000,
}: ReferencesCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!references.length) return;

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % references.length);
    }, intervalMs);

    return () => clearInterval(id);
  }, [references.length, intervalMs]);

  if (!references.length) return null;

  const current = references[index];

  return (
    <div className="space-y-4">
      {/* Reference content (no inner card) */}
      <div className="space-y-3">
        <HtmlBlock html={current.reference} />
        <div
          className="text-right text-xs text-[color:var(--text-muted)]"
          dangerouslySetInnerHTML={{ __html: current.name }}
        />
      </div>

      {references.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {references.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show reference ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 w-4 rounded-full transition-colors ${
                i === index
                  ? "bg-[color:var(--secondary)]"
                  : "bg-[color:var(--border-subtle)]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
