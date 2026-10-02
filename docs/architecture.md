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
  ├─ Google Places + Routes adapter (live, server-side configuration)
  └─ Fixture adapter (development/demo only)

Roulette Engine (pure, equal probability unless explicit weight)
Local Persistence (saved restaurants and explicit decisions)
Master Data (food-categories.json and local-specialties.json)
Brand / Store Master (explicit brand inclusion, store exclusion, branch choice)
```

Provider-specific payloads are normalized to `RestaurantCandidate` before reaching the UI or roulette engine. Missing API configuration is an unavailable state; it is never presented as a live search result. `src/providers/googlePlacesProvider.ts` calculates a route with Routes API, passes its encoded polyline to Places Search Along Route, and filters candidates using routing summaries. `src/server/restaurantSearchWorker.ts` keeps the Google key server-side; the browser calls only the remote search endpoint.

`src/server/restaurantSearchHandler.ts` provides the framework-neutral HTTP boundary for a deployed function. It validates `RestaurantQuery`, delegates to a configured provider, and returns 400 for invalid input or 502 when the upstream search service fails. A hosting adapter can wrap this handler without exposing Places or Routes credentials to the browser.

Brand selections are represented by `Brand` records and linked `RestaurantCandidate` branches. A brand query returns available branches as a separate direct-choice flow; branches are not silently mixed into ordinary restaurant roulette. The current fixture adapter demonstrates this contract with 岐阜タンメン and two branches. Production provider data still needs to populate the same brand/store identifiers.
