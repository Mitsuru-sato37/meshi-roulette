import { useState } from 'react';
import type { RestaurantCandidate } from '../domain/types';
import { ResultCard } from './ResultCard';

type SavedFilter = 'all' | 'open' | 'nearby';
type SavedRestaurantsProps = { restaurants: RestaurantCandidate[]; result: RestaurantCandidate | null; onRoulette: (restaurants: RestaurantCandidate[]) => void; onReroll: (restaurants: RestaurantCandidate[]) => void; onDecision: () => void };

export function SavedRestaurants({ restaurants, result, onRoulette, onReroll, onDecision }: SavedRestaurantsProps) {
  const [filter, setFilter] = useState<SavedFilter>('all');
  const filteredRestaurants = restaurants.filter((restaurant) => filter === 'all' || (filter === 'open' && restaurant.isOpen === true) || (filter === 'nearby' && (restaurant.travelMinutes ?? Number.POSITIVE_INFINITY) <= 10));
  return (
    <section className="panel" aria-labelledby="saved-heading">
      <p className="eyebrow">行きたい店</p>
      <h1 id="saved-heading">保存したお店</h1>
      {restaurants.length === 0 ? <p className="empty-state">まだ保存したお店はありません</p> : <><div className="saved-filters" aria-label="保存店舗フィルター"><button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>すべて</button><button type="button" aria-pressed={filter === 'open'} onClick={() => setFilter('open')}>営業中</button><button type="button" aria-pressed={filter === 'nearby'} onClick={() => setFilter('nearby')}>近い順</button></div><button className="primary-button" type="button" disabled={filteredRestaurants.length === 0} onClick={() => onRoulette(filteredRestaurants)}>保存店舗でルーレットを回す</button>{filteredRestaurants.length === 0 && <p className="empty-state">条件に合う保存店舗がありません</p>}<ul className="simple-list">{filteredRestaurants.map((restaurant) => <li key={restaurant.id}>{restaurant.name}<small>{restaurant.locationLabel}</small></li>)}</ul>{result && <><p className="status-message" role="status">保存店舗から選びました</p><ResultCard restaurant={result} onRestaurantDecision={onDecision} onReroll={() => onReroll(filteredRestaurants)} /></>}</>}
    </section>
  );
}
