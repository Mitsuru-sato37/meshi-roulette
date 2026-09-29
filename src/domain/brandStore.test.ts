import { describe, expect, it } from 'vitest';
import { resolveBrandCandidates } from './brandStore';
import type { Brand, RestaurantCandidate } from './types';

const brands: Brand[] = [
  { id: 'gifu-tanmen', name: '岐阜タンメン', storeIds: ['gifu-nagoya', 'gifu-kanayama'] },
];

const stores: RestaurantCandidate[] = [
  { id: 'gifu-nagoya', name: '岐阜タンメン 名古屋駅店', brandId: 'gifu-tanmen', foodIds: ['ramen'], locationLabel: '名古屋駅', travelSummary: '徒歩5分', isOpen: true, budgetLabel: '〜1,000円' },
  { id: 'gifu-kanayama', name: '岐阜タンメン 金山店', brandId: 'gifu-tanmen', foodIds: ['ramen'], locationLabel: '金山駅', travelSummary: '徒歩8分', isOpen: true, budgetLabel: '〜1,000円' },
];

describe('brand and store resolution', () => {
  it('returns a selected brand and available branches without choosing a branch', () => {
    const result = resolveBrandCandidates({ foodIds: ['ramen'], brandIds: ['gifu-tanmen'] }, brands, stores);

    expect(result.brands.map((brand) => brand.id)).toEqual(['gifu-tanmen']);
    expect(result.branches.map((store) => store.id)).toEqual(['gifu-nagoya', 'gifu-kanayama']);
  });

  it('excludes explicitly excluded stores from brand branches', () => {
    const result = resolveBrandCandidates({ foodIds: ['ramen'], brandIds: ['gifu-tanmen'], excludeStoreIds: ['gifu-kanayama'] }, brands, stores);

    expect(result.branches.map((store) => store.id)).toEqual(['gifu-nagoya']);
  });
});
