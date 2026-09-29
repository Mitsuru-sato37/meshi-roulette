import type { RestaurantCandidate, RestaurantQuery } from '../domain/types';
import type { RestaurantProvider } from './restaurantProvider';

type RemoteRestaurantResponse = { candidates?: RestaurantCandidate[] };
type RemoteRestaurantConfig = { endpoint: string; fetcher?: typeof fetch };

export function createRemoteRestaurantProvider(config: RemoteRestaurantConfig): RestaurantProvider {
  return {
    kind: 'remote',
    async search(query: RestaurantQuery): Promise<RestaurantCandidate[]> {
      const fetcher = config.fetcher ?? fetch;
      const response = await fetcher(config.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) });
      if (!response.ok) throw new Error('Restaurant search service is unavailable');
      const data = await response.json() as RemoteRestaurantResponse;
      return Array.isArray(data.candidates) ? data.candidates : [];
    },
  };
}
