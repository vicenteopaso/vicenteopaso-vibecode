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

function openDialog() {
  render(<ContactDialog />);
  const trigger = screen.getByRole("button", { name: /contact/i });
  fireEvent.click(trigger);
}

function fillForm() {
  const email = screen.getByLabelText(/email/i);
  const message = screen.getByLabelText(/message/i);

  fireEvent.change(email, { target: { value: "test@example.com" } });
  fireEvent.change(message, { target: { value: "Hello" } });
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

  it("preserves form values and keeps inputs enabled after validation error", async () => {
    openDialog();

    const email = screen.getByLabelText(/email/i) as HTMLInputElement;
    const message = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    const phone = screen.getByLabelText(/phone/i) as HTMLInputElement;

    // Fill only email, leave message empty to trigger validation error
    fireEvent.change(email, { target: { value: "user@example.com" } });
    fireEvent.change(phone, { target: { value: "555-1234" } });

    const form = email.closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    // Error should be displayed
    expect(
      await screen.findByText("Please provide a message."),
    ).toBeInTheDocument();

    // Form values should be preserved
    expect(email.value).toBe("user@example.com");
    expect(phone.value).toBe("555-1234");

    // Inputs should remain enabled
    expect(email).not.toBeDisabled();
    expect(message).not.toBeDisabled();
    expect(phone).not.toBeDisabled();

    // Modal should still be visible
    expect(
      screen.getByRole("heading", { name: /contact me/i }),
    ).toBeInTheDocument();
  });

  it("preserves form values and keeps inputs enabled after server error", async () => {
    // Mock fetch to return a server error
    vi.spyOn(window, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Server error occurred." }),
    } as Response);

    openDialog();

    // Wait for Turnstile to provide a token (Send button becomes enabled)
    await waitFor(() => {
      const sendButton = screen.getByRole("button", { name: /send/i });
      expect(sendButton).not.toBeDisabled();
    });

    const email = screen.getByLabelText(/email/i) as HTMLInputElement;
    const message = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    const phone = screen.getByLabelText(/phone/i) as HTMLInputElement;

    // Fill all required fields
    fireEvent.change(email, { target: { value: "user@example.com" } });
    fireEvent.change(phone, { target: { value: "555-1234" } });
    fireEvent.change(message, { target: { value: "Hello, this is a test message." } });

    const form = email.closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    // Wait for the async operation to complete and check the result
    await waitFor(() => {
      // Server error should be displayed
      expect(screen.getByText("Server error occurred.")).toBeInTheDocument();
    });

    // Form values should be preserved
    expect(email.value).toBe("user@example.com");
    expect(phone.value).toBe("555-1234");
    expect(message.value).toBe("Hello, this is a test message.");

    // Inputs should remain enabled (not disabled)
    expect(email).not.toBeDisabled();
    expect(message).not.toBeDisabled();
    expect(phone).not.toBeDisabled();

    // Modal should still be visible
    expect(
      screen.getByRole("heading", { name: /contact me/i }),
    ).toBeInTheDocument();

    // Turnstile should have been reset for retry
    expect(window.turnstile?.reset).toHaveBeenCalled();
  });

  it("does not close modal or trigger countdown after error", async () => {
    // Mock fetch to return a server error
    vi.spyOn(window, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Something went wrong." }),
    } as Response);

    openDialog();

    // Wait for Turnstile to provide a token (Send button becomes enabled)
    await waitFor(() => {
      const sendButton = screen.getByRole("button", { name: /send/i });
      expect(sendButton).not.toBeDisabled();
    });

    fillForm();

    const email = screen.getByLabelText(/email/i);
    const form = email.closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
    });

    // Modal should remain open (heading still visible)
    expect(
      screen.getByRole("heading", { name: /contact me/i }),
    ).toBeInTheDocument();

    // Close button should still be present and functional
    expect(
      screen.getByRole("button", { name: /close/i }),
    ).toBeInTheDocument();
  });
});
