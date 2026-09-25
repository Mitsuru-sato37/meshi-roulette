import type { Candidate, DrawMode } from "./types";
export type WeightedCandidate = { candidate: Candidate; weight: number };
export function buildWeights(candidates: Candidate[], mode: DrawMode, votes: Record<string, number>, ngIds: Set<string>): WeightedCandidate[] {
  return candidates.filter(c => !ngIds.has(c.id)).map(candidate => ({ candidate, weight: mode === "weighted" ? 1 + Math.max(0, votes[candidate.id] ?? 0) : 1 }));
}
export function drawCandidate(weighted: WeightedCandidate[], random: () => number = Math.random): Candidate | null {
  const total = weighted.reduce((n,x) => n + x.weight, 0); if (!total) return null;
  let cursor = random() * total;
  for (const x of weighted) { cursor -= x.weight; if (cursor < 0) return x.candidate; }
  return weighted.at(-1)?.candidate ?? null;
}
