import rawSpecialties from '../../data/local-specialties.json';
import type { Food } from './types';

export type LocalSpecialty = {
  id: string;
  label: string;
  foodId: string | null;
  searchTerms: string[];
  aliases: string[];
  tags: string[];
};

type LocalSpecialtyData = {
  specialties: LocalSpecialty[];
  regions: Array<{ id: string; label: string; aliases: string[]; specialtyIds: string[] }>;
};

const specialtyData = rawSpecialties as LocalSpecialtyData;

export function searchFoods(query: string, foods: Food[]): Food[] {
  const normalized = query.trim().toLocaleLowerCase('ja-JP');
  if (!normalized) return [];
  return foods.filter((food) => [food.label, ...food.searchTerms, ...food.aliases].some((value) => value.toLocaleLowerCase('ja-JP').includes(normalized)));
}

export function getFoodChildren(foodId: string, foods: Food[]): Food[] {
  const parent = foods.find((food) => food.id === foodId);
  if (!parent) return [];
  const ids = new Set(parent.children);
  return foods.filter((food) => ids.has(food.id));
}

export function getLocalSpecialties(regionLabel?: string, regionId?: string, cityLabel?: string): LocalSpecialty[] {
  const region = specialtyData.regions.find((candidate) => candidate.id === regionId)
    ?? specialtyData.regions.find((candidate) => [candidate.label, ...candidate.aliases].some((value) => [regionLabel, cityLabel].filter(Boolean).includes(value)));
  if (!region) return [];
  const ids = new Set(region.specialtyIds);
  return specialtyData.specialties.filter((specialty) => ids.has(specialty.id));
}
