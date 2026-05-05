import { beforeEach, describe, expect, it, vi } from "vitest";

const createCvPdfDownloadResponse = vi.fn();

vi.mock("../../app/config/cv.server", () => ({
  createCvPdfDownloadResponse,
}));

async function createRootGetHandler() {
  vi.resetModules();
  const mod = await import("../../app/cv/download/route");
  return mod.GET as () => Promise<Response>;
}

async function createLocalizedGetHandler() {
  vi.resetModules();
  const mod = await import("../../app/[lang]/cv/download/route");
  return mod.GET as (
    request: Request,
    context: { params: Promise<{ lang: string }> },
  ) => Promise<Response>;
}

describe("CV download routes", () => {
  beforeEach(() => {
    createCvPdfDownloadResponse.mockReset();
    createCvPdfDownloadResponse.mockResolvedValue(
      new Response("pdf", { status: 200 }),
    );
  });

  it("serves the root download route as English by default", async () => {
    const GET = await createRootGetHandler();

    const response = await GET();

    expect(createCvPdfDownloadResponse).toHaveBeenCalledWith("en");
    expect(response.status).toBe(200);
  });

  it("serves the localized English download route", async () => {
    const GET = await createLocalizedGetHandler();

    const response = await GET(new Request("http://localhost/en/cv/download"), {
      params: Promise.resolve({ lang: "en" }),
    });

    expect(createCvPdfDownloadResponse).toHaveBeenCalledWith("en");
    expect(response.status).toBe(200);
  });

  it("serves the localized Spanish download route", async () => {
    const GET = await createLocalizedGetHandler();

    const response = await GET(new Request("http://localhost/es/cv/download"), {
      params: Promise.resolve({ lang: "es" }),
    });

    expect(createCvPdfDownloadResponse).toHaveBeenCalledWith("es");
    expect(response.status).toBe(200);
  });

  it("returns 404 for unsupported locale routes", async () => {
    const GET = await createLocalizedGetHandler();

    const response = await GET(new Request("http://localhost/fr/cv/download"), {
      params: Promise.resolve({ lang: "fr" }),
    });

    expect(createCvPdfDownloadResponse).not.toHaveBeenCalled();
    expect(response.status).toBe(404);
  });
});
