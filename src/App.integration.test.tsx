import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

  it('opens Google Maps directly from a cuisine result without creating app-side candidates', () => {
    render(<App />);

    chooseCuisine('カレー', 'ご飯もの');
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    const link = screen.getByRole('link', { name: 'Googleマップで店を探す' });

    expect(link).toHaveAttribute('href', expect.stringContaining('google.com/maps/search'));
    expect(screen.queryByText('店舗検索の仮データです')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '店舗ルーレットを回す' })).not.toBeInTheDocument();
  });

  it('shows a clear zero-candidate state without changing the user conditions', () => {
    render(<App />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'ラーメンを候補から除外' }));
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));

    expect(screen.getByText('条件に合う料理がありません')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ラーメンを候補から除外' })).toBeInTheDocument();
  });

  it('includes the selected location in the direct cuisine map search', () => {
    render(<App />);

    chooseCuisine('パスタ', 'イタリアン等');
    fireEvent.click(screen.getByRole('button', { name: 'どこで食べる？ おまかせ' }));
    fireEvent.click(screen.getByRole('button', { name: '場所を指定' }));
    fireEvent.change(screen.getByRole('textbox', { name: '駅名・施設名・住所' }), { target: { value: '名古屋駅' } });
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));

    const link = screen.getByRole('link', { name: 'Googleマップで店を探す' });
    expect(new URL(link.getAttribute('href') ?? '').searchParams.get('query')).toBe('パスタ 名古屋駅');
  });

  it('clears the cuisine result when a location condition changes', () => {
    render(<App />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(screen.getByRole('button', { name: 'どこで食べる？ おまかせ' }));
    fireEvent.click(screen.getByRole('button', { name: '場所を指定' }));

    expect(screen.queryByRole('heading', { name: '「ラーメン」' })).not.toBeInTheDocument();
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

  it('runs a roulette using a manually saved restaurant', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'みんなで' }));
    fireEvent.click(screen.getByRole('button', { name: '店を決める' }));
    fireEvent.change(screen.getByRole('textbox', { name: '行きたい店名' }), { target: { value: '王将' } });
    fireEvent.click(screen.getByRole('button', { name: '店候補を追加' }));
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
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
    fireEvent.change(screen.getByRole('combobox', { name: '道中の移動手段' }), { target: { value: 'walk' } });
    fireEvent.change(screen.getByRole('combobox', { name: '寄り道上限' }), { target: { value: '10' } });

    expect(screen.getByDisplayValue('名古屋駅')).toBeInTheDocument();
    expect(screen.getByDisplayValue('栄駅')).toBeInTheDocument();
  });

  it('uses the cuisine and location in the direct Google Maps link', () => {
    render(<App />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'どこで食べる？ おまかせ' }));
    fireEvent.click(screen.getByRole('button', { name: '場所を指定' }));
    fireEvent.change(screen.getByRole('textbox', { name: '駅名・施設名・住所' }), { target: { value: '名古屋駅' } });
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    const link = screen.getByRole('link', { name: 'Googleマップで店を探す' });
    expect(new URL(link.getAttribute('href') ?? '').searchParams.get('query')).toBe('ラーメン 名古屋駅');
  });

  it('includes both route endpoints in the Google Maps fallback search', () => {
    render(<App />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'どこで食べる？ おまかせ' }));
    fireEvent.click(screen.getByRole('button', { name: '道中で探す' }));
    fireEvent.change(screen.getByRole('textbox', { name: '道中の出発地' }), { target: { value: '名古屋駅' } });
    fireEvent.change(screen.getByRole('textbox', { name: '道中の目的地' }), { target: { value: '栄駅' } });
    fireEvent.click(screen.getByRole('button', { name: 'その他の条件' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'テイクアウト' }));
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));

    const link = screen.getByRole('link', { name: 'Googleマップで店を探す' });
    expect(new URL(link.getAttribute('href') ?? '').searchParams.get('query')).toBe('ラーメン テイクアウト 名古屋駅 栄駅');
    expect(screen.queryAllByText('店舗検索は場所を指定すると利用できます')).toHaveLength(0);
  });

  it('searches restaurants along the selected route through the configured server', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ candidates: [{ id: 'route-shop', name: '道中の店', foodIds: ['ramen'], locationLabel: '栄', travelSummary: '約5分', isOpen: true, budgetLabel: '2,000円前後' }] }), { status: 200 }));
    render(<App restaurantSearchEndpoint="/api/restaurant-search" />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'どこで食べる？ おまかせ' }));
    fireEvent.click(screen.getByRole('button', { name: '道中で探す' }));
    fireEvent.change(screen.getByRole('textbox', { name: '道中の出発地' }), { target: { value: '名古屋駅' } });
    fireEvent.change(screen.getByRole('textbox', { name: '道中の目的地' }), { target: { value: '栄駅' } });
    fireEvent.change(screen.getByRole('combobox', { name: '道中の移動手段' }), { target: { value: 'walk' } });
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(await screen.findByRole('button', { name: '道中の店を探す' }));

    await waitFor(() => expect(screen.getByText('道中の候補を1件取得しました')).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith('/api/restaurant-search', expect.objectContaining({ method: 'POST' }));
    const candidateStage = screen.getByRole('region', { name: 'この中から店舗を決める' });
    const candidateHeading = within(candidateStage).getByRole('heading', { name: '条件に合う候補 1件' });
    const rouletteButton = within(candidateStage).getByRole('button', { name: 'この候補で店舗ルーレットを回す' });
    expect(rouletteButton.compareDocumentPosition(candidateHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fetchMock.mockRestore();
  });

  it('ignores a delayed route response after the user changes conditions', async () => {
    let resolveSearch: ((response: Response) => void) | undefined;
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise((resolve) => { resolveSearch = resolve; }));
    render(<App restaurantSearchEndpoint="/api/restaurant-search" />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'どこで食べる？ おまかせ' }));
    fireEvent.click(screen.getByRole('button', { name: '道中で探す' }));
    fireEvent.change(screen.getByRole('textbox', { name: '道中の出発地' }), { target: { value: '名古屋駅' } });
    fireEvent.change(screen.getByRole('textbox', { name: '道中の目的地' }), { target: { value: '栄駅' } });
    fireEvent.change(screen.getByRole('combobox', { name: '道中の移動手段' }), { target: { value: 'walk' } });
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(await screen.findByRole('button', { name: '道中の店を探す' }));
    await waitFor(() => expect(resolveSearch).toBeDefined());

    fireEvent.click(screen.getByRole('button', { name: 'その他の条件' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'テイクアウト' }));
    resolveSearch?.(new Response(JSON.stringify({ candidates: [{ id: 'stale', name: '古い条件の店', foodIds: ['ramen'], locationLabel: '栄', travelSummary: '約5分', isOpen: true, budgetLabel: '2,000円前後' }] }), { status: 200 }));

    await waitFor(() => expect(screen.queryByRole('region', { name: 'この中から店舗を決める' })).not.toBeInTheDocument());
    expect(screen.queryByText('古い条件の店')).not.toBeInTheDocument();
    fetchMock.mockRestore();
  });

  it('does not search a route until both endpoints are provided', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    render(<App restaurantSearchEndpoint="/api/restaurant-search" />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'どこで食べる？ おまかせ' }));
    fireEvent.click(screen.getByRole('button', { name: '道中で探す' }));
    fireEvent.change(screen.getByRole('combobox', { name: '道中の移動手段' }), { target: { value: 'walk' } });
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(await screen.findByRole('button', { name: '道中の店を探す' }));

    expect(await screen.findByText('出発地と目的地を入力してください')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock.mockRestore();
  });

  it('does not search a route until a transport mode is selected', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    render(<App restaurantSearchEndpoint="/api/restaurant-search" />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'どこで食べる？ おまかせ' }));
    fireEvent.click(screen.getByRole('button', { name: '道中で探す' }));
    fireEvent.change(screen.getByRole('textbox', { name: '道中の出発地' }), { target: { value: '名古屋駅' } });
    fireEvent.change(screen.getByRole('textbox', { name: '道中の目的地' }), { target: { value: '栄駅' } });
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(await screen.findByRole('button', { name: '道中の店を探す' }));

    expect(await screen.findByText('移動手段を選択してください')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryAllByText('店舗検索は場所を指定すると利用できます')).toHaveLength(0);
    fetchMock.mockRestore();
  });

  it('shows zero API candidates without relaxing the route conditions', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"candidates":[]}', { status: 200 }));
    render(<App restaurantSearchEndpoint="/api/restaurant-search" />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'どこで食べる？ おまかせ' }));
    fireEvent.click(screen.getByRole('button', { name: '道中で探す' }));
    fireEvent.change(screen.getByRole('textbox', { name: '道中の出発地' }), { target: { value: '名古屋駅' } });
    fireEvent.change(screen.getByRole('textbox', { name: '道中の目的地' }), { target: { value: '栄駅' } });
    fireEvent.change(screen.getByRole('combobox', { name: '道中の移動手段' }), { target: { value: 'walk' } });
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(await screen.findByRole('button', { name: '道中の店を探す' }));

    expect(await screen.findByText('寄り道上限内に条件に合う店舗がありません')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'この中から店舗を決める' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '道中の出発地' })).toHaveValue('名古屋駅');
    expect(screen.getByRole('textbox', { name: '道中の目的地' })).toHaveValue('栄駅');
    fetchMock.mockRestore();
  });

  it.each([400, 503])('keeps the app usable after a route API %s response', async (status) => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status }));
    render(<App restaurantSearchEndpoint="/api/restaurant-search" />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'どこで食べる？ おまかせ' }));
    fireEvent.click(screen.getByRole('button', { name: '道中で探す' }));
    fireEvent.change(screen.getByRole('textbox', { name: '道中の出発地' }), { target: { value: '名古屋駅' } });
    fireEvent.change(screen.getByRole('textbox', { name: '道中の目的地' }), { target: { value: '栄駅' } });
    fireEvent.change(screen.getByRole('combobox', { name: '道中の移動手段' }), { target: { value: 'walk' } });
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(await screen.findByRole('button', { name: '道中の店を探す' }));

    expect(await screen.findByText('道中の店舗情報を取得できませんでした。Googleマップで店を探してください')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Googleマップで店を探す' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'この中から店舗を決める' })).not.toBeInTheDocument();
    fetchMock.mockRestore();
  });

  it.each(['{bad', '{}', '{"candidates":[null]}'])('uses the existing fallback for an invalid route API payload: %s', async (body) => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(body, { status: 200 }));
    render(<App restaurantSearchEndpoint="/api/restaurant-search" />);

    chooseCuisine('ラーメン', '麺');
    fireEvent.click(screen.getByRole('button', { name: 'どこで食べる？ おまかせ' }));
    fireEvent.click(screen.getByRole('button', { name: '道中で探す' }));
    fireEvent.change(screen.getByRole('textbox', { name: '道中の出発地' }), { target: { value: '名古屋駅' } });
    fireEvent.change(screen.getByRole('textbox', { name: '道中の目的地' }), { target: { value: '栄駅' } });
    fireEvent.change(screen.getByRole('combobox', { name: '道中の移動手段' }), { target: { value: 'walk' } });
    fireEvent.click(screen.getByRole('button', { name: 'ルーレットを回す' }));
    fireEvent.click(await screen.findByRole('button', { name: '道中の店を探す' }));

    expect(await screen.findByText('道中の店舗情報を取得できませんでした。Googleマップで店を探してください')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Googleマップで店を探す' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'この中から店舗を決める' })).not.toBeInTheDocument();
    fetchMock.mockRestore();
  });
});
