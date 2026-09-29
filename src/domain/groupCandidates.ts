import type { Food, GroupEntry } from './types';

export function buildGroupFoodCandidates(entries: GroupEntry[], foods: Food[]): Array<Food & { weight: number }> {
  const foodById = new Map(foods.map((food) => [food.id, food]));
  const weights = new Map<string, number>();
  for (const entry of entries) {
    if (entry.type !== 'food') continue;
    for (const candidateId of entry.candidateIds) {
      if (!foodById.has(candidateId)) continue;
      weights.set(candidateId, (weights.get(candidateId) ?? 0) + entry.weight);
    }
  }
  return [...weights.entries()].map(([id, weight]) => ({ ...foodById.get(id)!, weight }));
}
