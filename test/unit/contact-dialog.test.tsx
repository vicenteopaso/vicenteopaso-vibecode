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

  it("shows countdown after successful submission", async () => {
    openDialog();
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
    openDialog();
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
    openDialog();
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
    openDialog();
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
});

describe("ContactDialog countdown with fake timers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-site-key";

    type TurnstileRender = (
      container: HTMLElement,
      options: { callback: (token: string) => void },
    ) => void;

    window.turnstile = {
      render: vi.fn((_, options: { callback: (token: string) => void }) => {
        options.callback("test-token");
      }) as TurnstileRender,
      reset: vi.fn(),
    };

    vi.spyOn(window, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ ok: true }),
      } as Response),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    window.turnstile = undefined;
  });

  it("countdown decrements and dialog closes at zero", async () => {
    render(<ContactDialog />);
    const trigger = screen.getByRole("button", { name: /contact/i });

    await act(async () => {
      fireEvent.click(trigger);
      // Advance timers to allow Turnstile interval to run
      vi.advanceTimersByTime(500);
    });

    const email = screen.getByLabelText(/email/i);
    const message = screen.getByLabelText(/message/i);

    await act(async () => {
      fireEvent.change(email, { target: { value: "test@example.com" } });
      fireEvent.change(message, { target: { value: "Hello" } });
    });

    const form = message.closest("form");
    expect(form).not.toBeNull();

    // Submit the form
    await act(async () => {
      fireEvent.submit(form as HTMLFormElement);
      // Flush microtasks for the fetch promise
      await vi.runAllTimersAsync();
    });

    // Verify countdown started at 10
    expect(screen.getByText("10")).toBeInTheDocument();

    // Advance timer by 1 second
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Should now show 9
    expect(screen.getByText("9")).toBeInTheDocument();

    // Advance to the end of the countdown
    await act(async () => {
      vi.advanceTimersByTime(9000);
    });

    // Dialog should be closed - the modal should no longer be in the document
    expect(screen.queryByText(/Message sent/i)).not.toBeInTheDocument();
  });

  it("reopens with fresh empty form after countdown closes", async () => {
    render(<ContactDialog />);
    const trigger = screen.getByRole("button", { name: /contact/i });

    await act(async () => {
      fireEvent.click(trigger);
      // Advance timers to allow Turnstile interval to run
      vi.advanceTimersByTime(500);
    });

    const email = screen.getByLabelText(/email/i) as HTMLInputElement;
    const message = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(email, { target: { value: "test@example.com" } });
      fireEvent.change(message, { target: { value: "Hello" } });
    });

    const form = message.closest("form");
    expect(form).not.toBeNull();

    // Submit the form
    await act(async () => {
      fireEvent.submit(form as HTMLFormElement);
      await vi.runAllTimersAsync();
    });

    // Verify countdown started
    expect(screen.getByText(/This dialog will close in/i)).toBeInTheDocument();

    // Advance to close the dialog
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    // Dialog should be closed
    expect(screen.queryByText(/Message sent/i)).not.toBeInTheDocument();

    // Re-open the dialog
    const newTrigger = screen.getByRole("button", { name: /contact/i });
    await act(async () => {
      fireEvent.click(newTrigger);
      // Advance timers to allow Turnstile interval to run
      vi.advanceTimersByTime(500);
    });

    // Form should be empty and enabled
    const newEmail = screen.getByLabelText(/email/i) as HTMLInputElement;
    const newMessage = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

    expect(newEmail.value).toBe("");
    expect(newMessage.value).toBe("");
    expect(newEmail).not.toBeDisabled();
    expect(newMessage).not.toBeDisabled();

    // Should not show countdown or success message
    expect(
      screen.queryByText(/This dialog will close in/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Message sent/i)).not.toBeInTheDocument();
  });
});
