export type Food = {
  id: string;
  label: string;
  parentIds: string[];
  children: string[];
  searchTerms: string[];
  aliases: string[];
  tags: string[];
};

export type FoodGroup = {
  id: string;
  label: string;
  children: string[];
};

export type FoodCatalog = {
  groups: FoodGroup[];
  foods: Food[];
};

export type CuisineSelection = {
  include: string[];
  exclude: string[];
};

export type CuisineCandidate = Food & { weight?: number };

export type WeightedCandidate = { id?: string; weight?: number; [key: string]: unknown };

export type RestaurantCandidate = {
  id: string;
  brandId?: string;
  brandName?: string;
  provider?: string;
  providerPlaceId?: string;
  name: string;
  foodIds: string[];
  locationLabel: string;
  travelSummary: string;
  isOpen: boolean | null;
  budgetLabel: string;
  priceYen?: number;
  travelMinutes?: number;
  transportModes?: string[];
  hasParking?: boolean | null;
  supportsTakeout?: boolean | null;
  location?: { latitude?: number; longitude?: number };
};

export type RestaurantConditions = {
  budgetMax?: number | null;
  transport?: string | null;
  travelTimeMax?: number | null;
  eatingTime?: 'now' | 'scheduled';
  parkingRequired?: boolean;
  takeoutRequired?: boolean;
};

export type RestaurantQuery = {
  foodIds: string[];
  locationLabel?: string;
  brandIds?: string[];
  includeStoreIds?: string[];
  excludeStoreIds?: string[];
  conditions?: RestaurantConditions;
  location?: { label?: string | null; latitude?: number; longitude?: number };
  route?: { origin: string; destination: string; maxDetourMinutes: number };
};

export type Brand = {
  id: string;
  name: string;
  storeIds: string[];
};

export type GroupEntry = {
  id: string;
  label: string;
  type: 'food' | 'restaurant';
  candidateIds: string[];
  weight: number;
};
