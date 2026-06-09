import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "../../app/not-found";

describe("NotFound page", () => {
  it("renders the 404 heading and helper text", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("404");
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it("links back to the home page", () => {
    render(<NotFound />);

    const homeLink = screen.getByRole("link", { name: /go home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
