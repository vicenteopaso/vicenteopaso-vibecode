import { render, screen } from "@testing-library/react";
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
  it("renders the CV shell when CV JSON is invalid", async () => {
    mockCvFs({
      locale: "en",
      cvJson: "this is not valid json",
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(
      screen.getByText(/CURRICULUM VITAE · v2026\.04/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /DOWNLOAD PDF/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Acme Corp/i)).toBeNull();
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
    expect(
      screen.getByRole("heading", { name: /Vicente\s*Opaso/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Engineering leader")).toBeInTheDocument();

    // Sections
    expect(screen.getAllByText("SUMMARY").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("EXPERIENCE").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("SKILLS").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("EDUCATION · LANGUAGES").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("PUBLICATIONS").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getAllByText("REFERENCES").length).toBeGreaterThanOrEqual(1);

    // Experience content
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer")).toBeInTheDocument();
    expect(screen.getByText("REMOTE")).toBeInTheDocument();

    // References carousel rendered (at least one visible copy)
    expect(
      screen.getAllByText(/Vicente is great to work with/i).length,
    ).toBeGreaterThanOrEqual(1);

    // Sanitizer should remove script tags from the rendered output.
    expect(document.querySelector("script")).toBeNull();
    // And should keep the visible summary text.
    expect(screen.getByText(/Summary HTML/i)).toBeInTheDocument();
  });

  it("sorts skills by keyword count descending", async () => {
    const cvJson = {
      basics: {
        name: "Vicente Opaso",
      },
      work: [],
      education: [],
      skills: [
        {
          name: "Testing",
          level: "Advanced",
          keywords: ["Jest"],
        },
        {
          name: "Frontend Development",
          level: "Master",
          keywords: ["React", "Next.js", "GraphQL"],
        },
        {
          name: "GitHub",
          level: "Master",
          keywords: ["Actions", "Pages"],
        },
      ],
      languages: [],
      interests: [],
      publications: [],
      references: [],
    };

    mockCvFs({
      locale: "en",
      cvJson,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });
    const { container } = render(ui);

    const skillTitles = Array.from(
      container.querySelectorAll("#cv-skills .v3-cv-skills-grid > div > div:first-child span:first-child"),
    ).map((node) => node.textContent?.trim());

    expect(skillTitles).toEqual([
      "Frontend Development",
      "GitHub",
      "Testing",
    ]);
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

    expect(
      screen.getByRole("heading", { name: /SingleName/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Tech Corp")).toBeNull();
    expect(
      screen.getAllByText("EDUCATION · LANGUAGES").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Minimal University")).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    expect(screen.getByText("Offline Article").closest("a")).not.toBeNull();
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

    expect(screen.getByRole("heading", { name: /Test/i })).toBeInTheDocument();
    expect(screen.getAllByText("SUMMARY").length).toBeGreaterThanOrEqual(1);
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
    expect(screen.getByText("SAN FRANCISCO")).toBeInTheDocument();
  });

  it("renders the shared TLDR content when work highlights are absent", async () => {
    const cvJson = {
      basics: {
        name: "Test User",
      },
    };

    mockCvFs({
      locale: "en",
      meta: { name: "Test" },
      cvJson,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(screen.getByText(/TL;DR —/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /I lead engineering teams and architect frontend platforms\./i,
      ),
    ).toBeInTheDocument();
  });
});

describe("CV Page Masthead Actions", () => {
  const mockCVData = {
    basics: {
      name: "Vicente Opaso",
    },
    education: [],
    work: [],
    skills: [],
    languages: [],
    publications: [],
    references: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the primary masthead actions", async () => {
    mockCvFs({
      locale: "en",
      cvJson: mockCVData,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(screen.getByRole("link", { name: /DOWNLOAD PDF/i })).toHaveAttribute(
      "href",
      expect.stringContaining("/assets/vicente-opaso-cv-2026.pdf"),
    );
    expect(
      screen.getAllByRole("link", { name: /VICENTE@OPA\.SO/i })[0],
    ).toHaveAttribute("href", "#contact");
  });

  it("renders the end CTA links with the current labels", async () => {
    mockCvFs({
      locale: "en",
      cvJson: mockCVData,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(screen.getByRole("link", { name: /GET IN TOUCH/i })).toHaveAttribute(
      "href",
      "/en#contact",
    );
    expect(screen.getByRole("link", { name: /LINKEDIN/i })).toHaveAttribute(
      "href",
      "https://linkedin.com/in/vicenteopaso",
    );
  });

  it("renders the portrait image with descriptive alt text", async () => {
    mockCvFs({
      locale: "en",
      cvJson: mockCVData,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(screen.getByAltText("Vicente Opaso")).toBeInTheDocument();
  });

  it("renders the LinkedIn CTA as an external link", async () => {
    mockCvFs({
      locale: "en",
      cvJson: mockCVData,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    const linkedin = screen.getByRole("link", { name: /LINKEDIN/i });
    expect(linkedin).toHaveAttribute("target", "_blank");
    expect(linkedin).toHaveAttribute("rel", "noreferrer");
  });

  it("renders the email CTA in the footer block", async () => {
    mockCvFs({
      locale: "en",
      cvJson: mockCVData,
    });

    const ui = await CVPage({ params: Promise.resolve({ lang: "en" }) });

    render(ui);

    expect(
      screen.getAllByRole("link", { name: /VICENTE@OPA\.SO/i })[1],
    ).toHaveAttribute("href", "mailto:vicente@opa.so");
  });
});
