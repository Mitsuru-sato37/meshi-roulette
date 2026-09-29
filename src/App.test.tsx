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

  it('shows the reference home controls with default conditions', () => {
    render(<App />);

    expect(screen.getByRole('group', { name: '利用モード' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ひとり' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'みんなで' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '何を食べる？ おまかせ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'どこで食べる？ おまかせ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'その他の条件' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ルーレットを回す' })).toBeInTheDocument();
  });

  it('shows honest location availability instead of claiming live restaurant results', () => {
    render(<App />);

    expect(screen.getByText('店舗検索は場所を指定すると利用できます')).toBeInTheDocument();
    expect(screen.queryByText('現在地周辺の店舗')).not.toBeInTheDocument();
  });
});
