import { fireEvent, render, screen } from '@testing-library/react';
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

  it('keeps detailed cuisine choices closed until the user opens the food editor', () => {
    render(<App />);

    expect(screen.queryByRole('button', { name: 'ラーメン' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '何を食べる？ おまかせ' }));

    expect(screen.getByRole('button', { name: 'ラーメン' })).toBeInTheDocument();
  });

  it('shows one clear close action for the food editor sheet', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '何を食べる？ おまかせ' }));

    expect(screen.getAllByRole('button', { name: '閉じる' })).toHaveLength(1);
    expect(screen.getByRole('dialog', { name: '何を食べる？' })).toBeInTheDocument();
  });

  it('focuses the cuisine result after the roulette is run', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '何を食べる？ おまかせ' }));
    fireEvent.click(screen.getByRole('button', { name: 'ラーメン' }));
    fireEvent.click(screen.getByRole('button', { name: '閉じる' }));
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));

    expect(screen.getByRole('region', { name: '料理の結果' })).toHaveFocus();
  });
});
