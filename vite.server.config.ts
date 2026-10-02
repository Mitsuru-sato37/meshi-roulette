import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

function readClientAsset(url: string): string {
  return readFileSync(resolve('dist', url.replace(/^\//, '')), 'utf8');
}

function buildSiteAssets(): { html: string; script: string; stylesheet: string; favicon: string; manifest: string } {
  const source = readFileSync(resolve('dist/index.html'), 'utf8');
  const script = source.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/)?.[1];
  const stylesheet = source.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/)?.[1];
  return {
    html: source,
    script: script ? readClientAsset(script) : '',
    stylesheet: stylesheet ? readClientAsset(stylesheet) : '',
    favicon: readClientAsset('/favicon.svg'),
    manifest: readClientAsset('/site.webmanifest'),
  };
}

const siteAssets = buildSiteAssets();

export default defineConfig({
  define: {
    __MESHI_SITE_HTML__: JSON.stringify(siteAssets.html),
    __MESHI_SITE_SCRIPT__: JSON.stringify(siteAssets.script),
    __MESHI_SITE_STYLES__: JSON.stringify(siteAssets.stylesheet),
    __MESHI_SITE_FAVICON__: JSON.stringify(siteAssets.favicon),
    __MESHI_SITE_MANIFEST__: JSON.stringify(siteAssets.manifest),
  },
  build: {
    ssr: 'src/server/restaurantSearchWorker.ts',
    outDir: 'dist/server',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'index.js',
      },
    },
  },
});
