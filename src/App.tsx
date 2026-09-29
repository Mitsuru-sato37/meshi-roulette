import { useMemo, useState } from 'react';
import { buildCuisineCandidates } from './domain/candidates';
import { foodCatalog } from './domain/masterData';
import { recordDecision } from './domain/history';
import { drawOne } from './domain/roulette';
import type { Food, RestaurantCandidate, CuisineSelection } from './domain/types';
import { createLocalStore, getBrowserStorage } from './application/persistence';
import { createHomeSessionState, updateConditions, updateFoodSelection, updateLocationMode } from './application/homeSession';
import { createSession } from './application/session';
import { createFixtureRestaurantProvider } from './providers/fixtureRestaurantProvider';
import { getProviderSearchResult } from './providers/providerStatus';
import { BottomNav, type AppTab } from './components/BottomNav';
import { CandidateList } from './components/CandidateList';
import { CuisinePicker } from './components/CuisinePicker';
import { HistoryList } from './components/HistoryList';
import { ResultCard } from './components/ResultCard';
import { SavedRestaurants } from './components/SavedRestaurants';
import { ConditionPanel } from './components/ConditionPanel';
import { ConditionSummary } from './components/ConditionSummary';
import { LocationPicker } from './components/LocationPicker';
import { ModeSwitch } from './components/ModeSwitch';
import { FoodPickerSheet } from './components/FoodPickerSheet';

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selection, setSelection] = useState<CuisineSelection>({ include: [], exclude: [] });
  const [cuisineResult, setCuisineResult] = useState<Food | null>(null);
  const [restaurantResult, setRestaurantResult] = useState<RestaurantCandidate | null>(null);
  const [restaurantCandidates, setRestaurantCandidates] = useState<RestaurantCandidate[]>([]);
  const [selectedRestaurantIds, setSelectedRestaurantIds] = useState<string[]>([]);
  const [excludedRestaurantIds, setExcludedRestaurantIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [homeState, setHomeState] = useState(createHomeSessionState);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showConditionPanel, setShowConditionPanel] = useState(false);
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [providerNotice, setProviderNotice] = useState('');
  const [version, setVersion] = useState(0);
  const store = useMemo(() => createLocalStore(getBrowserStorage()), []);
  const restaurantProvider = useMemo(() => createFixtureRestaurantProvider(), []);
  const restaurantSession = useMemo(() => createSession(restaurantProvider), [restaurantProvider]);
  const cuisineCandidates = buildCuisineCandidates(selection, foodCatalog);
  const history = store.getHistory();
  const savedRestaurants = store.getSavedRestaurants();

  const toggleInclude = (id: string) => {
    setHomeState((current) => updateFoodSelection(current, id, 'include'));
    setSelection((current) => ({ ...current, include: current.include.includes(id) ? current.include.filter((item) => item !== id) : [...current.include, id] }));
    setCuisineResult(null); setRestaurantResult(null); setRestaurantCandidates([]); setSelectedRestaurantIds([]); setExcludedRestaurantIds([]); setMessage('');
  };
  const toggleExclude = (id: string) => {
    setHomeState((current) => updateFoodSelection(current, id, 'exclude'));
    setSelection((current) => ({ ...current, exclude: current.exclude.includes(id) ? current.exclude.filter((item) => item !== id) : [...current.exclude, id] }));
    setCuisineResult(null); setRestaurantResult(null); setRestaurantCandidates([]); setSelectedRestaurantIds([]); setExcludedRestaurantIds([]); setMessage('');
  };
  const drawCuisine = () => {
    if (cuisineCandidates.length === 0) { setCuisineResult(null); setMessage('条件に合う料理がありません'); return; }
    setMessage(cuisineCandidates.length === 1 ? '候補は1件です。ルーレット演出は行いません。' : '');
    setCuisineResult(cuisineCandidates.length === 1 ? cuisineCandidates[0] : drawOne(cuisineCandidates));
    setRestaurantResult(null);
  };
  const decideCuisine = () => {
    if (!cuisineResult) return;
    recordDecision({ type: 'cuisine', id: cuisineResult.id, label: cuisineResult.label }, store);
    setVersion((current) => current + 1); setMessage('料理を決定しました');
  };
  const findRestaurants = async () => {
    if (!cuisineResult) return;
    const providerResult = await getProviderSearchResult(restaurantProvider, { foodIds: [cuisineResult.id] });
    setProviderNotice(providerResult.message);
    if (providerResult.status === 'unavailable') {
      setRestaurantCandidates([]); setSelectedRestaurantIds([]); setMessage(providerResult.message); return;
    }
    await restaurantSession.generate({ foodIds: [cuisineResult.id] });
    const candidates = restaurantSession.getCandidates();
    setRestaurantCandidates(candidates); setSelectedRestaurantIds(candidates.map((candidate) => candidate.id)); setExcludedRestaurantIds([]); setRestaurantResult(null); setMessage('');
    if (candidates.length === 0) setMessage('条件に合う店舗がありません');
  };
  const drawRestaurant = () => {
    const available = restaurantCandidates.filter((candidate) => selectedRestaurantIds.includes(candidate.id) && !excludedRestaurantIds.includes(candidate.id));
    if (available.length === 0) { setRestaurantResult(null); setMessage('条件に合う店舗がありません'); return; }
    setMessage(available.length === 1 ? '候補は1件です。この店に決定できます。' : '');
    setRestaurantResult(available.length === 1 ? available[0] : drawOne(available));
  };
  const rerollRestaurant = () => {
    const available = restaurantCandidates.filter((candidate) => selectedRestaurantIds.includes(candidate.id) && !excludedRestaurantIds.includes(candidate.id));
    setRestaurantResult(available.length === 0 ? null : drawOne(available));
  };
  const excludeAndRerollRestaurant = () => {
    if (!restaurantResult) return;
    restaurantSession.excludeAndReroll(restaurantResult.id);
    setExcludedRestaurantIds((current) => [...current, restaurantResult.id]); setRestaurantCandidates(restaurantSession.getCandidates());
    const available = restaurantSession.getCandidates().filter((candidate) => selectedRestaurantIds.includes(candidate.id) && !excludedRestaurantIds.includes(candidate.id) && candidate.id !== restaurantResult.id);
    setRestaurantResult(available.length === 0 ? null : drawOne(available));
  };
  const decideRestaurant = () => {
    if (!restaurantResult) return;
    recordDecision({ type: 'restaurant', id: restaurantResult.id, label: restaurantResult.name, restaurantId: restaurantResult.id }, store);
    setVersion((current) => current + 1); setMessage('この店に決定しました');
  };
  const saveRestaurant = () => {
    if (!restaurantResult) return;
    store.saveRestaurant(restaurantResult); setVersion((current) => current + 1); setMessage('行きたい店に保存しました');
  };
  const toggleRestaurantSelection = (id: string) => setSelectedRestaurantIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const renderHome = () => (
    <section className="home-screen" aria-labelledby="home-title">
      <p className="eyebrow">ご飯ルーレット</p>
      <ModeSwitch mode={homeState.mode} onChange={(mode) => setHomeState((current) => ({ ...current, mode }))} />
      <h1 id="home-title">今日のご飯、どうする？</h1>
      <p className="intro">決まっていることだけ指定して、残りはルーレットに任せよう。</p>
      <ConditionSummary
        state={homeState}
        onFoodClick={() => setShowFoodPicker((current) => !current)}
        onLocationClick={() => setShowLocationPicker((current) => !current)}
        onConditionsClick={() => setShowConditionPanel((current) => !current)}
      />
      {showFoodPicker && <FoodPickerSheet catalog={foodCatalog} include={selection.include} exclude={selection.exclude} onToggleInclude={toggleInclude} onToggleExclude={toggleExclude} onClose={() => setShowFoodPicker(false)} />}
      {showLocationPicker && <LocationPicker mode={homeState.location.mode} onChange={(mode, label) => setHomeState((current) => updateLocationMode(current, { mode, label }))} />}
      {showConditionPanel && <ConditionPanel conditions={homeState.conditions} onChange={(patch) => setHomeState((current) => updateConditions(current, patch))} />}
      <CuisinePicker foods={foodCatalog.foods.filter((food) => food.parentIds.length === 0)} include={selection.include} exclude={selection.exclude} onToggleInclude={toggleInclude} onToggleExclude={toggleExclude} />
      {message && <p className="status-message" role="status">{message}</p>}
      {providerNotice && <p className="status-message provider-notice" role="status">{providerNotice}</p>}
      <button className="primary-button" type="button" onClick={drawCuisine}>ルーレットを回す</button>
      {cuisineResult && <ResultCard cuisine={cuisineResult} onCuisineDecision={decideCuisine} onFindRestaurant={findRestaurants} onReroll={drawCuisine} />}
      {restaurantCandidates.length > 0 && <><CandidateList candidates={restaurantCandidates} excludedIds={excludedRestaurantIds} selectedIds={selectedRestaurantIds} onToggleSelected={toggleRestaurantSelection} /><button className="primary-button" type="button" onClick={drawRestaurant}>店舗ルーレットを回す</button></>}
      {restaurantResult && <ResultCard restaurant={restaurantResult} onRestaurantDecision={decideRestaurant} onReroll={rerollRestaurant} onExcludeAndReroll={excludeAndRerollRestaurant} onSaveRestaurant={saveRestaurant} />}
    </section>
  );

  return (
    <main className="app-shell">
      {activeTab === 'home' && renderHome()}
      {activeTab === 'saved' && <div className="home-screen"><SavedRestaurants restaurants={savedRestaurants} /></div>}
      {activeTab === 'history' && <div className="home-screen"><HistoryList history={history} /></div>}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      {version > -1 && null}
    </main>
  );
}
