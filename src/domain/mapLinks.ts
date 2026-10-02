import type { RestaurantCandidate } from './types';

type MapCandidate = Pick<RestaurantCandidate, 'name' | 'locationLabel' | 'location' | 'provider' | 'providerPlaceId'>;

function coordinateLabel(candidate: MapCandidate): string | null {
  const latitude = candidate.location?.latitude;
  const longitude = candidate.location?.longitude;
  return typeof latitude === 'number' && typeof longitude === 'number'
    ? `${latitude},${longitude}`
    : null;
}

function destinationLabel(candidate: MapCandidate): string {
  return [candidate.name, candidate.locationLabel].filter(Boolean).join(' ');
}

function googlePlaceId(candidate: MapCandidate): string | null {
  if (candidate.provider !== 'google' || !candidate.providerPlaceId) return null;
  return candidate.providerPlaceId.replace(/^places\//, '');
}

export function buildMapLinks(candidate: MapCandidate) {
  const destination = destinationLabel(candidate);
  const coordinates = coordinateLabel(candidate);
  const searchParams = new URLSearchParams({ api: '1', query: destination });
  const placeId = googlePlaceId(candidate);
  if (placeId) searchParams.set('query_place_id', placeId);

  const navigationParams = new URLSearchParams({
    api: '1',
    destination: coordinates ?? destination,
    travelmode: 'walking',
  });

  return {
    mapUrl: `https://www.google.com/maps/search/?${searchParams.toString()}`,
    navigationUrl: `https://www.google.com/maps/dir/?${navigationParams.toString()}`,
  };
}
