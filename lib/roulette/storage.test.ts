import { beforeEach, describe, expect, it } from "vitest";
import { loadStoredState, nextMidnight, STORAGE_KEY } from "./storage";
describe("browser storage", () => {
  beforeEach(()=>localStorage.clear());
  it("falls back safely when saved data is broken", () => { localStorage.setItem(STORAGE_KEY,"{"); expect(loadStoredState().version).toBe(1); expect(loadStoredState().history).toEqual([]); });
  it("falls back safely when versioned data has an invalid shape", () => { localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,filters:null,history:"bad",exclusions:[]})); expect(loadStoredState()).toEqual({version:1,filters:{genreIds:[],prices:[],tags:[]},history:[],exclusions:{}}); });
  it("drops expired temporary exclusions", () => { localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,filters:{genreIds:[],prices:[],tags:[]},history:[],exclusions:{old:"2025-01-01T00:00:00.000Z",fresh:"2030-01-01T00:00:00.000Z"}})); expect(loadStoredState(new Date("2026-01-01")).exclusions).toEqual({fresh:"2030-01-01T00:00:00.000Z"}); });
  it("expires today exclusions at the next local midnight", () => expect(nextMidnight(new Date(2026,8,24,18,30)).getTime()).toBe(new Date(2026,8,25,0,0).getTime()));
});
