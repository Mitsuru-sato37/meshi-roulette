import type { WeightedCandidate } from './types';

export class RouletteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RouletteError';
  }
}

export function drawOne<T extends WeightedCandidate>(candidates: T[], random: () => number = Math.random): T {
  if (candidates.length === 0) throw new RouletteError('抽選候補がありません');
  const weights = candidates.map((candidate) => candidate.weight ?? 1);
  if (weights.some((weight) => !Number.isFinite(weight) || weight <= 0)) {
    throw new RouletteError('抽選weightは正の数で指定してください');
  }
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const target = Math.min(Math.max(random(), 0), 1 - Number.EPSILON) * total;
  let cumulative = 0;
  for (let index = 0; index < candidates.length; index += 1) {
    cumulative += weights[index];
    if (target < cumulative) return candidates[index];
  }
  return candidates[candidates.length - 1];
}
