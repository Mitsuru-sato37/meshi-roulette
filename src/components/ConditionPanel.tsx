import type { HomeConditions } from '../application/homeSession';

type ConditionPanelProps = { conditions: HomeConditions; onChange: (patch: Partial<HomeConditions>) => void };

export function ConditionPanel({ conditions, onChange }: ConditionPanelProps) {
  return (
    <section className="panel picker-panel" aria-label="その他の条件">
      <div className="section-heading"><div><p className="eyebrow">その他の条件</p><h2>条件を追加</h2></div></div>
      <div className="condition-form">
        <label>予算<select value={conditions.budget ?? ''} onChange={(event) => onChange({ budget: event.target.value ? Number(event.target.value) : null })}><option value="">指定なし</option><option value="1000">1,000円以内</option><option value="2000">2,000円以内</option><option value="3000">3,000円以内</option></select></label>
        <label>移動手段<select value={conditions.transport ?? ''} onChange={(event) => onChange({ transport: (event.target.value || null) as HomeConditions['transport'] })}><option value="">指定なし</option><option value="walk">徒歩</option><option value="car">車</option><option value="bicycle">自転車</option><option value="transit">公共交通</option></select></label>
        <label>移動時間<select value={conditions.travelTime ?? ''} onChange={(event) => onChange({ travelTime: event.target.value ? Number(event.target.value) : null })}><option value="">指定なし</option><option value="10">10分</option><option value="15">15分</option><option value="20">20分</option></select></label>
        <label>食べる時間<select value={conditions.eatingTime} onChange={(event) => onChange({ eatingTime: event.target.value as HomeConditions['eatingTime'] })}><option value="now">今から</option><option value="scheduled">日時を指定</option></select></label>
        <label className="checkbox-label"><input type="checkbox" checked={conditions.parking === 'required'} onChange={(event) => onChange({ parking: event.target.checked ? 'required' : 'unspecified' })} />駐車場あり</label>
        <label className="checkbox-label"><input type="checkbox" checked={conditions.takeout} onChange={(event) => onChange({ takeout: event.target.checked })} />テイクアウト</label>
      </div>
    </section>
  );
}
