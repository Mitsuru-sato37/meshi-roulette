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
});
