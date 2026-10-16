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
    expect(screen.getByRole('heading', { name: '麺' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ご飯もの' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ルーレットを回す' })).toBeInTheDocument();
  });

  it('shows honest location availability instead of claiming live restaurant results', () => {
    render(<App />);

    expect(screen.getByText('店舗検索は場所を指定すると利用できます')).toBeInTheDocument();
    expect(screen.queryByText('現在地周辺の店舗')).not.toBeInTheDocument();
  });

  it('offers only conditions the current search can evaluate', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'その他の条件' }));

    expect(screen.getByRole('combobox', { name: '移動手段' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '移動時間' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'テイクアウト' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: '予算' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: '駐車場あり' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: '食べる時間' })).not.toBeInTheDocument();
  });
});
