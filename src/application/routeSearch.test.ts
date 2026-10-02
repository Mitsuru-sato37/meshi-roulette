import { describe, expect, it } from 'vitest';
import { buildRouteRestaurantQuery } from './routeSearch';

describe('route restaurant query', () => {
  it('maps the selected food, route, and travel mode into a provider query', () => {
    expect(buildRouteRestaurantQuery({
      foodId: 'ramen',
      locationLabel: '道中で探す',
      route: { origin: '名古屋駅', destination: '栄駅', maxDetourMinutes: 10 },
      transport: 'walk',
      conditions: { takeoutRequired: true },
    })).toEqual({
      foodIds: ['ramen'],
      locationLabel: '道中で探す',
      conditions: { takeoutRequired: true },
      route: { origin: '名古屋駅', destination: '栄駅', maxDetourMinutes: 10, travelMode: 'WALK' },
    });
  });
});
