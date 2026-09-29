import { drawOne } from '../domain/roulette';
import type { RestaurantCandidate, RestaurantQuery } from '../domain/types';
import type { RestaurantProvider } from '../providers/restaurantProvider';

export interface RouletteSession {
  generate(query: RestaurantQuery): Promise<void>;
  getCandidates(): RestaurantCandidate[];
  reroll(): RestaurantCandidate;
  excludeAndReroll(id: string): RestaurantCandidate | null;
}

export function createSession(provider: RestaurantProvider, random: () => number = Math.random): RouletteSession {
  let candidates: RestaurantCandidate[] = [];
  let activeQuery: RestaurantQuery | null = null;

  return {
    async generate(query) {
      const sameQuery = activeQuery && JSON.stringify(activeQuery) === JSON.stringify(query);
      if (!sameQuery) {
        candidates = await provider.search(query);
        activeQuery = query;
      }
    },
    getCandidates: () => [...candidates],
    reroll() {
      return drawOne(candidates, random);
    },
    excludeAndReroll(id) {
      candidates = candidates.filter((candidate) => candidate.id !== id);
      return candidates.length === 0 ? null : drawOne(candidates, random);
    },
  };
}
