import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { SeoJsonLd } from "../../app/components/SeoJsonLd";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("next/script", () => {
  return {
    __esModule: true,
    default: ({ id, type }: { id: string; type: string }) => (
      <script data-testid={id} type={type} />
    ),
  };
});

describe("SeoJsonLd", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReset();
  });

  it("always renders website JSON-LD script", () => {
    vi.mocked(usePathname).mockReturnValue("/");

    const { getByTestId } = render(<SeoJsonLd />);

    expect(getByTestId("website-json-ld")).toBeInTheDocument();
  });

  it("renders person JSON-LD only on /about and /cv", () => {
    vi.mocked(usePathname).mockReturnValue("/about");
    const { getAllByTestId, unmount } = render(<SeoJsonLd />);

    expect(getAllByTestId("person-json-ld").length).toBeGreaterThan(0);

    unmount();

    vi.mocked(usePathname).mockReturnValue("/cv");
    const { getAllByTestId: getAllByTestIdCv, unmount: unmountCv } = render(
      <SeoJsonLd />,
    );
    expect(getAllByTestIdCv("person-json-ld").length).toBeGreaterThan(0);

    unmountCv();

    vi.mocked(usePathname).mockReturnValue("/");
    const { queryByTestId } = render(<SeoJsonLd />);
    expect(queryByTestId("person-json-ld")).not.toBeInTheDocument();
  });
});
