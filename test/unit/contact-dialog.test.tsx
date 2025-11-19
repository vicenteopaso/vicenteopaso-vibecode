import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void },
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

describe("ContactDialog", () => {
  beforeEach(() => {
    window.turnstile = {
      render: vi.fn(),
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
    openDialog();

    const email = screen.getByLabelText(/email/i);
    const message = screen.getByLabelText(/message/i);

    fireEvent.change(email, { target: { value: "test@example.com" } });
    fireEvent.change(message, { target: { value: "Hello" } });

    // Do NOT invoke the Turnstile callback here so the token remains null.
    // Submit the form programmatically without a Turnstile token to
    // exercise the verification check in the submit handler.
    const form = message.closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(
      await screen.findByText("Please complete the verification."),
    ).toBeInTheDocument();
  });
});
