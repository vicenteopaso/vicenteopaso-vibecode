import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
    vi.spyOn(window, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requires email and message", async () => {
    openDialog();

    const submit = screen.getByRole("button", { name: /send/i });
    fireEvent.click(submit);

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

    const submit = screen.getByRole("button", { name: /send/i });
    fireEvent.click(submit);

    expect(
      await screen.findByText("Please complete the verification."),
    ).toBeInTheDocument();
  });
});
