import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SavedRestaurants } from './SavedRestaurants';
import type { RestaurantCandidate } from '../domain/types';

const restaurants: RestaurantCandidate[] = [
  { id: 'a', name: '店A', foodIds: [], locationLabel: '駅前', travelSummary: '徒歩5分', isOpen: true, budgetLabel: '' },
  { id: 'b', name: '店B', foodIds: [], locationLabel: '商店街', travelSummary: '徒歩8分', isOpen: false, budgetLabel: '' },
];

describe('saved restaurant selection', () => {
  it('starts with all stores selected and draws only checked stores without removing them', () => {
    const onRoulette = vi.fn();
    const onSelectionChange = vi.fn();
    render(<SavedRestaurants restaurants={restaurants} result={null} onRoulette={onRoulette} onReroll={vi.fn()} onDecision={vi.fn()} onSelectionChange={onSelectionChange} />);

    expect(screen.getByRole('checkbox', { name: /店A/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /店B/ })).toBeChecked();
    expect(screen.queryByRole('button', { name: '営業中' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '近い順' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: /店B/ }));
    expect(onSelectionChange).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: '保存店舗でルーレットを回す' }));
    expect(onRoulette).toHaveBeenCalledWith([restaurants[0]]);
    expect(screen.getByText('店B')).toBeInTheDocument();
  });

  it('disables the draw when no saved stores are checked', () => {
    render(<SavedRestaurants restaurants={restaurants} result={null} onRoulette={vi.fn()} onReroll={vi.fn()} onDecision={vi.fn()} onSelectionChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /店A/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /店B/ }));

    expect(screen.getByRole('button', { name: '保存店舗でルーレットを回す' })).toBeDisabled();
    expect(screen.getByText('抽選する店を選んでください')).toBeInTheDocument();
  });

  it('does not present saved opening data as the current status', () => {
    render(<SavedRestaurants restaurants={restaurants} result={restaurants[1]} onRoulette={vi.fn()} onReroll={vi.fn()} onDecision={vi.fn()} onSelectionChange={vi.fn()} />);

    expect(screen.getByText('営業時間・移動時間は保存時の情報です')).toBeInTheDocument();
    expect(screen.queryByText('現在は営業時間外です')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'この店を除外して引く' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '行きたい店に保存' })).not.toBeInTheDocument();
  });

  it('does not repeat an old yen estimate saved from a Google price level', () => {
    const oldGoogleStore = { ...restaurants[0], provider: 'google' as const, budgetLabel: '2,000円前後' };
    render(<SavedRestaurants restaurants={[oldGoogleStore]} result={oldGoogleStore} onRoulette={vi.fn()} onReroll={vi.fn()} onDecision={vi.fn()} onSelectionChange={vi.fn()} />);

    expect(screen.queryByText(/2,000円前後/)).not.toBeInTheDocument();
  });
});
