import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  clearScreen: false,
  plugins: [react()],
  optimizeDeps: {
    include: ['lucide-react', 'gsap', 'framer-motion', 'three', 'lenis'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'vendor-three';
          if (id.includes('node_modules/framer-motion')) return 'vendor-framer';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor-react';
          if (id.includes('node_modules/gsap')) return 'vendor-gsap';
          if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
