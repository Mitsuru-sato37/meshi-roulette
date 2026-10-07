import type { RestaurantCandidate, RestaurantQuery } from '../domain/types';
import type { RestaurantProvider } from './restaurantProvider';

type RemoteRestaurantResponse = { candidates?: RestaurantCandidate[] };
type RemoteRestaurantConfig = { endpoint: string; fetcher?: typeof fetch };

function isRestaurantCandidate(value: unknown): value is RestaurantCandidate {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'string' && typeof candidate.name === 'string'
    && Array.isArray(candidate.foodIds) && candidate.foodIds.every((id) => typeof id === 'string')
    && typeof candidate.locationLabel === 'string' && typeof candidate.travelSummary === 'string'
    && (typeof candidate.isOpen === 'boolean' || candidate.isOpen === null) && typeof candidate.budgetLabel === 'string';
}

export function createRemoteRestaurantProvider(config: RemoteRestaurantConfig): RestaurantProvider {
  return {
    kind: 'remote',
    async search(query: RestaurantQuery): Promise<RestaurantCandidate[]> {
      const fetcher = config.fetcher ?? fetch;
      const response = await fetcher(config.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) });
      if (!response.ok) throw new Error('Restaurant search service is unavailable');
      let data: unknown;
      try {
        data = await response.json();
      } catch {
        throw new Error('Invalid restaurant search response');
      }
      if (typeof data !== 'object' || data === null || !Array.isArray((data as RemoteRestaurantResponse).candidates)
        || !(data as RemoteRestaurantResponse).candidates!.every(isRestaurantCandidate)) {
        throw new Error('Invalid restaurant search response');
      }
      return (data as RemoteRestaurantResponse).candidates!;
    },
  };
}
