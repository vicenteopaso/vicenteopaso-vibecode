import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

    expect(screen.getByText("Read CV")).toBeInTheDocument();
    expect(screen.getByText("Download CV")).toBeInTheDocument();

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

    expect(
      screen.getByRole("link", { name: "Download CV (PDF)" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Experience" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skills" })).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "GitHub profile" }),
    ).toBeInTheDocument();
  });
});
