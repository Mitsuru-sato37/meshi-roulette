export type AppTab = 'home' | 'saved' | 'history';

type BottomNavProps = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const items: Array<[AppTab, string]> = [['home', 'ホーム'], ['saved', '行きたい店'], ['history', '履歴']];
  return (
    <nav className="bottom-nav" aria-label="メインナビゲーション">
      {items.map(([tab, label]) => (
        <button key={tab} className={`bottom-nav__item${activeTab === tab ? ' bottom-nav__item--active' : ''}`} type="button" onClick={() => onChange(tab)}>
          {label}
        </button>
      ))}
    </nav>
  );
}
