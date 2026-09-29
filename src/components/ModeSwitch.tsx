import type { FoodTargetMode } from '../application/homeSession';

type ModeSwitchProps = { mode: FoodTargetMode; onChange: (mode: FoodTargetMode) => void };

export function ModeSwitch({ mode, onChange }: ModeSwitchProps) {
  return (
    <div className="mode-switch" role="group" aria-label="利用モード">
      <button type="button" aria-pressed={mode === 'solo'} onClick={() => onChange('solo')}>ひとり</button>
      <button type="button" aria-pressed={mode === 'group'} onClick={() => onChange('group')}>みんなで</button>
    </div>
  );
}
