import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App shell', () => {
  it('shows the home title and the three bottom navigation destinations', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: '今日のご飯、どうする？' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ホーム' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '行きたい店' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '履歴' })).toBeInTheDocument();
  });
});
