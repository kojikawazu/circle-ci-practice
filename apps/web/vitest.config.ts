import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // SFC(.vue) を Vitest から読めるようにする。Nuxt のランタイムは載せないため、
  // auto-import に依存するコードは UT では明示 import が必要になる
  plugins: [vue()],
  test: {
    // ブラウザを起動せず Node 上で DOM を再現する。jsdom より軽く、
    // 「UT は速く・多く、E2E は遅く・少なく」というピラミッドを維持しやすい
    environment: 'happy-dom',
    // E2E（e2e/*.spec.ts）を拾わないよう対象を限定する。
    // これが無いと Vitest が Playwright のテストまで実行しようとして失敗する
    include: ['tests/unit/**/*.spec.ts'],
  },
})
