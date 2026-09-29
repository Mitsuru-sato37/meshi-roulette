import { describe, expect, it, vi } from 'vitest';
import { createSession } from './session';
import type { RestaurantCandidate } from '../domain/types';
import type { RestaurantProvider } from '../providers/restaurantProvider';

const restaurants: RestaurantCandidate[] = [
  { id: 'r1', name: '店A', foodIds: ['ramen'], locationLabel: '駅前', travelSummary: '徒歩5分', isOpen: true, budgetLabel: '〜1,000円' },
  { id: 'r2', name: '店B', foodIds: ['ramen'], locationLabel: '駅前', travelSummary: '徒歩8分', isOpen: true, budgetLabel: '〜1,500円' },
];

describe('RouletteSession', () => {
  it('reuses provider results when rerolling the same query', async () => {
    const provider: RestaurantProvider = { search: vi.fn().mockResolvedValue(restaurants) };
    const session = createSession(provider, () => 0);

    await session.generate({ foodIds: ['ramen'] });
    expect(session.reroll().id).toBe('r1');
    expect(session.reroll().id).toBe('r1');
    expect(provider.search).toHaveBeenCalledTimes(1);
  });

  it('removes only excluded candidates and returns null after the pool is empty', async () => {
    const provider: RestaurantProvider = { search: vi.fn().mockResolvedValue(restaurants) };
    const session = createSession(provider, () => 0);

    await session.generate({ foodIds: ['ramen'] });
    expect(session.excludeAndReroll('r1')?.id).toBe('r2');
    expect(session.excludeAndReroll('r2')).toBeNull();
  });
});
