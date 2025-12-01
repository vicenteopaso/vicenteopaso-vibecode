import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileCard } from "../../app/components/ProfileCard";

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "dark" }),
}));

vi.mock("next/image", () => {
  return {
    __esModule: true,
    default: ({
      alt,
      src,
      onError,
      ...rest
    }: {
      alt: string;
      src: string;
      onError?: () => void;
    }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt}
        src={src}
        onError={onError}
        data-testid="profile-image"
        {...rest}
      />
    ),
  };
});

beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0); // pick first portrait deterministically
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ProfileCard", () => {
  it("renders name, tagline, links, and social icons", () => {
    render(
      <ProfileCard
        name="Vicente Opaso"
        tagline="Engineering leader"
        initials="VO"
        showLinks
        showAvatar
        showSocialIcons
      />,
    );

    expect(screen.getByText("Vicente Opaso")).toBeInTheDocument();
    expect(screen.getByText("Engineering leader")).toBeInTheDocument();

    // Both mobile and desktop variants render "Read CV" / "Download CV";
    // in tests, we just assert that at least one instance is present.
    expect(screen.getAllByText("Read CV")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Download CV")[0]).toBeInTheDocument();

    expect(
      screen.getAllByRole("link", { name: "GitHub profile" })[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "LinkedIn profile" })[0],
    ).toBeInTheDocument();
  });

  it("falls back to initials when image fails to load", () => {
    render(
      <ProfileCard
        name="Vicente Opaso"
        tagline="Engineering leader"
        initials="VO"
        showAvatar
      />,
    );

    const img = screen.getByTestId("profile-image");
    fireEvent.error(img);

    expect(screen.getByText("VO")).toBeInTheDocument();
  });

  it("renders CV header layout with section links and download icon", () => {
    render(
      <ProfileCard
        name="Vicente Opaso"
        tagline="Engineering leader"
        initials="VO"
        showAvatar={false}
        showLinks={false}
        showSocialIcons
        showDownloadIcon
        sectionLinks={[
          { href: "#experience", label: "Experience" },
          { href: "#skills", label: "Skills" },
        ]}
      />,
    );

    // Download CV link exists (may have multiple instances for mobile/desktop)
    expect(
      screen.getAllByRole("link", { name: "Download CV (PDF)" })[0],
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Experience" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skills" })).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "GitHub profile" }),
    ).toBeInTheDocument();
  });

  it("renders without avatar when showAvatar is false", () => {
    render(
      <ProfileCard
        name="Vicente Opaso"
        tagline="Engineering leader"
        initials="VO"
        showAvatar={false}
      />,
    );

    expect(screen.queryByTestId("profile-image")).not.toBeInTheDocument();
    expect(screen.queryByText("VO")).not.toBeInTheDocument();
  });

  it("renders without links when showLinks is false", () => {
    render(
      <ProfileCard
        name="Vicente Opaso"
        tagline="Engineering leader"
        initials="VO"
        showLinks={false}
      />,
    );

    expect(screen.queryByText("Read CV")).not.toBeInTheDocument();
    expect(screen.queryByText("Download CV")).not.toBeInTheDocument();
  });

  it("renders without social icons when showSocialIcons is false", () => {
    render(
      <ProfileCard
        name="Vicente Opaso"
        tagline="Engineering leader"
        initials="VO"
        showSocialIcons={false}
      />,
    );

    expect(
      screen.queryByRole("link", { name: "GitHub profile" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "LinkedIn profile" }),
    ).not.toBeInTheDocument();
  });

  it("renders portrait image correctly", () => {
    render(
      <ProfileCard
        name="Vicente Opaso"
        tagline="Engineering leader"
        initials="VO"
        showAvatar
      />,
    );

    const img = screen.getByTestId("profile-image");
    expect((img as HTMLImageElement).src).toContain("portrait");
  });

  it("handles missing tagline gracefully", () => {
    render(
      <ProfileCard name="Vicente Opaso" tagline="" initials="VO" showAvatar />,
    );

    expect(screen.getByText("Vicente Opaso")).toBeInTheDocument();
    // Tagline should not render when empty
    expect(screen.queryByText("Engineering leader")).not.toBeInTheDocument();
  });
});
