import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

function readClientAsset(url: string): string {
  return readFileSync(resolve('dist', url.replace(/^\//, '')), 'utf8');
}

function buildInlineSiteHtml(): { html: string; favicon: string; manifest: string } {
  const source = readFileSync(resolve('dist/index.html'), 'utf8');
  const script = source.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/)?.[1];
  const stylesheet = source.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/)?.[1];
  const html = source
    .replace(/<script[^>]+src="[^"]+"[^>]*><\/script>/, script ? `<script>${readClientAsset(script).replace(/<\/script>/gi, '<\\/script>')}</script>` : '')
    .replace(/<link[^>]+rel="stylesheet"[^>]+href="[^"]+"[^>]*>/, stylesheet ? `<style>${readClientAsset(stylesheet)}</style>` : '');
  return {
    html,
    favicon: readClientAsset('/favicon.svg'),
    manifest: readClientAsset('/site.webmanifest'),
  };
}

const inlineSite = buildInlineSiteHtml();

export default defineConfig({
  define: {
    __MESHI_SITE_HTML__: JSON.stringify(inlineSite.html),
    __MESHI_SITE_FAVICON__: JSON.stringify(inlineSite.favicon),
    __MESHI_SITE_MANIFEST__: JSON.stringify(inlineSite.manifest),
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
