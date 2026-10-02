import { defineConfig } from 'vite';

export default defineConfig({
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
