import { describe, expect, it } from "vitest";
import { CHAINS, GENRES } from "./candidates";
describe("candidate catalog", () => {
  it("contains a valid, unique catalog", () => {
    expect(GENRES.length).toBeGreaterThanOrEqual(17);
    expect(CHAINS.length).toBeGreaterThanOrEqual(60);
    const all = [...GENRES, ...CHAINS];
    expect(new Set(all.map(x => x.id)).size).toBe(all.length);
    const genreIds = new Set(GENRES.map(x => x.id));
    for (const x of all) { expect(x.id).toMatch(/^[a-z0-9-]+$/); expect(x.name).not.toBe(""); expect(x.mapQuery).not.toBe(""); expect(x.prices.length).toBeGreaterThan(0); expect(x.tags.length).toBeGreaterThan(0); }
    expect(GENRES.every(x => x.kind === "genre" && x.genreId === x.id)).toBe(true);
    expect(CHAINS.every(x => x.kind === "chain" && genreIds.has(x.genreId))).toBe(true);
  });
});
