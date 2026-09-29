import type { DecisionHistory } from '../domain/history';

export function HistoryList({ history, onRerun }: { history: DecisionHistory[]; onRerun: (item: DecisionHistory) => void }) {
  return (
    <section className="panel" aria-labelledby="history-heading">
      <p className="eyebrow">履歴</p>
      <h1 id="history-heading">決定履歴</h1>
      {history.length === 0 ? <p className="empty-state">まだ決定履歴はありません</p> : <ul className="simple-list">{history.slice().reverse().map((item) => <li key={item.historyId}><span>{item.label}</span><small>{item.type === 'restaurant' ? 'お店' : '料理'} ・ {new Date(item.createdAt).toLocaleString('ja-JP')}</small><button className="text-button" type="button" onClick={() => onRerun(item)}>{item.type === 'cuisine' ? 'この料理を再実行' : 'この履歴を再実行'}</button></li>)}</ul>}
    </section>
  );
}
