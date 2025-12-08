import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CookiePolicyModal } from "../../app/components/CookiePolicyModal";
import { PrivacyPolicyModal } from "../../app/components/PrivacyPolicyModal";
import { TechStackModal } from "../../app/components/TechStackModal";

const trackSpy = vi.fn();

vi.mock("@vercel/analytics", () => ({
  track: (...args: unknown[]) => trackSpy(...args),
}));

function mockContentFetch(body: { title: string; body: string }, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  } as Response);

  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe("Footer policy and tech modals", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("CookiePolicyModal loads and renders content on success", async () => {
    const fetchMock = mockContentFetch(
      { title: "Cookie Policy", body: "Cookie policy body" },
      true,
    );

    render(<CookiePolicyModal />);

    fireEvent.click(screen.getByRole("button", { name: "Cookie Policy" }));

    expect(
      await screen.findByRole("heading", { name: "Cookie Policy" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Cookie policy body")).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/content/cookie-policy");
  });

  it("CookiePolicyModal shows an error message on failure", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false } as Response);
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<CookiePolicyModal />);

    fireEvent.click(screen.getByRole("button", { name: "Cookie Policy" }));

    expect(
      await screen.findByText(/failed to load cookie policy/i),
    ).toBeInTheDocument();
  });

  it("PrivacyPolicyModal loads and renders content on success", async () => {
    const fetchMock = mockContentFetch(
      { title: "Privacy Policy", body: "Privacy policy body" },
      true,
    );

    render(<PrivacyPolicyModal />);

    fireEvent.click(screen.getByRole("button", { name: "Privacy Policy" }));

    expect(
      await screen.findByRole("heading", { name: "Privacy Policy" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Privacy policy body")).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/content/privacy-policy");
  });

  it("PrivacyPolicyModal shows an error message on failure", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false } as Response);
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<PrivacyPolicyModal />);

    fireEvent.click(screen.getByRole("button", { name: "Privacy Policy" }));

    expect(
      await screen.findByText(/failed to load privacy policy/i),
    ).toBeInTheDocument();
  });

  it("TechStackModal loads and renders content on success", async () => {
    const fetchMock = mockContentFetch(
      { title: "Tech Stack", body: "Tech stack body" },
      true,
    );

    render(<TechStackModal />);

    fireEvent.click(screen.getByRole("button", { name: "Tech Stack" }));

    expect(
      await screen.findByRole("heading", { name: "Tech Stack" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Tech stack body")).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/content/tech-stack");
  });

  it("TechStackModal shows an error message on failure", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false } as Response);
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<TechStackModal />);

    fireEvent.click(screen.getByRole("button", { name: "Tech Stack" }));

    expect(
      await screen.findByText(/failed to load tech stack/i),
    ).toBeInTheDocument();
  });
});
