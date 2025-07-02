import {defineConfig} from 'vite';
import {resolve} from 'path';

export default defineConfig(({mode}) => ({
  root: '.',
  server: {
    open: '/examples/index.html',
  },
  build: {
    emptyOutDir: false, // Don't clear dist/ to preserve leaflet.distortableimage.css
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LeafletDistortableImage',
      fileName: 'leaflet.distortableimage',
      formats: ['iife'],
    },
    outDir: 'dist',
    sourcemap: 'inline',
    rollupOptions: {
      // Externalize dependencies that should be loaded separately
      external: [
        'leaflet',
        'leaflet-toolbar',
        'webgl-distort',
        'glfx',
        'exif-js',
      ],
      output: {
        globals: {
          leaflet: 'L',
          'leaflet-toolbar': 'L.Toolbar',
          'webgl-distort': 'WebGLDistort',
          glfx: 'fx',
          'exif-js': 'EXIF',
        },
        extend: true,
      },
    },
  },
}));
