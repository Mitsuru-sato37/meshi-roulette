"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Ban, ChevronRight, History, MapPin, Moon, RotateCw, Shuffle, Sparkles, Sun, Trash2, UserRound, Users } from "lucide-react";
import { CHAINS, GENRES } from "@/lib/roulette/candidates";
import { applyHistoryAvoidance, filterCandidates, suggestRelaxation } from "@/lib/roulette/filter";
import { buildWeights, drawCandidate } from "@/lib/roulette/draw";
import { createShortlist, replaceShortlist } from "@/lib/roulette/shortlist";
import { buildMapsUrl } from "@/lib/roulette/maps";
import { assetUrl } from "@/lib/roulette/base-path";
import { clearStoredData, emptyStoredState, loadStoredState, loadTheme, nextMidnight, saveStoredState, saveTheme } from "@/lib/roulette/storage";
import { registerMealTools } from "@/lib/roulette/webmcp";
import type { Candidate, DrawMode, Filters, MoodTag, PriceBand } from "@/lib/roulette/types";

const moods: {id:MoodTag;label:string;emoji:string}[] = [
  {id:"quick",label:"すぐ食べたい",emoji:"⚡"},{id:"hearty",label:"がっつり",emoji:"🔥"},{id:"light",label:"軽め",emoji:"🌿"},
  {id:"solo-friendly",label:"ひとり向き",emoji:"☝️"},{id:"group-friendly",label:"みんな向き",emoji:"👥"},{id:"late-night",label:"夜遅め",emoji:"🌙"},
  {id:"vegetables",label:"野菜も",emoji:"🥬"},{id:"takeout",label:"持ち帰り",emoji:"🥡"},
];
const prices: {id:PriceBand;label:string}[] = [{id:"under-1000",label:"〜1,000円"},{id:"1000-2000",label:"1,000〜2,000円"},{id:"over-2000",label:"2,000円〜"}];
const toggle = <T,>(xs:T[],x:T) => xs.includes(x) ? xs.filter(v=>v!==x) : [...xs,x];

