import type { RestaurantCandidate, RestaurantQuery } from '../domain/types';
import type { RestaurantProvider } from './restaurantProvider';
import { foodCatalog } from '../domain/masterData';

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  currentOpeningHours?: { openNow?: boolean };
  priceLevel?: string;
  location?: { latitude?: number; longitude?: number };
};

type GooglePlacesResponse = {
  places?: GooglePlace[];
  routingSummaries?: Array<{ legs?: Array<{ duration?: string }> }>;
};

type GoogleRouteResponse = {
  routes?: Array<{ duration?: string; polyline?: { encodedPolyline?: string } }>;
};

type GooglePlacesConfig = {
  apiKey: string;
  endpoint?: string;
  routesEndpoint?: string;
  fetcher?: typeof fetch;
};

function priceLabel(level?: string): string {
  return ({ PRICE_LEVEL_INEXPENSIVE: '1,000円前後', PRICE_LEVEL_MODERATE: '2,000円前後', PRICE_LEVEL_EXPENSIVE: '3,000円前後', PRICE_LEVEL_VERY_EXPENSIVE: '高価格帯' } as Record<string, string>)[level ?? ''] ?? '予算不明';
}

function durationSeconds(value?: string): number | null {
  if (!value) return null;
  const seconds = Number.parseFloat(value.replace(/s$/, ''));
  return Number.isFinite(seconds) ? seconds : null;
}

function durationMinutes(value: number | null): number | null {
  return value == null ? null : Math.max(1, Math.round(value / 60));
}

function searchText(query: RestaurantQuery): string {
  return [
    query.route ? undefined : query.locationLabel,
    query.foodIds.flatMap((id) => {
      const food = foodCatalog.foods.find((candidate) => candidate.id === id);
      return [...new Set([food?.label ?? id, ...(food?.searchTerms ?? []), ...(food?.aliases ?? [])])].slice(0, 4);
    }).join(' '),
  ].filter(Boolean).join(' ');
}

function normalizePlace(place: GooglePlace, query: RestaurantQuery, routeSummary?: { legs?: Array<{ duration?: string }> }, baselineDurationSeconds?: number): RestaurantCandidate | null {
  if (!place.id || !place.displayName?.text) return null;
  const legSeconds = routeSummary?.legs?.map((leg) => durationSeconds(leg.duration)).filter((value): value is number => value != null) ?? [];
  const routeTotalSeconds = legSeconds.length === 2 ? legSeconds[0] + legSeconds[1] : null;
  const routeDetourMinutes = routeTotalSeconds != null && baselineDurationSeconds != null
    ? Math.max(0, Math.ceil((routeTotalSeconds - baselineDurationSeconds) / 60))
    : null;
  const travelMinutes = legSeconds[0] != null ? durationMinutes(legSeconds[0]) : null;
  return {
    id: place.id,
    provider: 'google',
    providerPlaceId: place.id,
    name: place.displayName.text,
    foodIds: query.foodIds,
    locationLabel: place.formattedAddress ?? query.locationLabel ?? '場所不明',
    travelSummary: travelMinutes == null ? '移動時間不明' : `約${travelMinutes}分`,
    travelMinutes: travelMinutes ?? undefined,
    routeDetourMinutes,
    isOpen: place.currentOpeningHours?.openNow ?? null,
    budgetLabel: priceLabel(place.priceLevel),
    location: place.location,
  };
}

export function createGooglePlacesProvider(config: GooglePlacesConfig): RestaurantProvider {
  return {
    kind: 'live',
    async search(query: RestaurantQuery): Promise<RestaurantCandidate[]> {
      if (!config.apiKey) throw new Error('Google Places API key is not configured');
      const fetcher = config.fetcher ?? fetch;
      const placesEndpoint = config.endpoint ?? 'https://places.googleapis.com/v1/places:searchText';

      let baselineDurationSeconds: number | undefined;
      let encodedPolyline: string | undefined;
      if (query.route) {
        if (query.route.travelMode === 'TRANSIT') throw new Error('Transit route search is not supported');
        const routeResponse = await fetcher(config.routesEndpoint ?? 'https://routes.googleapis.com/directions/v2:computeRoutes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': config.apiKey,
            'X-Goog-FieldMask': 'routes.duration,routes.polyline.encodedPolyline',
          },
          body: JSON.stringify({
            origin: { address: query.route.origin },
            destination: { address: query.route.destination },
            travelMode: query.route.travelMode ?? 'DRIVE',
          }),
        });
        if (!routeResponse.ok) throw new Error(`Google Routes request failed: ${routeResponse.status}`);
        const routeData = await routeResponse.json() as GoogleRouteResponse;
        const route = routeData.routes?.[0];
        baselineDurationSeconds = durationSeconds(route?.duration) ?? undefined;
        encodedPolyline = route?.polyline?.encodedPolyline;
        if (!encodedPolyline || baselineDurationSeconds == null) throw new Error('Google Routes response did not include a usable route');
      }

      const body: Record<string, unknown> = {
        textQuery: searchText(query),
        includedType: 'restaurant',
        languageCode: 'ja',
        regionCode: 'JP',
      };
      if (query.route && encodedPolyline) {
        body.searchAlongRouteParameters = { polyline: { encodedPolyline } };
        body.maxResultCount = 20;
      } else if (query.location?.latitude != null && query.location.longitude != null) {
        body.locationBias = { circle: { center: { latitude: query.location.latitude, longitude: query.location.longitude }, radius: 5000 } };
      }
      const fieldMask = query.route
        ? 'places.id,places.displayName,places.formattedAddress,places.currentOpeningHours,places.priceLevel,places.location,routingSummaries'
        : 'places.id,places.displayName,places.formattedAddress,places.currentOpeningHours,places.priceLevel,places.location';
      const response = await fetcher(placesEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': config.apiKey, 'X-Goog-FieldMask': fieldMask },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`Google Places request failed: ${response.status}`);
      const data = await response.json() as GooglePlacesResponse;
      const candidates = (data.places ?? []).map((place, index) => normalizePlace(place, query, query.route ? data.routingSummaries?.[index] : undefined, baselineDurationSeconds)).filter((candidate): candidate is RestaurantCandidate => candidate !== null);
      if (!query.route) return candidates;
      return candidates.filter((candidate) => candidate.routeDetourMinutes != null && candidate.routeDetourMinutes <= query.route!.maxDetourMinutes);
    },
  };
}
