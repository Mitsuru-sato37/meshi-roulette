import { describe, expect, it } from 'vitest';
import { searchCuisineCatalog } from './candidates';
import type { FoodCatalog } from './types';

const catalog: FoodCatalog = {
  groups: [],
  foods: [
    { id: 'ramen', label: 'ラーメン', parentIds: [], children: [], searchTerms: ['ラーメン'], aliases: ['らーめん'], tags: ['麺'] },
    { id: 'curry', label: 'カレー', parentIds: [], children: [], searchTerms: ['カレーライス'], aliases: ['カレー'], tags: ['ご飯'] },
  ],
};

describe('cuisine master data search', () => {
  it('matches labels, aliases, and search terms', () => {
    expect(searchCuisineCatalog('らーめん', catalog).map((food) => food.id)).toEqual(['ramen']);
    expect(searchCuisineCatalog('カレーライス', catalog).map((food) => food.id)).toEqual(['curry']);
  });
});
