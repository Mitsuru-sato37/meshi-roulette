import type { Food, RestaurantCandidate } from '../domain/types';

type ResultCardProps = {
  cuisine?: Food | null;
  restaurant?: RestaurantCandidate | null;
  onCuisineDecision?: () => void;
  onFindRestaurant?: () => void;
  onRestaurantDecision?: () => void;
  onReroll?: () => void;
  onExcludeAndReroll?: () => void;
  onSaveRestaurant?: () => void;
};

export function ResultCard({ cuisine, restaurant, onCuisineDecision, onFindRestaurant, onRestaurantDecision, onReroll, onExcludeAndReroll, onSaveRestaurant }: ResultCardProps) {
  if (restaurant) {
    const destination = encodeURIComponent(`${restaurant.name} ${restaurant.locationLabel}`);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;
    const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking`;
    return (
      <section className="result-card" aria-live="polite">
        <p className="eyebrow">今回の候補</p>
        <h2>{restaurant.name}</h2>
        <p>{restaurant.locationLabel} ・ {restaurant.travelSummary} ・ {restaurant.budgetLabel}</p>
        {restaurant.isOpen === false && <p className="notice">現在は営業時間外です</p>}
        <div className="map-links"><a href={mapUrl} target="_blank" rel="noreferrer">地図で見る</a><a href={navigationUrl} target="_blank" rel="noreferrer">ナビを開始</a></div>
        <div className="action-stack">
          <button className="primary-button" type="button" onClick={onRestaurantDecision}>この店に決定</button>
          <button className="secondary-button" type="button" onClick={onReroll}>別の店を引く</button>
          <button className="secondary-button" type="button" onClick={onExcludeAndReroll}>この店を除外して引く</button>
          <button className="text-button" type="button" onClick={onSaveRestaurant}>行きたい店に保存</button>
        </div>
      </section>
    );
  }

  if (!cuisine) return null;
  return (
    <section className="result-card" aria-live="polite">
      <p className="eyebrow">今日のご飯は</p>
      <h2>「{cuisine.label}」</h2>
      <div className="action-stack">
        <button className="primary-button" type="button" onClick={onCuisineDecision}>この料理に決定</button>
        <button className="secondary-button" type="button" onClick={onFindRestaurant}>この料理のお店を探す</button>
        <button className="text-button" type="button" onClick={onReroll}>もう一度回す</button>
      </div>
    </section>
  );
}
