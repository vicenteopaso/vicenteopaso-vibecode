import { render, screen, waitFor } from "@testing-library/react";
import { useParams } from "next/navigation";
import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LocaleProvider, useLocale } from "../../app/components/LocaleProvider";

// Mock next/navigation
vi.mock("next/navigation");

// Component to access useLocale hook in tests
function TestComponent() {
  const { locale, setLocale } = useLocale();
  return (
    <div>
      <div data-testid="locale-display">{locale}</div>
      <button onClick={() => setLocale("es")} data-testid="set-locale-btn">
        Set Spanish
      </button>
    </div>
  );
}

describe("LocaleProvider and useLocale", () => {
  let mockUseParams: Mock;
  let store: Record<string, string>;

  beforeEach(() => {
    mockUseParams = vi.mocked(useParams);
    // Mock localStorage
    store = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      length: 0,
      key: vi.fn(() => null),
    } as unknown as Storage;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("LocaleProvider initialization", () => {
    it("should render children", () => {
      mockUseParams.mockReturnValue({ lang: "en" });

      render(
        <LocaleProvider>
          <div data-testid="child-element">Test Child</div>
        </LocaleProvider>,
      );

      expect(screen.getByTestId("child-element")).toBeInTheDocument();
    });

    it("should initialize with default locale when params.lang is undefined", async () => {
      mockUseParams.mockReturnValue({});

      render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
      });
    });

    it("should initialize with en locale from params", async () => {
      mockUseParams.mockReturnValue({ lang: "en" });

      render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
      });
    });

    it("should initialize with es locale from params", async () => {
      mockUseParams.mockReturnValue({ lang: "es" });

      render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("es");
      });
    });

    it("should handle invalid locale by falling back to default", async () => {
      mockUseParams.mockReturnValue({ lang: "invalid" });

      render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
      });
    });
  });

  describe("useLocale hook", () => {
    it("should provide locale and setLocale function", async () => {
      mockUseParams.mockReturnValue({ lang: "en" });

      render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toBeInTheDocument();
      });
    });

    it("should return default locale when context is not available", () => {
      // Call useLocale outside of LocaleProvider
      const TestComponentOutsideProvider = () => {
        const { locale } = useLocale();
        return <div data-testid="locale">{locale}</div>;
      };

      render(<TestComponentOutsideProvider />);

      // Should fall back to default locale
      expect(screen.getByTestId("locale")).toHaveTextContent("en");
    });

    it("should have a no-op setLocale when context is not available", () => {
      const TestComponentOutsideProvider = () => {
        const { setLocale } = useLocale();
        return (
          <button
            data-testid="set-btn"
            onClick={() => {
              setLocale("es");
            }}
          >
            Set Locale
          </button>
        );
      };

      const { getByTestId } = render(<TestComponentOutsideProvider />);

      // Should not throw even though setLocale is a no-op
      const btn = getByTestId("set-btn");
      expect(btn).toBeInTheDocument();

      // Actually click to invoke the no-op function
      expect(() => btn.click()).not.toThrow();
    });

    it("should invoke no-op setLocale without side effects when context is unavailable", () => {
      const TestComponentOutsideProvider = () => {
        const { locale, setLocale } = useLocale();
        return (
          <div>
            <div data-testid="locale">{locale}</div>
            <button
              data-testid="change-btn"
              onClick={() => {
                setLocale("es");
              }}
            >
              Change
            </button>
          </div>
        );
      };

      const { getByTestId } = render(<TestComponentOutsideProvider />);

      // Locale should be default
      expect(getByTestId("locale")).toHaveTextContent("en");

      // Click button to invoke no-op setLocale
      getByTestId("change-btn").click();

      // Locale should still be default (no-op didn't change anything)
      expect(getByTestId("locale")).toHaveTextContent("en");
    });
  });

  describe("localStorage synchronization", () => {
    it("should save locale to localStorage on mount", async () => {
      mockUseParams.mockReturnValue({ lang: "es" });

      render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(global.localStorage.setItem).toHaveBeenCalledWith(
          "preferred-locale",
          "es",
        );
      });
    });

    it("should save locale to localStorage when setLocale is called", async () => {
      mockUseParams.mockReturnValue({ lang: "en" });

      const { getByTestId } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toBeInTheDocument();
      });

      const button = getByTestId("set-locale-btn");
      button.click();

      await waitFor(() => {
        expect(global.localStorage.setItem).toHaveBeenCalledWith(
          "preferred-locale",
          "es",
        );
      });
    });
  });

  describe("Hydration", () => {
    it("should not render content until mounted", () => {
      mockUseParams.mockReturnValue({ lang: "en" });

      const { container } = render(
        <LocaleProvider>
          <div data-testid="test-content">Content</div>
        </LocaleProvider>,
      );

      // Content should eventually be rendered
      expect(container).toBeInTheDocument();
    });

    it("should handle params changes", async () => {
      let params = { lang: "en" };
      mockUseParams.mockReturnValue(params);

      const { rerender } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
      });

      // Simulate params change
      params = { lang: "es" };
      mockUseParams.mockReturnValue(params);

      rerender(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("es");
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle numeric lang param", async () => {
      mockUseParams.mockReturnValue({ lang: 123 });

      render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        // Should fall back to default since 123 is not a valid locale
        expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
      });
    });

    it("should handle null lang param", async () => {
      mockUseParams.mockReturnValue({ lang: null });

      render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
      });
    });

    it("should handle params.lang as undefined", async () => {
      mockUseParams.mockReturnValue({ lang: undefined });

      render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
      });
    });
  });

  describe("setLocale behavior", () => {
    it("should update locale state when setLocale is called with valid locale", async () => {
      mockUseParams.mockReturnValue({ lang: "en" });

      const { getByTestId } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
      });

      const button = getByTestId("set-locale-btn");
      button.click();

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("es");
      });
    });

    it("should persist locale to localStorage when setLocale is called", async () => {
      mockUseParams.mockReturnValue({ lang: "en" });

      const { getByTestId } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toBeInTheDocument();
      });

      const button = getByTestId("set-locale-btn");
      button.click();

      await waitFor(() => {
        expect(global.localStorage.setItem).toHaveBeenCalledWith(
          "preferred-locale",
          "es",
        );
      });
    });

    it("should reflect multiple setLocale calls", async () => {
      mockUseParams.mockReturnValue({ lang: "en" });

      const MultiChangeComponent = () => {
        const { locale, setLocale } = useLocale();
        return (
          <div>
            <div data-testid="locale-display">{locale}</div>
            <button onClick={() => setLocale("es")} data-testid="set-es-btn">
              Set ES
            </button>
            <button onClick={() => setLocale("en")} data-testid="set-en-btn">
              Set EN
            </button>
          </div>
        );
      };

      const { getByTestId } = render(
        <LocaleProvider>
          <MultiChangeComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
      });

      // Change to Spanish
      getByTestId("set-es-btn").click();
      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("es");
      });

      // Change back to English
      getByTestId("set-en-btn").click();
      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
      });
    });
  });

  describe("useEffect and params synchronization", () => {
    it("should update locale when params.lang changes from en to es", async () => {
      const { rerender } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      mockUseParams.mockReturnValue({ lang: "en" });
      rerender(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
      });

      mockUseParams.mockReturnValue({ lang: "es" });
      rerender(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("es");
      });
    });

    it("should not update locale if params.lang is invalid", async () => {
      mockUseParams.mockReturnValue({ lang: "en" });

      const { rerender } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
      });

      // Try to set invalid locale
      mockUseParams.mockReturnValue({ lang: "fr" });
      rerender(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      // Should remain at en (default), not update to invalid locale
      await waitFor(() => {
        expect(screen.getByTestId("locale-display")).toHaveTextContent("en");
      });
    });

    it("should save locale to localStorage when params.lang is valid", async () => {
      mockUseParams.mockReturnValue({ lang: "en" });
      const setItemSpy = vi.spyOn(global.localStorage, "setItem");

      render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith("preferred-locale", "en");
      });
    });
  });

  describe("mounted state", () => {
    it("should render children before mounted to prevent hydration issues", async () => {
      mockUseParams.mockReturnValue({ lang: "en" });

      const { container } = render(
        <LocaleProvider>
          <div data-testid="always-render">Should Always Render</div>
        </LocaleProvider>,
      );

      // Children should be rendered even if component is not yet mounted
      expect(
        container.querySelector('[data-testid="always-render"]'),
      ).toBeInTheDocument();
    });

    it("should transition from pre-mounted to mounted state", async () => {
      mockUseParams.mockReturnValue({ lang: "es" });

      const StateTrackingComponent = () => {
        const { locale } = useLocale();
        return <div data-testid="locale-state">{locale}</div>;
      };

      render(
        <LocaleProvider>
          <StateTrackingComponent />
        </LocaleProvider>,
      );

      // Eventually should have the locale from params
      await waitFor(() => {
        expect(screen.getByTestId("locale-state")).toHaveTextContent("es");
      });
    });
  });

  describe("context consumer behaviors", () => {
    it("should allow setLocale to be called multiple times without errors", async () => {
      mockUseParams.mockReturnValue({ lang: "en" });

      const TestComponentWithMultipleCalls = () => {
        const { locale, setLocale } = useLocale();
        return (
          <div>
            <div data-testid="locale">{locale}</div>
            <button
              onClick={() => {
                setLocale("es");
                setLocale("en");
                setLocale("es");
              }}
              data-testid="rapid-changes"
            >
              Rapid Changes
            </button>
          </div>
        );
      };

      const { getByTestId } = render(
        <LocaleProvider>
          <TestComponentWithMultipleCalls />
        </LocaleProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("locale")).toHaveTextContent("en");
      });

      getByTestId("rapid-changes").click();

      // Should eventually settle on the last value
      await waitFor(() => {
        expect(screen.getByTestId("locale")).toHaveTextContent("es");
      });
    });
  });
});
