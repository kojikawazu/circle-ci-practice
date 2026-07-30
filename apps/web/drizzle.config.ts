import { defineConfig } from 'drizzle-kit'

/**
 * drizzle-kit の設定（マイグレーションの生成・適用）。
 *
 * `pnpm db:generate` … `schema` の差分から `out` へ SQL を生成する（生成物はコミットする）
 * `pnpm db:migrate`  … `out` の SQL を DB へ適用する（CI では E2E の前段で実行）
 */
export default defineConfig({
  // スキーマ定義の場所。ここが差分検出の起点になる
  schema: './server/db/schema.ts',
  // 生成された SQL と履歴（meta/_journal.json）の出力先
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // 接続先は環境変数から。ローカルと CI で同じ設定ファイルを使い回せる
    url: process.env.DATABASE_URL ?? '',
  },
})
