import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          size?: "normal" | "flexible" | "compact" | string;
        },
      ) => void;
      reset: () => void;
    };
  }
}
import { ContactDialog } from "../../app/components/ContactDialog";

vi.mock("next/script", () => ({
  __esModule: true,
  default: () => null,
}));

async function openDialogAndWaitForTurnstile() {
  render(<ContactDialog />);
  const trigger = screen.getByRole("button", { name: /contact/i });
  fireEvent.click(trigger);

  // Wait for the dialog to fully render and Turnstile to initialize
  // (the challenge visible message indicates Turnstile callback was invoked)
  await waitFor(() => {
    expect(
      screen.getByText(/cloudflare turnstile verification/i),
    ).toBeInTheDocument();
  });
}

function fillForm() {
  const email = screen.getByLabelText(/email/i);
  const message = screen.getByLabelText(/message/i);

  fireEvent.change(email, { target: { value: "test@example.com" } });
  fireEvent.change(message, { target: { value: "Hello" } });
}

function openDialogWithoutWaiting() {
  render(<ContactDialog />);
  const trigger = screen.getByRole("button", { name: /contact/i });
  fireEvent.click(trigger);
}
describe("ContactDialog", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-site-key";

    type TurnstileRender = (
      container: HTMLElement,
      options: { callback: (token: string) => void },
    ) => void;

    window.turnstile = {
      render: vi.fn((_, options: { callback: (token: string) => void }) => {
        // Simulate Turnstile immediately providing a token
        options.callback("test-token");
      }) as TurnstileRender,
      reset: vi.fn(),
    };

    vi.spyOn(window, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.turnstile = undefined;
  });

  it("requires email and message", async () => {
    await openDialogAndWaitForTurnstile();

    // Submit the form without filling any fields to trigger validation
    const email = screen.getByLabelText(/email/i);
    const form = email.closest("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);

    expect(
      await screen.findByText("Please provide an email address."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Please provide a message."),
    ).toBeInTheDocument();
  });

  it("requires Turnstile token before submit", async () => {
    // Override render to avoid calling the callback so token remains null
    if (window.turnstile) {
      window.turnstile.render = vi.fn();
    }

    openDialogWithoutWaiting();

    fillForm();

    const message = screen.getByLabelText(/message/i);
    const form = message.closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(
      await screen.findByText("Please complete the verification."),
    ).toBeInTheDocument();
  });

  it("logs error when Turnstile site key is missing", async () => {
    // eslint-disable-next-line no-console
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    render(<ContactDialog />);
    const trigger = screen.getByRole("button", { name: /contact/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Turnstile site key is not configured"),
      );
    });

    consoleErrorSpy.mockRestore();
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-site-key";
  });

  it("waits for Turnstile script to load with retry mechanism", async () => {
    // Start without turnstile loaded
    window.turnstile = undefined;

    render(<ContactDialog />);
    const trigger = screen.getByRole("button", { name: /contact/i });
    fireEvent.click(trigger);

    // Wait a bit, then load Turnstile
    await new Promise((resolve) => setTimeout(resolve, 250));

    window.turnstile = {
      render: vi.fn((_, options: { callback: (token: string) => void }) => {
        options.callback("test-token");
      }) as (
        container: HTMLElement,
        options: { callback: (token: string) => void },
      ) => void,
      reset: vi.fn(),
    };

    // Wait for Turnstile to be detected and rendered
    await waitFor(
      () => {
        expect(
          screen.getByText(/cloudflare turnstile verification/i),
        ).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it("renders all form fields correctly", async () => {
    await openDialogAndWaitForTurnstile();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  describe("success flow", () => {
    it("resets form fields and disables inputs and send button after successful submission", async () => {
      await openDialogAndWaitForTurnstile();
      fillForm();

      const form = screen.getByLabelText(/email/i).closest("form");
      expect(form).not.toBeNull();

      // Submit the form
      fireEvent.submit(form as HTMLFormElement);

      // Wait for success message
      await waitFor(() => {
        expect(
          screen.getByText(/message sent/i, { exact: false }),
        ).toBeInTheDocument();
      });

      // Form fields should be reset and disabled
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const messageInput = screen.getByLabelText(
        /message/i,
      ) as HTMLTextAreaElement;
      const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;

      expect(emailInput.value).toBe("");
      expect(messageInput.value).toBe("");
      expect(phoneInput.value).toBe("");
      expect(emailInput).toBeDisabled();
      expect(messageInput).toBeDisabled();
      expect(phoneInput).toBeDisabled();

      // Send button should also be disabled after a successful submission
      const sendButton = screen.getByRole("button", { name: /send/i });
      expect(sendButton).toBeDisabled();
    });

    it("shows countdown after successful submission", async () => {
      await openDialogAndWaitForTurnstile();
      fillForm();

      const form = screen.getByLabelText(/email/i).closest("form");
      expect(form).not.toBeNull();

      // Submit the form
      fireEvent.submit(form as HTMLFormElement);

      // Wait for success state
      await waitFor(() => {
        expect(
          screen.getByText(/message sent/i, { exact: false }),
        ).toBeInTheDocument();
      });

      // Countdown should eventually be visible (after state transition)
      await waitFor(
        () => {
          expect(screen.getByText(/closing in/i)).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });

    it("starts countdown at 10 seconds after successful submission", async () => {
      await openDialogAndWaitForTurnstile();
      fillForm();

      const form = screen.getByLabelText(/email/i).closest("form");
      expect(form).not.toBeNull();

      // Submit the form
      fireEvent.submit(form as HTMLFormElement);

      // Wait for countdown to appear
      await waitFor(
        () => {
          expect(screen.getByText(/closing in/i)).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Verify countdown starts at 10
      expect(screen.getByText(/closing in 10/i)).toBeInTheDocument();
    });

    it("auto-closes modal when countdown reaches zero", async () => {
      vi.useFakeTimers();

      render(<ContactDialog />);
      const trigger = screen.getByRole("button", { name: /contact/i });
      fireEvent.click(trigger);

      // Wait for Turnstile to initialize
      await vi.advanceTimersByTimeAsync(300);

      fillForm();

      const form = screen.getByLabelText(/email/i).closest("form");
      expect(form).not.toBeNull();

      // Submit the form
      fireEvent.submit(form as HTMLFormElement);

      // Advance through the full countdown
      // Start: success -> countdown transition (1000ms) + 10 seconds of countdown
      await vi.advanceTimersByTimeAsync(1200);

      // Verify countdown is visible
      expect(screen.getByText(/closing in/i)).toBeInTheDocument();

      // Advance through the countdown 1 second at a time (10 iterations + 1 for final close)
      for (let i = 0; i < 11; i++) {
        await vi.advanceTimersByTimeAsync(1000);
      }

      // Modal should be closed (dialog should no longer be in the document)
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      vi.useRealTimers();
    });

    it("reopening modal after success shows fresh form with enabled inputs", async () => {
      vi.useFakeTimers();

      render(<ContactDialog />);
      const trigger = screen.getByRole("button", { name: /contact/i });
      fireEvent.click(trigger);

      // Wait for Turnstile to initialize
      await vi.advanceTimersByTimeAsync(300);

      fillForm();

      const form = screen.getByLabelText(/email/i).closest("form");
      expect(form).not.toBeNull();

      // Submit the form
      fireEvent.submit(form as HTMLFormElement);

      // Advance to countdown state
      await vi.advanceTimersByTimeAsync(1200);

      // Verify we're in countdown
      expect(screen.getByText(/closing in/i)).toBeInTheDocument();

      // Advance through the countdown 1 second at a time (10 iterations + 1 for final close)
      for (let i = 0; i < 11; i++) {
        await vi.advanceTimersByTimeAsync(1000);
      }

      // Modal should be closed
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      // Switch to real timers before re-opening
      vi.useRealTimers();

      // Reopen the modal
      fireEvent.click(trigger);

      // Wait for the dialog to open and Turnstile to initialize
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // All inputs should be enabled and empty
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const messageInput = screen.getByLabelText(
        /message/i,
      ) as HTMLTextAreaElement;
      const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;

      expect(emailInput.value).toBe("");
      expect(messageInput.value).toBe("");
      expect(phoneInput.value).toBe("");
      expect(emailInput).not.toBeDisabled();
      expect(messageInput).not.toBeDisabled();
      expect(phoneInput).not.toBeDisabled();

      // Countdown should not be visible
      expect(screen.queryByText(/closing in/i)).not.toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe("error flow", () => {
    it("preserves form values on server error", async () => {
      // Mock fetch to return an error
      vi.spyOn(window, "fetch").mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Server error" }),
      } as Response);

      await openDialogAndWaitForTurnstile();
      fillForm();

      const form = screen.getByLabelText(/email/i).closest("form");
      expect(form).not.toBeNull();

      // Submit the form
      fireEvent.submit(form as HTMLFormElement);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });

      // Form values should be preserved
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const messageInput = screen.getByLabelText(
        /message/i,
      ) as HTMLTextAreaElement;

      expect(emailInput.value).toBe("test@example.com");
      expect(messageInput.value).toBe("Hello");
    });

    it("keeps inputs enabled on error", async () => {
      // Mock fetch to return an error
      vi.spyOn(window, "fetch").mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Server error" }),
      } as Response);

      await openDialogAndWaitForTurnstile();
      fillForm();

      const form = screen.getByLabelText(/email/i).closest("form");
      expect(form).not.toBeNull();

      // Submit the form
      fireEvent.submit(form as HTMLFormElement);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });

      // Inputs should remain enabled
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const messageInput = screen.getByLabelText(
        /message/i,
      ) as HTMLTextAreaElement;
      const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;

      expect(emailInput).not.toBeDisabled();
      expect(messageInput).not.toBeDisabled();
      expect(phoneInput).not.toBeDisabled();
    });

    it("resets Turnstile but keeps inputs enabled on error", async () => {
      // Mock fetch to return an error
      vi.spyOn(window, "fetch").mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Server error" }),
      } as Response);

      await openDialogAndWaitForTurnstile();
      fillForm();

      const form = screen.getByLabelText(/email/i).closest("form");
      expect(form).not.toBeNull();

      // Submit the form
      fireEvent.submit(form as HTMLFormElement);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });

      // Turnstile is reset after error, so send button is disabled
      // until user completes verification again
      const sendButton = screen.getByRole("button", { name: /send/i });
      expect(sendButton).toBeDisabled();

      // But Turnstile reset was called
      expect(window.turnstile?.reset).toHaveBeenCalled();
    });

    it("does not show countdown on error", async () => {
      // Mock fetch to return an error
      vi.spyOn(window, "fetch").mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Server error" }),
      } as Response);

      await openDialogAndWaitForTurnstile();
      fillForm();

      const form = screen.getByLabelText(/email/i).closest("form");
      expect(form).not.toBeNull();

      // Submit the form
      fireEvent.submit(form as HTMLFormElement);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });

      // Countdown should not be visible
      expect(screen.queryByText(/closing in/i)).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has aria-live region for status messages", async () => {
      await openDialogAndWaitForTurnstile();

      const statusRegions = screen.getAllByRole("status");
      expect(statusRegions.length).toBeGreaterThan(0);
      expect(statusRegions[0]).toHaveAttribute("aria-live", "polite");
    });

    it("countdown message has aria-live for screen readers", async () => {
      await openDialogAndWaitForTurnstile();
      fillForm();

      const form = screen.getByLabelText(/email/i).closest("form");
      expect(form).not.toBeNull();

      // Submit the form
      fireEvent.submit(form as HTMLFormElement);

      // Wait for success and countdown
      await waitFor(() => {
        expect(
          screen.getByText(/message sent/i, { exact: false }),
        ).toBeInTheDocument();
      });

      // Wait for countdown to appear (includes 1s delay from SUCCESS_TO_COUNTDOWN_DELAY_MS)
      await waitFor(
        () => {
          expect(screen.getByText(/closing in/i)).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Find countdown message container and verify aria attributes
      const countdownRegion = screen
        .getByText(/closing in/i)
        .closest('[role="status"]');
      expect(countdownRegion).toHaveAttribute("aria-live", "polite");
      expect(countdownRegion).toHaveAttribute("aria-atomic", "true");
    });
  });

  describe("Enter key navigation", () => {
    it("does not submit form when pressing Enter with invalid email format", async () => {
      await openDialogAndWaitForTurnstile();

      const email = screen.getByLabelText(/email/i) as HTMLInputElement;
      const message = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

      // Fill form with invalid email (no @ symbol)
      fireEvent.change(email, { target: { value: "test" } });
      fireEvent.change(message, { target: { value: "Hello" } });

      // Press Enter from the message field
      fireEvent.keyDown(message, { key: "Enter", code: "Enter" });

      // Form should NOT be submitted - verify fetch was never called
      // and no success message appears after waiting for any potential async updates
      await waitFor(() => {
        expect(window.fetch).not.toHaveBeenCalled();
      });

      expect(screen.queryByText(/message sent/i)).not.toBeInTheDocument();
    });

    it("allows navigation with Enter in phone field", async () => {
      await openDialogAndWaitForTurnstile();

      const phone = screen.getByLabelText(/phone/i) as HTMLInputElement;

      // Press Enter in phone field
      fireEvent.keyDown(phone, { key: "Enter", code: "Enter" });

      // No submission should occur
      expect(window.fetch).not.toHaveBeenCalled();
    });

    it("allows multi-line text in message field with Shift+Enter", async () => {
      await openDialogAndWaitForTurnstile();

      const message = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

      fireEvent.change(message, { target: { value: "Line 1" } });
      fireEvent.keyDown(message, {
        key: "Enter",
        code: "Enter",
        shiftKey: true,
      });

      // No form submission
      expect(window.fetch).not.toHaveBeenCalled();
    });
  });

  describe("email field keyboard navigation", () => {
    it("prevents Enter key from submitting when email is empty", async () => {
      await openDialogAndWaitForTurnstile();

      const email = screen.getByLabelText(/email/i) as HTMLInputElement;

      // Press Enter without filling email
      fireEvent.keyDown(email, { key: "Enter", code: "Enter" });

      // No submission
      expect(window.fetch).not.toHaveBeenCalled();
    });

    it("prevents Enter key from submitting when email format is invalid", async () => {
      await openDialogAndWaitForTurnstile();

      const email = screen.getByLabelText(/email/i) as HTMLInputElement;

      fireEvent.change(email, { target: { value: "invalid-email" } });
      fireEvent.keyDown(email, { key: "Enter", code: "Enter" });

      // No submission
      expect(window.fetch).not.toHaveBeenCalled();
    });
  });

  describe("form navigation and focus", () => {
    it("submits form when pressing Enter with valid email format", async () => {
      await openDialogAndWaitForTurnstile();

      const email = screen.getByLabelText(/email/i) as HTMLInputElement;
      const message = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

      // Fill form with valid email
      fireEvent.change(email, { target: { value: "test@example.com" } });
      fireEvent.change(message, { target: { value: "Hello" } });

      // Press Enter from the message field
      fireEvent.keyDown(message, { key: "Enter", code: "Enter" });

      // Form should be submitted - success message should appear
      await waitFor(() => {
        expect(
          screen.getByText(/message sent/i, { exact: false }),
        ).toBeInTheDocument();
      });

      expect(window.fetch).toHaveBeenCalled();
    });

    it("navigates from email to phone field on Enter", async () => {
      await openDialogAndWaitForTurnstile();

      const email = screen.getByLabelText(/email/i) as HTMLInputElement;
      const phone = screen.getByLabelText(/phone/i) as HTMLInputElement;

      // Focus email and press Enter
      email.focus();
      fireEvent.keyDown(email, { key: "Enter", code: "Enter" });

      // Phone should now be focused
      expect(document.activeElement).toBe(phone);
    });

    it("navigates from phone to message field on Enter", async () => {
      await openDialogAndWaitForTurnstile();

      const phone = screen.getByLabelText(/phone/i) as HTMLInputElement;
      const message = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

      // Focus phone and press Enter
      phone.focus();
      fireEvent.keyDown(phone, { key: "Enter", code: "Enter" });

      // Message should now be focused
      expect(document.activeElement).toBe(message);
    });
  });
});
