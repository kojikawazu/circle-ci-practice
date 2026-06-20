# アーキテクチャ仕様書

システム構成・技術スタック・インフラ・セットアップ手順を定義する。

## 目次

- [技術スタック](#技術スタック)
- [構成方針](#構成方針)
- [システム構成図](#システム構成図)
- [環境変数](#環境変数)
- [ローカル開発セットアップ](#ローカル開発セットアップ)
- [デプロイ](#デプロイ)
- [将来構成](#将来構成)

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| モノレポ | pnpm workspaces（`apps/*`, `packages/*`） |
| フロント | Nuxt 3 / Vue 3 |
| スタイル | TailwindCSS v4（`@tailwindcss/vite`） |
| サーバ（API） | Nuxt Nitro `server/api`（別バックエンドなし） |
| データ層 | Drizzle ORM + `postgres`（postgres.js ドライバ） |
| マイグレーション | drizzle-kit |
| DB | PostgreSQL 16（Docker） |
| 共有コード | `packages/shared`（Task 型 + zod スキーマ） |
| UT | Vitest（+ happy-dom / Vue Test Utils） |
| E2E | Playwright（Chromium） |
| CI | CircleCI（Free / Linux Docker executor） |
| ランタイム | Node.js 20 LTS |

## 構成方針

- **モノレポ**: `apps/web`（Nuxt アプリ）と `packages/shared`（型 + 検証）に分割。
  `shared` を front と server/api の双方が依存し、バリデーションを一元化する。
- **単一フレームワーク**: 「front だけ」を維持するため、API は Nuxt の Nitro `server/api` に置く。
- **スキーマ駆動**: Drizzle の TS スキーマを真実とし、SQL マイグレーションを生成・適用する。

```
circle-ci-practice/
├── .circleci/config.yml      # CI 定義
├── apps/web/                 # Nuxt 3（UI + server/api + db）
├── packages/shared/          # Task 型 + zod（front/server 共用）
├── docker-compose.yml        # ローカル Postgres
└── pnpm-workspace.yaml
```

## システム構成図

```mermaid
flowchart LR
    User([ユーザー]) --> UI[Nuxt 画面/コンポーネント]
    subgraph Nuxt[Nuxt 3 アプリ]
      UI -->|$fetch /api/tasks| API[Nitro server/api]
      API -->|Drizzle| ORM[Drizzle ORM]
    end
    ORM -->|SQL| DB[(PostgreSQL 16)]
    Shared[/packages/shared: zod/] -.検証共用.-> UI
    Shared -.検証共用.-> API
```

## 環境変数

| 変数 | 用途 | 参照箇所 |
|------|------|----------|
| `DATABASE_URL` | PostgreSQL 接続文字列 | `server/db/client.ts`、drizzle-kit。**サーバ専用**（クライアント非露出） |

- ローカルは `.env`（Git 非管理）、CI は環境変数 / コンテキストで注入する。
- 例: `postgres://postgres:postgres@localhost:5432/tasks`（ローカル）。

## ローカル開発セットアップ

```bash
# 1. 前提ツール: Node 20 / pnpm / Docker
corepack enable                 # pnpm を有効化

# 2. 依存インストール
pnpm install

# 3. 環境変数
cp .env.example .env            # DATABASE_URL を確認

# 4. PostgreSQL 起動
docker compose up -d

# 5. マイグレーション適用
pnpm db:migrate

# 6. 開発サーバ
pnpm dev                        # http://localhost:3000

# 7. テスト
pnpm test:unit                  # Vitest
pnpm build && pnpm test:e2e     # Playwright（実 Postgres）
```

## デプロイ

- **CI のみが対象**。CD（本番デプロイ）はスコープ外（将来拡張）。

### CI フロー（CircleCI / `.circleci/config.yml`）

- トリガー: GitHub への push。
- **job `unit`**: `cimg/node:20`。`pnpm install`（store キャッシュ）→ `lint` → `test:unit`（DB 不要）。
- **job `e2e`**: primary = Playwright 公式イメージ（ブラウザ同梱）、service = `cimg/postgres:16`。
  `pnpm install` → Postgres 起動待ち → `db:migrate` → `nuxt build` → `playwright test` → レポートを artifacts 保存。
- **workflow**: `unit` → 成功後 `e2e`（無料 credit 節約のため直列）。全ジョブ Linux。

```mermaid
flowchart LR
    push[git push] --> unit[job: unit\nlint + Vitest]
    unit -->|成功| e2e[job: e2e\nPostgres + migrate + build + Playwright]
    e2e --> done([緑ならパイプライン成功])
```

## 将来構成

- 認証 / マルチユーザー化、CD（デプロイ自動化）、`pnpm audit` の CI 組み込み、E2E のブラウザ拡張（Firefox/WebKit）。
