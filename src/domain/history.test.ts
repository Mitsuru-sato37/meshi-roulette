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
});
