---
description: コーディング規約
globs:
---

# コーディング規約

- **言語**: TypeScript strict モード（Nuxt の既定。`nuxt.config.ts` で `typescript: { strict: true }` を明示してもよい）
- **パッケージマネージャ**: pnpm を使用（npm / yarn は使用しない）。バージョンは `package.json` の `packageManager` に固定し、corepack で有効化する
- **型チェック**: `pnpm lint`（= `nuxt typecheck`）を CI 必須とする。**ビルドが通ることは型が正しいことを意味しない**
- **Linter / Formatter**: 現状は未導入。導入する場合は ESLint（flat config）+ Prettier とし、`eslint-config-prettier` で競合を排除する
- **環境変数**: 設定値は環境変数で管理する（`.env` / `.env.example`）。サーバ専用の値は `runtimeConfig` のトップレベルに置き、`runtimeConfig.public` には公開可の値のみ置く
- **シークレット禁止**: シークレット・認証情報をハードコードしない。`.env` はコミットしない（`.env.example` のみ追跡する）
