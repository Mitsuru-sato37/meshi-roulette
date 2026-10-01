import type { Food, GroupEntry, RestaurantCandidate } from './types';

export function buildGroupFoodCandidates(entries: GroupEntry[], foods: Food[]): Array<Food & { weight: number }> {
  const foodById = new Map(foods.map((food) => [food.id, food]));
  const weights = new Map<string, number>();
  for (const entry of entries) {
    if (entry.type !== 'food') continue;
    for (const candidateId of entry.candidateIds) {
      if (!foodById.has(candidateId)) continue;
      weights.set(candidateId, (weights.get(candidateId) ?? 0) + entry.weight);
    }
  }
  return [...weights.entries()].map(([id, weight]) => ({ ...foodById.get(id)!, weight }));
}

export function buildGroupRestaurantCandidates(entries: GroupEntry[]): Array<RestaurantCandidate & { weight: number }> {
  const restaurants = new Map<string, RestaurantCandidate>();
  const weights = new Map<string, number>();
  for (const entry of entries) {
    if (entry.type !== 'restaurant' || !entry.restaurant) continue;
    restaurants.set(entry.restaurant.id, entry.restaurant);
    for (const candidateId of entry.candidateIds) {
      if (candidateId !== entry.restaurant.id) continue;
      weights.set(candidateId, (weights.get(candidateId) ?? 0) + entry.weight);
    }
  }
  return [...weights.entries()]
    .map(([id, weight]) => {
      const restaurant = restaurants.get(id);
      return restaurant ? { ...restaurant, weight } : null;
    })
    .filter((restaurant): restaurant is RestaurantCandidate & { weight: number } => restaurant !== null);
}

export function createManualRestaurantCandidate(name: string): RestaurantCandidate {
  const label = name.trim();
  return {
    id: `group-manual-${label}`,
    name: label,
    foodIds: [],
    locationLabel: '情報未取得',
    travelSummary: '店舗情報未取得',
    isOpen: null,
    budgetLabel: '不明',
    metadataAvailable: false,
  };
}