export function MealRoulette() {
  const [mode,setMode] = useState<"solo"|"group">("solo");
  const [kind,setKind] = useState<"genre"|"chain">("genre");
  const [filters,setFilters] = useState<Filters>({genreIds:[],prices:[],tags:[]});
  const [people,setPeople] = useState(4);
  const [drawMode,setDrawMode] = useState<DrawMode>("equal");
  const [votes,setVotes] = useState<Record<string,number>>({});
  const [ngIds,setNgIds] = useState<Set<string>>(new Set());
  const [shortlist,setShortlist] = useState<Candidate[]>([]);
  const [result,setResult] = useState<Candidate|null>(null);
  const [reason,setReason] = useState("");
  const [history,setHistory] = useState<{candidateId:string;chosenAt:string}[]>([]);
  const [exclusions,setExclusions] = useState<Record<string,string>>({});
  const [dark,setDark] = useState(false);
  const [ready,setReady] = useState(false);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const catalog = kind === "genre" ? GENRES : CHAINS;
  const excludedIds = useMemo(()=>new Set(Object.keys(exclusions)),[exclusions]);
  const matching = useMemo(()=>filterCandidates(catalog,filters,excludedIds),[catalog,filters,excludedIds]);

  useEffect(()=>{ const s=loadStoredState(); setFilters(s.filters); setHistory(s.history); setExclusions(s.exclusions); setDark(loadTheme()==="dark"); setReady(true); },[]);
  useEffect(()=>{ if (ready) saveStoredState({version:1,filters,history,exclusions}); },[ready,filters,history,exclusions]);
  useEffect(()=>{ const recent=new Set(history.slice(0,3).map(h=>h.candidateId)); const fresh=matching.filter(c=>!recent.has(c.id)); setShortlist(createShortlist(fresh.length?fresh:matching,8)); setVotes({}); setResult(null); setReason(""); },[kind,filters,exclusions,mode]);
  useEffect(()=>{ if(result) requestAnimationFrame(()=>resultRef.current?.focus()); },[result]);

  const choose = () => {
    const recent = history.map(h=>h.candidateId);
    const pool = mode === "solo" ? applyHistoryAvoidance(matching,recent,excludedIds) : applyHistoryAvoidance(shortlist,recent,ngIds);
    const picked = drawCandidate(buildWeights(pool.candidates, mode === "group" ? drawMode : "equal", votes, mode === "group" ? ngIds : new Set()));
    if (!picked) { setResult(null); setReason("条件に合う候補がありません。条件または除外を見直してください。"); return null; }
    setResult(picked);
    const vote = votes[picked.id] ?? 0;
    setReason(mode === "solo" ? (pool.restoredHistoryIds.length ? "新しい候補がなかったため、以前の候補を含めました" : `${matching.length}候補からランダムに選びました`) : drawMode === "equal" ? `NGなしの${buildWeights(shortlist,"equal",votes,ngIds).length}候補から平等に抽選` : `${people}人中${vote}人が希望。希望数に応じて当たりやすさを調整しました`);
    setHistory(h=>[{candidateId:picked.id,chosenAt:new Date().toISOString()},...h].slice(0,30)); return picked;
  };
  const refresh = () => { const next=replaceShortlist(matching,new Set(shortlist.map(c=>c.id)),ngIds,8); setShortlist(next.items.length?next.items:createShortlist(matching.filter(c=>!ngIds.has(c.id)),8)); setVotes({}); };
  const excludeToday = () => { if(!result) return; setExclusions(e=>({...e,[result.id]:nextMidnight().toISOString()})); setResult(null); setReason(""); };
  const relaxation = suggestRelaxation(catalog,filters,excludedIds);
  const historyItems = history.map(h=>[...GENRES,...CHAINS].find(c=>c.id===h.candidateId)).filter(Boolean) as Candidate[];
  const remainingOutsideShortlist = matching.filter(c=>!ngIds.has(c.id) && !shortlist.some(s=>s.id===c.id)).length;
  const allShortlistNg = mode==="group" && shortlist.length>0 && buildWeights(shortlist,drawMode,votes,ngIds).length===0;
  const drawActionRef = useRef(choose); drawActionRef.current=choose;
  useEffect(()=>{ const controller=new AbortController(); registerMealTools(async()=>{const picked=drawActionRef.current(); if(!picked) throw new Error("No eligible meal candidate"); await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve())); return {id:picked.id,name:picked.name};},controller.signal); return()=>controller.abort(); },[]);

  return <main className={dark?"app dark":"app"} data-mode={mode}>
    <header className="topbar"><a className="brand" href="#top" aria-label="メシ決めルーレット トップ"><span className="brand-mark">飯</span><span>メシ決め<br/><b>ルーレット</b></span></a><button className="icon-button" onClick={()=>{setDark(v=>{saveTheme(!v?"dark":"light");return !v})}} aria-label={dark?"ライト表示":"ダーク表示"}>{dark?<Sun/>:<Moon/>}</button></header>
    <section className="hero" id="top">
      <div className="hero-copy"><p className="eyebrow"><Sparkles size={16}/> 今日の「何食べる？」を30秒で。</p><h1>迷う時間を、<br/><em>おいしい時間</em>に。</h1><p>気分を選んで回すだけ。ひとりでも、みんなでも、今日の一皿をさっと決めよう。</p></div>
      <div className="hero-art"><img src={assetUrl("/meal-table.webp")} alt="ラーメンやカレー、寿司などが並ぶ楽しい食卓"/><span className="art-badge">きょうは<br/><b>なに食べる？</b></span></div>
    </section>
    <section className="workspace" aria-label="抽選設定">
      <div className="mode-tabs" role="tablist" aria-label="利用モード"><button role="tab" aria-selected={mode==="solo"} onClick={()=>setMode("solo")}><UserRound/>ひとりで決める</button><button role="tab" aria-selected={mode==="group"} onClick={()=>setMode("group")}><Users/>みんなで決める</button></div>
      <div className="roulette-card">
        <div className="section-head"><div><span className="step">01</span><h2>抽選するもの</h2></div><span className="candidate-count">対象 {matching.length}件</span></div>
        <div className="segmented"><button aria-pressed={kind==="genre"} className={kind==="genre"?"selected":""} onClick={()=>setKind("genre")}>🍜 ジャンルから</button><button aria-pressed={kind==="chain"} className={kind==="chain"?"selected":""} onClick={()=>setKind("chain")}>🏪 チェーンから</button></div>
        <div className="section-head second"><div><span className="step">02</span><h2>いまの気分は？</h2></div><button className="text-button" onClick={()=>setFilters({genreIds:[],prices:[],tags:[]})}>すべてクリア</button></div>
        <div className="chip-grid">{moods.map(m=><button key={m.id} className={filters.tags.includes(m.id)?"chip active":"chip"} aria-pressed={filters.tags.includes(m.id)} onClick={()=>setFilters(f=>({...f,tags:toggle(f.tags,m.id)}))}><span>{m.emoji}</span>{m.label}{filters.tags.includes(m.id)&&<b>✓</b>}</button>)}</div>
        <details className="details"><summary>もっと条件をしぼる <ChevronRight/></summary><div className="detail-body"><h3>予算</h3><div className="small-chips">{prices.map(p=><button key={p.id} aria-pressed={filters.prices.includes(p.id)} onClick={()=>setFilters(f=>({...f,prices:toggle(f.prices,p.id)}))}>{p.label}</button>)}</div><h3>ジャンル</h3><div className="small-chips">{GENRES.map(g=><button key={g.id} aria-pressed={filters.genreIds.includes(g.id)} onClick={()=>setFilters(f=>({...f,genreIds:toggle(f.genreIds,g.id)}))}>{g.name}</button>)}</div></div></details>
        {mode==="group" && <section className="group-panel"><div className="section-head"><div><span className="step">03</span><h2>みんなの希望</h2></div><label className="people">人数 <input aria-label="参加人数" type="number" min="2" max="8" value={people} onChange={e=>{const n=Math.max(2,Math.min(8,+e.target.value));setPeople(n);setVotes(v=>Object.fromEntries(Object.entries(v).map(([k,x])=>[k,Math.min(x,n)])))}}/> 人</label></div><div className="balance"><button aria-pressed={drawMode==="equal"} className={drawMode==="equal"?"selected":""} onClick={()=>setDrawMode("equal")}><b>平等に抽選</b><span>全候補を同じ確率で</span></button><button aria-pressed={drawMode==="weighted"} className={drawMode==="weighted"?"selected":""} onClick={()=>setDrawMode("weighted")}><b>希望を反映</b><span>希望が多いほど当たりやすく</span></button></div><div className="shortlist-head"><p>候補ごとに希望人数とNGを設定</p><button className="text-button" onClick={refresh}><RotateCw/> 候補を入れ替える</button></div><div className="shortlist">{shortlist.map(c=><div className={ngIds.has(c.id)?"candidate ng":"candidate"} key={c.id}><span className="candidate-name">{c.name}</span><label>希望 <select aria-label={`${c.name}の希望人数`} value={votes[c.id]??0} disabled={drawMode==="equal"||ngIds.has(c.id)} onChange={e=>setVotes(v=>({...v,[c.id]:+e.target.value}))}>{Array.from({length:people+1},(_,i)=><option key={i}>{i}</option>)}</select>人</label><button aria-label={`${c.name}を${ngIds.has(c.id)?"NG解除":"NGにする"}`} aria-pressed={ngIds.has(c.id)} onClick={()=>setNgIds(s=>{const n=new Set(s);n.has(c.id)?n.delete(c.id):n.add(c.id);return n})}><Ban/> {ngIds.has(c.id)?"NG解除":"NG"}</button></div>)}</div>{allShortlistNg&&<div className="empty" role="status"><b>表示中の候補はすべてNGです</b><span>NGは解除せず、ショートリスト外に有効候補が {remainingOutsideShortlist}件あります。</span>{remainingOutsideShortlist>0?<button onClick={refresh}>NGを保持して候補を入れ替える</button>:<a href="#exclusions">除外中の候補を確認する</a>}</div>}</section>}
        {matching.length===0 && <div className="empty" role="status"><b>候補が見つかりませんでした</b><span>設定した条件と「今日は出さない」を保ったまま停止しています。</span>{relaxation&&<button onClick={()=>setFilters(f=>relaxation.kind==="tag"?{...f,tags:f.tags.slice(0,-1)}:relaxation.kind==="price"?{...f,prices:[]}:{...f,genreIds:[]})}>{relaxation.kind==="tag"?"最後の気分":"条件"}を外すと {relaxation.resultingCount}件</button>}</div>}
        <button className="draw-button" onClick={choose} disabled={!matching.length || (mode==="group" && buildWeights(shortlist,drawMode,votes,ngIds).length===0)}><Shuffle/> ルーレットを回す <span>GO!</span></button>
      </div>
    </section>
    <section className="result-wrap" aria-live="polite" aria-atomic="true">{result ? <article className="result-card"><p className="eyebrow">TODAY&apos;S PICK</p><h2 tabIndex={-1} ref={resultRef}>{result.name}</h2><p>{reason}</p><div className="result-actions"><a href={buildMapsUrl(result)} target="_blank" rel="noopener noreferrer"><MapPin/>近くのお店を探す</a><button onClick={choose}><RotateCw/>もう一度</button><button onClick={excludeToday}><Ban/>今日は出さない</button></div></article> : reason && <div className="empty"><b>{reason}</b></div>}</section>
    <section className="utility" id="exclusions"><details><summary><History/> 最近の決定 <span>{historyItems.length}件</span></summary><div className="history-list">{historyItems.length?historyItems.slice(0,8).map((c,i)=><span key={`${c.id}-${i}`}>{c.name}</span>):<p>まだ履歴はありません。</p>}</div></details><details><summary><Ban/> 今日は出さない <span>{Object.keys(exclusions).length}件</span></summary><div className="history-list">{Object.keys(exclusions).map(id=>{const c=[...GENRES,...CHAINS].find(x=>x.id===id);return c&&<button key={id} onClick={()=>setExclusions(e=>Object.fromEntries(Object.entries(e).filter(([k])=>k!==id)))}>{c.name} ×</button>})}</div></details><button className="clear-data" onClick={()=>{if(!window.confirm("履歴・条件・除外・テーマをすべて消去しますか？"))return;clearStoredData();const s=emptyStoredState();setFilters(s.filters);setHistory([]);setExclusions({});setResult(null);setDark(false)}}><Trash2/> 保存データを消去</button></section>
    <footer><b>メシ決めルーレット</b><p>価格帯やタグは目安です。価格・営業時間・店舗の有無は検索先でご確認ください。</p></footer>
  </main>;
}
