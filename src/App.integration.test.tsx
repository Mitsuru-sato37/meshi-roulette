import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';

describe('meal roulette user flows', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('selects multiple cuisines and stores history only after explicit cuisine decision', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'ラーメン' }));
    fireEvent.click(screen.getByRole('button', { name: '寿司' }));
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));

    expect(screen.getByRole('button', { name: 'この料理に決定' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '履歴' }));
    expect(screen.getByText('まだ決定履歴はありません')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'ホーム' }));
    fireEvent.click(screen.getByRole('button', { name: 'この料理に決定' }));
    fireEvent.click(screen.getByRole('button', { name: '履歴' }));
    expect(screen.getByText(/決定履歴/)).toBeInTheDocument();
  });

  it('continues from a cuisine result to a restaurant result without saving history on display', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'カレー' }));
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(screen.getByRole('button', { name: 'この料理のお店を探す' }));
    fireEvent.click(await screen.findByRole('button', { name: '店舗ルーレットを回す' }));

    expect(screen.getAllByText('食堂まる')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: '履歴' }));
    expect(screen.getByText('まだ決定履歴はありません')).toBeInTheDocument();
  });

  it('shows a clear zero-candidate state without changing the user conditions', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'ラーメン' }));
    fireEvent.click(screen.getByRole('button', { name: 'ラーメンを候補から除外' }));
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));

    expect(screen.getByText('条件に合う料理がありません')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ラーメンを候補から除外' })).toBeInTheDocument();
  });

  it('does not show a roulette action for a single restaurant candidate', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'カレー' }));
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(screen.getByRole('button', { name: 'この料理のお店を探す' }));
    fireEvent.click(await screen.findByRole('button', { name: '店舗ルーレットを回す' }));

    expect(screen.getByText('候補は1件です。この店に決定できます。')).toBeInTheDocument();
    expect(screen.queryByText('ルーレット演出中')).not.toBeInTheDocument();
  });

  it('does not draw an unselected restaurant', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'ラーメン' }));
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(screen.getByRole('button', { name: 'この料理のお店を探す' }));
    await screen.findByRole('button', { name: '店舗ルーレットを回す' });
    screen.getAllByRole('checkbox').forEach((checkbox) => fireEvent.click(checkbox));
    fireEvent.click(screen.getByRole('button', { name: '店舗ルーレットを回す' }));

    expect(screen.getByText('条件に合う店舗がありません')).toBeInTheDocument();
  });

  it('clears old restaurant candidates when the cuisine condition changes', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'ラーメン' }));
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(screen.getByRole('button', { name: 'この料理のお店を探す' }));
    await screen.findByRole('button', { name: '店舗ルーレットを回す' });
    fireEvent.click(screen.getByRole('button', { name: 'ラーメン' }));

    expect(screen.queryByText('麺処ひなた')).not.toBeInTheDocument();
  });
});
