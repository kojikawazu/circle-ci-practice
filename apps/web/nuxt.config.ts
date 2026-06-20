import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-06-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  // DATABASE_URL はサーバ専用（runtimeConfig のトップレベル = サーバのみ。public には置かない）
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
  },
})
