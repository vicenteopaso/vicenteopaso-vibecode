import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
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

function openDialog(autoCloseDelay?: number) {
  render(<ContactDialog autoCloseDelay={autoCloseDelay} />);
  const trigger = screen.getByRole("button", { name: /contact/i });
  fireEvent.click(trigger);
}

function fillForm() {
  const email = screen.getByLabelText(/email/i);
  const message = screen.getByLabelText(/message/i);

  fireEvent.change(email, { target: { value: "test@example.com" } });
  fireEvent.change(message, { target: { value: "Hello there, this is a test message." } });
}

async function submitForm() {
  const sendButton = screen.getByRole("button", { name: /send/i });
  await act(async () => {
    fireEvent.click(sendButton);
  });
}

describe("ContactDialog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
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
    vi.useRealTimers();
    window.turnstile = undefined;
  });

  describe("form validation", () => {
    it("requires email and message", async () => {
      openDialog();

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

      openDialog();

      fillForm();

      const message = screen.getByLabelText(/message/i);
      const form = message.closest("form");
      expect(form).not.toBeNull();
      fireEvent.submit(form as HTMLFormElement);

      expect(
        await screen.findByText("Please complete the verification."),
      ).toBeInTheDocument();
    });

    it("renders all form fields correctly", async () => {
      openDialog();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
    });
  });

  describe("success flow with countdown and auto-close", () => {
    it("shows success message after successful submission", async () => {
      openDialog();
      fillForm();

      await submitForm();

      expect(
        await screen.findByText(/Message sent/i),
      ).toBeInTheDocument();
    });

    it("displays countdown after successful submission", async () => {
      openDialog(3);
      fillForm();

      await submitForm();

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/Message sent/i)).toBeInTheDocument();
      });

      // Countdown should be visible
      expect(screen.getByTestId("countdown")).toBeInTheDocument();
      expect(screen.getByText(/closing in 3s/i)).toBeInTheDocument();
    });

    it("counts down each second", async () => {
      openDialog(3);
      fillForm();

      await submitForm();

      await waitFor(() => {
        expect(screen.getByText(/closing in 3s/i)).toBeInTheDocument();
      });

      // Advance timer by 1 second
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/closing in 2s/i)).toBeInTheDocument();
      });

      // Advance timer by another second
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/closing in 1s/i)).toBeInTheDocument();
      });
    });

    it("auto-closes modal when countdown reaches zero", async () => {
      openDialog(2);
      fillForm();

      await submitForm();

      await waitFor(() => {
        expect(screen.getByText(/closing in 2s/i)).toBeInTheDocument();
      });

      // Advance timer to complete countdown
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      // Modal should be closed - dialog should not be visible
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("clears form fields after successful submission", async () => {
      openDialog();
      fillForm();

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const messageInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

      expect(emailInput.value).toBe("test@example.com");
      expect(messageInput.value).toBe("Hello there, this is a test message.");

      await submitForm();

      await waitFor(() => {
        expect(screen.getByText(/Message sent/i)).toBeInTheDocument();
      });

      // Form fields should be cleared
      expect(emailInput.value).toBe("");
      expect(messageInput.value).toBe("");
    });
  });

  describe("error handling - values preserved", () => {
    it("preserves form values when server returns error", async () => {
      vi.spyOn(window, "fetch").mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Server error occurred" }),
      } as Response);

      openDialog();
      fillForm();

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const messageInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

      await submitForm();

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/Server error occurred/i)).toBeInTheDocument();
      });

      // Form values should be preserved
      expect(emailInput.value).toBe("test@example.com");
      expect(messageInput.value).toBe("Hello there, this is a test message.");
    });

    it("displays server error message", async () => {
      vi.spyOn(window, "fetch").mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Rate limit exceeded" }),
      } as Response);

      openDialog();
      fillForm();

      await submitForm();

      expect(await screen.findByText(/Rate limit exceeded/i)).toBeInTheDocument();
    });

    it("resets Turnstile on error", async () => {
      const resetMock = vi.fn();
      if (window.turnstile) {
        window.turnstile.reset = resetMock;
      }

      vi.spyOn(window, "fetch").mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Error" }),
      } as Response);

      openDialog();
      fillForm();

      await submitForm();

      await waitFor(() => {
        expect(resetMock).toHaveBeenCalled();
      });
    });

    it("shows generic error when server response parsing fails", async () => {
      vi.spyOn(window, "fetch").mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error("Parse error");
        },
      } as Response);

      openDialog();
      fillForm();

      await submitForm();

      expect(
        await screen.findByText(/Something went wrong. Please try again./i),
      ).toBeInTheDocument();
    });
  });

  describe("focus and accessibility", () => {
    it("has aria-live region for status announcements", async () => {
      openDialog();

      const statusElement = screen.getByRole("status");
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveAttribute("aria-live", "polite");
    });

    it("marks email input as invalid when validation fails", async () => {
      openDialog();

      const emailInput = screen.getByLabelText(/email/i);
      const form = emailInput.closest("form");

      fireEvent.submit(form as HTMLFormElement);

      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("marks message input as invalid when validation fails", async () => {
      openDialog();

      const messageInput = screen.getByLabelText(/message/i);
      const form = messageInput.closest("form");

      fireEvent.submit(form as HTMLFormElement);

      await waitFor(() => {
        expect(messageInput).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("announces success message to screen readers", async () => {
      openDialog();
      fillForm();

      await submitForm();

      await waitFor(() => {
        const statusElement = screen.getByRole("status");
        expect(statusElement.textContent).toContain("Message sent");
      });
    });

    it("announces error message to screen readers", async () => {
      vi.spyOn(window, "fetch").mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Connection failed" }),
      } as Response);

      openDialog();
      fillForm();

      await submitForm();

      await waitFor(() => {
        const statusElement = screen.getByRole("status");
        expect(statusElement.textContent).toContain("Connection failed");
      });
    });

    it("has required aria attributes on form fields", async () => {
      openDialog();

      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);

      expect(emailInput).toHaveAttribute("aria-required", "true");
      expect(messageInput).toHaveAttribute("aria-required", "true");
    });
  });

  describe("modal state management", () => {
    it("resets state when modal is closed and reopened", async () => {
      openDialog(5);
      fillForm();

      await submitForm();

      await waitFor(() => {
        expect(screen.getByText(/Message sent/i)).toBeInTheDocument();
      });

      // Close the modal
      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      // Modal should be closed
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });

      // Reopen the modal
      const trigger = screen.getByRole("button", { name: /contact/i });
      fireEvent.click(trigger);

      // Success message should not be visible
      expect(screen.queryByText(/Message sent/i)).not.toBeInTheDocument();
      // Countdown should not be visible
      expect(screen.queryByTestId("countdown")).not.toBeInTheDocument();
    });

    it("stops countdown when modal is manually closed", async () => {
      openDialog(10);
      fillForm();

      await submitForm();

      await waitFor(() => {
        expect(screen.getByText(/closing in 10s/i)).toBeInTheDocument();
      });

      // Close the modal manually
      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      // Advance timers
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // Modal should remain closed
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("form interaction", () => {
    it("disables send button while submitting", async () => {
      let resolvePromise: (value: unknown) => void;
      const slowPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.spyOn(window, "fetch").mockReturnValue(slowPromise as Promise<Response>);

      openDialog();
      fillForm();

      const sendButton = screen.getByRole("button", { name: /send/i });

      // Submit the form
      await act(async () => {
        fireEvent.click(sendButton);
      });

      // Button should show "Sending..." and be disabled
      expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({ ok: true }),
        });
      });
    });

    it("disables close button while submitting", async () => {
      let resolvePromise: (value: unknown) => void;
      const slowPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.spyOn(window, "fetch").mockReturnValue(slowPromise as Promise<Response>);

      openDialog();
      fillForm();

      // Submit the form
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /send/i }));
      });

      // Close button should be disabled
      expect(screen.getByRole("button", { name: /close/i })).toBeDisabled();

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({ ok: true }),
        });
      });
    });
  });
});
