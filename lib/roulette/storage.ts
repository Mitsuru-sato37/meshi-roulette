import type { Filters, HistoryEntry } from "./types";
export const STORAGE_KEY = "meshi-roulette:v1";
export type StoredState = { version: 1; filters: Filters; history: HistoryEntry[]; exclusions: Record<string,string> };
export const emptyStoredState = (): StoredState => ({ version:1, filters:{genreIds:[],prices:[],tags:[]}, history:[], exclusions:{} });
export function nextMidnight(now = new Date()) { const d = new Date(now); d.setHours(24,0,0,0); return d; }
export function loadStoredState(now = new Date()): StoredState {
  if (typeof localStorage === "undefined") return emptyStoredState();
  try { const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"); if (raw?.version !== 1) return emptyStoredState(); return {...raw, exclusions:Object.fromEntries(Object.entries(raw.exclusions ?? {}).filter(([,v]) => new Date(String(v)) > now))}; } catch { return emptyStoredState(); }
}
export function saveStoredState(state: StoredState) { try { localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); } catch {} }
