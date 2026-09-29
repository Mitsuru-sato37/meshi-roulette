import type { RestaurantCandidate, RestaurantQuery } from '../domain/types';

export interface RestaurantProvider {
  search(query: RestaurantQuery): Promise<RestaurantCandidate[]>;
}
