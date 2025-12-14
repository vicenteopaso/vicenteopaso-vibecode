import { fireEvent, render, screen } from "@testing-library/react";
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
  }, 10000);

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

  it.each([
    ["sm", "w-[92vw] max-w-md"],
    ["md", "w-[92vw] max-w-xl"],
    ["lg", "w-[94vw] max-w-3xl"],
  ])("applies correct size classes for size=%%s", (size, expectedClass) => {
    render(
      <Modal trigger={<button>Open</button>} size={size as any}>
        <p>Body</p>
      </Modal>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain(expectedClass);
  });

  it("calls onOpenChange when modal is opened and closed", () => {
    const onOpenChange = vi.fn();
    render(
      <Modal trigger={<button>Open</button>} onOpenChange={onOpenChange}>
        <p>Body</p>
      </Modal>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // Close modal by pressing Escape
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("supports controlled open state", () => {
    const onOpenChange = vi.fn();
    render(
      <Modal
        trigger={<button>Open</button>}
        open={true}
        onOpenChange={onOpenChange}
      >
        <p>Controlled</p>
      </Modal>,
    );
    expect(screen.getByText("Controlled")).toBeInTheDocument();
  });

  it("sets data-testid on Dialog.Content if testId is provided", () => {
    render(
      <Modal trigger={<button>Open</button>} testId="modal-test-id">
        <p>Body</p>
      </Modal>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByTestId("modal-test-id")).toBeInTheDocument();
  });

  it("throws for invalid size prop", () => {
    // purposely pass invalid size using type assertion to bypass TS
    const renderInvalid = () =>
      render(
        <Modal trigger={<button>Open</button>} size={"invalid" as any}>
          <p>Body</p>
        </Modal>,
      );
    expect(renderInvalid).toThrow();
  });
});
