import { useCallback, useMemo, useState } from 'react';
import { buildCuisineCandidates } from './domain/candidates';
import { foodCatalog } from './domain/masterData';
import { recordDecision, type DecisionHistory } from './domain/history';
import { drawOne } from './domain/roulette';
import type { Food, RestaurantCandidate, CuisineSelection, GroupEntry, GroupTarget } from './domain/types';
import { createLocalStore, getBrowserStorage } from './application/persistence';
import { createHomeSessionState, resetGeneratedResults, updateConditions, updateFoodSelection, updateLocationMode, updateRoute } from './application/homeSession';
import { fixtureRestaurants } from './providers/fixtureRestaurants';
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
import { GroupPanel } from './components/GroupPanel';
import { buildGroupFoodCandidates, buildGroupRestaurantCandidates, createManualRestaurantCandidate } from './domain/groupCandidates';
import { requestCurrentLocation } from './application/location';
import type { RouletteRevealConfig } from './components/RouletteReveal';

type ActiveReveal = RouletteRevealConfig & { kind: 'cuisine' | 'restaurant' };

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
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [excludedStoreIds, setExcludedStoreIds] = useState<string[]>([]);
  const [groupEntries, setGroupEntries] = useState<GroupEntry[]>([]);
  const [groupTarget, setGroupTarget] = useState<GroupTarget>('food');
  const [activeReveal, setActiveReveal] = useState<ActiveReveal | null>(null);
  const [savedReveal, setSavedReveal] = useState<RouletteRevealConfig | null>(null);
  const [version, setVersion] = useState(0);
  const store = useMemo(() => createLocalStore(getBrowserStorage()), []);
  const cuisineCandidates = homeState.mode === 'group' && groupTarget === 'food' && groupEntries.length > 0
    ? buildGroupFoodCandidates(groupEntries, foodCatalog.foods)
    : buildCuisineCandidates(selection, foodCatalog);
  const history = store.getHistory();
  const savedRestaurants = store.getSavedRestaurants();
  const historyRestaurants = history.filter((item) => item.type === 'restaurant').map((item) => {
    const resolved = [...savedRestaurants, ...fixtureRestaurants].find((candidate) => candidate.id === item.restaurantId || candidate.id === item.id);
    return resolved ?? createManualRestaurantCandidate(item.label);
  }).filter((candidate, index, candidates) => candidates.findIndex((item) => item.id === candidate.id) === index);
  const groupRestaurantCandidates = buildGroupRestaurantCandidates(groupEntries);
  const buildSessionSnapshot = (foodIds: string[]) => ({
    foodIds,
    brandIds: selectedBrandIds,
    excludeStoreIds: excludedStoreIds,
    locationLabel: homeState.location.label,
    conditions: {
      budgetMax: homeState.conditions.budget,
      transport: homeState.conditions.transport,
      travelTimeMax: homeState.conditions.travelTime,
      eatingTime: homeState.conditions.eatingTime,
      parkingRequired: homeState.conditions.parking === 'required',
      takeoutRequired: homeState.conditions.takeout,
    },
  });

  const clearGeneratedUi = () => {
    setCuisineResult(null); setRestaurantResult(null); setRestaurantCandidates([]); setSelectedRestaurantIds([]); setExcludedRestaurantIds([]); setMessage(''); setActiveReveal(null);
  };
  const finishActiveReveal = useCallback(() => setActiveReveal(null), []);
  const finishSavedReveal = useCallback(() => setSavedReveal(null), []);

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
    if (homeState.mode === 'group' && groupTarget === 'food' && groupEntries.length === 0) { setCuisineResult(null); setMessage('メンバーを追加してください'); return; }
    if (cuisineCandidates.length === 0) { setCuisineResult(null); setMessage('条件に合う料理がありません'); return; }
    const winner = cuisineCandidates.length === 1 ? cuisineCandidates[0] : drawOne(cuisineCandidates);
    setMessage(cuisineCandidates.length === 1 ? '候補は1件です。ルーレット演出は行いません。' : '');
    setCuisineResult(winner);
    setRestaurantResult(null);
    setActiveReveal(cuisineCandidates.length === 1 ? null : { kind: 'cuisine', items: cuisineCandidates.map((candidate) => candidate.label), winnerLabel: winner.label });
  };
  const drawGroupRestaurant = () => {
    if (groupRestaurantCandidates.length === 0) { setRestaurantResult(null); setMessage('店候補を追加してください'); return; }
    setRestaurantCandidates(groupRestaurantCandidates);
    setSelectedRestaurantIds(groupRestaurantCandidates.map((candidate) => candidate.id));
    setExcludedRestaurantIds([]);
    setCuisineResult(null);
    const winner = groupRestaurantCandidates.length === 1 ? groupRestaurantCandidates[0] : drawOne(groupRestaurantCandidates);
    setMessage(groupRestaurantCandidates.length === 1 ? '候補は1件です。この店に決定できます。' : '');
    setRestaurantResult(winner);
    setActiveReveal(groupRestaurantCandidates.length === 1 ? null : { kind: 'restaurant', items: groupRestaurantCandidates.map((candidate) => candidate.name), winnerLabel: winner.name });
  };
  const drawPrimary = () => homeState.mode === 'group' && groupTarget === 'restaurant' ? drawGroupRestaurant() : drawCuisine();
  const decideCuisine = () => {
    if (!cuisineResult) return;
    recordDecision({ type: 'cuisine', id: cuisineResult.id, label: cuisineResult.label, sessionSnapshot: buildSessionSnapshot([cuisineResult.id]) }, store);
    setVersion((current) => current + 1); setMessage('料理を決定しました');
  };
  const drawRestaurant = () => {
    const available = restaurantCandidates.filter((candidate) => selectedRestaurantIds.includes(candidate.id) && !excludedRestaurantIds.includes(candidate.id));
    if (available.length === 0) { setRestaurantResult(null); setMessage('条件に合う店舗がありません'); return; }
    const winner = available.length === 1 ? available[0] : drawOne(available);
    setMessage(available.length === 1 ? '候補は1件です。この店に決定できます。' : '');
    setRestaurantResult(winner);
    setActiveReveal(available.length === 1 ? null : { kind: 'restaurant', items: available.map((candidate) => candidate.name), winnerLabel: winner.name });
  };
  const rerollRestaurant = () => {
    const available = restaurantCandidates.filter((candidate) => selectedRestaurantIds.includes(candidate.id) && !excludedRestaurantIds.includes(candidate.id));
    if (available.length === 0) { setRestaurantResult(null); setActiveReveal(null); return; }
    const winner = drawOne(available);
    setRestaurantResult(winner);
    setActiveReveal(available.length === 1 ? null : { kind: 'restaurant', items: available.map((candidate) => candidate.name), winnerLabel: winner.name });
  };
  const excludeAndRerollRestaurant = () => {
    if (!restaurantResult) return;
    const nextExcludedIds = excludedRestaurantIds.includes(restaurantResult.id) ? excludedRestaurantIds : [...excludedRestaurantIds, restaurantResult.id];
    setExcludedRestaurantIds(nextExcludedIds);
    const available = restaurantCandidates.filter((candidate) => selectedRestaurantIds.includes(candidate.id) && !nextExcludedIds.includes(candidate.id));
    if (available.length === 0) { setRestaurantResult(null); setActiveReveal(null); return; }
    const winner = drawOne(available);
    setRestaurantResult(winner);
    setActiveReveal(available.length === 1 ? null : { kind: 'restaurant', items: available.map((candidate) => candidate.name), winnerLabel: winner.name });
  };
  const decideRestaurant = () => {
    if (!restaurantResult) return;
    recordDecision({ type: 'restaurant', id: restaurantResult.id, label: restaurantResult.name, restaurantId: restaurantResult.id, sessionSnapshot: buildSessionSnapshot(cuisineResult ? [cuisineResult.id] : restaurantResult.foodIds) }, store);
    setVersion((current) => current + 1); setMessage('この店に決定しました');
  };
  const saveRestaurant = () => {
    if (!restaurantResult) return;
    store.saveRestaurant(restaurantResult); setVersion((current) => current + 1); setMessage('行きたい店に保存しました');
  };
  const toggleRestaurantSelection = (id: string) => setSelectedRestaurantIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const drawSavedRestaurant = (candidates: RestaurantCandidate[]) => {
    if (candidates.length === 0) { setSavedRouletteResult(null); setSavedReveal(null); return; }
    const winner = drawOne(candidates);
    setSavedRouletteResult(winner);
    setSavedReveal(candidates.length === 1 ? null : { items: candidates.map((candidate) => candidate.name), winnerLabel: winner.name });
  };
  const rerollSavedRestaurant = (candidates: RestaurantCandidate[]) => {
    if (candidates.length === 0) { setSavedRouletteResult(null); setSavedReveal(null); return; }
    const winner = drawOne(candidates);
    setSavedRouletteResult(winner);
    setSavedReveal(candidates.length === 1 ? null : { items: candidates.map((candidate) => candidate.name), winnerLabel: winner.name });
  };
  const decideSavedRestaurant = () => { if (!savedRouletteResult) return; recordDecision({ type: 'restaurant', id: savedRouletteResult.id, label: savedRouletteResult.name, restaurantId: savedRouletteResult.id, sessionSnapshot: buildSessionSnapshot(savedRouletteResult.foodIds) }, store); setVersion((current) => current + 1); };
  const rerunHistory = (item: DecisionHistory) => {
    const snapshot = item.sessionSnapshot;
    const foodIds = snapshot?.foodIds?.length ? snapshot.foodIds : item.type === 'cuisine' ? [item.id] : [];
    if (foodIds.length === 0) { setMessage('この履歴には再実行に必要な条件がありません'); setActiveTab('home'); return; }
    setSelection({ include: foodIds, exclude: [] });
    setSelectedBrandIds(snapshot?.brandIds ?? []);
    setExcludedStoreIds(snapshot?.excludeStoreIds ?? []);
    setHomeState((current) => resetGeneratedResults({
      ...current,
      food: { include: foodIds, exclude: [] },
      location: { ...current.location, label: snapshot?.locationLabel ?? null, mode: snapshot?.locationLabel ? 'specified' : 'auto' },
      conditions: snapshot?.conditions ? {
        ...current.conditions,
        budget: snapshot.conditions.budgetMax ?? null,
        transport: snapshot.conditions.transport as typeof current.conditions.transport ?? null,
        travelTime: snapshot.conditions.travelTimeMax ?? null,
        eatingTime: snapshot.conditions.eatingTime ?? 'now',
        parking: snapshot.conditions.parkingRequired ? 'required' : 'unspecified',
        takeout: snapshot.conditions.takeoutRequired ?? false,
      } : current.conditions,
    }));
    setActiveTab('home');
    setMessage(item.type === 'restaurant' ? '履歴から店舗検索条件を復元しました' : '履歴から料理を再実行します');
  };

  const renderHome = () => (
    <section className="home-screen" aria-labelledby="home-title">
      <div className="hero-topline">
        <p className="eyebrow">食券ルーレット <span className="eyebrow-dot" aria-hidden="true" /></p>
        <span className="hero-index" aria-hidden="true">NO. 0001</span>
      </div>
      <div className="ticket-hero">
        <div className="ticket-hero__art" aria-hidden="true">
          <span className="ticket-hero__art-label">TICKET / 0001</span>
          <span className="ticket-hero__art-number">01</span>
          <span className="ticket-hero__art-slash" />
        </div>
        <div className="ticket-hero__copy">
          <ModeSwitch mode={homeState.mode} onChange={(mode) => { setHomeState((current) => ({ ...current, mode })); clearGeneratedUi(); }} />
          <h1 id="home-title" aria-label="今日のご飯、どうする？"><span aria-hidden="true">今日の</span><span aria-hidden="true">ご飯、</span><em aria-hidden="true">どうする？</em></h1>
          <p className="intro">決まっていることだけ指定して、あとは一枚のチケットに任せよう。</p>
          <button className="primary-button primary-button--hero" type="button" onClick={drawPrimary}><span>ルーレットを回す</span><strong aria-hidden="true">↗</strong></button>
        </div>
      </div>
      {cuisineResult && <ResultCard cuisine={cuisineResult} cuisineLocationLabel={homeState.location.mode === 'specified' ? homeState.location.label : undefined} reveal={activeReveal?.kind === 'cuisine' ? activeReveal : undefined} onRevealComplete={finishActiveReveal} onCuisineDecision={decideCuisine} onReroll={drawCuisine} />}
      {restaurantResult && <ResultCard restaurant={restaurantResult} reveal={activeReveal?.kind === 'restaurant' ? activeReveal : undefined} onRevealComplete={finishActiveReveal} onRestaurantDecision={decideRestaurant} onReroll={rerollRestaurant} onExcludeAndReroll={excludeAndRerollRestaurant} onSaveRestaurant={saveRestaurant} />}
      {restaurantCandidates.length > 0 && !restaurantCandidates.some((candidate) => candidate.brandId) && <><CandidateList candidates={restaurantCandidates} excludedIds={excludedRestaurantIds} selectedIds={selectedRestaurantIds} onToggleSelected={toggleRestaurantSelection} /><button className="primary-button" type="button" onClick={drawRestaurant}>店舗ルーレットを回す</button></>}
      {message && <p className="status-message" role="status">{message}</p>}
      {homeState.mode === 'group' && <GroupPanel entries={groupEntries} foods={foodCatalog.foods} target={groupTarget} savedRestaurants={savedRestaurants} historyRestaurants={historyRestaurants} onTargetChange={(target) => { setGroupTarget(target); clearGeneratedUi(); }} onChange={(entries) => { setGroupEntries(entries); clearGeneratedUi(); }} />}
      <ConditionSummary
        state={homeState}
        showFood={homeState.mode !== 'group'}
        onFoodClick={() => setShowFoodPicker((current) => !current)}
        onLocationClick={() => setShowLocationPicker((current) => !current)}
        onConditionsClick={() => setShowConditionPanel((current) => !current)}
      />
      {showFoodPicker && homeState.mode !== 'group' && <FoodPickerSheet catalog={foodCatalog} include={selection.include} exclude={selection.exclude} regionLabel={homeState.location.label} onToggleInclude={toggleInclude} onToggleExclude={toggleExclude} onClose={() => setShowFoodPicker(false)} />}
      {showLocationPicker && <LocationPicker mode={homeState.location.mode} label={homeState.location.label} route={homeState.location.route} onUseCurrentLocation={useCurrentLocation} onRouteChange={(route) => { setHomeState((current) => updateRoute(current, route)); clearGeneratedUi(); }} onChange={(mode, label) => { setHomeState((current) => updateLocationMode(current, { mode, label })); clearGeneratedUi(); }} />}
      {showConditionPanel && <ConditionPanel conditions={homeState.conditions} onChange={(patch) => { setHomeState((current) => updateConditions(current, patch)); clearGeneratedUi(); }} />}
      {homeState.mode !== 'group' && <CuisinePicker groups={foodCatalog.groups} foods={foodCatalog.foods} include={selection.include} exclude={selection.exclude} onToggleInclude={toggleInclude} onToggleExclude={toggleExclude} />}
    </section>
  );

  return (
    <main className="app-shell">
      {activeTab === 'home' && renderHome()}
      {activeTab === 'saved' && <div className="home-screen"><SavedRestaurants restaurants={savedRestaurants} result={savedRouletteResult} reveal={savedReveal ?? undefined} onRevealComplete={finishSavedReveal} onRoulette={drawSavedRestaurant} onReroll={rerollSavedRestaurant} onDecision={decideSavedRestaurant} /></div>}
      {activeTab === 'history' && <div className="home-screen"><HistoryList history={history} onRerun={rerunHistory} /></div>}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      {version > -1 && null}
    </main>
  );
}
