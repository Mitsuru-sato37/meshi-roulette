import type { CuisineCandidate, CuisineSelection, Food, FoodCatalog } from './types';

function idsForSelection(ids: string[], catalog: FoodCatalog): string[] {
  const groupChildren = new Map(catalog.groups.map((group) => [group.id, group.children]));
  const foodById = new Map(catalog.foods.map((food) => [food.id, food]));
  const resolved: string[] = [];

  const visit = (id: string) => {
    const children = groupChildren.get(id);
    if (children) {
      children.forEach(visit);
      return;
    }
    if (foodById.has(id)) resolved.push(id);
  };

  ids.forEach(visit);
  return resolved;
}

export function buildCuisineCandidates(input: CuisineSelection, catalog: FoodCatalog): CuisineCandidate[] {
  const includes = input.include.length > 0
    ? idsForSelection(input.include, catalog)
    : catalog.foods.filter((food) => food.parentIds.length === 0).map((food) => food.id);
  const excluded = new Set(idsForSelection(input.exclude, catalog));
  const seen = new Set<string>();

  return includes
    .filter((id) => !excluded.has(id))
    .map((id) => catalog.foods.find((food) => food.id === id))
    .filter((food): food is Food => Boolean(food))
    .filter((food) => {
      if (seen.has(food.id)) return false;
      seen.add(food.id);
      return true;
    });
}

export function searchCuisineCatalog(query: string, catalog: FoodCatalog): Food[] {
  const normalized = query.trim().toLocaleLowerCase('ja-JP');
  if (!normalized) return [];
  return catalog.foods.filter((food) => [food.label, ...food.searchTerms, ...food.aliases, ...food.tags]
    .some((value) => value.toLocaleLowerCase('ja-JP').includes(normalized)));
}
