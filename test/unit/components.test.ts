export {};

const { describe, it, expect } = await import("vitest");

describe("components", () => {
  it("is wired for testing", () => {
    expect(true).toBe(true);
  });
});
