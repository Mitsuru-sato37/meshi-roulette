import { useMemo, useState } from 'react';
import { buildCuisineCandidates } from './domain/candidates';
import { foodCatalog } from './domain/masterData';
import { recordDecision, type DecisionHistory } from './domain/history';
import { drawOne } from './domain/roulette';
import type { Food, RestaurantCandidate, CuisineSelection, GroupEntry } from './domain/types';
import { createLocalStore, getBrowserStorage } from './application/persistence';
import { createHomeSessionState, resetGeneratedResults, updateConditions, updateFoodSelection, updateLocationMode } from './application/homeSession';
import { createSession } from './application/session';
import { createFixtureRestaurantProvider } from './providers/fixtureRestaurantProvider';
import { createGooglePlacesProvider } from './providers/googlePlacesProvider';
import { fixtureBrands, fixtureRestaurants } from './providers/fixtureRestaurants';
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
import { BrandPicker } from './components/BrandPicker';
import { BranchPicker } from './components/BranchPicker';
import { GroupPanel } from './components/GroupPanel';
import { buildGroupFoodCandidates } from './domain/groupCandidates';
import { requestCurrentLocation } from './application/location';

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selection, setSelection] = useState<CuisineSelection>({ include: [], exclude: [] });
  const [cuisineResult, setCuisineResult] = useState<Food | null>(null);
  const [restaurantResult, setRestaurantResult] = useState<RestaurantCandidate | null>(null);
  const [savedRouletteResult, setSavedRouletteResult] = useState<RestaurantCandidate | null>(null);
  const [restaurantCandidates, setRestaurantCandidates] = useState<RestaurantCandidate[]>([]);
  const [selectedRestaurantIds, setSelectedRestaurantIds] = useState<string[]>([]);
  const [excludedRestaurantIds, setExcludedRestaurantIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [homeState, setHomeState] = useState(createHomeSessionState);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showConditionPanel, setShowConditionPanel] = useState(false);
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [excludedStoreIds, setExcludedStoreIds] = useState<string[]>([]);
  const [groupEntries, setGroupEntries] = useState<GroupEntry[]>([]);
  const [providerNotice, setProviderNotice] = useState('');
  const [version, setVersion] = useState(0);
  const store = useMemo(() => createLocalStore(getBrowserStorage()), []);
  const restaurantProvider = useMemo(() => import.meta.env.VITE_GOOGLE_PLACES_API_KEY ? createGooglePlacesProvider({ apiKey: import.meta.env.VITE_GOOGLE_PLACES_API_KEY }) : createFixtureRestaurantProvider(), []);
  const restaurantSession = useMemo(() => createSession(restaurantProvider), [restaurantProvider]);
  const cuisineCandidates = homeState.mode === 'group' && groupEntries.length > 0
    ? buildGroupFoodCandidates(groupEntries, foodCatalog.foods)
    : buildCuisineCandidates(selection, foodCatalog);
  const history = store.getHistory();
  const savedRestaurants = store.getSavedRestaurants();

  const clearGeneratedUi = () => {
    setCuisineResult(null); setRestaurantResult(null); setRestaurantCandidates([]); setSelectedRestaurantIds([]); setExcludedRestaurantIds([]); setProviderNotice(''); setMessage('');
  };

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
  const toggleBrand = (id: string) => {
    setSelectedBrandIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    clearGeneratedUi();
  };
  const toggleExcludeStore = (id: string) => {
    setExcludedStoreIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    clearGeneratedUi();
  };
  const useCurrentLocation = async () => {
    try {
      const coordinates = await requestCurrentLocation();
      setHomeState((current) => updateLocationMode(current, { mode: 'current', label: '現在地の近く', coordinates }));
      clearGeneratedUi();
      setMessage('現在地を取得しました');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '現在地を取得できませんでした。場所を手入力してください');
    }
  };
  const drawCuisine = () => {
    if (homeState.mode === 'group' && groupEntries.length === 0) { setCuisineResult(null); setMessage('メンバーを追加してください'); return; }
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
    const query = {
      foodIds: [cuisineResult.id],
      locationLabel: homeState.location.label ?? undefined,
      location: { label: homeState.location.label, latitude: homeState.location.latitude, longitude: homeState.location.longitude },
      brandIds: selectedBrandIds,
      excludeStoreIds: excludedStoreIds,
      conditions: {
        budgetMax: homeState.conditions.budget,
        transport: homeState.conditions.transport,
        travelTimeMax: homeState.conditions.travelTime,
        eatingTime: homeState.conditions.eatingTime,
        parkingRequired: homeState.conditions.parking === 'required',
        takeoutRequired: homeState.conditions.takeout,
      },
    };
    try {
      await restaurantSession.generate(query);
    } catch {
      setProviderNotice('店舗情報を取得できませんでした。設定と通信状態を確認してください');
      setRestaurantCandidates([]); setSelectedRestaurantIds([]); setMessage('店舗情報を取得できませんでした。設定と通信状態を確認してください'); return;
    }
    const candidates = restaurantSession.getCandidates();
    setProviderNotice(restaurantProvider.kind === 'fixture' ? 'これは店舗検索の仮データです' : '店舗情報はGoogle Placesから取得しています');
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
  const drawSavedRestaurant = () => setSavedRouletteResult(savedRestaurants.length === 0 ? null : drawOne(savedRestaurants));
  const rerollSavedRestaurant = () => setSavedRouletteResult(savedRestaurants.length === 0 ? null : drawOne(savedRestaurants));
  const decideSavedRestaurant = () => { if (!savedRouletteResult) return; recordDecision({ type: 'restaurant', id: savedRouletteResult.id, label: savedRouletteResult.name, restaurantId: savedRouletteResult.id }, store); setVersion((current) => current + 1); };
  const rerunHistory = (item: DecisionHistory) => {
    if (item.type !== 'cuisine') { setMessage('店舗履歴の再実行には、保存した検索条件が必要です'); setActiveTab('home'); return; }
    setSelection({ include: [item.id], exclude: [] });
    setHomeState((current) => resetGeneratedResults({ ...current, food: { include: [item.id], exclude: [] } }));
    setActiveTab('home');
    setMessage('履歴から料理を再実行します');
  };

  const renderHome = () => (
    <section className="home-screen" aria-labelledby="home-title">
      <p className="eyebrow">ご飯ルーレット</p>
      <ModeSwitch mode={homeState.mode} onChange={(mode) => { setHomeState((current) => ({ ...current, mode })); clearGeneratedUi(); }} />
      <h1 id="home-title">今日のご飯、どうする？</h1>
      <p className="intro">決まっていることだけ指定して、残りはルーレットに任せよう。</p>
      <ConditionSummary
        state={homeState}
        onFoodClick={() => setShowFoodPicker((current) => !current)}
        onLocationClick={() => setShowLocationPicker((current) => !current)}
        onConditionsClick={() => setShowConditionPanel((current) => !current)}
      />
      <button className="condition-more" type="button" onClick={() => setShowBrandPicker((current) => !current)}>チェーン・店舗を指定</button>
      {homeState.mode === 'group' && <GroupPanel entries={groupEntries} foods={foodCatalog.foods} onChange={(entries) => { setGroupEntries(entries); clearGeneratedUi(); }} />}
      {showFoodPicker && <FoodPickerSheet catalog={foodCatalog} include={selection.include} exclude={selection.exclude} regionLabel={homeState.location.label} onToggleInclude={toggleInclude} onToggleExclude={toggleExclude} onClose={() => setShowFoodPicker(false)} />}
      {showBrandPicker && <BrandPicker brands={fixtureBrands} stores={fixtureRestaurants} selectedBrandIds={selectedBrandIds} excludedStoreIds={excludedStoreIds} onToggleBrand={toggleBrand} onToggleExcludeStore={toggleExcludeStore} />}
      {showLocationPicker && <LocationPicker mode={homeState.location.mode} label={homeState.location.label} onUseCurrentLocation={useCurrentLocation} onChange={(mode, label) => { setHomeState((current) => updateLocationMode(current, { mode, label })); clearGeneratedUi(); }} />}
      {showConditionPanel && <ConditionPanel conditions={homeState.conditions} onChange={(patch) => { setHomeState((current) => updateConditions(current, patch)); clearGeneratedUi(); }} />}
      <CuisinePicker foods={foodCatalog.foods.filter((food) => food.parentIds.length === 0)} include={selection.include} exclude={selection.exclude} onToggleInclude={toggleInclude} onToggleExclude={toggleExclude} />
      {message && <p className="status-message" role="status">{message}</p>}
      {providerNotice && <p className="status-message provider-notice" role="status">{providerNotice}</p>}
      <button className="primary-button" type="button" onClick={drawCuisine}>ルーレットを回す</button>
      {cuisineResult && <ResultCard cuisine={cuisineResult} onCuisineDecision={decideCuisine} onFindRestaurant={findRestaurants} onReroll={drawCuisine} />}
      {restaurantCandidates.length > 0 && restaurantCandidates.some((candidate) => candidate.brandId) && <BranchPicker branches={restaurantCandidates} onSelect={(branch) => { setRestaurantResult(branch); setMessage('支店を選択しました'); }} />}
      {restaurantCandidates.length > 0 && !restaurantCandidates.some((candidate) => candidate.brandId) && <><CandidateList candidates={restaurantCandidates} excludedIds={excludedRestaurantIds} selectedIds={selectedRestaurantIds} onToggleSelected={toggleRestaurantSelection} /><button className="primary-button" type="button" onClick={drawRestaurant}>店舗ルーレットを回す</button></>}
      {restaurantResult && <ResultCard restaurant={restaurantResult} onRestaurantDecision={decideRestaurant} onReroll={rerollRestaurant} onExcludeAndReroll={excludeAndRerollRestaurant} onSaveRestaurant={saveRestaurant} />}
    </section>
  );

  return (
    <main className="app-shell">
      {activeTab === 'home' && renderHome()}
      {activeTab === 'saved' && <div className="home-screen"><SavedRestaurants restaurants={savedRestaurants} result={savedRouletteResult} onRoulette={drawSavedRestaurant} onReroll={rerollSavedRestaurant} onDecision={decideSavedRestaurant} /></div>}
      {activeTab === 'history' && <div className="home-screen"><HistoryList history={history} onRerun={rerunHistory} /></div>}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      {version > -1 && null}
    </main>
  );
}
