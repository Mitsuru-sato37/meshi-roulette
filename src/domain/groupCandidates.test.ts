import { describe, expect, it } from 'vitest';
import { buildGroupFoodCandidates, buildGroupRestaurantCandidates, createManualRestaurantCandidate } from './groupCandidates';
import type { Food, RestaurantCandidate } from './types';

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

describe('buildGroupRestaurantCandidates', () => {
  const ramenShop: RestaurantCandidate = {
    id: 'shop-ramen',
    name: '麺処ひなた',
    foodIds: ['ramen'],
    locationLabel: '駅前',
    travelSummary: '徒歩8分',
    isOpen: true,
    budgetLabel: '〜1,000円',
  };

  it('aggregates explicit weights without mixing food entries', () => {
    const result = buildGroupRestaurantCandidates([
      { id: 'food-entry', label: 'Aさん', type: 'food', candidateIds: ['ramen'], weight: 2 },
      { id: 'store-a', label: 'Aさん', type: 'restaurant', candidateIds: [ramenShop.id], weight: 2, restaurant: ramenShop },
      { id: 'store-b', label: 'Bさん', type: 'restaurant', candidateIds: [ramenShop.id], weight: 1, restaurant: ramenShop },
    ]);

    expect(result.map((restaurant) => ({ id: restaurant.id, weight: restaurant.weight }))).toEqual([
      { id: 'shop-ramen', weight: 3 },
    ]);
  });

  it('creates a manual store candidate without pretending metadata exists', () => {
    const result = createManualRestaurantCandidate('王将');

    expect(result).toMatchObject({
      id: 'group-manual-王将',
      name: '王将',
      metadataAvailable: false,
    });
  });
});
