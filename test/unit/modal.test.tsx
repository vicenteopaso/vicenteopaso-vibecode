import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Modal } from "../../app/components/Modal";

const trackSpy = vi.fn();

vi.mock("@vercel/analytics", () => ({
  track: (...args: unknown[]) => trackSpy(...args),
}));

describe("Modal component", () => {
  beforeEach(() => {
    trackSpy.mockClear();
  });

  it("renders trigger and shows children when opened", () => {
    render(
      <Modal trigger={<button type="button">Open modal</button>}>
        <p>Modal body</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open modal" }));

    expect(screen.getByText("Modal body")).toBeInTheDocument();
  });

  it("sends analytics event when opened with analyticsEventName", () => {
    render(
      <Modal
        trigger={<button type="button">Open tracked modal</button>}
        analyticsEventName="test_modal_open"
        analyticsMetadata={{ location: "test" }}
      >
        <p>Tracked modal body</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open tracked modal" }));

    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(trackSpy).toHaveBeenCalledWith("test_modal_open", {
      location: "test",
    });
  });

  it("does not send analytics when analyticsEventName is not provided", () => {
    render(
      <Modal trigger={<button type="button">Open modal</button>}>
        <p>Modal body</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open modal" }));

    expect(trackSpy).not.toHaveBeenCalled();
  });

  it("renders and opens modal dialog", () => {
    render(
      <Modal trigger={<button type="button">Open modal</button>}>
        <p>Modal content</p>
      </Modal>,
    );

    const button = screen.getByRole("button", { name: "Open modal" });
    fireEvent.click(button);

    // Modal should open and show content
    expect(screen.getByText("Modal content")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has mobile-friendly scrollable styles on dialog content", () => {
    render(
      <Modal trigger={<button type="button">Open modal</button>}>
        <p>Scrollable modal content</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open modal" }));

    const dialog = screen.getByRole("dialog");
    // Verify the dialog has scrollable and mobile-friendly styles
    expect(dialog).toHaveClass("overflow-y-auto");
    expect(dialog).toHaveClass("overscroll-contain");
    expect(dialog).toHaveClass("max-h-[90dvh]");
  });
});
