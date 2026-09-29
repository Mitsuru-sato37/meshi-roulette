# ご飯ルーレット Architecture

The product specification is the source of truth in `docs/product-spec.md`.

```text
React UI
  ↓
Home / Roulette Session
  ↓
Candidate Generator
  ↓
RestaurantProvider
  ├─ Google Places adapter (live, requires configuration)
  └─ Fixture adapter (development/demo only)

Roulette Engine (pure, equal probability unless explicit weight)
Local Persistence (saved restaurants and explicit decisions)
Master Data (food-categories.json and local-specialties.json)
```

Provider-specific payloads are normalized to `RestaurantCandidate` before reaching the UI or roulette engine. Missing API configuration is an unavailable state; it is never presented as a live search result. The current browser-side Google adapter is a boundary implementation and still requires a production-safe key strategy and Routes API integration for travel-time and detour conditions.
