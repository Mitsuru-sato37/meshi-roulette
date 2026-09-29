import { foodCatalog } from '../domain/masterData';
import type { Coordinates } from './location';

export type FoodTargetMode = 'solo' | 'group';
export type LocationMode = 'auto' | 'current' | 'specified' | 'route';
export type Transport = 'walk' | 'car' | 'bicycle' | 'transit';
export type ParkingRequirement = 'unspecified' | 'required';

export type HomeConditions = {
  budget: number | null;
  transport: Transport | null;
  travelTime: number | null;
  eatingTime: 'now' | 'scheduled';
  parking: ParkingRequirement;
  takeout: boolean;
  savedRestaurantMode: 'exclude' | 'include' | 'only';
  recentExclusion: boolean;
};

export type HomeSessionState = {
  mode: FoodTargetMode;
  food: { include: string[]; exclude: string[] };
  location: { mode: LocationMode; label: string | null; latitude?: number; longitude?: number };
  conditions: HomeConditions;
  generatedFoodId: string | null;
  restaurantCandidates: Array<{ id: string }>;
  selectedRestaurantIds: string[];
  temporarilyExcludedRestaurantIds: string[];
};

export type ConditionPatch = Partial<HomeConditions>;

const defaultConditions: HomeConditions = {
  budget: null,
  transport: null,
  travelTime: null,
  eatingTime: 'now',
  parking: 'unspecified',
  takeout: false,
  savedRestaurantMode: 'exclude',
  recentExclusion: false,
};

export function createHomeSessionState(): HomeSessionState {
  return {
    mode: 'solo',
    food: { include: [], exclude: [] },
    location: { mode: 'auto', label: null },
    conditions: { ...defaultConditions },
    generatedFoodId: null,
    restaurantCandidates: [],
    selectedRestaurantIds: [],
    temporarilyExcludedRestaurantIds: [],
  };
}

export function resetGeneratedResults(state: HomeSessionState): HomeSessionState {
  return {
    ...state,
    generatedFoodId: null,
    restaurantCandidates: [],
    selectedRestaurantIds: [],
    temporarilyExcludedRestaurantIds: [],
  };
}

export function updateFoodSelection(
  state: HomeSessionState,
  id: string,
  kind: 'include' | 'exclude',
): HomeSessionState {
  const nextValues = state.food[kind].includes(id)
    ? state.food[kind].filter((value) => value !== id)
    : [...state.food[kind], id];

  return resetGeneratedResults({ ...state, food: { ...state.food, [kind]: nextValues } });
}

export function updateLocationMode(
  state: HomeSessionState,
  location: { mode: LocationMode; label?: string | null; coordinates?: Coordinates },
): HomeSessionState {
  return resetGeneratedResults({ ...state, location: { mode: location.mode, label: location.label ?? null, ...location.coordinates } });
}

export function updateConditions(state: HomeSessionState, patch: ConditionPatch): HomeSessionState {
  return resetGeneratedResults({ ...state, conditions: { ...state.conditions, ...patch } });
}

function foodLabel(id: string): string {
  return foodCatalog.foods.find((food) => food.id === id)?.label ?? id;
}

function locationLabel(state: HomeSessionState): string {
  if (state.location.label) return state.location.label;
  if (state.location.mode === 'current') return '現在地の近く';
  if (state.location.mode === 'route') return '道中で探す';
  if (state.location.mode === 'specified') return '場所を指定';
  return 'おまかせ';
}

function transportLabel(transport: Transport): string {
  return { walk: '徒歩', car: '車', bicycle: '自転車', transit: '公共交通' }[transport];
}

export function summarizeConditions(state: HomeSessionState): string[] {
  const food = state.food.include.length > 0
    ? `料理：${state.food.include.map(foodLabel).join('・')}`
    : '料理：おまかせ';
  const summary = [food, `場所：${locationLabel(state)}`];
  if (state.food.exclude.length > 0) summary.push(`除外：${state.food.exclude.map(foodLabel).join('・')}`);
  if (state.conditions.transport && state.conditions.travelTime) {
    summary.push(`${transportLabel(state.conditions.transport)}${state.conditions.travelTime}分`);
  }
  if (state.conditions.budget) summary.push(`${state.conditions.budget.toLocaleString('ja-JP')}円以内`);
  if (state.conditions.parking === 'required') summary.push('駐車場あり');
  if (state.conditions.takeout) summary.push('テイクアウト');
  summary.push(`食べる時間：${state.conditions.eatingTime === 'now' ? '今から' : '日時指定'}`);
  return summary;
}
