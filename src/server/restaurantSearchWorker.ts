import { createGooglePlacesProvider } from '../providers/googlePlacesProvider';
import { createRestaurantSearchHandler } from './restaurantSearchHandler';

export type RestaurantSearchWorkerEnv = {
  GOOGLE_MAPS_PLATFORM_API_KEY?: string;
};

type WorkerFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const fallbackSiteHtml = '<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ご飯ルーレット</title></head><body><div id="root"></div></body></html>';

function siteHtml(): string {
  return typeof __MESHI_SITE_HTML__ === 'string' ? __MESHI_SITE_HTML__ : fallbackSiteHtml;
}

function siteScript(): string {
  return typeof __MESHI_SITE_SCRIPT__ === 'string' ? __MESHI_SITE_SCRIPT__ : '';
}

function siteStyles(): string {
  return typeof __MESHI_SITE_STYLES__ === 'string' ? __MESHI_SITE_STYLES__ : '';
}

function siteAsset(value: string, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function siteFavicon(): string {
  return typeof __MESHI_SITE_FAVICON__ === 'string' ? __MESHI_SITE_FAVICON__ : '';
}

function siteManifest(): string {
  return typeof __MESHI_SITE_MANIFEST__ === 'string' ? __MESHI_SITE_MANIFEST__ : '{}';
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
}

export function createRestaurantSearchWorker(fetcher: WorkerFetcher = fetch) {
  return {
    async fetch(request: Request, env: RestaurantSearchWorkerEnv): Promise<Response> {
      const url = new URL(request.url);
      if (url.pathname === '/' || url.pathname === '/index.html') {
        if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
        return new Response(siteHtml(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
      if (url.pathname === '/favicon.svg') {
        return new Response(siteAsset(siteFavicon(), ''), { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
      }
      if (url.pathname === '/site.webmanifest') {
        return new Response(siteAsset(siteManifest(), '{}'), { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } });
      }
      if (url.pathname.startsWith('/assets/') && url.pathname.endsWith('.js')) {
        return new Response(siteScript(), { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
      }
      if (url.pathname.startsWith('/assets/') && url.pathname.endsWith('.css')) {
        return new Response(siteStyles(), { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
      }
      if (url.pathname !== '/api/restaurant-search') return jsonResponse({ error: 'Not found' }, 404);
      if (request.method === 'OPTIONS') return jsonResponse(null, 204);
      if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

      const provider = createGooglePlacesProvider({ apiKey: env.GOOGLE_MAPS_PLATFORM_API_KEY ?? '', fetcher });
      const handler = createRestaurantSearchHandler(provider);
      const result = await handler({ json: () => request.json() });
      return jsonResponse(result.body, result.status);
    },
  };
}

const worker = createRestaurantSearchWorker();
export default worker;
