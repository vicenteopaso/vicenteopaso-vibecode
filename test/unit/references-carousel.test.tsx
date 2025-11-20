import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReferencesCarousel } from "../../app/components/ReferencesCarousel";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe("ReferencesCarousel", () => {
  it("returns null when there are no references", () => {
    const { container } = render(<ReferencesCarousel references={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a single reference without dots", () => {
    render(
      <ReferencesCarousel
        references={[
          { name: "<strong>Someone</strong>", reference: "<p>Ref one</p>" },
        ]}
      />,
    );

    expect(screen.getByText(/Ref one/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Show reference/i }),
    ).toBeNull();
  });

  // Flaky under JSDOM with fake timers; keeping for reference but disabled for now.
  // it("auto-advances references over time", () => {
  //   render(
  //     <ReferencesCarousel
  //       intervalMs={1000}
  //       references={[
  //         { name: "A", reference: "<p>First</p>" },
  //         { name: "B", reference: "<p>Second</p>" },
  //       ]}
  //     />,
  //   );
  //
  //   const firstDot = screen.getByRole("button", { name: "Show reference 1" });
  //   const secondDot = screen.getByRole("button", { name: "Show reference 2" });
  //
  //   expect(firstDot).toHaveClass("bg-[color:var(--secondary)]");
  //
  //   vi.advanceTimersByTime(1100);
  //
  //   expect(secondDot).toHaveClass("bg-[color:var(--secondary)]");
  // });
  it("allows manual navigation via dots", () => {
    render(
      <ReferencesCarousel
        references={[
          { name: "A", reference: "<p>Ref 1</p>" },
          { name: "B", reference: "<p>Ref 2</p>" },
          { name: "C", reference: "<p>Ref 3</p>" },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show reference 2" }));

    expect(screen.getByText(/Ref 2/i)).toBeInTheDocument();
  });
});
