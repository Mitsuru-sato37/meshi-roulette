import type { RestaurantCandidate } from '../domain/types';
import { ResultCard } from './ResultCard';

type SavedRestaurantsProps = { restaurants: RestaurantCandidate[]; result: RestaurantCandidate | null; onRoulette: () => void; onReroll: () => void; onDecision: () => void };

export function SavedRestaurants({ restaurants, result, onRoulette, onReroll, onDecision }: SavedRestaurantsProps) {
  return (
    <section className="panel" aria-labelledby="saved-heading">
      <p className="eyebrow">行きたい店</p>
      <h1 id="saved-heading">保存したお店</h1>
      {restaurants.length === 0 ? <p className="empty-state">まだ保存したお店はありません</p> : <><button className="primary-button" type="button" onClick={onRoulette}>保存店舗でルーレットを回す</button><ul className="simple-list">{restaurants.map((restaurant) => <li key={restaurant.id}>{restaurant.name}<small>{restaurant.locationLabel}</small></li>)}</ul>{result && <><p className="status-message" role="status">保存店舗から選びました</p><ResultCard restaurant={result} onRestaurantDecision={onDecision} onReroll={onReroll} /></>}</>}
    </section>
  );
}
