import { describe, expect, it } from 'vitest';
import { createGooglePlacesProvider } from './googlePlacesProvider';

describe('google places provider', () => {
  it('returns an unavailable provider when no API key is configured', async () => {
    const provider = createGooglePlacesProvider({ apiKey: '' });

    await expect(provider.search({ foodIds: ['ramen'] })).rejects.toThrow('Google Places API key is not configured');
  });

  it('normalizes a Google text-search response into restaurant candidates', async () => {
    let requestBody = '';
    const provider = createGooglePlacesProvider({
      apiKey: 'test-key',
      fetcher: async (_input, init) => { requestBody = String(init?.body); return new Response(JSON.stringify({ places: [{ id: 'places/1', displayName: { text: '麺処テスト' }, formattedAddress: '名古屋駅', currentOpeningHours: { openNow: true }, priceLevel: 'PRICE_LEVEL_MODERATE', location: { latitude: 35.17, longitude: 136.88 } }] }), { status: 200 }); },
    });

    await expect(provider.search({ foodIds: ['ramen'], locationLabel: '名古屋駅' })).resolves.toEqual([expect.objectContaining({ id: 'places/1', name: '麺処テスト', provider: 'google', providerPlaceId: 'places/1', locationLabel: '名古屋駅', isOpen: true })]);
    expect(requestBody).toContain('ラーメン');
  });

  it('sends coordinates as a Places search bias when a location is available', async () => {
    let requestBody = '';
    const provider = createGooglePlacesProvider({
      apiKey: 'test-key',
      fetcher: async (_input, init) => { requestBody = String(init?.body); return new Response(JSON.stringify({ places: [] }), { status: 200 }); },
    });

    await provider.search({ foodIds: ['ramen'], location: { label: '現在地の近く', latitude: 35.17, longitude: 136.88 } });

    expect(JSON.parse(requestBody).locationBias.circle.center).toEqual({ latitude: 35.17, longitude: 136.88 });
  });

  it('includes route endpoints and detour limit in a route search request', async () => {
    const requestBodies: string[] = [];
    const provider = createGooglePlacesProvider({
      apiKey: 'test-key',
      fetcher: async (input, init) => {
        requestBodies.push(String(init?.body));
        if (String(input).includes('computeRoutes')) {
          return new Response(JSON.stringify({ routes: [{ duration: '600s', polyline: { encodedPolyline: 'encoded-route' } }] }), { status: 200 });
        }
        return new Response(JSON.stringify({
          places: [
            { id: 'places/1', displayName: { text: '道中の店A' }, formattedAddress: '名古屋市', location: { latitude: 35.17, longitude: 136.88 } },
            { id: 'places/2', displayName: { text: '道中の店B' }, formattedAddress: '名古屋市', location: { latitude: 35.18, longitude: 136.89 } },
          ],
          routingSummaries: [
            { legs: [{ duration: '300s' }, { duration: '360s' }] },
            { legs: [{ duration: '480s' }, { duration: '720s' }] },
          ],
        }), { status: 200 });
      },
    });

    await expect(provider.search({ foodIds: ['ramen'], route: { origin: '名古屋駅', destination: '栄駅', maxDetourMinutes: 2 } })).resolves.toEqual([
      expect.objectContaining({ id: 'places/1', name: '道中の店A', routeDetourMinutes: 1 }),
    ]);

    const routeBody = JSON.parse(requestBodies[0]);
    expect(routeBody.origin.address).toBe('名古屋駅');
    expect(routeBody.destination.address).toBe('栄駅');
    expect(routeBody.travelMode).toBe('DRIVE');
    const searchBody = JSON.parse(requestBodies[1]);
    expect(searchBody.searchAlongRouteParameters.polyline.encodedPolyline).toBe('encoded-route');
    expect(searchBody.textQuery).toContain('ラーメン');
    expect(searchBody.textQuery).not.toContain('道中で探す');
  });

  it('does not silently convert transit route searches into another travel mode', async () => {
    const fetcher = async () => new Response('{}', { status: 200 });
    const provider = createGooglePlacesProvider({ apiKey: 'test-key', fetcher });

    await expect(provider.search({ foodIds: ['ramen'], route: { origin: '名古屋駅', destination: '栄駅', maxDetourMinutes: 10, travelMode: 'TRANSIT' } })).rejects.toThrow('Transit route search is not supported');
  });
});
