import type { LocalStore } from '../application/persistence';
import type { RestaurantConditions } from './types';

export type SessionSnapshot = {
  foodIds: string[];
  brandIds?: string[];
  excludeStoreIds?: string[];
  locationLabel?: string | null;
  conditions?: RestaurantConditions;
};

export type DecisionInput = {
  type: 'cuisine' | 'restaurant';
  id: string;
  label: string;
  restaurantId?: string;
  sessionSnapshot?: SessionSnapshot;
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
