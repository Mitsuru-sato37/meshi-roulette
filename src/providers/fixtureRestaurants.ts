import type { Brand, RestaurantCandidate } from '../domain/types';

export const fixtureBrands: Brand[] = [
  { id: 'gifu-tanmen', name: '岐阜タンメン', storeIds: ['fixture-gifu-nagoya', 'fixture-gifu-kanayama'] },
];

export const fixtureRestaurants: RestaurantCandidate[] = [
  { id: 'fixture-ramen-1', name: '麺処ひなた', foodIds: ['ramen'], locationLabel: '駅前', travelSummary: '徒歩8分', isOpen: true, budgetLabel: '〜1,000円' },
  { id: 'fixture-ramen-2', name: '中華そば青空', foodIds: ['ramen'], locationLabel: '中央通り', travelSummary: '徒歩12分', isOpen: true, budgetLabel: '〜1,500円' },
  { id: 'fixture-sushi-1', name: 'すし波', foodIds: ['sushi'], locationLabel: '駅前', travelSummary: '徒歩6分', isOpen: true, budgetLabel: '2,000円〜' },
  { id: 'fixture-curry-1', name: '食堂まる', foodIds: ['curry'], locationLabel: '商店街', travelSummary: '徒歩10分', isOpen: false, budgetLabel: '〜1,000円' },
  { id: 'fixture-gifu-nagoya', brandId: 'gifu-tanmen', brandName: '岐阜タンメン', name: '岐阜タンメン 名古屋駅店', foodIds: ['ramen'], locationLabel: '名古屋駅', travelSummary: '徒歩5分', isOpen: true, budgetLabel: '〜1,000円' },
  { id: 'fixture-gifu-kanayama', brandId: 'gifu-tanmen', brandName: '岐阜タンメン', name: '岐阜タンメン 金山店', foodIds: ['ramen'], locationLabel: '金山駅', travelSummary: '徒歩8分', isOpen: true, budgetLabel: '〜1,000円' },
];
