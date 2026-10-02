import type { RestaurantCandidate } from '../domain/types';

type CandidateListProps = {
  candidates: RestaurantCandidate[];
  excludedIds: string[];
  selectedIds: string[];
  onToggleSelected: (id: string) => void;
};

export function CandidateList({ candidates, excludedIds, selectedIds, onToggleSelected }: CandidateListProps) {
  return (
    <section className="panel" aria-labelledby="candidate-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">候補</p>
          <h2 id="candidate-heading">条件に合う候補 {candidates.length}件</h2>
        </div>
        <span className="muted">一時除外 {excludedIds.length}件</span>
      </div>
      <div className="candidate-list">
        {candidates.map((candidate) => (
          <label key={candidate.id} className={`candidate-row${excludedIds.includes(candidate.id) ? ' candidate-row--excluded' : ''}`}>
            <input type="checkbox" checked={selectedIds.includes(candidate.id)} onChange={() => onToggleSelected(candidate.id)} />
            <span><strong>{candidate.name}</strong><small>{[candidate.locationLabel, candidate.travelSummary, candidate.routeDetourMinutes != null ? `寄り道約${candidate.routeDetourMinutes}分` : null, candidate.budgetLabel].filter(Boolean).join(' ・ ')}</small></span>
          </label>
        ))}
      </div>
    </section>
  );
}
