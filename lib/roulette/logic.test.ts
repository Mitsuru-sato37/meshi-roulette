import { describe, expect, it } from "vitest";
import { filterCandidates, applyHistoryAvoidance } from "./filter";
import { buildWeights, drawCandidate } from "./draw";
import { createShortlist, replaceShortlist } from "./shortlist";
import { buildMapsUrl } from "./maps";
import type { Candidate } from "./types";
const items: Candidate[] = [
  {id:"a",name:"A",kind:"genre",genreId:"ramen",mapQuery:"東京 ラーメン",prices:["under-1000"],tags:["quick","solo-friendly"]},
  {id:"b",name:"B",kind:"genre",genreId:"curry",mapQuery:"カレー & ナン",prices:["1000-2000"],tags:["quick","solo-friendly"]},
  {id:"c",name:"C",kind:"genre",genreId:"cafe",mapQuery:"喫茶店",prices:["under-1000"],tags:["light"]},
];
describe("roulette domain", () => {
  it("filters OR axes, AND tags and explicit exclusions", () => expect(filterCandidates(items,{genreIds:["ramen","curry"],prices:["under-1000","1000-2000"],tags:["quick","solo-friendly"]},new Set(["b"])).map(x=>x.id)).toEqual(["a"]));
  it("restores only oldest recent candidate and never exclusions", () => expect(applyHistoryAvoidance(items.slice(0,2),["a","b"],new Set(["b"]))).toEqual({candidates:[items[0]],restoredHistoryIds:["a"]}));
  it("builds equal and weighted chances and draws deterministically", () => { expect(buildWeights(items.slice(0,2),"equal",{a:3},new Set()).map(x=>x.weight)).toEqual([1,1]); const w=buildWeights(items.slice(0,2),"weighted",{a:3},new Set()); expect(w.map(x=>x.weight)).toEqual([4,1]); expect(drawCandidate(w,()=>0.9)?.id).toBe("b"); });
  it("creates unique shortlists and respects exclusions on replacement", () => { expect(createShortlist(items,8,()=>0)).toHaveLength(3); expect(replaceShortlist(items,new Set(["a"]),new Set(["b"]),8,()=>0).items.map(x=>x.id)).toEqual(["c"]); });
  it("encodes map queries", () => expect(buildMapsUrl(items[1])).toBe("https://www.google.com/maps/search/?api=1&query=%E3%82%AB%E3%83%AC%E3%83%BC%20%26%20%E3%83%8A%E3%83%B3"));
});
