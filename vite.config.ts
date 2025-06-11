import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite"
import {TanStackRouterVite} from '@tanstack/router-vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  // base:'/retail-pro-max/',
  plugins: [react(), tailwindcss(), TanStackRouterVite()],
  resolve:{
    alias:{
      "@": path.resolve(__dirname, "./src"),
    }
  },
  server:{
    port:3001
  }
})
