import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Configuración de alias para imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Configuración del servidor de desarrollo
  server: {
    port: 5173,
    // Removido proxy ya que CORS está configurado en el backend
  },

  // Optimización de build y code splitting
  build: {
    // Configurar code splitting para reducir el tamaño de chunks
    rollupOptions: {
      output: {
        // Separar vendors en chunks independientes
        manualChunks: {
          // React y DOM
          'react-vendor': ['react', 'react-dom'],
          
          // Bibliotecas de UI y formularios
          'ui-vendor': [
            'lucide-react',
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          
          // Bibliotecas de estado y utilidades
          'state-vendor': [
            'zustand',
            'axios'
          ],
          
          // Bibliotecas específicas grandes (si las hay)
          // 'chart-vendor': ['recharts', 'chart.js'],
        },
      },
    },
    
    // Configurar límites para chunks
    chunkSizeWarningLimit: 1000, // Aumentar límite a 1MB para evitar warnings innecesarios
    
    // Optimizaciones adicionales
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false, // Desactivar sourcemaps en producción para reducir tamaño
  },

  // Optimizaciones de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      'zustand',
      'axios',
      'lucide-react'
    ],
  }
})
