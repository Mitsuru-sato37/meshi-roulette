import type { LocationMode } from '../application/homeSession';

type LocationPickerProps = { mode: LocationMode; onChange: (mode: LocationMode, label?: string) => void };

export function LocationPicker({ mode, onChange }: LocationPickerProps) {
  return (
    <section className="panel picker-panel" aria-label="食べる場所">
      <div className="section-heading"><div><p className="eyebrow">どこで食べる？</p><h2>場所を選ぶ</h2></div></div>
      <div className="picker-options">
        <button type="button" className={mode === 'auto' ? 'choice-chip choice-chip--selected' : 'choice-chip'} onClick={() => onChange('auto')}>おまかせ</button>
        <button type="button" className={mode === 'current' ? 'choice-chip choice-chip--selected' : 'choice-chip'} onClick={() => onChange('current', '現在地の近く')}>現在地の近く</button>
        <button type="button" className={mode === 'specified' ? 'choice-chip choice-chip--selected' : 'choice-chip'} onClick={() => onChange('specified', '場所を指定')}>場所を指定</button>
        <button type="button" className={mode === 'route' ? 'choice-chip choice-chip--selected' : 'choice-chip'} onClick={() => onChange('route', '道中で探す')}>道中で探す</button>
      </div>
      <p className="muted">店舗検索は場所を指定すると利用できます</p>
    </section>
  );
}
