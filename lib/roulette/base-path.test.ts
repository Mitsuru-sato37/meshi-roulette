import { afterEach, describe, expect, it, vi } from "vitest";
describe("assetUrl", () => {
  afterEach(()=>{ vi.unstubAllEnvs(); vi.resetModules(); });
  it("prefixes static assets for subpath hosting", async () => { vi.stubEnv("NEXT_PUBLIC_BASE_PATH","/meshi-roulette"); const {assetUrl}=await import("./base-path"); expect(assetUrl("/meal-table.png")).toBe("/meshi-roulette/meal-table.png"); });
});
