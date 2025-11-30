import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("renders all form fields correctly", async () => {
    await openDialogAndWaitForTurnstile();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  describe("success flow", () => {
    it("resets form fields and disables inputs after successful submission", async () => {
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
    });

    it("disables send button after successful submission", async () => {
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

      // Send button should be disabled
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
      await waitFor(() => {
        expect(screen.getByText(/closing in/i)).toBeInTheDocument();
      });
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

      // Wait for countdown to appear
      await waitFor(() => {
        expect(screen.getByText(/closing in/i)).toBeInTheDocument();
      });

      // Find countdown message container and verify aria attributes
      const countdownRegion = screen
        .getByText(/closing in/i)
        .closest('[role="status"]');
      expect(countdownRegion).toHaveAttribute("aria-live", "polite");
      expect(countdownRegion).toHaveAttribute("aria-atomic", "true");
    });
  });
});
