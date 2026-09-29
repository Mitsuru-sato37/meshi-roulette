import type { RestaurantCandidate, RestaurantQuery } from '../domain/types';
import type { RestaurantProvider } from './restaurantProvider';

export type ProviderStatus = 'live' | 'fixture' | 'unavailable';
export type ProviderSearchResult = { status: ProviderStatus; candidates: RestaurantCandidate[]; message: string };

export async function getProviderSearchResult(provider: RestaurantProvider, query: RestaurantQuery): Promise<ProviderSearchResult> {
  try {
    const candidates = await provider.search(query);
    if (provider.kind === 'fixture') return { status: 'fixture', candidates, message: 'これは店舗検索の仮データです' };
    return { status: 'live', candidates, message: '' };
  } catch {
    return { status: 'unavailable', candidates: [], message: '店舗情報を取得できませんでした。設定と通信状態を確認してください' };
  }
}
