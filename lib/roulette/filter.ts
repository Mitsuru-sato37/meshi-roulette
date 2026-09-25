import type { Candidate, Filters } from "./types";

export function filterCandidates(candidates: Candidate[], filters: Filters, excludedIds: Set<string>): Candidate[] {
  return candidates.filter(c => !excludedIds.has(c.id)
    && (!filters.genreIds.length || filters.genreIds.includes(c.genreId))
    && (!filters.prices.length || filters.prices.some(p => c.prices.includes(p)))
    && filters.tags.every(t => c.tags.includes(t)));
}

export function applyHistoryAvoidance(candidates: Candidate[], recentIdsNewestFirst: string[], excludedIds: Set<string>) {
  const allowed = candidates.filter(c => !excludedIds.has(c.id));
  const recent = recentIdsNewestFirst.slice(0, 3);
  const fresh = allowed.filter(c => !recent.includes(c.id));
  if (fresh.length) return { candidates: fresh, restoredHistoryIds: [] as string[] };
  const restored: string[] = [];
  const pool: Candidate[] = [];
  for (const id of [...recent].reverse()) {
    const item = allowed.find(c => c.id === id);
    if (item) { pool.push(item); restored.push(id); break; }
  }
  return { candidates: pool, restoredHistoryIds: restored };
}

export function suggestRelaxation(candidates: Candidate[], filters: Filters, excludedIds: Set<string>) {
  const attempts: { kind: "tag" | "price" | "genre"; value: string; next: Filters }[] = [];
  if (filters.tags.length) attempts.push({ kind:"tag", value:filters.tags.at(-1)!, next:{...filters,tags:filters.tags.slice(0,-1)} });
  if (filters.prices.length) attempts.push({ kind:"price", value:filters.prices.join(","), next:{...filters,prices:[]} });
  if (filters.genreIds.length) attempts.push({ kind:"genre", value:filters.genreIds.join(","), next:{...filters,genreIds:[]} });
  for (const a of attempts) { const resultingCount = filterCandidates(candidates, a.next, excludedIds).length; if (resultingCount) return {kind:a.kind,value:a.value,resultingCount}; }
  return null;
}
