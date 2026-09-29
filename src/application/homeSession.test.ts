import { describe, expect, it } from 'vitest';
import {
  createHomeSessionState,
  resetGeneratedResults,
  summarizeConditions,
  updateConditions,
  updateFoodSelection,
  updateLocationMode,
} from './homeSession';

describe('home session', () => {
  it('starts with the specification default of おまかせ', () => {
    const state = createHomeSessionState();

    expect(state.mode).toBe('solo');
    expect(state.food.include).toEqual([]);
    expect(state.food.exclude).toEqual([]);
    expect(state.location.mode).toBe('auto');
    expect(summarizeConditions(state)).toEqual(['料理：おまかせ', '場所：おまかせ', '食べる時間：今から']);
  });

  it('keeps include and exclude selections independently', () => {
    const included = updateFoodSelection(createHomeSessionState(), 'ramen', 'include');
    const state = updateFoodSelection(included, 'ramen', 'exclude');

    expect(state.food.include).toEqual(['ramen']);
    expect(state.food.exclude).toEqual(['ramen']);
  });

  it('summarizes explicitly selected conditions', () => {
    let state = updateFoodSelection(createHomeSessionState(), 'ramen', 'include');
    state = updateLocationMode(state, { mode: 'specified', label: '名古屋駅' });
    state = updateConditions(state, { budget: 2000, transport: 'car', travelTime: 15, parking: 'required' });

    expect(summarizeConditions(state)).toEqual([
      '料理：ラーメン',
      '場所：名古屋駅',
      '車15分',
      '2,000円以内',
      '駐車場あり',
      '食べる時間：今から',
    ]);
  });

  it('shows excluded foods in the condition summary', () => {
    let state = updateFoodSelection(createHomeSessionState(), 'ramen', 'include');
    state = updateFoodSelection(state, 'ramen', 'exclude');

    expect(summarizeConditions(state)).toContain('除外：ラーメン');
  });

  it('clears generated results and manual candidate state when conditions change', () => {
    const state = {
      ...createHomeSessionState(),
      generatedFoodId: 'ramen',
      restaurantCandidates: [{ id: 'a' }],
      selectedRestaurantIds: ['a'],
      temporarilyExcludedRestaurantIds: ['b'],
    };

    expect(resetGeneratedResults(state)).toMatchObject({
      generatedFoodId: null,
      restaurantCandidates: [],
      selectedRestaurantIds: [],
      temporarilyExcludedRestaurantIds: [],
    });
  });
});
