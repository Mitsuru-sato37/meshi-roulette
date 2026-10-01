import type { HomeSessionState } from '../application/homeSession';
import { summarizeConditions } from '../application/homeSession';

type ConditionSummaryProps = { state: HomeSessionState; onFoodClick: () => void; onLocationClick: () => void; onConditionsClick: () => void; showFood?: boolean };

export function ConditionSummary({ state, onFoodClick, onLocationClick, onConditionsClick, showFood = true }: ConditionSummaryProps) {
  const summaries = summarizeConditions(state);
  return (
    <section className="panel condition-panel" aria-label="条件">
      <div className={showFood ? 'condition-row' : 'condition-row condition-row--single'}>
        {showFood && <button type="button" aria-label={`何を食べる？ ${summaries[0].replace('料理：', '')}`} className="condition-button" onClick={onFoodClick}>
          <span>何を食べる？</span><strong>{summaries[0].replace('料理：', '')}</strong>
        </button>}
        <button type="button" aria-label={`どこで食べる？ ${summaries[1].replace('場所：', '')}`} className="condition-button" onClick={onLocationClick}>
          <span>どこで食べる？</span><strong>{summaries[1].replace('場所：', '')}</strong>
        </button>
      </div>
      <button type="button" className="condition-more" onClick={onConditionsClick}>その他の条件</button>
      <div className="condition-chips" aria-label="設定中の条件">
        {summaries.slice(2).map((summary) => <span key={summary} className="condition-chip">{summary}</span>)}
      </div>
      <p className="muted provider-hint">店舗検索は場所を指定すると利用できます</p>
    </section>
  );
}
