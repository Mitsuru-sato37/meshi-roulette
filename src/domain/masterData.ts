import rawFoodCatalog from '../../data/food-categories.json';
import type { FoodCatalog } from './types';

export const foodCatalog = rawFoodCatalog as FoodCatalog;
