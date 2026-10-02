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

    expect(screen.getByRole('status')).toHaveTextContent('抽選中');
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

  it('switches group mode to store roulette and hides solo food controls', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'みんなで' }));
    expect(screen.queryByRole('button', { name: /何を食べる？/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '店を決める' }));

    expect(screen.getByRole('textbox', { name: '行きたい店名' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '履歴から追加' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '保存済みから追加' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '料理を選ぶ' })).not.toBeInTheDocument();
  });

  it('runs a roulette from a manually entered group store without provider search', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'みんなで' }));
    fireEvent.click(screen.getByRole('button', { name: '店を決める' }));
    fireEvent.change(screen.getByRole('textbox', { name: '行きたい店名' }), { target: { value: '王将' } });
    fireEvent.click(screen.getByRole('button', { name: '店候補を追加' }));
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));

    expect(screen.getByRole('heading', { name: '王将' })).toBeInTheDocument();
    expect(screen.queryByText(/店舗情報は店舗検索/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '地図で見る' })).not.toBeInTheDocument();
  });

  it('shows the selection reveal when the group store roulette has multiple choices', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'みんなで' }));
    fireEvent.click(screen.getByRole('button', { name: '店を決める' }));
    fireEvent.change(screen.getByRole('textbox', { name: '行きたい店名' }), { target: { value: '王将' } });
    fireEvent.click(screen.getByRole('button', { name: '店候補を追加' }));
    fireEvent.change(screen.getByRole('textbox', { name: '行きたい店名' }), { target: { value: 'すき家' } });
    fireEvent.click(screen.getByRole('button', { name: '店候補を追加' }));
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));

    expect(screen.getByRole('status')).toHaveTextContent('抽選中');
  });

  it('adds saved and history stores to the group store candidate list', () => {
    window.localStorage.setItem('meshi-roulette:saved-restaurants', JSON.stringify([{
      id: 'saved-shop', name: '保存店', foodIds: [], locationLabel: '駅前', travelSummary: '徒歩5分', isOpen: true, budgetLabel: '〜1,000円',
    }]));
    window.localStorage.setItem('meshi-roulette:history', JSON.stringify([{
      historyId: 'history-shop', type: 'restaurant', id: 'history-shop', label: '履歴店', createdAt: new Date().toISOString(),
    }]));
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'みんなで' }));
    fireEvent.click(screen.getByRole('button', { name: '店を決める' }));
    fireEvent.click(screen.getByRole('button', { name: '保存済みから追加' }));
    fireEvent.click(screen.getByRole('button', { name: '保存店を候補に追加' }));
    fireEvent.click(screen.getByRole('button', { name: '履歴から追加' }));
    fireEvent.click(screen.getByRole('button', { name: '履歴店を候補に追加' }));

    expect(screen.getByText('保存店')).toBeInTheDocument();
    expect(screen.getByText('履歴店')).toBeInTheDocument();
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

  it('shows the selection reveal for multiple saved restaurants', () => {
    window.localStorage.setItem('meshi-roulette:saved-restaurants', JSON.stringify([
      { id: 'saved-one', name: '保存店A', foodIds: [], locationLabel: '駅前', travelSummary: '徒歩5分', isOpen: true, budgetLabel: '〜1,000円' },
      { id: 'saved-two', name: '保存店B', foodIds: [], locationLabel: '商店街', travelSummary: '徒歩8分', isOpen: true, budgetLabel: '〜1,500円' },
    ]));
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '行きたい店' }));
    fireEvent.click(screen.getByRole('button', { name: '保存店舗でルーレットを回す' }));

    expect(screen.getAllByRole('status').some((element) => element.textContent?.includes('抽選中'))).toBe(true);
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

    expect(screen.getAllByRole('status').some((element) => element.textContent?.includes('抽選中'))).toBe(true);
    expect(screen.getByRole('link', { name: 'Googleマップで見る' })).toHaveAttribute('href', expect.stringContaining('google.com/maps'));
    expect(screen.getByRole('link', { name: '経路を調べる' })).toHaveAttribute('href', expect.stringContaining('dir'));
  });
});
