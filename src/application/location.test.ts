import { describe, expect, it } from 'vitest';
import { requestCurrentLocation } from './location';

describe('requestCurrentLocation', () => {
  it('resolves browser coordinates', async () => {
    const geolocation = {
      getCurrentPosition: (success: (position: GeolocationPosition) => void) => success({ coords: { latitude: 35.1709, longitude: 136.8815 } } as GeolocationPosition),
    } as Geolocation;

    await expect(requestCurrentLocation(geolocation)).resolves.toEqual({ latitude: 35.1709, longitude: 136.8815 });
  });

  it('returns a user-facing error when permission is denied', async () => {
    const geolocation = {
      getCurrentPosition: (_success: unknown, error: (failure: GeolocationPositionError) => void) => error({ code: 1 } as GeolocationPositionError),
    } as Geolocation;

    await expect(requestCurrentLocation(geolocation)).rejects.toThrow('現在地を取得できませんでした。場所を手入力してください');
  });
});
