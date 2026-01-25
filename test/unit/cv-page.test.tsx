import { render, screen, waitFor } from "@testing-library/react";
import fs from "fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CVPage from "../../app/[lang]/cv/page";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CVPage", () => {
  it("renders fallback message when CV JSON is invalid", () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      "---\nname: Vicente\ntitle: CV\ntagline: Engineering leader\nslug: cv\n---\nthis is not valid json",
    );

    render(<CVPage params={Promise.resolve({ lang: "en" })} />);

    expect(screen.getByText("CV")).toBeInTheDocument();
    expect(
      screen.getByText(
        /CV data could not be loaded. Please check that the JSON body/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/content\/en\/cv\.md/)).toBeInTheDocument();
  });

  it("renders CV sections when JSON is valid", () => {
    const cvJson = {
      basics: {
        name: "Vicente Opaso",
        label: "Engineering leader",
        summary:
          "<p>Summary HTML</p><script>window.evilSummary = true;</script>",
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

    vi.spyOn(fs, "readFileSync").mockReturnValue(
      `---\nname: Vicente\ntitle: CV\ntagline: Engineering leader\nslug: cv\n---\n${JSON.stringify(cvJson)}`,
    );

    render(<CVPage params={Promise.resolve({ lang: "en" })} />);

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

    // References carousel rendered (at least one visible copy)
    expect(
      screen.getAllByText(/Vicente is great to work with/i).length,
    ).toBeGreaterThanOrEqual(1);

    // Sanitizer should remove script tags from the rendered output.
    expect(document.querySelector("script")).toBeNull();
    // And should keep the visible summary text.
    expect(screen.getByText("Summary HTML")).toBeInTheDocument();
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

    vi.spyOn(fs, "readFileSync").mockReturnValue(
      `---\nname: Vicente\ntitle: CV\nslug: cv\n---\n${JSON.stringify(cvJson)}`,
    );

    render(<CVPage params={Promise.resolve({ lang: "en" })} />);

    // Header uses basics.name and getInitials handles single-word name
    expect(screen.getByText("SingleName")).toBeInTheDocument();

    // Experience section should be omitted when work array is empty
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

  it("handles CV with all optional fields missing", () => {
    const cvJson = {
      basics: {},
      work: [],
      education: [],
      skills: [],
      languages: [],
      interests: [],
      publications: [],
      references: [],
    };

    vi.spyOn(fs, "readFileSync").mockReturnValue(
      `---\nname: Test\ntitle: CV\nslug: cv\n---\n${JSON.stringify(cvJson)}`,
    );

    render(<CVPage params={Promise.resolve({ lang: "en" })} />);

    // Should render without crashing even when all sections are empty
    expect(screen.getByRole("heading", { name: "Test" })).toBeInTheDocument();
  });

  it("renders work experience with multiple positions", () => {
    const cvJson = {
      basics: {
        name: "Test User",
      },
      work: [
        {
          company: "Tech Corp",
          location: "San Francisco",
          positions: [
            {
              position: "Senior Engineer",
              startDate: "2022",
              endDate: "2024",
              summary: "<p>Current role</p>",
              highlights: ["<p>Built systems</p>"],
              skills: ["React", "Node.js"],
            },
            {
              position: "Engineer",
              startDate: "2020",
              endDate: "2022",
              summary: "<p>Previous role</p>",
              highlights: [],
              skills: [],
            },
          ],
        },
      ],
    };

    vi.spyOn(fs, "readFileSync").mockReturnValue(
      `---\nname: Test\ntitle: CV\nslug: cv\n---\n${JSON.stringify(cvJson)}`,
    );

    render(<CVPage params={Promise.resolve({ lang: "en" })} />);

    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("San Francisco")).toBeInTheDocument();
  });

  it("renders highlights with title when provided", () => {
    const cvJson = {
      basics: {
        name: "Test User",
        highlights: [
          "Simple highlight",
          {
            title: "Complex Highlight",
            content: "<p>With structured content</p>",
          },
        ],
      },
    };

    vi.spyOn(fs, "readFileSync").mockReturnValue(
      `---\nname: Test\ntitle: CV\nslug: cv\n---\n${JSON.stringify(cvJson)}`,
    );

    render(<CVPage params={Promise.resolve({ lang: "en" })} />);

    expect(screen.getByText("Simple highlight")).toBeInTheDocument();
    expect(screen.getByText("Complex Highlight")).toBeInTheDocument();
    expect(screen.getByText("With structured content")).toBeInTheDocument();
  });
});

describe("CV Page Social Icons", () => {
  const mockCVData = {
    intro: "Test intro",
    education: [],
    experience: [],
    skills: [],
    highlights: [],
    references: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render social icons in ProfileCard when CV page loads", async () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      `---\n${JSON.stringify(mockCVData)}`,
    );

    render(<CVPage params={Promise.resolve({ lang: "en" })} />);

    await waitFor(() => {
      const githubLink = screen.queryByRole("link", { name: /GitHub/i });
      const linkedInLink = screen.queryByRole("link", { name: /LinkedIn/i });
      const xLink = screen.queryByRole("link", { name: /X/i });

      expect(githubLink).toBeInTheDocument();
      expect(linkedInLink).toBeInTheDocument();
      expect(xLink).toBeInTheDocument();
    });
  });

  it("should have correct hrefs for social icon links", async () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      `---\n${JSON.stringify(mockCVData)}`,
    );

    render(<CVPage params={Promise.resolve({ lang: "en" })} />);

    await waitFor(() => {
      const githubLink = screen.queryByRole("link", { name: /GitHub/i });
      const linkedInLink = screen.queryByRole("link", { name: /LinkedIn/i });
      const xLink = screen.queryByRole("link", { name: /X/i });

      expect(githubLink?.getAttribute("href")).toContain(
        "github.com/vicenteopaso",
      );
      expect(linkedInLink?.getAttribute("href")).toContain("linkedin.com");
      expect(xLink?.getAttribute("href")).toContain("x.com");
    });
  });

  it("should have proper accessibility attributes on social icons", async () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      `---\n${JSON.stringify(mockCVData)}`,
    );

    render(<CVPage params={Promise.resolve({ lang: "en" })} />);

    await waitFor(() => {
      const githubLink = screen.queryByRole("link", { name: /GitHub/i });
      const linkedInLink = screen.queryByRole("link", { name: /LinkedIn/i });
      const xLink = screen.queryByRole("link", { name: /X/i });

      // Verify GitHub link accessibility
      expect(githubLink).toHaveAttribute("aria-label");
      expect(githubLink).toHaveAttribute("target", "_blank");
      expect(githubLink).toHaveAttribute("rel", "noreferrer");

      // Verify LinkedIn link accessibility
      expect(linkedInLink).toHaveAttribute("aria-label");
      expect(linkedInLink).toHaveAttribute("target", "_blank");
      expect(linkedInLink).toHaveAttribute("rel", "noreferrer");

      // Verify X (Twitter) link accessibility
      expect(xLink).toHaveAttribute("aria-label");
      expect(xLink).toHaveAttribute("target", "_blank");
      expect(xLink).toHaveAttribute("rel", "noreferrer");
    });
  });

  it("should render social icons with correct styling classes", async () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      `---\n${JSON.stringify(mockCVData)}`,
    );

    render(<CVPage params={Promise.resolve({ lang: "en" })} />);

    await waitFor(() => {
      const socialLinks = screen.queryAllByRole("link", {
        name: /(GitHub|LinkedIn|X)/i,
      });

      socialLinks.forEach((link) => {
        // Verify consistent styling classes for all social icons
        expect(link).toHaveClass("h-8");
        expect(link).toHaveClass("w-8");
        expect(link).toHaveClass("rounded-full");
        expect(link).toHaveClass("border");
      });
    });
  });

  it("should render download CV button with proper accessibility", async () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      `---\n${JSON.stringify(mockCVData)}`,
    );

    render(<CVPage params={Promise.resolve({ lang: "en" })} />);

    await waitFor(() => {
      const downloadButton = screen.queryByRole("link", {
        name: /Download CV/i,
      });

      // Download button should be accessible and properly labeled
      expect(downloadButton).toBeInTheDocument();
      expect(downloadButton).toHaveAttribute("aria-label");
    });
  });
});
