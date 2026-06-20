# CircleCI Practice

CircleCI を学習・検証するための練習用プロジェクト。軽量なタスク管理アプリ（Nuxt 3）を題材に、
**Vitest（UT）** と **Playwright（E2E）** を **CircleCI 無料枠**で自動実行する CI パイプラインを構築する。

## 概要

- **題材**: タスク管理アプリ（追加 / 一覧 / 完了トグル / 削除、PostgreSQL に永続化）
- **構成**: pnpm モノレポ。`apps/web`（Nuxt 3 + Nitro `server/api`）/ `packages/shared`（型 + zod）
- **DB**: PostgreSQL 16（Docker）、Drizzle ORM
- **CI**: CircleCI（`unit` → `e2e`、Linux / Free プラン）

詳細な仕様は [`docs/`](./docs/README.md) を参照（要求・要件・機能・データ・API・テスト・アーキテクチャ）。

> ⚠️ 現状は **設計フェーズ（docs/ 記入済み）**。アプリ実装（`apps/` / `packages/` / `.circleci/`）はレビュー承認後に着手する。

## セットアップ

前提: Node.js 20 / pnpm / Docker

```bash
corepack enable                 # pnpm を有効化
pnpm install                    # 依存インストール
cp .env.example .env            # DATABASE_URL を確認
docker compose up -d            # PostgreSQL 起動
pnpm db:migrate                 # マイグレーション適用
```

> ホストの 5432 が他プロセスと衝突する場合は `.env` に `DB_PORT=5433` を設定し、
> `DATABASE_URL` のポートも合わせる（`docker-compose.yml` は `${DB_PORT:-5432}` で上書き可能）。

## 使い方

```bash
pnpm dev                        # 開発サーバ（http://localhost:3000）
pnpm test:unit                  # ユニットテスト（Vitest）
pnpm build && pnpm test:e2e     # E2E テスト（Playwright・実 Postgres）
pnpm lint                       # Lint
```

CI（CircleCI）は GitHub への push で起動し、`unit`（lint + Vitest）→ `e2e`（Postgres + migrate + build + Playwright）を実行する。
詳細は [`docs/09-architecture-specification.md`](./docs/09-architecture-specification.md) の「CI フロー」を参照。

## ドキュメント

- 仕様一覧: [`docs/README.md`](./docs/README.md)
- 開発ルール: [`CLAUDE.md`](./CLAUDE.md) と [`.claude/rules/`](./.claude/rules/)
