import { describe, expect, it } from 'vitest';
import { createRemoteRestaurantProvider } from './remoteRestaurantProvider';

describe('remote restaurant provider', () => {
  it('posts the complete restaurant query to the configured server endpoint', async () => {
    let requestBody = '';
    const provider = createRemoteRestaurantProvider({
      endpoint: 'https://api.example.test/restaurants/search',
      fetcher: async (_input, init) => { requestBody = String(init?.body); return new Response(JSON.stringify({ candidates: [{ id: 'r1', name: '店A', foodIds: ['ramen'], locationLabel: '名古屋駅', travelSummary: '徒歩5分', isOpen: true, budgetLabel: '〜1,000円' }] }), { status: 200 }); },
    });

    await expect(provider.search({ foodIds: ['ramen'], brandIds: ['gifu-tanmen'], route: { origin: '名古屋駅', destination: '栄駅', maxDetourMinutes: 10 } })).resolves.toEqual([expect.objectContaining({ id: 'r1' })]);
    expect(JSON.parse(requestBody)).toEqual(expect.objectContaining({ foodIds: ['ramen'], brandIds: ['gifu-tanmen'], route: { origin: '名古屋駅', destination: '栄駅', maxDetourMinutes: 10 } }));
  });

  it('returns a clear error for an unavailable server response', async () => {
    const provider = createRemoteRestaurantProvider({ endpoint: 'https://api.example.test/restaurants/search', fetcher: async () => new Response('', { status: 503 }) });

    await expect(provider.search({ foodIds: ['ramen'] })).rejects.toThrow('Restaurant search service is unavailable');
  });

  it('accepts an explicit zero-candidate response', async () => {
    const provider = createRemoteRestaurantProvider({ endpoint: '/api/restaurant-search', fetcher: async () => new Response('{"candidates":[]}', { status: 200 }) });

    await expect(provider.search({ foodIds: ['ramen'] })).resolves.toEqual([]);
  });

  it.each([
    ['missing candidate list', '{}'],
    ['malformed candidate', '{"candidates":[null]}'],
    ['malformed JSON', '{bad'],
  ])('rejects %s instead of treating it as a successful empty result', async (_case, body) => {
    const provider = createRemoteRestaurantProvider({ endpoint: '/api/restaurant-search', fetcher: async () => new Response(body, { status: 200 }) });

    await expect(provider.search({ foodIds: ['ramen'] })).rejects.toThrow('Invalid restaurant search response');
  });
});
