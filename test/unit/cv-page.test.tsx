import React from "react";
import fs from "fs";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CVPage from "../../app/cv/page";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CVPage", () => {
  it("renders fallback message when CV JSON is invalid", () => {
    const raw = [
      "---",
      "name: Vicente",
      "title: CV",
      "tagline: Engineering leader",
      "slug: cv",
      "---",
      "this is not valid json",
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    render(<CVPage />);

    expect(screen.getByText("CV")).toBeInTheDocument();
    expect(
      screen.getByText(
        /CV data could not be loaded. Please check that the JSON body/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/content\/cv\.md/)).toBeInTheDocument();
  });

  it("renders CV sections when JSON is valid", () => {
    const cvJson = {
      basics: {
        name: "Vicente Opaso",
        label: "Engineering leader",
        summary: "<p>Summary HTML</p>",
        highlights: [
          "Led teams",
          {
            title: "<strong>Technical leadership</strong>",
            content: "<p>Built modern web platforms</p>",
          },
        ],
      },
      work: [
        {
          company: "Acme Corp",
          location: "Remote",
          positions: [
            {
              position: "Staff Engineer",
              summary: "<p>Did important things</p>",
              startDate: "2020",
              endDate: "2024",
              highlights: ["<p>Shipped features</p>"],
              skills: ["TypeScript", "Next.js"],
            },
          ],
        },
      ],
      education: [
        {
          institution: "Example University",
          area: "Computer Science",
          studyType: "BSc",
          startDate: "2010",
          endDate: "2014",
        },
      ],
      skills: [
        {
          name: "Languages",
          level: "Expert",
          keywords: ["TypeScript", "JavaScript"],
        },
      ],
      languages: [
        {
          language: "English",
          fluency: "Native",
        },
      ],
      interests: [
        {
          name: "Mentoring",
          keywords: ["Leadership", "Coaching"],
        },
      ],
      publications: [
        {
          name: "Great Article",
          publisher: "Tech Journal",
          releaseDate: "2023",
          url: "https://example.com/article",
        },
      ],
      references: [
        {
          name: "<strong>Someone</strong>",
          reference: "<p>Vicente is great to work with.</p>",
        },
      ],
    };

    const raw = [
      "---",
      "name: Vicente",
      "title: CV",
      "tagline: Engineering leader",
      "slug: cv",
      "---",
      JSON.stringify(cvJson),
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    render(<CVPage />);

    // Header
    expect(screen.getByText("Vicente Opaso")).toBeInTheDocument();
    expect(screen.getByText("Engineering leader")).toBeInTheDocument();

    // Sections
    expect(
      screen.getByRole("heading", { name: "Experience" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Education" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Skills" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Languages" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Interests" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Publications" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "References" }),
    ).toBeInTheDocument();

    // Experience content
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer")).toBeInTheDocument();

    // References carousel rendered
    expect(
      screen.getByText(/Vicente is great to work with/i),
    ).toBeInTheDocument();
  });

  it("handles minimal CV JSON and optional branches", () => {
    const cvJson = {
      basics: {
        name: "SingleName",
      },
      work: [],
      education: [
        {
          institution: "Minimal University",
        },
      ],
      skills: [
        {
          name: "Tools",
        },
      ],
      languages: [
        {
          language: "Spanish",
        },
      ],
      interests: [
        {
          name: "Hiking",
        },
      ],
      publications: [
        {
          name: "Offline Article",
          publisher: "Print Journal",
        },
      ],
      references: [],
    };

    const raw = [
      "---",
      "name: Vicente",
      "title: CV",
      "slug: cv",
      "---",
      JSON.stringify(cvJson),
    ].join("\n");

    vi.spyOn(fs, "readFileSync").mockReturnValue(raw);

    render(<CVPage />);

    // Header uses basics.name and getInitials handles single-word name
    expect(screen.getByText("SingleName")).toBeInTheDocument();

    // Experience section should be omitted when work is empty
    expect(screen.queryByRole("heading", { name: "Experience" })).toBeNull();

    // Education section still renders
    expect(
      screen.getByRole("heading", { name: "Education" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Minimal University")).toBeInTheDocument();

    // Languages without fluency render without separator text
    expect(screen.getByText("Spanish")).toBeInTheDocument();

    // Publications without URL render as plain text, not a link
    expect(screen.getByText("Offline Article").closest("a")).toBeNull();
  });
});
