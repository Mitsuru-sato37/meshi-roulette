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
  ├─ Remote server adapter (recommended; keeps provider keys server-side)
  ├─ Google Places adapter (live, requires configuration)
  └─ Fixture adapter (development/demo only)

Roulette Engine (pure, equal probability unless explicit weight)
Local Persistence (saved restaurants and explicit decisions)
Master Data (food-categories.json and local-specialties.json)
Brand / Store Master (explicit brand inclusion, store exclusion, branch choice)
```

Provider-specific payloads are normalized to `RestaurantCandidate` before reaching the UI or roulette engine. Missing API configuration is an unavailable state; it is never presented as a live search result. The current browser-side Google adapter is a boundary implementation and still requires a production-safe key strategy and Routes API integration for travel-time and detour conditions.

Brand selections are represented by `Brand` records and linked `RestaurantCandidate` branches. A brand query returns available branches as a separate direct-choice flow; branches are not silently mixed into ordinary restaurant roulette. The current fixture adapter demonstrates this contract with 岐阜タンメン and two branches. Production provider data still needs to populate the same brand/store identifiers.
