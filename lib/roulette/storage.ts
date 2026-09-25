import type { Filters, HistoryEntry } from "./types";
export const STORAGE_KEY = "meshi-roulette:v1";
export type StoredState = { version: 1; filters: Filters; history: HistoryEntry[]; exclusions: Record<string,string> };
export const emptyStoredState = (): StoredState => ({ version:1, filters:{genreIds:[],prices:[],tags:[]}, history:[], exclusions:{} });
export function nextMidnight(now = new Date()) { const d = new Date(now); d.setHours(24,0,0,0); return d; }
export function loadStoredState(now = new Date()): StoredState {
  if (typeof localStorage === "undefined") return emptyStoredState();
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    const filters = raw?.filters;
    if (raw?.version !== 1 || !filters || !Array.isArray(filters.genreIds) || !Array.isArray(filters.prices) || !Array.isArray(filters.tags)) return emptyStoredState();
    const history = Array.isArray(raw.history) ? raw.history.filter((x:unknown):x is HistoryEntry => !!x && typeof x === "object" && typeof (x as HistoryEntry).candidateId === "string" && typeof (x as HistoryEntry).chosenAt === "string").slice(0,30) : [];
    const sourceExclusions = raw.exclusions && typeof raw.exclusions === "object" && !Array.isArray(raw.exclusions) ? raw.exclusions : {};
    const exclusions = Object.fromEntries(Object.entries(sourceExclusions).filter(([id,v]) => id && typeof v === "string" && new Date(v) > now)) as Record<string,string>;
    return { version:1, filters, history, exclusions };
  } catch { return emptyStoredState(); }
}
export function saveStoredState(state: StoredState) { try { localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); } catch {} }
export function loadTheme(): "light"|"dark" { try { return localStorage.getItem("meshi-theme") === "dark" ? "dark" : "light"; } catch { return "light"; } }
export function saveTheme(theme:"light"|"dark") { try { localStorage.setItem("meshi-theme",theme); } catch {} }
export function clearStoredData() { try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem("meshi-theme"); } catch {} }
