import type { RestaurantCandidate } from '../domain/types';

export function SavedRestaurants({ restaurants }: { restaurants: RestaurantCandidate[] }) {
  return (
    <section className="panel" aria-labelledby="saved-heading">
      <p className="eyebrow">行きたい店</p>
      <h1 id="saved-heading">保存したお店</h1>
      {restaurants.length === 0 ? <p className="empty-state">まだ保存したお店はありません</p> : <ul className="simple-list">{restaurants.map((restaurant) => <li key={restaurant.id}>{restaurant.name}<small>{restaurant.locationLabel}</small></li>)}</ul>}
    </section>
  );
}
