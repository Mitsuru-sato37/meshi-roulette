import { describe, expect, it } from 'vitest';
import { createLocalStore, getBrowserStorage } from './persistence';

describe('createLocalStore', () => {
  it('round-trips settings, saved restaurants, and history', () => {
    const storage = window.localStorage;
    const first = createLocalStore(storage);
    const restaurant = { id: 'r1', name: '店A', foodIds: ['ramen'], locationLabel: '駅前', travelSummary: '徒歩5分', isOpen: true, budgetLabel: '〜1,000円' };

    first.setSettings({ transportModes: ['walk'] });
    first.saveRestaurant(restaurant);
    first.appendHistory({ historyId: 'h1', id: 'curry', type: 'cuisine', label: 'ラーメン', createdAt: '2026-09-29T00:00:00.000Z' });

    const second = createLocalStore(storage);
    expect(second.getSettings()).toEqual({ transportModes: ['walk'] });
    expect(second.getSavedRestaurants()).toEqual([restaurant]);
    expect(second.getHistory()).toHaveLength(1);
  });

  it('returns safe defaults when stored JSON is malformed', () => {
    window.localStorage.setItem('meshi-roulette:settings', '{bad');
    window.localStorage.setItem('meshi-roulette:saved-restaurants', '[]');
    window.localStorage.setItem('meshi-roulette:history', '[]');

    expect(createLocalStore(window.localStorage).getSettings()).toEqual({});
  });

  it('continues with safe defaults when storage access throws', () => {
    const unavailableStorage = {
      getItem: () => { throw new Error('storage unavailable'); },
      setItem: () => { throw new Error('storage unavailable'); },
    } as unknown as Storage;

    const store = createLocalStore(unavailableStorage);
    expect(store.getSavedRestaurants()).toEqual([]);
    expect(() => store.setSettings({ transportModes: ['walk'] })).not.toThrow();
  });

  it('filters invalid array entries instead of exposing malformed saved data', () => {
    window.localStorage.setItem('meshi-roulette:saved-restaurants', '[{}, null]');
    window.localStorage.setItem('meshi-roulette:history', '[null, {"historyId":"h1","type":"cuisine","id":"ramen","label":"ラーメン","createdAt":"2026-09-29T00:00:00.000Z"}]');

    const store = createLocalStore(window.localStorage);
    expect(store.getSavedRestaurants()).toEqual([]);
    expect(store.getHistory()).toHaveLength(1);
  });

  it('returns undefined when browser storage access itself throws', () => {
    const unavailableWindow = { get localStorage(): Storage { throw new Error('denied'); } } as unknown as Window;
    expect(getBrowserStorage(unavailableWindow)).toBeUndefined();
  });
});
