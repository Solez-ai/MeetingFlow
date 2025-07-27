import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    global: 'globalThis',
  },
  envPrefix: 'VITE_',
  build: {
    // Enable code splitting and tree shaking
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-toast', '@radix-ui/react-switch'],
          'editor-vendor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-highlight'],
          'collaboration-vendor': ['simple-peer'],
          'transcription-vendor': ['assemblyai'],
          'utils-vendor': ['uuid', 'clsx', 'tailwind-merge'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    // Enable source maps for debugging in production
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@tiptap/react',
      '@tiptap/starter-kit',
      'lucide-react',
    ],
    exclude: [
      // Exclude heavy dependencies that should be lazy loaded
      'simple-peer',
      'assemblyai',
      'qrcode.react',
      'react-to-print',
    ],
  },
})
