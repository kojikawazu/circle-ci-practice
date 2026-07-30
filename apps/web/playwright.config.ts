import { defineConfig, devices } from '@playwright/test'

const PORT = 3000
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  // 各テストが自分でデータを用意し、実行順に依存しないことが前提
  fullyParallel: true,
  // `test.only` の commit を CI で失敗させる。ローカルでは許容し、CI だけ厳しくする
  // （残ったまま merge されると、他のテストが黙って実行されなくなる）
  forbidOnly: !!process.env.CI,
  // CI のみ 1 回だけ再試行する。ローカルで 0 なのは flaky を見逃さないため
  retries: process.env.CI ? 1 : 0,
  // CI では HTML レポートも出し、artifacts として保存する（.circleci/config.yml）
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    // 再試行時のみ trace を採る。常時採ると遅く・重くなるため、
    // 「1 回目が落ちた時だけ調査材料を残す」バランスにしている
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // 事前に `pnpm build` 済みの本番出力を起動する（実 Postgres を使う）。
  // dev サーバではなくビルド成果物を叩くのは、本番と同じコード経路を検証するため
  // （dev だけで通る・本番で落ちる差分を CI で拾う）。
  webServer: {
    command: 'node .output/server/index.mjs',
    // Playwright はこの URL が応答するまで待つ。固定の sleep を書かずに済む
    url: baseURL,
    // ローカルは起動済みサーバを再利用して速く回す。CI では毎回新規起動し、
    // 前のテストが残した状態を持ち込まない
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? '',
      PORT: String(PORT),
    },
  },
})
