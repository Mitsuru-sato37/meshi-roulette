import type { RestaurantCandidate, RestaurantQuery } from '../domain/types';
import type { RestaurantProvider } from './restaurantProvider';

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  currentOpeningHours?: { openNow?: boolean };
  priceLevel?: string;
  location?: { latitude?: number; longitude?: number };
};

type GooglePlacesResponse = { places?: GooglePlace[] };
type GooglePlacesConfig = { apiKey: string; endpoint?: string; fetcher?: typeof fetch };

function priceLabel(level?: string): string {
  return ({ PRICE_LEVEL_INEXPENSIVE: '1,000円前後', PRICE_LEVEL_MODERATE: '2,000円前後', PRICE_LEVEL_EXPENSIVE: '3,000円前後', PRICE_LEVEL_VERY_EXPENSIVE: '高価格帯' } as Record<string, string>)[level ?? ''] ?? '予算不明';
}

export function createGooglePlacesProvider(config: GooglePlacesConfig): RestaurantProvider {
  return {
    kind: 'live',
    async search(query: RestaurantQuery): Promise<RestaurantCandidate[]> {
      if (!config.apiKey) throw new Error('Google Places API key is not configured');
      const fetcher = config.fetcher ?? fetch;
      const response = await fetcher(config.endpoint ?? 'https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': config.apiKey, 'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.currentOpeningHours,places.priceLevel,places.location' },
        body: JSON.stringify({ textQuery: query.locationLabel ? `${query.locationLabel} ${query.foodIds.join(' ')}` : query.foodIds.join(' ') }),
      });
      if (!response.ok) throw new Error(`Google Places request failed: ${response.status}`);
      const data = await response.json() as GooglePlacesResponse;
      return (data.places ?? []).flatMap((place) => place.id && place.displayName?.text ? [{
        id: place.id,
        provider: 'google',
        providerPlaceId: place.id,
        name: place.displayName.text,
        foodIds: query.foodIds,
        locationLabel: place.formattedAddress ?? query.locationLabel ?? '場所不明',
        travelSummary: '移動時間不明',
        isOpen: place.currentOpeningHours?.openNow ?? null,
        budgetLabel: priceLabel(place.priceLevel),
        location: place.location,
      }] : []) as RestaurantCandidate[];
    },
  };
}
