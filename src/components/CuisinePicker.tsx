import { useState } from 'react';
import type { Food, FoodGroup } from '../domain/types';

type CuisinePickerProps = {
  groups: FoodGroup[];
  foods: Food[];
  include: string[];
  exclude: string[];
  onToggleInclude: (id: string) => void;
  onToggleExclude: (id: string) => void;
};

export function CuisinePicker({ groups, foods, include, exclude, onToggleInclude, onToggleExclude }: CuisinePickerProps) {
  const foodById = new Map(foods.map((food) => [food.id, food]));
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  return (
    <section className="panel" aria-labelledby="cuisine-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">何を食べる？</p>
          <h2 id="cuisine-heading">料理を選ぶ</h2>
        </div>
        <span className="muted">複数選択可</span>
      </div>
      <div className="cuisine-groups">
        {groups.map((group) => {
          const groupFoods = group.children
            .map((id) => foodById.get(id))
            .filter((food): food is Food => food !== undefined && food.parentIds.length === 0);
          if (groupFoods.length === 0) return null;
          return (
            <section key={group.id} className={`cuisine-group${expandedGroups.has(group.id) ? ' cuisine-group--expanded' : ''}`} aria-labelledby={`cuisine-group-${group.id}`}>
              <div className="cuisine-group__heading">
                <h3 id={`cuisine-group-${group.id}`}>
                  <button className="cuisine-group__toggle" type="button" aria-expanded={expandedGroups.has(group.id)} aria-controls={`cuisine-items-${group.id}`} onClick={() => toggleGroup(group.id)}>
                    <span>{group.label}</span>
                    <span className="cuisine-group__count" aria-hidden="true">{groupFoods.length}種類</span>
                    <span className="cuisine-group__icon" aria-hidden="true">{expandedGroups.has(group.id) ? '−' : '＋'}</span>
                  </button>
                </h3>
              </div>
              {expandedGroups.has(group.id) && <div id={`cuisine-items-${group.id}`} className="chip-grid">
                {groupFoods.map((food) => {
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
              </div>}
            </section>
          );
        })}
      </div>
    </section>
  );
}
