import type { LocalStore } from '../application/persistence';

export type DecisionInput = {
  type: 'cuisine' | 'restaurant';
  id: string;
  label: string;
  restaurantId?: string;
};

export type DecisionHistory = DecisionInput & {
  historyId: string;
  createdAt: string;
};

export function recordDecision(input: DecisionInput, store: LocalStore): DecisionHistory {
  const decision: DecisionHistory = {
    ...input,
    historyId: `${input.type}-${input.id}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store.appendHistory(decision);
  return decision;
}
