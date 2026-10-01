import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';

describe('meal roulette user flows', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const chooseCuisine = (label: string, group: string) => {
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${group}`) }));
    fireEvent.click(screen.getByRole('button', { name: label }));
  };

  it('selects multiple cuisines and stores history only after explicit cuisine decision', () => {
    render(<App />);

    chooseCuisine('ラーメン', '麺');
    chooseCuisine('寿司', '寿司・魚');
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

    chooseCuisine('カレー', 'ご飯もの');
    fireEvent.click(screen.getByRole('button', { name: 'その他の条件' }));
    fireEvent.change(screen.getByLabelText('食べる時間'), { target: { value: 'scheduled' } });
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(screen.getByRole('button', { name: 'この料理のお店を探す' }));
    fireEvent.click(await screen.findByRole('button', { name: '店舗ルーレットを回す' }));

    expect(screen.getAllByText('食堂まる')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: '履歴' }));
    expect(screen.getByText('まだ決定履歴はありません')).toBeInTheDocument();
  });

  it('shows a clear zero-candidate state without changing the user conditions', () => {
    render(<App />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'ラーメンを候補から除外' }));
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));

    expect(screen.getByText('条件に合う料理がありません')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ラーメンを候補から除外' })).toBeInTheDocument();
  });

  it('does not show a roulette action for a single restaurant candidate', async () => {
    render(<App />);

    chooseCuisine('カレー', 'ご飯もの');
    fireEvent.click(screen.getByRole('button', { name: 'その他の条件' }));
    fireEvent.change(screen.getByLabelText('食べる時間'), { target: { value: 'scheduled' } });
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(screen.getByRole('button', { name: 'この料理のお店を探す' }));
    fireEvent.click(await screen.findByRole('button', { name: '店舗ルーレットを回す' }));

    expect(screen.getByText('候補は1件です。この店に決定できます。')).toBeInTheDocument();
    expect(screen.queryByText('ルーレット演出中')).not.toBeInTheDocument();
  });

  it('does not draw an unselected restaurant', async () => {
    render(<App />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(screen.getByRole('button', { name: 'この料理のお店を探す' }));
    await screen.findByRole('button', { name: '店舗ルーレットを回す' });
    screen.getAllByRole('checkbox').forEach((checkbox) => fireEvent.click(checkbox));
    fireEvent.click(screen.getByRole('button', { name: '店舗ルーレットを回す' }));

    expect(screen.getByText('条件に合う店舗がありません')).toBeInTheDocument();
  });

  it('clears old restaurant candidates when the cuisine condition changes', async () => {
    render(<App />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(screen.getByRole('button', { name: 'この料理のお店を探す' }));
    await screen.findByRole('button', { name: '店舗ルーレットを回す' });
    fireEvent.click(screen.getByRole('button', { name: 'ラーメン' }));

    expect(screen.queryByText('麺処ひなた')).not.toBeInTheDocument();
  });

  it('clears generated results when a location condition changes', async () => {
    render(<App />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(screen.getByRole('button', { name: 'この料理のお店を探す' }));
    await screen.findByRole('button', { name: '店舗ルーレットを回す' });
    fireEvent.click(screen.getByRole('button', { name: 'どこで食べる？ おまかせ' }));
    fireEvent.click(screen.getByRole('button', { name: '場所を指定' }));

    expect(screen.queryByRole('button', { name: '店舗ルーレットを回す' })).not.toBeInTheDocument();
  });

  it('lets the user choose a chain and then select a branch directly', async () => {
    render(<App />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'チェーン・店舗を指定' }));
    fireEvent.click(screen.getByRole('button', { name: '岐阜タンメン' }));
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(screen.getByRole('button', { name: 'この料理のお店を探す' }));

    expect(await screen.findByRole('heading', { name: '利用可能な支店' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '岐阜タンメン 名古屋駅店を選ぶ' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '店舗ルーレットを回す' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '岐阜タンメン 名古屋駅店を選ぶ' }));
    expect(screen.getByRole('heading', { name: '岐阜タンメン 名古屋駅店' })).toBeInTheDocument();
  });

  it('registers group members and uses their weighted food candidates', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'みんなで' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'メンバー名' }), { target: { value: '太郎' } });
    fireEvent.click(screen.getByRole('button', { name: 'メンバーを追加' }));

    expect(screen.getByText('太郎')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    expect(screen.getByRole('heading', { name: '「ラーメン」' })).toBeInTheDocument();
  });

  it('runs a roulette using saved restaurants only', async () => {
    render(<App />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(screen.getByRole('button', { name: 'この料理のお店を探す' }));
    fireEvent.click(await screen.findByRole('button', { name: '店舗ルーレットを回す' }));
    fireEvent.click(screen.getByRole('button', { name: '行きたい店に保存' }));
    fireEvent.click(screen.getByRole('button', { name: '行きたい店' }));

    expect(screen.getByRole('button', { name: '保存店舗でルーレットを回す' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '保存店舗でルーレットを回す' }));
    expect(screen.getByText('保存店舗から選びました')).toBeInTheDocument();
  });

  it('can rerun a cuisine decision from history', () => {
    render(<App />);

    chooseCuisine('カレー', 'ご飯もの');
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(screen.getByRole('button', { name: 'この料理に決定' }));
    fireEvent.click(screen.getByRole('button', { name: '履歴' }));
    fireEvent.click(screen.getByRole('button', { name: 'この料理を再実行' }));

    expect(screen.getByRole('button', { name: '何を食べる？ カレー' })).toBeInTheDocument();
  });

  it('captures a route search with origin, destination, and detour limit', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'どこで食べる？ おまかせ' }));
    fireEvent.click(screen.getByRole('button', { name: '道中で探す' }));
    fireEvent.change(screen.getByRole('textbox', { name: '道中の出発地' }), { target: { value: '名古屋駅' } });
    fireEvent.change(screen.getByRole('textbox', { name: '道中の目的地' }), { target: { value: '栄駅' } });
    fireEvent.change(screen.getByRole('combobox', { name: '寄り道上限' }), { target: { value: '10' } });

    expect(screen.getByDisplayValue('名古屋駅')).toBeInTheDocument();
    expect(screen.getByDisplayValue('栄駅')).toBeInTheDocument();
  });

  it('offers map and navigation links for a restaurant result', async () => {
    render(<App />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(screen.getByRole('button', { name: 'この料理のお店を探す' }));
    fireEvent.click(await screen.findByRole('button', { name: '店舗ルーレットを回す' }));

    expect(screen.getByRole('link', { name: '地図で見る' })).toHaveAttribute('href', expect.stringContaining('google.com/maps'));
    expect(screen.getByRole('link', { name: 'ナビを開始' })).toHaveAttribute('href', expect.stringContaining('dir'));
  });
});
