import { useState } from 'react';
import type { Food, GroupEntry } from '../domain/types';

type GroupPanelProps = { entries: GroupEntry[]; foods: Food[]; onChange: (entries: GroupEntry[]) => void };

export function GroupPanel({ entries, foods, onChange }: GroupPanelProps) {
  const [label, setLabel] = useState('');
  const [foodId, setFoodId] = useState(foods[0]?.id ?? '');
  const [weight, setWeight] = useState(1);
  const addEntry = () => {
    if (!label.trim() || !foodId) return;
    onChange([...entries, { id: `${Date.now()}-${entries.length}`, label: label.trim(), type: 'food', candidateIds: [foodId], weight }]);
    setLabel('');
  };
  const updateWeight = (id: string, delta: number) => onChange(entries.map((entry) => entry.id === id ? { ...entry, weight: Math.max(1, entry.weight + delta) } : entry));

  return (
    <section className="panel picker-panel" aria-labelledby="group-heading">
      <div className="section-heading"><div><p className="eyebrow">みんなで決める</p><h2 id="group-heading">メンバーと重み</h2></div></div>
      <div className="group-form">
        <input aria-label="メンバー名" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="メンバー名" />
        <select aria-label="メンバーの料理" value={foodId} onChange={(event) => setFoodId(event.target.value)}>{foods.filter((food) => food.parentIds.length === 0).map((food) => <option key={food.id} value={food.id}>{food.label}</option>)}</select>
        <input aria-label="メンバーの重み" type="number" min="1" value={weight} onChange={(event) => setWeight(Math.max(1, Number(event.target.value) || 1))} />
        <button className="secondary-button" type="button" onClick={addEntry}>メンバーを追加</button>
      </div>
      {entries.length === 0 && <p className="muted">メンバーを追加すると、料理の希望を重み付きで抽選できます。</p>}
      <div className="group-list">{entries.map((entry) => <div className="group-row" key={entry.id}><span><strong>{entry.label}</strong><small>{foods.find((food) => food.id === entry.candidateIds[0])?.label ?? '料理未設定'}</small></span><button className="text-button" type="button" onClick={() => updateWeight(entry.id, -1)} aria-label={`${entry.label}の重みを減らす`}>−</button><strong>{entry.weight}</strong><button className="text-button" type="button" onClick={() => updateWeight(entry.id, 1)} aria-label={`${entry.label}の重みを増やす`}>＋</button></div>)}</div>
    </section>
  );
}
