"use client";

import { useEffect, useRef, useState } from "react";

import { sanitizeRichText } from "../../lib/sanitize-html";

type Reference = {
  name: string;
  reference: string;
};

interface ReferencesCarouselProps {
  references: Reference[];
  intervalMs?: number;
}

function HtmlBlock({ html }: { html?: string }) {
  const safeHtml = sanitizeRichText(html);
  if (!safeHtml) return null;
  return (
    <div
      className="space-y-2 text-sm text-[color:var(--text-primary)]"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}

export function ReferencesCarousel({
  references,
  intervalMs = 12000,
}: ReferencesCarouselProps) {
  const [index, setIndex] = useState(0);

  // Track tallest reference block height to avoid layout shift between slides
  const referenceRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [maxHeight, setMaxHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!references.length) return;

    const elements = referenceRefs.current.filter(
      (el): el is HTMLDivElement => el !== null,
    );

    if (!elements.length) return;

    const measure = () => {
      const heights = elements.map((el) => el.offsetHeight ?? 0);
      const nextMax = heights.length ? Math.max(...heights) : 0;

      if (nextMax > 0 && Number.isFinite(nextMax)) {
        setMaxHeight((current) =>
          current === null ? nextMax : Math.max(current, nextMax),
        );
      }
    };

    measure();

    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      const ResizeObserverConstructor = window.ResizeObserver;
      const observer = new ResizeObserverConstructor(() => {
        measure();
      });

      elements.forEach((el) => observer.observe(el));

      return () => {
        observer.disconnect();
      };
    }

    const timeoutId = setTimeout(measure, 250);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [references]);

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
      {/* Hidden measurement blocks to compute tallest reference without
          affecting layout. */}
      <div
        className="pointer-events-none absolute inset-0 -z-50 overflow-hidden opacity-0"
        aria-hidden="true"
      >
        {references.map((ref, i) => (
          <div
            key={`measure-ref-${i}`}
            ref={(el) => {
              referenceRefs.current[i] = el;
            }}
            className="space-y-3"
          >
            <HtmlBlock html={ref.reference} />
            <div
              className="text-right text-xs text-[color:var(--text-primary)]"
              dangerouslySetInnerHTML={{
                __html: sanitizeRichText(ref.name),
              }}
            />
          </div>
        ))}
      </div>

      {/* Reference content (no inner card) */}
      <div
        className="space-y-3"
        style={maxHeight ? { minHeight: maxHeight } : undefined}
      >
        <HtmlBlock html={current.reference} />
        <div
          className="text-right text-xs text-[color:var(--text-primary)]"
          dangerouslySetInnerHTML={{
            __html: sanitizeRichText(current.name),
          }}
        />
      </div>

      {references.length > 1 && (
        <div
          className="flex items-center justify-center gap-2"
          data-testid="references-carousel-dots"
        >
          {references.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show reference ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 w-4 rounded-full transition-colors cursor-pointer ${
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
