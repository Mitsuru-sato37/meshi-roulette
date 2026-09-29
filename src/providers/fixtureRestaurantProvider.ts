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
      const conditions = query.conditions;
      return fixtureRestaurants.filter((restaurant) => {
        if (!restaurant.foodIds.some((foodId) => requested.has(foodId))) return false;
        if (excluded.has(restaurant.id)) return false;
        if (included && !included.has(restaurant.id)) return false;
        if (hasBrandFilter ? !brandStores.has(restaurant.id) : restaurant.brandId) return false;
        if (conditions?.budgetMax != null && (restaurant.priceYen == null || restaurant.priceYen > conditions.budgetMax)) return false;
        if (conditions?.travelTimeMax != null && (restaurant.travelMinutes == null || restaurant.travelMinutes > conditions.travelTimeMax)) return false;
        if (conditions?.transport && !(restaurant.transportModes ?? []).includes(conditions.transport)) return false;
        if (conditions?.parkingRequired && restaurant.hasParking !== true) return false;
        if (conditions?.takeoutRequired && restaurant.supportsTakeout !== true) return false;
        if (conditions?.eatingTime === 'now' && restaurant.isOpen !== true) return false;
        return true;
      });
    },
  };
}
