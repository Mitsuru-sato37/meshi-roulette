import { describe, expect, it } from 'vitest';
import { buildGroupFoodCandidates } from './groupCandidates';
import type { Food } from './types';

const foods: Food[] = [
  { id: 'ramen', label: 'ラーメン', parentIds: [], children: [], searchTerms: [], aliases: [], tags: [] },
  { id: 'sushi', label: '寿司', parentIds: [], children: [], searchTerms: [], aliases: [], tags: [] },
];

describe('buildGroupFoodCandidates', () => {
  it('aggregates explicit member weights for selected foods', () => {
    const result = buildGroupFoodCandidates([
      { id: 'a', label: 'Aさん', type: 'food', candidateIds: ['ramen'], weight: 2 },
      { id: 'b', label: 'Bさん', type: 'food', candidateIds: ['ramen', 'sushi'], weight: 1 },
    ], foods);

    expect(result.map((food) => ({ id: food.id, weight: food.weight }))).toEqual([
      { id: 'ramen', weight: 3 },
      { id: 'sushi', weight: 1 },
    ]);
  });
});
