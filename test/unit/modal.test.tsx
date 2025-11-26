import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
});
