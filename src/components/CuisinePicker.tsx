import type { Food } from '../domain/types';

type CuisinePickerProps = {
  foods: Food[];
  include: string[];
  exclude: string[];
  onToggleInclude: (id: string) => void;
  onToggleExclude: (id: string) => void;
};

export function CuisinePicker({ foods, include, exclude, onToggleInclude, onToggleExclude }: CuisinePickerProps) {
  return (
    <section className="panel" aria-labelledby="cuisine-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">何を食べる？</p>
          <h2 id="cuisine-heading">料理を選ぶ</h2>
        </div>
        <span className="muted">複数選択可</span>
      </div>
      <div className="chip-grid">
        {foods.slice(0, 16).map((food) => {
          const selected = include.includes(food.id);
          const isExcluded = exclude.includes(food.id);
          return (
            <div key={food.id} className="chip-group">
              <button className={`choice-chip${selected ? ' choice-chip--selected' : ''}`} type="button" aria-pressed={selected} onClick={() => onToggleInclude(food.id)}>
                {food.label}
              </button>
              {selected && (
                <button className={`exclude-chip${isExcluded ? ' exclude-chip--active' : ''}`} type="button" aria-pressed={isExcluded} onClick={() => onToggleExclude(food.id)}>
                  {food.label}を候補から除外
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
