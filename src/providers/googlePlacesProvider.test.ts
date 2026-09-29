import { describe, expect, it } from 'vitest';
import { createGooglePlacesProvider } from './googlePlacesProvider';

describe('google places provider', () => {
  it('returns an unavailable provider when no API key is configured', async () => {
    const provider = createGooglePlacesProvider({ apiKey: '' });

    await expect(provider.search({ foodIds: ['ramen'] })).rejects.toThrow('Google Places API key is not configured');
  });

  it('normalizes a Google text-search response into restaurant candidates', async () => {
    const provider = createGooglePlacesProvider({
      apiKey: 'test-key',
      fetcher: async () => new Response(JSON.stringify({ places: [{ id: 'places/1', displayName: { text: '麺処テスト' }, formattedAddress: '名古屋駅', currentOpeningHours: { openNow: true }, priceLevel: 'PRICE_LEVEL_MODERATE', location: { latitude: 35.17, longitude: 136.88 } }] }), { status: 200 }),
    });

    await expect(provider.search({ foodIds: ['ramen'], locationLabel: '名古屋駅' })).resolves.toEqual([expect.objectContaining({ id: 'places/1', name: '麺処テスト', provider: 'google', providerPlaceId: 'places/1', locationLabel: '名古屋駅', isOpen: true })]);
  });
});
