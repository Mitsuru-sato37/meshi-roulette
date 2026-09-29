import { describe, expect, it } from 'vitest';
import { createFixtureRestaurantProvider } from './fixtureRestaurantProvider';
import { getProviderSearchResult } from './providerStatus';

describe('restaurant provider status', () => {
  it('marks fixture results as fixture data', async () => {
    const result = await getProviderSearchResult(createFixtureRestaurantProvider(), { foodIds: ['curry'] });

    expect(result.status).toBe('fixture');
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.message).toContain('仮データ');
  });

  it('maps a missing live provider to an unavailable result', async () => {
    const result = await getProviderSearchResult({ search: async () => { throw new Error('not configured'); } }, { foodIds: ['curry'] });

    expect(result.status).toBe('unavailable');
    expect(result.candidates).toEqual([]);
    expect(result.message).toContain('取得できません');
  });
});
