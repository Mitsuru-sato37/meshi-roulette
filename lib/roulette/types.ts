export type CandidateKind = "genre" | "chain";
export type PriceBand = "under-1000" | "1000-2000" | "over-2000";
export type MoodTag = "quick" | "hearty" | "light" | "vegetables" | "morning" | "late-night" | "solo-friendly" | "group-friendly" | "drinks" | "takeout";
export type Candidate = { id: string; kind: CandidateKind; name: string; genreId: string; mapQuery: string; prices: PriceBand[]; tags: MoodTag[] };
export type Filters = { genreIds: string[]; prices: PriceBand[]; tags: MoodTag[] };
export type DrawMode = "equal" | "weighted";
export type HistoryEntry = { candidateId: string; chosenAt: string };
