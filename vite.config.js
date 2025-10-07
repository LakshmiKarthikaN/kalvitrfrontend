// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//   ],
//   // 👈 must match your repo name
// })
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite' <-- DELETE THIS LINE

// The latest versions of Tailwind/Vite usually don't require an explicit import 
// if it's correctly configured as a PostCSS plugin or if the CLI handles it.

export default defineConfig({
  plugins: [
    react(),
    // REMOVE the incorrect tailwindcss() plugin call
  ],
  // The official documentation should guide how to correctly configure Tailwind v4 
  // with Vite, which often involves PostCSS setup, not a dedicated plugin import like this.
})