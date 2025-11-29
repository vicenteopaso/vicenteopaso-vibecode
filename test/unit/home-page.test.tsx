import { render, screen } from "@testing-library/react";
import fs from "fs";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import Home from "../../app/page";

describe("Home page", () => {
  it("renders the About page content", () => {
    const raw = [
      "---",
      "name: Vicente Opaso",
      "title: About",
      "tagline: Engineering leader",
      "initials: VO",
      "slug: about",
      "---",
      "Hello world from about page.",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    render(<Home />);

    expect(screen.getByText("Vicente Opaso")).toBeInTheDocument();
    expect(screen.getByText("Engineering leader")).toBeInTheDocument();
  });
});
