import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../app/about/page", () => ({
  __esModule: true,
  default: () => <div data-testid="about-page">About page content</div>,
}));

import Home from "../../app/page";

describe("Home page", () => {
  it("renders the About page content", () => {
    render(<Home />);

    expect(screen.getByTestId("about-page")).toBeInTheDocument();
  });
});
