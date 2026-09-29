import type { Brand, RestaurantCandidate, RestaurantQuery } from './types';

export type BrandResolution = {
  brands: Brand[];
  branches: RestaurantCandidate[];
};

export function resolveBrandCandidates(query: RestaurantQuery, brands: Brand[], stores: RestaurantCandidate[]): BrandResolution {
  const requestedBrandIds = new Set(query.brandIds ?? []);
  const excludedStoreIds = new Set(query.excludeStoreIds ?? []);
  const includedStoreIds = query.includeStoreIds?.length ? new Set(query.includeStoreIds) : null;
  const requestedFoodIds = new Set(query.foodIds);
  const selectedBrands = brands.filter((brand) => requestedBrandIds.has(brand.id));
  const selectedBrandStoreIds = new Set(selectedBrands.flatMap((brand) => brand.storeIds));
  const branches = stores.filter((store) => {
    if (!selectedBrandStoreIds.has(store.id)) return false;
    if (excludedStoreIds.has(store.id)) return false;
    if (includedStoreIds && !includedStoreIds.has(store.id)) return false;
    return store.foodIds.some((foodId) => requestedFoodIds.has(foodId));
  });

  return { brands: selectedBrands.filter((brand) => branches.some((store) => brand.storeIds.includes(store.id))), branches };
}
