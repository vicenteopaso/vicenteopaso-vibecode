import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the locales module
vi.mock("../../lib/i18n/locales", () => ({
  locales: ["en", "es"],
}));

describe("middleware", () => {
  let middleware: (req: NextRequest) => Response | NextResponse;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("../../middleware");
    middleware = mod.middleware;
  });

  function createMockRequest(
    pathname: string,
    acceptLanguage?: string,
  ): NextRequest {
    const url = new URL(pathname, "http://localhost:3000");

    // Add clone method to URL for middleware redirect logic
    const urlWithClone = Object.assign(url, {
      clone: () => {
        const cloned = new URL(url.toString());
        Object.assign(cloned, { clone: urlWithClone.clone });
        return cloned;
      },
    });

    const headers = new Headers();
    if (acceptLanguage) {
      headers.set("accept-language", acceptLanguage);
    }

    return {
      nextUrl: urlWithClone,
      headers,
    } as NextRequest;
  }

  describe("Spanish locale detection and redirect", () => {
    it("should redirect Spanish browsers from / to /es", () => {
      const req = createMockRequest("/", "es-ES,es;q=0.9");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/es",
      );
    });

    it("should redirect when accept-language starts with es", () => {
      const req = createMockRequest("/", "es");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
    });

    it("should redirect with mixed language preferences where Spanish is first", () => {
      const req = createMockRequest("/", "es-MX,en;q=0.9,fr;q=0.8");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/es",
      );
    });
  });

  describe("Non-Spanish locale handling", () => {
    it("should redirect English browsers to /en", () => {
      const req = createMockRequest("/", "en-US,en;q=0.9");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/en",
      );
    });

    it("should redirect French browsers to /en", () => {
      const req = createMockRequest("/", "fr-FR,fr;q=0.9");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/en",
      );
    });

    it("should redirect to /en when accept-language header is missing", () => {
      const req = createMockRequest("/");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/en",
      );
    });

    it("should redirect to /en when accept-language header is empty", () => {
      const req = createMockRequest("/", "");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/en",
      );
    });
  });

  describe("Locale already in path", () => {
    it("should not redirect when path is /es", () => {
      const req = createMockRequest("/es", "es-ES,es;q=0.9");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).not.toBe(307);
    });

    it("should not redirect when path is /en", () => {
      const req = createMockRequest("/en", "en-US,en;q=0.9");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).not.toBe(307);
    });

    it("should not redirect when path starts with /es/", () => {
      const req = createMockRequest("/es/cv", "es-ES,es;q=0.9");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).not.toBe(307);
    });

    it("should not redirect when path starts with /en/", () => {
      const req = createMockRequest("/en/about", "en-US,en;q=0.9");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).not.toBe(307);
    });
  });

  describe("Non-root path handling", () => {
    it("should redirect Spanish browsers from /cv to /es/cv", () => {
      const req = createMockRequest("/cv", "es-ES,es;q=0.9");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/es/cv",
      );
    });

    it("should redirect English browsers from /cv to /en/cv", () => {
      const req = createMockRequest("/cv", "en-US,en;q=0.9");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/en/cv",
      );
    });

    it("should redirect Spanish browsers from /about to /es/about", () => {
      const req = createMockRequest("/about", "es-ES,es;q=0.9");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/es/about",
      );
    });

    it("should redirect from nested paths without locale", () => {
      const req = createMockRequest("/privacy-policy", "es-ES,es;q=0.9");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/es/privacy-policy",
      );
    });

    it("should redirect browsers without accept-language header to /en for non-root paths", () => {
      const req = createMockRequest("/tech-stack");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/en/tech-stack",
      );
    });
  });

  describe("Edge cases", () => {
    it("should redirect malformed accept-language headers to /en", () => {
      const req = createMockRequest("/", "invalid-header");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/en",
      );
    });

    it("should handle accept-language with only language code", () => {
      const req = createMockRequest("/", "es");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/es",
      );
    });

    it("should redirect to /en when English is first in quality values", () => {
      const req = createMockRequest("/", "en-US;q=0.9,es;q=0.8,fr;q=0.7");
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/en",
      );
    });

    it("should handle Latin American Spanish locale codes", () => {
      const req = createMockRequest("/", "es-419,es;q=0.9"); // Latin American Spanish
      const response = middleware(req);

      expect(response).toBeInstanceOf(NextResponse);
      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get("location")).toBe(
        "http://localhost:3000/es",
      );
    });
  });
});
