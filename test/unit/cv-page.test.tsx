import { render, screen, waitFor } from "@testing-library/react";
import fs from "fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CVPage from "../../app/[lang]/cv/page";

const realReadFileSync = fs.readFileSync;

function mockCvFs({
  locale = "en",
  meta,
  cvJson,
}: {
  locale?: string;
  meta?: { name?: string; title?: string; tagline?: string };
  cvJson: unknown;
}) {
  const metaConfig = {
    name: "Vicente",
    title: "CV",
    tagline: "Engineering leader",
    ...meta,
  };

  const metaLines = [
    "---",
    `name: ${metaConfig.name}`,
    `title: ${metaConfig.title}`,
    metaConfig.tagline ? `tagline: ${metaConfig.tagline}` : undefined,
    "slug: cv",
    "---",
    "",
  ].filter(Boolean) as string[];

  const metaRaw = metaLines.join("\n");
  const cvContent =
    typeof cvJson === "string" ? cvJson : JSON.stringify(cvJson);

  vi.spyOn(fs, "readFileSync").mockImplementation((filePath, options) => {
    const file = String(filePath);

    if (file.endsWith(`${locale}/cv.md`)) {
      return metaRaw;
    }

    if (file.endsWith(`${locale}/cv.json`)) {
      return cvContent;
    }

    return realReadFileSync(filePath, options as never);
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CVPage", () => {
  it("renders fallback message when CV JSON is invalid", async () => {
    mockCvFs({
      locale: "en",
      cvJson: "this is not valid json",
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(screen.getByText("CV")).toBeInTheDocument();
    expect(
      screen.getByText(
        /CV data could not be loaded. Please check that the CV JSON file/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/content\/en\/cv\.json/)).toBeInTheDocument();
  });

  it("renders CV sections when JSON is valid", async () => {
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

    mockCvFs({
      locale: "en",
      cvJson,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

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

  it("handles minimal CV JSON and optional branches", async () => {
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

    mockCvFs({
      locale: "en",
      cvJson,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(screen.getByText("SingleName")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Experience" })).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Education" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Minimal University")).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    expect(screen.getByText("Offline Article").closest("a")).toBeNull();
  });

  it("handles CV with all optional fields missing", async () => {
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

    mockCvFs({
      locale: "en",
      meta: { name: "Test" },
      cvJson,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(screen.getByRole("heading", { name: "Test" })).toBeInTheDocument();
  });

  it("renders work experience with multiple positions", async () => {
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

    mockCvFs({
      locale: "en",
      meta: { name: "Test" },
      cvJson,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("San Francisco")).toBeInTheDocument();
  });

  it("renders highlights with title when provided", async () => {
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

    mockCvFs({
      locale: "en",
      meta: { name: "Test" },
      cvJson,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

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
    mockCvFs({
      locale: "en",
      cvJson: mockCVData,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    await waitFor(() => {
      const githubLinks = screen.getAllByRole("link", {
        name: /GitHub profile/i,
      });
      const linkedInLinks = screen.getAllByRole("link", {
        name: /LinkedIn profile/i,
      });
      const xLinks = screen.getAllByRole("link", {
        name: /X \(Twitter\) profile/i,
      });

      expect(githubLinks.length).toBeGreaterThanOrEqual(1);
      expect(linkedInLinks.length).toBeGreaterThanOrEqual(1);
      expect(xLinks.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("should have correct hrefs for social icon links", async () => {
    mockCvFs({
      locale: "en",
      cvJson: mockCVData,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    await waitFor(() => {
      const githubLinks = screen.getAllByRole("link", {
        name: /GitHub profile/i,
      });
      expect(
        githubLinks.some((link) =>
          link.getAttribute("href")?.includes("github.com/vicenteopaso"),
        ),
      ).toBe(true);

      const linkedInLinks = screen.getAllByRole("link", {
        name: /LinkedIn profile/i,
      });
      expect(
        linkedInLinks.some((link) =>
          link.getAttribute("href")?.includes("linkedin.com"),
        ),
      ).toBe(true);

      const xLinks = screen.getAllByRole("link", {
        name: /X \(Twitter\) profile/i,
      });
      expect(
        xLinks.some((link) => link.getAttribute("href")?.includes("x.com")),
      ).toBe(true);
    });
  });

  it("should have proper accessibility attributes on social icons", async () => {
    mockCvFs({
      locale: "en",
      cvJson: mockCVData,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    await waitFor(() => {
      const githubLinks = screen.getAllByRole("link", {
        name: /GitHub profile/i,
      });
      githubLinks.forEach((link) => {
        expect(link).toHaveAttribute("aria-label", "GitHub profile");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noreferrer");
      });

      const linkedInLinks = screen.getAllByRole("link", {
        name: /LinkedIn profile/i,
      });
      linkedInLinks.forEach((link) => {
        expect(link).toHaveAttribute("aria-label", "LinkedIn profile");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noreferrer");
      });

      const xLinks = screen.getAllByRole("link", {
        name: /X \(Twitter\) profile/i,
      });
      xLinks.forEach((link) => {
        expect(link).toHaveAttribute("aria-label", "X (Twitter) profile");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noreferrer");
      });
    });
  });

  it("should render social icons with correct styling classes", async () => {
    mockCvFs({
      locale: "en",
      cvJson: mockCVData,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    await waitFor(() => {
      const socialLinks = screen.getAllByRole("link", {
        name: /(GitHub profile|LinkedIn profile|X \(Twitter\) profile)/i,
      });

      socialLinks.forEach((link) => {
        expect(link).toHaveClass("btn-outline");
        expect(link).toHaveClass("h-8");
        expect(link).toHaveClass("w-8");
        expect(link).toHaveClass("p-0");
      });
    });
  });

  it("should render download CV button with social icons in CV header", async () => {
    mockCvFs({
      locale: "en",
      cvJson: mockCVData,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    await waitFor(() => {
      const downloadButtons = screen.getAllByRole("link", {
        name: /Download CV/i,
      });
      expect(downloadButtons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
