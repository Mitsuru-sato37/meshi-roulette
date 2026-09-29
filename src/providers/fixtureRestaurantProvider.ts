import type { RestaurantCandidate } from '../domain/types';
import { fixtureBrands, fixtureRestaurants } from './fixtureRestaurants';
import { resolveBrandCandidates } from '../domain/brandStore';
import type { RestaurantProvider } from './restaurantProvider';

export function createFixtureRestaurantProvider(): RestaurantProvider {
  return {
    kind: 'fixture',
    async search(query): Promise<RestaurantCandidate[]> {
      const requested = new Set(query.foodIds);
      const excluded = new Set(query.excludeStoreIds ?? []);
      const included = query.includeStoreIds?.length ? new Set(query.includeStoreIds) : null;
      const brandIds = new Set(query.brandIds ?? []);
      const brandResult = resolveBrandCandidates(query, fixtureBrands, fixtureRestaurants);
      const hasBrandFilter = brandIds.size > 0;
      const brandStores = new Set(brandResult.branches.map((store) => store.id));
      return fixtureRestaurants.filter((restaurant) => {
        if (!restaurant.foodIds.some((foodId) => requested.has(foodId))) return false;
        if (excluded.has(restaurant.id)) return false;
        if (included && !included.has(restaurant.id)) return false;
        if (hasBrandFilter) return brandStores.has(restaurant.id);
        return !restaurant.brandId;
      });
    },
  };
}
