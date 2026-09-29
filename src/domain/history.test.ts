import { describe, expect, it } from 'vitest';
import { recordDecision } from './history';
import type { DecisionInput } from './history';
import { createLocalStore } from '../application/persistence';

describe('recordDecision', () => {
  it('persists an explicit cuisine decision', () => {
    const store = createLocalStore(window.localStorage);
    const input: DecisionInput = { type: 'cuisine', id: 'curry', label: 'カレー' };

    const decision = recordDecision(input, store);

    expect(store.getHistory()).toEqual([decision]);
    expect(decision.type).toBe('cuisine');
  });

  it('persists the session snapshot needed to rerun a decision', () => {
    const store = createLocalStore(window.localStorage);
    const decision = recordDecision({
      type: 'restaurant', id: 'store-1', label: '店A', restaurantId: 'store-1',
      sessionSnapshot: { foodIds: ['ramen'], brandIds: ['gifu-tanmen'], excludeStoreIds: ['store-2'], locationLabel: '名古屋駅', conditions: { budgetMax: 2000 } },
    }, store);

    expect(store.getHistory().at(-1)?.sessionSnapshot?.foodIds).toEqual(['ramen']);
    expect(decision.sessionSnapshot?.brandIds).toEqual(['gifu-tanmen']);
  });
});
