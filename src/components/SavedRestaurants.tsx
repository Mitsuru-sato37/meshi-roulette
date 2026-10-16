import { useState } from 'react';
import type { RestaurantCandidate } from '../domain/types';
import { ResultCard } from './ResultCard';
import type { RouletteRevealConfig } from './RouletteReveal';

type SavedRestaurantsProps = {
  restaurants: RestaurantCandidate[];
  result: RestaurantCandidate | null;
  reveal?: RouletteRevealConfig;
  onRoulette: (restaurants: RestaurantCandidate[]) => void;
  onReroll: (restaurants: RestaurantCandidate[]) => void;
  onDecision: () => void;
  onRevealComplete?: () => void;
  onSelectionChange: () => void;
};

export function SavedRestaurants({ restaurants, result, reveal, onRoulette, onReroll, onDecision, onRevealComplete, onSelectionChange }: SavedRestaurantsProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => restaurants.map((restaurant) => restaurant.id));
  const selectedRestaurants = restaurants.filter((restaurant) => selectedIds.includes(restaurant.id));

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    onSelectionChange();
  };

  return (
    <section className="panel" aria-labelledby="saved-heading">
      <p className="eyebrow">行きたい店</p>
      <h1 id="saved-heading">保存したお店</h1>
      {restaurants.length === 0 ? <p className="empty-state">まだ保存したお店はありません</p> : <>
        <p className="muted">抽選する店を選んでください（{selectedRestaurants.length}/{restaurants.length}件）</p>
        <button className="primary-button" type="button" disabled={selectedRestaurants.length === 0} onClick={() => onRoulette(selectedRestaurants)}>保存店舗でルーレットを回す</button>
        {selectedRestaurants.length === 0 && <p className="empty-state">抽選する店を選んでください</p>}
        <div className="candidate-list" aria-label="保存店舗の選択">
          {restaurants.map((restaurant) => <label key={restaurant.id} className="candidate-row">
            <input type="checkbox" checked={selectedIds.includes(restaurant.id)} onChange={() => toggleSelected(restaurant.id)} />
            <span><strong>{restaurant.name}</strong><small>{restaurant.locationLabel}</small></span>
          </label>)}
        </div>
        {result && <><p className="status-message" role="status">保存店舗から選びました</p><ResultCard restaurant={result} savedDetails reveal={reveal} onRevealComplete={onRevealComplete} onRestaurantDecision={onDecision} onReroll={() => onReroll(selectedRestaurants)} /></>}
      </>}
    </section>
  );
}
