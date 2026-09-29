import type { RestaurantQuery } from '../domain/types';
import type { RestaurantProvider } from '../providers/restaurantProvider';

export type RestaurantSearchRequest = { json: () => Promise<unknown> };
export type RestaurantSearchResponse = { status: number; body: unknown };

function isRestaurantQuery(value: unknown): value is RestaurantQuery {
  if (typeof value !== 'object' || value === null || !Array.isArray((value as { foodIds?: unknown }).foodIds)) return false;
  const query = value as RestaurantQuery;
  if (query.foodIds.length === 0 || !query.foodIds.every((id) => typeof id === 'string' && id.length > 0)) return false;
  if (query.route && (typeof query.route.origin !== 'string' || typeof query.route.destination !== 'string' || !Number.isFinite(query.route.maxDetourMinutes) || query.route.maxDetourMinutes < 0)) return false;
  return true;
}

export function createRestaurantSearchHandler(provider: RestaurantProvider) {
  return async (request: RestaurantSearchRequest): Promise<RestaurantSearchResponse> => {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return { status: 400, body: { error: 'Invalid JSON request' } };
    }
    if (!isRestaurantQuery(payload)) return { status: 400, body: { error: 'foodIds is required' } };
    try {
      return { status: 200, body: { candidates: await provider.search(payload) } };
    } catch {
      return { status: 502, body: { error: 'Restaurant search service is unavailable' } };
    }
  };
}
