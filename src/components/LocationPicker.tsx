import type { LocationMode } from '../application/homeSession';

type LocationPickerProps = { mode: LocationMode; label: string | null; onChange: (mode: LocationMode, label?: string) => void; onUseCurrentLocation: () => void };

export function LocationPicker({ mode, label, onChange, onUseCurrentLocation }: LocationPickerProps) {
  return (
    <section className="panel picker-panel" aria-label="食べる場所">
      <div className="section-heading"><div><p className="eyebrow">どこで食べる？</p><h2>場所を選ぶ</h2></div></div>
      <div className="picker-options">
        <button type="button" className={mode === 'auto' ? 'choice-chip choice-chip--selected' : 'choice-chip'} onClick={() => onChange('auto')}>おまかせ</button>
        <button type="button" className={mode === 'current' ? 'choice-chip choice-chip--selected' : 'choice-chip'} onClick={onUseCurrentLocation}>現在地の近く</button>
        <button type="button" className={mode === 'specified' ? 'choice-chip choice-chip--selected' : 'choice-chip'} onClick={() => onChange('specified', '場所を指定')}>場所を指定</button>
        <button type="button" className={mode === 'route' ? 'choice-chip choice-chip--selected' : 'choice-chip'} onClick={() => onChange('route', '道中で探す')}>道中で探す</button>
      </div>
      {mode === 'specified' && <label className="location-input">駅名・施設名・住所<input value={label ?? ''} onChange={(event) => onChange('specified', event.target.value)} placeholder="例：名古屋駅" /></label>}
      <p className="muted">店舗検索は場所を指定すると利用できます</p>
    </section>
  );
}
