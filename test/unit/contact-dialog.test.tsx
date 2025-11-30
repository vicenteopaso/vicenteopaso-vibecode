import {
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

async function openDialog() {
  render(<ContactDialog />);
  const trigger = screen.getByRole("button", { name: /contact/i });
  fireEvent.click(trigger);
  // Wait for the dialog to open and the Turnstile callback to provide a token
  // The Send button is disabled when there's no token, so we wait for it to be enabled
  await waitFor(
    () => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      // The Send button should not be disabled (meaning token is set)
      const sendButton = screen.getByRole("button", { name: /send/i });
      expect(sendButton).not.toBeDisabled();
    },
    { timeout: 1000 },
  );
}

function fillForm() {
  const email = screen.getByLabelText(/email/i);
  const message = screen.getByLabelText(/message/i);

  fireEvent.change(email, { target: { value: "test@example.com" } });
  fireEvent.change(message, { target: { value: "Hello" } });
}

describe("ContactDialog", () => {
  // Store the turnstile callback so reset() can invoke it
  let turnstileCallback: ((token: string) => void) | null = null;

  beforeEach(() => {
    turnstileCallback = null;
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-site-key";

    type TurnstileRender = (
      container: HTMLElement,
      options: { callback: (token: string) => void },
    ) => void;

    window.turnstile = {
      render: vi.fn((_, options: { callback: (token: string) => void }) => {
        // Store the callback for reset() to use
        turnstileCallback = options.callback;
        // Simulate Turnstile immediately providing a token
        options.callback("test-token");
      }) as TurnstileRender,
      reset: vi.fn(() => {
        // When reset is called, re-invoke the callback with a new token
        // This simulates real Turnstile behavior where reset triggers re-verification
        if (turnstileCallback) {
          turnstileCallback("test-token-after-reset");
        }
      }),
    };

    vi.spyOn(window, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.turnstile = undefined;
    turnstileCallback = null;
  });

  it("requires email and message", async () => {
    await openDialog();

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

    // Use manual dialog opening since we don't want to wait for token
    render(<ContactDialog />);
    const trigger = screen.getByRole("button", { name: /contact/i });
    fireEvent.click(trigger);

    // Wait for dialog to be visible
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

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
    await openDialog();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("shows countdown after successful submission", async () => {
    await openDialog();
    fillForm();

    const form = screen.getByLabelText(/message/i).closest("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);

    // Should show success message
    expect(await screen.findByText(/Message sent/i)).toBeInTheDocument();

    // Should show countdown
    expect(
      await screen.findByText(/This dialog will close in/i),
    ).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("disables form inputs after successful submission", async () => {
    await openDialog();
    fillForm();

    const email = screen.getByLabelText(/email/i);
    const phone = screen.getByLabelText(/phone/i);
    const message = screen.getByLabelText(/message/i);
    const sendButton = screen.getByRole("button", { name: /send/i });

    expect(email).not.toBeDisabled();
    expect(phone).not.toBeDisabled();
    expect(message).not.toBeDisabled();

    const form = message.closest("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText(/Message sent/i)).toBeInTheDocument();
    });

    // Form inputs should be disabled
    expect(email).toBeDisabled();
    expect(phone).toBeDisabled();
    expect(message).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it("clears form fields after successful submission", async () => {
    await openDialog();
    fillForm();

    const email = screen.getByLabelText(/email/i) as HTMLInputElement;
    const message = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

    expect(email.value).toBe("test@example.com");
    expect(message.value).toBe("Hello");

    const form = message.closest("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText(/Message sent/i)).toBeInTheDocument();
    });

    // Form fields should be cleared
    expect(email.value).toBe("");
    expect(message.value).toBe("");
  });

  it("has accessible countdown with aria-live region", async () => {
    await openDialog();
    fillForm();

    const form = screen.getByLabelText(/message/i).closest("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText(/Message sent/i)).toBeInTheDocument();
    });

    // The countdown should be inside an aria-live region
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
    expect(statusRegion).toHaveAttribute("aria-atomic", "true");
    expect(statusRegion).toHaveTextContent(/This dialog will close in/i);
  });

  it("form resets to initial state when closed and reopened", async () => {
    render(<ContactDialog />);
    const trigger = screen.getByRole("button", { name: /contact/i });
    fireEvent.click(trigger);

    // Fill the form
    const email = screen.getByLabelText(/email/i) as HTMLInputElement;
    const phone = screen.getByLabelText(/phone/i) as HTMLInputElement;
    const message = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

    fireEvent.change(email, { target: { value: "test@example.com" } });
    fireEvent.change(phone, { target: { value: "123-456-7890" } });
    fireEvent.change(message, { target: { value: "Hello there" } });

    expect(email.value).toBe("test@example.com");
    expect(phone.value).toBe("123-456-7890");
    expect(message.value).toBe("Hello there");

    // Close the dialog
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    // Wait for modal to close
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // Reopen the dialog
    fireEvent.click(trigger);

    // Wait for modal to reopen
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Form should be empty
    const newEmail = screen.getByLabelText(/email/i) as HTMLInputElement;
    const newPhone = screen.getByLabelText(/phone/i) as HTMLInputElement;
    const newMessage = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

    expect(newEmail.value).toBe("");
    expect(newPhone.value).toBe("");
    expect(newMessage.value).toBe("");
    expect(newEmail).not.toBeDisabled();
    expect(newMessage).not.toBeDisabled();
  });
});
