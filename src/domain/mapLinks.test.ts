import { describe, expect, it } from 'vitest';
import { buildCuisineSearchUrl, buildMapLinks } from './mapLinks';

describe('buildCuisineSearchUrl', () => {
  it('builds a Google Maps search for the selected cuisine and location', () => {
    const url = new URL(buildCuisineSearchUrl({ label: 'パスタ', locationLabel: '名古屋駅' }));

    expect(url.hostname).toBe('www.google.com');
    expect(url.pathname).toBe('/maps/search/');
    expect(url.searchParams.get('query')).toBe('パスタ 名古屋駅');
  });
});

describe('buildMapLinks', () => {
  it('uses the provider place id for map lookup and coordinates for navigation', () => {
    const links = buildMapLinks({
      name: '麺処テスト',
      locationLabel: '名古屋駅',
      provider: 'google',
      providerPlaceId: 'places/ChIJtest',
      location: { latitude: 35.1709, longitude: 136.8815 },
    });

    expect(links.mapUrl).toContain('query_place_id=ChIJtest');
    expect(links.navigationUrl).toContain('destination=35.1709%2C136.8815');
  });

  it('falls back to the restaurant name and location when coordinates are unavailable', () => {
    const links = buildMapLinks({ name: '麺処ひなた', locationLabel: '駅前' });
    const mapUrl = new URL(links.mapUrl);
    const navigationUrl = new URL(links.navigationUrl);

    expect(mapUrl.searchParams.get('query')).toBe('麺処ひなた 駅前');
    expect(navigationUrl.searchParams.get('destination')).toBe('麺処ひなた 駅前');
  });
});
