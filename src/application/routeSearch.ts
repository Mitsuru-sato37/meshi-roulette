import type { RoutePlan, Transport } from './homeSession';
import type { RestaurantQuery } from '../domain/types';

type RouteRestaurantQueryInput = {
  foodId: string;
  locationLabel?: string | null;
  route: RoutePlan;
  transport?: Transport | null;
};

function toGoogleTravelMode(transport?: Transport | null): NonNullable<RestaurantQuery['route']>['travelMode'] {
  return ({ walk: 'WALK', car: 'DRIVE', bicycle: 'BICYCLE', transit: 'TRANSIT' } as const)[transport ?? 'car'];
}

export function buildRouteRestaurantQuery({ foodId, locationLabel, route, transport }: RouteRestaurantQueryInput): RestaurantQuery {
  return {
    foodIds: [foodId],
    locationLabel: locationLabel ?? undefined,
    route: { ...route, travelMode: toGoogleTravelMode(transport) },
  };
}
