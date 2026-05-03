"use client";

import type { KeyboardEvent } from "react";
import { useState } from "react";

const mono: React.CSSProperties = { fontFamily: "var(--f-mono)" };

interface Ref {
  index: number;
  total: number;
  name: string;
  role: string;
  fullText: string;
}

function CardContent({
  index,
  name,
  role,
  text,
}: {
  index: number;
  name: string;
  role: string;
  text: string;
}) {
  return (
    <>
      <div
        style={{
          ...mono,
          fontSize: 10,
          color: "var(--v3-accent)",
          letterSpacing: "0.14em",
          marginBottom: 10,
        }}
      >
        ❝ REF · {String(index + 1).padStart(2, "0")}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "var(--v3-fg)",
          marginBottom: 14,
          lineHeight: 1.65,
        }}
      >
        {text}
      </div>
      <div style={{ paddingTop: 10, borderTop: "1px solid var(--v3-rule)" }}>
        <div
          style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.005em" }}
        >
          {name}
        </div>
        <div
          style={{
            ...mono,
            fontSize: 10.5,
            color: "var(--v3-muted)",
            letterSpacing: "0.04em",
            marginTop: 2,
          }}
        >
          {role}
        </div>
      </div>
    </>
  );
}

function CvRefCard({
  index,
  total,
  name,
  role,
  fullText,
  dimmed,
  onEnter,
  onLeave,
}: Ref & {
  dimmed: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isEvenCol = index % 2 === 0;
  const isLastRow = index >= total - 2;
  const truncated = fullText.slice(0, 220) + "\u2026";

  const handleEnter = () => {
    setExpanded(true);
    onEnter();
  };
  const handleLeave = () => {
    setExpanded(false);
    onLeave();
  };
  const handleFocus = () => {
    setExpanded(true);
    onEnter();
  };
  const handleBlur = () => {
    setExpanded(false);
    onLeave();
  };
  const handleToggle = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);

    if (nextExpanded) {
      onEnter();
    } else {
      onLeave();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleToggle();
  };

  return (
    <button
      type="button"
      aria-expanded={expanded}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      style={{
        position: "relative",
        padding: "20px",
        borderTop: "none",
        borderLeft: "none",
        borderRight: isEvenCol ? "1px solid var(--v3-rule)" : "none",
        borderBottom: !isLastRow ? "1px solid var(--v3-rule)" : "none",
        cursor: "pointer",
        zIndex: expanded ? 10 : "auto",
        opacity: dimmed ? 0.35 : 1,
        transition: "opacity 0.2s ease",
        background: "transparent",
        textAlign: "left",
        width: "100%",
        fontFamily: "inherit",
        color: "inherit",
      }}
    >
      {/* Truncated content — always rendered to hold grid row height */}
      <div style={{ visibility: expanded ? "hidden" : "visible" }}>
        <CardContent index={index} name={name} role={role} text={truncated} />
      </div>

      {/* Expanded overlay — floats above without affecting layout */}
      <div
        style={{
          position: "absolute",
          ...(isLastRow ? { bottom: 0 } : { top: 0 }),
          left: 0,
          right: 0,
          padding: "20px",
          background: "var(--v3-bg)",
          border: "1px solid var(--v3-fg)",
          zIndex: 10,
          opacity: expanded ? 1 : 0,
          transform: expanded
            ? "translateY(0) scale(1)"
            : isLastRow
              ? "translateY(6px) scale(0.99)"
              : "translateY(-6px) scale(0.99)",
          transition: "opacity 0.2s ease, transform 0.22s ease",
          pointerEvents: "none",
        }}
        aria-hidden={!expanded}
      >
        <CardContent index={index} name={name} role={role} text={fullText} />
      </div>
    </button>
  );
}

interface CvRefsGridProps {
  refs: Array<{ name: string; role: string; fullText: string }>;
}

export function CvRefsGrid({ refs }: CvRefsGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = refs.length;

  return (
    <div
      className="v3-cv-refs-grid"
      style={{
        marginTop: 24,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        border: "1px solid var(--v3-rule)",
      }}
    >
      {refs.map((ref, i) => (
        <CvRefCard
          key={i}
          index={i}
          total={total}
          name={ref.name}
          role={ref.role}
          fullText={ref.fullText}
          dimmed={activeIndex !== null && activeIndex !== i}
          onEnter={() => setActiveIndex(i)}
          onLeave={() => setActiveIndex(null)}
        />
      ))}
    </div>
  );
}
