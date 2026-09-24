import type { Candidate } from "./types";
export const buildMapsUrl = (candidate: Pick<Candidate,"mapQuery">) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(candidate.mapQuery)}`;
