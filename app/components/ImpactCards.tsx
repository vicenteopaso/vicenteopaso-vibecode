"use client";

import React from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

interface ImpactCardsProps {
  cards: string[];
  /** How many cards to show at once. */
  visibleCount?: number;
  /** Interval between card changes, in milliseconds. */
  intervalMs?: number;
}

const impactCardComponents: Components = {
  p: (props) => (
    <p
      className="text-xs leading-relaxed text-[color:var(--text-primary)] text-center"
      {...props}
    />
  ),
  strong: (props) => (
    <strong
      className="block text-xl font-semibold leading-tight text-[color:var(--secondary)] text-center py-1"
      {...props}
    />
  ),
  em: (props) => (
    <em
      className="block text-lg font-semibold tracking-wide text-[color:var(--text-primary)] text-center not-italic"
      {...props}
    />
  ),
  br: () => null,
};

export function ImpactCards({
  cards,
  visibleCount = 3,
  intervalMs = 15000,
}: ImpactCardsProps) {
  const total = cards.length;

  const safeVisibleCount = Math.min(Math.max(1, visibleCount), total);

  const [visibleIndices, setVisibleIndices] = React.useState<number[]>(() =>
    Array.from({ length: safeVisibleCount }, (_, i) => i),
  );

  // Track which logical slot is currently fading out
  const [exitingSlot, setExitingSlot] = React.useState<number | null>(null);

  // Track tallest card height across all impact cards to avoid content shift
  const cardRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const [maxHeight, setMaxHeight] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!cards.length) return;

    const elements = cardRefs.current.filter(
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

    // Fallback: re-measure once after a short delay (e.g., after fonts load)
    const timeoutId = setTimeout(measure, 250);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [cards]);

  // Keep visible indices array in sync with card count / visible count
  React.useEffect(() => {
    if (!total) {
      setVisibleIndices([]);
      return;
    }

    const count = Math.min(safeVisibleCount, total);

    setVisibleIndices((current) => {
      if (
        current.length === count &&
        current.every((i) => i >= 0 && i < total)
      ) {
        return current;
      }

      return Array.from({ length: count }, (_, i) => i);
    });
  }, [total, safeVisibleCount]);

  // Rotate exactly one card every interval
  React.useEffect(() => {
    if (!total || !visibleIndices.length) return;

    let timeoutId: number | undefined;

    const id = window.setInterval(() => {
      setVisibleIndices((current) => {
        if (!total || !current.length) return current;
        if (total <= current.length) return current;

        const slotToChange = Math.floor(Math.random() * current.length);
        const used = new Set(current);

        let candidate = current[slotToChange];
        let attempts = 0;

        while (used.has(candidate) && attempts < total * 4) {
          candidate = Math.floor(Math.random() * total);
          attempts += 1;
        }

        if (used.has(candidate)) return current;

        // Trigger a quick fade-out on this logical slot
        setExitingSlot(slotToChange);

        timeoutId = window.setTimeout(() => {
          setVisibleIndices((innerCurrent) => {
            if (!innerCurrent.length || total <= innerCurrent.length) {
              setExitingSlot(null);
              return innerCurrent;
            }

            if (slotToChange >= innerCurrent.length) {
              setExitingSlot(null);
              return innerCurrent;
            }

            const next = [...innerCurrent];
            next[slotToChange] = candidate;
            setExitingSlot(null);
            return next;
          });
        }, 90); // quick, subtle fade-out before swap

        return current;
      });
    }, intervalMs);

    return () => {
      window.clearInterval(id);
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [total, intervalMs, visibleIndices.length]);

  const visibleCards = visibleIndices
    .filter((i) => i >= 0 && i < total)
    .map((i, slot) => ({ slot, content: cards[i] }));

  if (!visibleCards.length) return null;

  return (
    <>
      {/* Hidden measurement grid to compute tallest card without affecting layout.
          Use the exact same card chrome as the visible cards so measurements
          match what is actually rendered. */}
      <div
        className="pointer-events-none absolute inset-0 -z-50 overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((content, i) => (
            <div
              key={`measure-${i}`}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="glass-card impact-card flex flex-col items-center justify-center rounded-2xl px-6 py-4 text-center"
            >
              <ReactMarkdown components={impactCardComponents}>
                {content}
              </ReactMarkdown>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3" data-testid="impact-cards">
        {visibleCards.map(({ slot, content }) => {
          const isExiting = exitingSlot === slot;
          const stateClass = isExiting ? "impact-card--out" : "impact-card--in";

          return (
            <div
              key={slot}
              className={`glass-card impact-card ${stateClass} flex flex-col items-center justify-center rounded-2xl px-6 py-4 text-center`}
              style={maxHeight ? { minHeight: maxHeight } : undefined}
            >
              <ReactMarkdown components={impactCardComponents}>
                {content}
              </ReactMarkdown>
            </div>
          );
        })}
      </div>
    </>
  );
}
