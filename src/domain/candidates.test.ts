import { describe, expect, it } from 'vitest';
import { buildCuisineCandidates } from './candidates';
import type { FoodCatalog } from './types';

const catalog: FoodCatalog = {
  groups: [{ id: 'noodles', label: '麺', children: ['ramen', 'udon'] }],
  foods: [
    { id: 'ramen', label: 'ラーメン', parentIds: [], children: [], searchTerms: [], aliases: [], tags: [] },
    { id: 'udon', label: 'うどん', parentIds: [], children: [], searchTerms: [], aliases: [], tags: [] },
    { id: 'curry', label: 'カレー', parentIds: [], children: [], searchTerms: [], aliases: [], tags: [] },
  ],
};

describe('buildCuisineCandidates', () => {
  it('uses top-level foods for the default selection', () => {
    expect(buildCuisineCandidates({ include: [], exclude: [] }, catalog).map((food) => food.id)).toEqual(['ramen', 'udon', 'curry']);
  });

  it('expands groups, deduplicates duplicate paths, and applies exclusions', () => {
    expect(buildCuisineCandidates({ include: ['noodles', 'ramen'], exclude: ['ramen'] }, catalog).map((food) => food.id)).toEqual(['udon']);
  });
});
