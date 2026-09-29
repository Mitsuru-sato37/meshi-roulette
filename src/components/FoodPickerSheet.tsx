import { useMemo, useState } from 'react';
import { getFoodChildren, getLocalSpecialties, searchFoods } from '../domain/foodCatalog';
import type { Food, FoodCatalog } from '../domain/types';

type FoodPickerSheetProps = {
  catalog: FoodCatalog;
  include: string[];
  exclude: string[];
  onToggleInclude: (id: string) => void;
  onToggleExclude: (id: string) => void;
  onClose: () => void;
  regionLabel?: string | null;
};

export function FoodPickerSheet({ catalog, include, exclude, onToggleInclude, onToggleExclude, onClose, regionLabel }: FoodPickerSheetProps) {
  const [query, setQuery] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const results = useMemo(() => {
    if (query) return searchFoods(query, catalog.foods);
    if (!parentId) return catalog.foods.filter((food) => food.parentIds.length === 0);
    const group = catalog.groups.find((candidate) => candidate.id === parentId);
    if (group) return catalog.foods.filter((food) => group.children.includes(food.id));
    return getFoodChildren(parentId, catalog.foods);
  }, [catalog, parentId, query]);
  const specialties = getLocalSpecialties(regionLabel ?? undefined);

  return (
    <section className="panel food-sheet" aria-label="料理を詳しく選ぶ">
      <div className="section-heading"><div><p className="eyebrow">料理を選ぶ</p><h2>料理を詳しく選ぶ</h2></div><button type="button" className="text-button" onClick={onClose}>閉じる</button></div>
      <input className="food-search" aria-label="料理名を検索" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="料理名・ aliasesで検索" />
      {!query && <div className="picker-options"><button type="button" className="choice-chip" onClick={() => { setParentId(null); setQuery(''); }}>おまかせ</button>{catalog.groups.map((group) => <button type="button" className="choice-chip" key={group.id} onClick={() => setParentId(group.id)}>{group.label}</button>)}<button type="button" className="choice-chip" onClick={() => setParentId('local_specialties')}>ご当地・名物</button></div>}
      {parentId === 'local_specialties' ? <div className="chip-grid">{specialties.length > 0 ? specialties.map((specialty) => <button type="button" className="choice-chip" key={specialty.id} disabled={!specialty.foodId} onClick={() => specialty.foodId && onToggleInclude(specialty.foodId)}>{specialty.label}</button>) : <p className="empty-state">地域を指定すると、ご当地・名物を表示できます。</p>}</div> : <div className="chip-grid">{results.map((food: Food) => { const selected = include.includes(food.id); const isExcluded = exclude.includes(food.id); return <div className="chip-group" key={food.id}><button type="button" className={`choice-chip${selected ? ' choice-chip--selected' : ''}`} aria-pressed={selected} onClick={() => onToggleInclude(food.id)}>{food.label}</button>{selected && <button type="button" className={`exclude-chip${isExcluded ? ' exclude-chip--active' : ''}`} onClick={() => onToggleExclude(food.id)}>{food.label}を候補から除外</button>}</div>; })}</div>}
    </section>
  );
}
