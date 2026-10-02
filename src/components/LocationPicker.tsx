import type { LocationMode, RoutePlan, Transport } from '../application/homeSession';

type LocationPickerProps = { mode: LocationMode; label: string | null; route?: RoutePlan; transport: Transport | null; onChange: (mode: LocationMode, label?: string) => void; onUseCurrentLocation: () => void; onRouteChange: (route: RoutePlan) => void; onTransportChange: (transport: Transport | null) => void };

export function LocationPicker({ mode, label, route, transport, onChange, onUseCurrentLocation, onRouteChange, onTransportChange }: LocationPickerProps) {
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
      {mode === 'route' && <div className="route-form"><label>出発地<input aria-label="道中の出発地" value={route?.origin ?? ''} onChange={(event) => onRouteChange({ origin: event.target.value, destination: route?.destination ?? '', maxDetourMinutes: route?.maxDetourMinutes ?? 10 })} placeholder="例：名古屋駅" /></label><label>目的地<input aria-label="道中の目的地" value={route?.destination ?? ''} onChange={(event) => onRouteChange({ origin: route?.origin ?? '', destination: event.target.value, maxDetourMinutes: route?.maxDetourMinutes ?? 10 })} placeholder="例：栄駅" /></label><label>移動手段<select aria-label="道中の移動手段" value={transport ?? ''} onChange={(event) => onTransportChange((event.target.value || null) as Transport | null)}><option value="">選択してください</option><option value="walk">徒歩</option><option value="car">車</option><option value="bicycle">自転車</option><option value="transit">公共交通</option></select></label><label>寄り道上限<select aria-label="寄り道上限" value={route?.maxDetourMinutes ?? 10} onChange={(event) => onRouteChange({ origin: route?.origin ?? '', destination: route?.destination ?? '', maxDetourMinutes: Number(event.target.value) })}><option value="5">+5分</option><option value="10">+10分</option><option value="15">+15分</option></select></label></div>}
      <p className="muted">店舗検索は場所を指定すると利用できます</p>
    </section>
  );
}
