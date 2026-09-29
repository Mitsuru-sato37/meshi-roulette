import { describe, expect, it } from 'vitest';
import { foodCatalog } from './masterData';
import { getFoodChildren, getLocalSpecialties, searchFoods } from './foodCatalog';

describe('food catalog helpers', () => {
  it('searches labels, aliases, and search terms', () => {
    expect(searchFoods('らーめん', foodCatalog.foods).map((food) => food.id)).toContain('ramen');
    expect(searchFoods('魚介系', foodCatalog.foods).map((food) => food.id)).toContain('seafood_ramen');
  });

  it('returns direct detail children without duplicate food ids', () => {
    const ids = getFoodChildren('ramen', foodCatalog.foods).map((food) => food.id);
    expect(ids).toContain('shoyu_ramen');
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('loads specialties by region alias from the local master', () => {
    const specialties = getLocalSpecialties('名古屋', 'jp-23', '名古屋市');
    expect(specialties.map((specialty) => specialty.label)).toContain('味噌カツ');
  });
});
