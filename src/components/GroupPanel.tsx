import { useState } from 'react';
import type { Food, GroupEntry, GroupTarget, RestaurantCandidate } from '../domain/types';
import { createManualRestaurantCandidate } from '../domain/groupCandidates';

type GroupPanelProps = {
  entries: GroupEntry[];
  foods: Food[];
  target: GroupTarget;
  savedRestaurants: RestaurantCandidate[];
  historyRestaurants: RestaurantCandidate[];
  onTargetChange: (target: GroupTarget) => void;
  onChange: (entries: GroupEntry[]) => void;
};

export function GroupPanel({ entries, foods, target, savedRestaurants, historyRestaurants, onTargetChange, onChange }: GroupPanelProps) {
  const [label, setLabel] = useState('');
  const [foodId, setFoodId] = useState(foods[0]?.id ?? '');
  const [restaurantName, setRestaurantName] = useState('');
  const [weight, setWeight] = useState(1);
  const [sourceOpen, setSourceOpen] = useState<'history' | 'saved' | null>(null);
  const foodOptions = foods.filter((food) => food.parentIds.length === 0);
  const addEntry = () => {
    if (!label.trim() || !foodId) return;
    onChange([...entries, { id: `${Date.now()}-${entries.length}`, label: label.trim(), type: 'food', candidateIds: [foodId], weight }]);
    setLabel('');
  };
  const addRestaurantEntry = (candidate: RestaurantCandidate) => {
    onChange([...entries, { id: `${Date.now()}-${entries.length}`, label: label.trim() || candidate.name, type: 'restaurant', candidateIds: [candidate.id], weight, restaurant: candidate }]);
    setLabel(''); setRestaurantName(''); setSourceOpen(null);
  };
  const addManualRestaurant = () => { const name = restaurantName.trim(); if (name) addRestaurantEntry(createManualRestaurantCandidate(name)); };
  const updateWeight = (id: string, delta: number) => onChange(entries.map((entry) => entry.id === id ? { ...entry, weight: Math.max(1, entry.weight + delta) } : entry));
  const visibleEntries = entries.filter((entry) => entry.type === target);
  const sourceRestaurants = sourceOpen === 'history' ? historyRestaurants : savedRestaurants;

  return (
    <section className="panel picker-panel" aria-labelledby="group-heading">
      <div className="section-heading"><div><p className="eyebrow">みんなで決める</p><h2 id="group-heading">決め方を選ぶ</h2></div></div>
      <div className="group-target-switch" aria-label="みんなで決める対象">
        <button type="button" className={target === 'food' ? 'group-target-button is-active' : 'group-target-button'} aria-pressed={target === 'food'} onClick={() => { onTargetChange('food'); setSourceOpen(null); }}>料理を決める</button>
        <button type="button" className={target === 'restaurant' ? 'group-target-button is-active' : 'group-target-button'} aria-pressed={target === 'restaurant'} onClick={() => { onTargetChange('restaurant'); setSourceOpen(null); }}>店を決める</button>
      </div>
      <div className="group-form">
        <label className="group-form__field group-form__field--name">
          <span>メンバー名</span>
          <input aria-label="メンバー名" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="例：太郎" />
        </label>
        {target === 'food' ? <div className="group-form__preferences">
          <label className="group-form__field">
            <span>食べたい料理</span>
            <select aria-label="メンバーの料理" value={foodId} onChange={(event) => setFoodId(event.target.value)}>{foods.filter((food) => food.parentIds.length === 0).map((food) => <option key={food.id} value={food.id}>{food.label}</option>)}</select>
          </label>
          <label className="group-form__field group-form__field--weight">
            <span>重み</span>
            <input aria-label="メンバーの重み" type="number" min="1" value={weight} onChange={(event) => setWeight(Math.max(1, Number(event.target.value) || 1))} />
          </label>
        </div> : <>
          <label className="group-form__field"><span>行きたい店名</span><input aria-label="行きたい店名" value={restaurantName} onChange={(event) => setRestaurantName(event.target.value)} placeholder="例：王将" /></label>
          <div className="group-form__preferences"><label className="group-form__field"><span>候補を出す人</span><span className="group-form__field-note">名前なしでも追加できます</span></label><label className="group-form__field group-form__field--weight"><span>重み</span><input aria-label="メンバーの重み" type="number" min="1" value={weight} onChange={(event) => setWeight(Math.max(1, Number(event.target.value) || 1))} /></label></div>
        </>}
        {target === 'food' ? <button className="secondary-button" type="button" onClick={addEntry}>メンバーを追加</button> : <>
          <button className="secondary-button" type="button" onClick={addManualRestaurant}>店候補を追加</button>
          <div className="group-source-actions"><button className="text-button" type="button" onClick={() => setSourceOpen(sourceOpen === 'history' ? null : 'history')}>履歴から追加</button><button className="text-button" type="button" onClick={() => setSourceOpen(sourceOpen === 'saved' ? null : 'saved')}>保存済みから追加</button></div>
          {sourceOpen && <div className="group-source-list" aria-label={sourceOpen === 'history' ? '履歴の店舗' : '保存済み店舗'}>{sourceRestaurants.length === 0 ? <p className="muted">候補がありません</p> : sourceRestaurants.map((restaurant) => <button type="button" className="group-source-option" aria-label={sourceOpen === 'history' ? '履歴店を候補に追加' : '保存店を候補に追加'} key={restaurant.id} onClick={() => addRestaurantEntry(restaurant)}>{restaurant.name}<span aria-hidden="true">{sourceOpen === 'history' ? '履歴店を候補に追加' : '保存店を候補に追加'}</span></button>)}</div>}
        </>}
      </div>
      {visibleEntries.length === 0 && <p className="muted">{target === 'food' ? 'メンバーを追加すると、料理の希望を重み付きで抽選できます。' : '店名を追加すると、みんなの候補から店舗ルーレットを回せます。'}</p>}
      <div className="group-list">{visibleEntries.map((entry) => { const candidateLabel = entry.type === 'restaurant' ? entry.restaurant?.name ?? entry.label : foods.find((food) => food.id === entry.candidateIds[0])?.label ?? '料理未設定'; const showMember = entry.type !== 'restaurant' || entry.label !== candidateLabel; return <div className="group-row" key={entry.id}><span>{showMember && <strong>{entry.label}</strong>}<small>{candidateLabel}</small></span><button className="text-button" type="button" onClick={() => updateWeight(entry.id, -1)} aria-label={`${entry.label}の重みを減らす`}>−</button><strong>{entry.weight}</strong><button className="text-button" type="button" onClick={() => updateWeight(entry.id, 1)} aria-label={`${entry.label}の重みを増やす`}>＋</button></div>; })}</div>
    </section>
  );
}
