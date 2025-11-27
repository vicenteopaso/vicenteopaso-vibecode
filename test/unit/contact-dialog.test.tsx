import { fireEvent, render, screen } from "@testing-library/react";
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
});
