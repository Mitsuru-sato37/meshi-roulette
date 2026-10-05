import { describe, expect, it } from 'vitest';
import { createRestaurantSearchWorker } from './restaurantSearchWorker';

describe('restaurant search worker', () => {
  it('serves the bundled app shell from the Worker', async () => {
    const worker = createRestaurantSearchWorker();
    const response = await worker.fetch(new Request('https://example.test/'), {});

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    await expect(response.text()).resolves.toContain('<div id="root"></div>');
  });

  it('serves client bundles through stable asset routes', async () => {
    const worker = createRestaurantSearchWorker();
    const response = await worker.fetch(new Request('https://example.test/assets/app.js'), {});

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/javascript');
    expect(response.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
  });

  it('keeps the Google key on the server and returns normalized candidates', async () => {
    const requestedUrls: string[] = [];
    const worker = createRestaurantSearchWorker(async (input) => {
      requestedUrls.push(String(input));
      if (String(input).includes('computeRoutes')) return new Response(JSON.stringify({ routes: [{ duration: '600s', polyline: { encodedPolyline: 'route' } }] }), { status: 200 });
      return new Response(JSON.stringify({ places: [{ id: 'places/1', displayName: { text: '道中の店' }, formattedAddress: '栄', location: { latitude: 35.17, longitude: 136.9 } }], routingSummaries: [{ legs: [{ duration: '300s' }, { duration: '360s' }] }] }), { status: 200 });
    });

    const response = await worker.fetch(new Request('https://example.test/api/restaurant-search', { method: 'POST', body: JSON.stringify({ foodIds: ['ramen'], route: { origin: '名古屋駅', destination: '栄駅', maxDetourMinutes: 2 } }) }), { GOOGLE_MAPS_PLATFORM_API_KEY: 'server-only-key' });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ candidates: [expect.objectContaining({ name: '道中の店', routeDetourMinutes: 1 })] });
    expect(requestedUrls).toEqual(['https://routes.googleapis.com/directions/v2:computeRoutes', 'https://places.googleapis.com/v1/places:searchText']);
  });

  it('returns an unavailable response when the server key is missing', async () => {
    const worker = createRestaurantSearchWorker();
    const response = await worker.fetch(new Request('https://example.test/api/restaurant-search', { method: 'POST', body: JSON.stringify({ foodIds: ['ramen'] }) }), {});

    expect(response.status).toBe(502);
  });
});
