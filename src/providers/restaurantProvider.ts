import type { RestaurantCandidate, RestaurantQuery } from '../domain/types';

export interface RestaurantProvider {
  kind?: 'live' | 'fixture';
  search(query: RestaurantQuery): Promise<RestaurantCandidate[]>;
}
