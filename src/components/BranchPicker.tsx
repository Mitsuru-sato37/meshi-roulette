import type { RestaurantCandidate } from '../domain/types';

export function BranchPicker({ branches, onSelect }: { branches: RestaurantCandidate[]; onSelect: (branch: RestaurantCandidate) => void }) {
  return (
    <section className="panel" aria-labelledby="branch-heading">
      <div className="section-heading"><div><p className="eyebrow">ブランドが決まりました</p><h2 id="branch-heading">利用可能な支店</h2></div><span className="muted">支店は直接選べます</span></div>
      <div className="candidate-list">
        {branches.map((branch) => <button key={branch.id} className="branch-option" aria-label={`${branch.name}を選ぶ`} type="button" onClick={() => onSelect(branch)}><strong>{branch.name}を選ぶ</strong><small>{branch.locationLabel} ・ {branch.travelSummary} ・ {branch.budgetLabel}</small></button>)}
      </div>
    </section>
  );
}
