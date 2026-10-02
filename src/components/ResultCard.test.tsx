import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResultCard } from './ResultCard';

describe('ResultCard roulette reveal', () => {
  it('hides the final result content while the reveal is active', () => {
    render(<ResultCard cuisine={{ id: 'pizza', label: 'ピザ', parentIds: [], children: [], searchTerms: [], aliases: [], tags: [] }} reveal={{ items: ['ラーメン', 'ピザ'], winnerLabel: 'ピザ' }} onRevealComplete={() => undefined} />);

    expect(screen.getByRole('heading', { name: '「ピザ」' })).toHaveClass('result-card__final--hidden');
    expect(screen.getByRole('button', { name: 'この料理に決定' }).parentElement).toHaveClass('result-card__final--hidden');
  });

  it('offers an in-app route search when the route API is configured', () => {
    render(<ResultCard cuisine={{ id: 'ramen', label: 'ラーメン', parentIds: [], children: [], searchTerms: [], aliases: [], tags: [] }} routeSearchAvailable onRouteSearch={() => undefined} />);

    expect(screen.getByRole('button', { name: '道中の店を探す' })).toBeInTheDocument();
  });

  it('shows the detour on a route-search result', () => {
    render(<ResultCard restaurant={{ id: 'route-shop', name: '道中の店', foodIds: ['ramen'], locationLabel: '名古屋市', travelSummary: '約5分', routeDetourMinutes: 3, isOpen: true, budgetLabel: '2,000円前後' }} />);

    expect(screen.getByText(/寄り道約3分/)).toBeInTheDocument();
  });

  it('uses the selected travel mode for the navigation link', () => {
    render(<ResultCard restaurant={{ id: 'route-shop', name: '道中の店', foodIds: ['ramen'], locationLabel: '名古屋市', travelSummary: '約5分', isOpen: true, budgetLabel: '2,000円前後', metadataAvailable: true }} navigationTravelMode="driving" />);

    expect(new URL(screen.getByRole('link', { name: '経路を調べる' }).getAttribute('href') ?? '').searchParams.get('travelmode')).toBe('driving');
  });
});
