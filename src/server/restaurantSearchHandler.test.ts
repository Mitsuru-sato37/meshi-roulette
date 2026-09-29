import { describe, expect, it, vi } from 'vitest';
import { createRestaurantSearchHandler } from './restaurantSearchHandler';

describe('restaurant search handler', () => {
  it('validates the request and delegates the complete query to the provider', async () => {
    const provider = { search: vi.fn().mockResolvedValue([{ id: 'r1' }]) };
    const handler = createRestaurantSearchHandler(provider);
    const response = await handler({ json: async () => ({ foodIds: ['ramen'], route: { origin: '名古屋駅', destination: '栄駅', maxDetourMinutes: 10 } }) });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ candidates: [{ id: 'r1' }] });
    expect(provider.search).toHaveBeenCalledWith(expect.objectContaining({ foodIds: ['ramen'] }));
  });

  it('rejects malformed requests before calling the provider', async () => {
    const provider = { search: vi.fn() };
    const handler = createRestaurantSearchHandler(provider);
    const response = await handler({ json: async () => ({ foodIds: [] }) });

    expect(response.status).toBe(400);
    expect(provider.search).not.toHaveBeenCalled();
  });
});
