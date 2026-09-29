import type { RestaurantCandidate } from '../domain/types';
import { fixtureRestaurants } from './fixtureRestaurants';
import type { RestaurantProvider } from './restaurantProvider';

export function createFixtureRestaurantProvider(): RestaurantProvider {
  return {
    async search(query): Promise<RestaurantCandidate[]> {
      const requested = new Set(query.foodIds);
      return fixtureRestaurants.filter((restaurant) => restaurant.foodIds.some((foodId) => requested.has(foodId)));
    },
  };
}
