import { createGooglePlacesProvider } from '../providers/googlePlacesProvider';
import { createRestaurantSearchHandler } from './restaurantSearchHandler';

export type RestaurantSearchWorkerEnv = {
  GOOGLE_MAPS_PLATFORM_API_KEY?: string;
};

type WorkerFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
}

export function createRestaurantSearchWorker(fetcher: WorkerFetcher = fetch) {
  return {
    async fetch(request: Request, env: RestaurantSearchWorkerEnv): Promise<Response> {
      const url = new URL(request.url);
      if (url.pathname !== '/api/restaurant-search') return jsonResponse({ error: 'Not found' }, 404);
      if (request.method === 'OPTIONS') return jsonResponse(null, 204);
      if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

      const provider = createGooglePlacesProvider({ apiKey: env.GOOGLE_MAPS_PLATFORM_API_KEY ?? '', fetcher });
      const handler = createRestaurantSearchHandler(provider);
      const result = await handler({ json: () => request.json() });
      return jsonResponse(result.body, result.status);
    },
  };
}

const worker = createRestaurantSearchWorker();
export default worker;
