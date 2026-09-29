import type { DecisionHistory } from '../domain/history';
import type { RestaurantCandidate } from '../domain/types';

export interface LocalStore {
  getSettings<T extends Record<string, unknown> = Record<string, unknown>>(): T;
  setSettings(settings: Record<string, unknown>): void;
  getSavedRestaurants(): RestaurantCandidate[];
  saveRestaurant(restaurant: RestaurantCandidate): void;
  getHistory(): DecisionHistory[];
  appendHistory(decision: DecisionHistory): void;
}

const PREFIX = 'meshi-roulette:';
const KEYS = {
  settings: `${PREFIX}settings`,
  savedRestaurants: `${PREFIX}saved-restaurants`,
  history: `${PREFIX}history`,
} as const;

function readJson<T>(storage: Storage | undefined, key: string, fallback: T): T {
  try {
    const raw = storage?.getItem(key);
    return raw === null || raw === undefined ? fallback : JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isRestaurantCandidate(value: unknown): value is RestaurantCandidate {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' && typeof value.name === 'string' && Array.isArray(value.foodIds)
    && value.foodIds.every((id) => typeof id === 'string') && typeof value.locationLabel === 'string'
    && typeof value.travelSummary === 'string' && (typeof value.isOpen === 'boolean' || value.isOpen === null)
    && typeof value.budgetLabel === 'string';
}

function isDecisionHistory(value: unknown): value is DecisionHistory {
  if (!isRecord(value)) return false;
  return typeof value.historyId === 'string' && (value.type === 'cuisine' || value.type === 'restaurant')
    && typeof value.id === 'string' && typeof value.label === 'string' && typeof value.createdAt === 'string';
}

function writeJson(storage: Storage | undefined, key: string, value: unknown): void {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be disabled or full; the in-memory application can continue.
  }
}

export function createLocalStore(storage?: Storage): LocalStore {
  return {
    getSettings: <T extends Record<string, unknown> = Record<string, unknown>>() => {
      const value = readJson<unknown>(storage, KEYS.settings, {});
      return (isRecord(value) ? value : {}) as T;
    },
    setSettings: (settings) => writeJson(storage, KEYS.settings, settings),
    getSavedRestaurants: () => {
      const value = readJson<unknown>(storage, KEYS.savedRestaurants, []);
      return (Array.isArray(value) ? value : []).filter(isRestaurantCandidate);
    },
    saveRestaurant: (restaurant) => {
      const raw = readJson<unknown>(storage, KEYS.savedRestaurants, []);
      const saved = (Array.isArray(raw) ? raw : []).filter(isRestaurantCandidate);
      if (!saved.some((item) => item.id === restaurant.id)) writeJson(storage, KEYS.savedRestaurants, [...saved, restaurant]);
    },
    getHistory: () => {
      const value = readJson<unknown>(storage, KEYS.history, []);
      return (Array.isArray(value) ? value : []).filter(isDecisionHistory);
    },
    appendHistory: (decision) => {
      const raw = readJson<unknown>(storage, KEYS.history, []);
      const history = (Array.isArray(raw) ? raw : []).filter(isDecisionHistory);
      writeJson(storage, KEYS.history, [...history, decision]);
    },
  };
}

export function getBrowserStorage(windowLike: Pick<Window, 'localStorage'> = window): Storage | undefined {
  try {
    return windowLike.localStorage;
  } catch {
    return undefined;
  }
}
