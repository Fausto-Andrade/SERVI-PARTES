// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    // ESTO AYUDA EN WINDOWS:
    deps: {
      inline: [/vitest\/dist/],
    },
    // Fuerza a Vitest a no usar hilos si hay problemas de permisos en disco
    pool: 'forks', 
  },
})