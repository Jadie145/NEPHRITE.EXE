import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ command }) => {
  const isProd = command === 'build';
  
  return {
    plugins: [react()],
    // ADD THE TRAILING SLASH HERE: "/NEPHRITE-EXE/"
    base: isProd ? "/NEPHRITE-EXE/" : "/", 
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})