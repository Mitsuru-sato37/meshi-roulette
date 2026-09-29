import { describe, expect, it } from 'vitest';
import { createFixtureRestaurantProvider } from './fixtureRestaurantProvider';

describe('fixture restaurant provider', () => {
  it('returns restaurants matching at least one requested cuisine', async () => {
    const provider = createFixtureRestaurantProvider();
    const restaurants = await provider.search({ foodIds: ['ramen'] });

    expect(restaurants.length).toBeGreaterThan(0);
    expect(restaurants.every((restaurant) => restaurant.foodIds.includes('ramen'))).toBe(true);
  });

  it('returns only the requested brand branches and honors store exclusion', async () => {
    const provider = createFixtureRestaurantProvider();
    const restaurants = await provider.search({ foodIds: ['ramen'], brandIds: ['gifu-tanmen'], excludeStoreIds: ['fixture-gifu-kanayama'] });

    expect(restaurants.map((restaurant) => restaurant.name)).toEqual(['岐阜タンメン 名古屋駅店']);
  });
});
