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
  }
})
