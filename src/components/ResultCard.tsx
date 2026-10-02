import type { Food, RestaurantCandidate } from '../domain/types';
import { buildMapLinks } from '../domain/mapLinks';
import { RouletteReveal, type RouletteRevealConfig } from './RouletteReveal';

type ResultCardProps = {
  cuisine?: Food | null;
  restaurant?: RestaurantCandidate | null;
  onCuisineDecision?: () => void;
  onFindRestaurant?: () => void;
  onRestaurantDecision?: () => void;
  onReroll?: () => void;
  onExcludeAndReroll?: () => void;
  onSaveRestaurant?: () => void;
  reveal?: RouletteRevealConfig;
  onRevealComplete?: () => void;
};

export function ResultCard({ cuisine, restaurant, onCuisineDecision, onFindRestaurant, onRestaurantDecision, onReroll, onExcludeAndReroll, onSaveRestaurant, reveal, onRevealComplete }: ResultCardProps) {
  const finalClassName = reveal ? 'result-card__final--hidden' : undefined;
  if (restaurant) {
    const hasMetadata = restaurant.metadataAvailable !== false;
    const { mapUrl, navigationUrl } = buildMapLinks(restaurant);
    return (
      <section className={reveal ? 'result-card result-card--revealing' : 'result-card'} aria-live="polite">
        <p className="eyebrow">今回の候補</p>
        {reveal && onRevealComplete && <RouletteReveal {...reveal} onComplete={onRevealComplete} />}
        <h2 className={finalClassName}>{restaurant.name}</h2>
        {hasMetadata && <><p className={finalClassName}>{restaurant.locationLabel} ・ {restaurant.travelSummary} ・ {restaurant.budgetLabel}</p>
        {restaurant.isOpen === false && <p className={`notice ${finalClassName ?? ''}`}>現在は営業時間外です</p>}
        <div className={`map-links ${finalClassName ?? ''}`}>
          <a href={mapUrl}><MapIcon />Googleマップで見る</a>
          <a href={navigationUrl}><NavigationIcon />経路を調べる</a>
        </div></>}
        <div className={`action-stack ${finalClassName ?? ''}`}>
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
    <section className={reveal ? 'result-card result-card--revealing' : 'result-card'} aria-live="polite">
      <p className="eyebrow">今日のご飯は</p>
      {reveal && onRevealComplete && <RouletteReveal {...reveal} onComplete={onRevealComplete} />}
      <h2 className={finalClassName}>「{cuisine.label}」</h2>
      <div className={`action-stack ${finalClassName ?? ''}`}>
        <button className="primary-button" type="button" onClick={onCuisineDecision}>この料理に決定</button>
        <button className="secondary-button" type="button" onClick={onFindRestaurant}>この料理のお店を探す</button>
        <button className="text-button" type="button" onClick={onReroll}>もう一度回す</button>
      </div>
    </section>
  );
}

function MapIcon() {
  return <svg className="map-link__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" /><circle cx="12" cy="9" r="2.25" /></svg>;
}

function NavigationIcon() {
  return <svg className="map-link__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m4 4 16 7-7 2-2 7L4 4Z" /><path d="m11 13 5 5" /></svg>;
}
