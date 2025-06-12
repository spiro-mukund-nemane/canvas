import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite"
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  base: '/retail-pro-max/',
  plugins: [
    react(),
    tailwindcss(),
    TanStackRouterVite(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  server: {
    port: 3000,
    host:true
  },
  preview:{
    port:3000,
    host:true
  }
})