import type { Brand, RestaurantCandidate } from '../domain/types';

type BrandPickerProps = {
  brands: Brand[];
  stores: RestaurantCandidate[];
  selectedBrandIds: string[];
  excludedStoreIds: string[];
  onToggleBrand: (id: string) => void;
  onToggleExcludeStore: (id: string) => void;
};

export function BrandPicker({ brands, stores, selectedBrandIds, excludedStoreIds, onToggleBrand, onToggleExcludeStore }: BrandPickerProps) {
  const selectedBrands = brands.filter((brand) => selectedBrandIds.includes(brand.id));
  return (
    <section className="panel picker-panel" aria-labelledby="brand-heading">
      <div className="section-heading">
        <div><p className="eyebrow">店舗を指定</p><h2 id="brand-heading">チェーン・ブランド</h2></div>
        <span className="muted">複数選択可</span>
      </div>
      <div className="chip-grid">
        {brands.map((brand) => <button key={brand.id} type="button" className={`choice-chip${selectedBrandIds.includes(brand.id) ? ' choice-chip--selected' : ''}`} aria-pressed={selectedBrandIds.includes(brand.id)} onClick={() => onToggleBrand(brand.id)}>{brand.name}</button>)}
      </div>
      {selectedBrands.map((brand) => (
        <div key={brand.id} className="brand-stores">
          <p className="muted">{brand.name}の特定店舗を除外</p>
          {stores.filter((store) => store.brandId === brand.id).map((store) => <label key={store.id} className="checkbox-label"><input type="checkbox" checked={excludedStoreIds.includes(store.id)} onChange={() => onToggleExcludeStore(store.id)} />{store.name}</label>)}
        </div>
      ))}
    </section>
  );
}
