import type { Candidate } from "./types";
export function createShortlist(candidates: Candidate[], size: number, random: () => number = Math.random): Candidate[] {
  const pool = [...new Map(candidates.map(c => [c.id,c])).values()];
  const out: Candidate[] = [];
  while (pool.length && out.length < Math.min(8, size)) out.push(pool.splice(Math.floor(random()*pool.length),1)[0]);
  return out;
}
export function replaceShortlist(allCandidates: Candidate[], currentIds: Set<string>, excludedIds: Set<string>, size: number, random: () => number = Math.random) {
  const available = allCandidates.filter(c => !currentIds.has(c.id) && !excludedIds.has(c.id));
  const items = createShortlist(available,size,random);
  return { items, exhausted: items.length === 0 };
}
