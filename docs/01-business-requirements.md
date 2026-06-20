# 要求仕様書

プロジェクトの背景・目標・スコープ・制約を定義する。機能の詳細要件は [`02-requirements-specification.md`](./02-requirements-specification.md) を参照。

## 目次

- [背景・目的](#背景目的)
- [ステークホルダー](#ステークホルダー)
- [スコープ](#スコープ)
- [制約・前提](#制約前提)
- [主要な決定事項](#主要な決定事項)

## 背景・目的

**CircleCI を実地で学ぶ**ことが本プロジェクトの主目的。題材として軽量なタスク管理アプリを作り、
ユニットテスト（Vitest）と E2E テスト（Playwright）を **CircleCI 無料枠で自動実行する CI パイプライン**を構築・体験する。

- アプリ自体の機能網羅性は目的ではなく、**CI が回る最小限の実用アプリ**であれば良い。
- 「実 DB を使う E2E を CI でどう回すか」までを学習対象に含める（Postgres サービスコンテナの利用）。

## ステークホルダー

| 役割 | 説明 |
|------|------|
| 開発者（本人） | 実装・CI 設定・学習の主体 |
| レビュアー（本人 / Claude） | 設計・実装のセルフレビュー、品質ゲートの確認 |

## スコープ

- タスク管理アプリ（追加・一覧・完了トグル・削除）を Nuxt 3 で実装する。
- データは PostgreSQL に永続化する（Nuxt の server エンジン Nitro `server/api` 経由）。
- Vitest による UT（ロジック中心・DB モック）を用意する。
- Playwright による E2E（実 Postgres で永続化まで検証）を用意する。
- CircleCI で `unit` → `e2e` のパイプラインを構築し、無料枠内で緑にする。
- モノレポ（pnpm workspaces）で構成する。

### スコープ外（将来拡張）

- ユーザー認証・マルチユーザー対応。
- タスクの編集（タイトル変更）・期限・タグ・並び替えなどの高度な機能。
- 本番デプロイ（CI のみが対象。CD は将来拡張）。
- macOS / Windows ジョブ（CircleCI Free は Linux のみ）。

## 制約・前提

- **CircleCI Free プラン**で完結させる（30,000 credits/月 ≒ Linux Small 約 6,000 分。Linux のみ・macOS 不可）。
- **VCS は GitHub**（CircleCI と連携できること）。
- ローカルでは **Docker** で PostgreSQL を起動できること。
- 技術スタックの詳細は [`09-architecture-specification.md`](./09-architecture-specification.md) を参照。

## 主要な決定事項

| 決定 | 内容 | 理由 |
|------|------|------|
| パッケージ管理 | pnpm workspaces（モノレポ） | ディスク効率が良く CI キャッシュと相性が良い |
| UI | Nuxt 3 + TailwindCSS v4 | 指定スタック。Tailwind v4 は `@tailwindcss/vite` で設定が最小 |
| バックエンド | 別サーバを立てず Nuxt の Nitro `server/api` で完結 | 「front だけ」を維持しつつ DB アクセスを実現 |
| データ層 | Drizzle ORM | TS ファースト・依存が薄く、Nitro バンドル/CI 起動と相性が良い |
| （不採用）TypeORM | デコレータ + reflect-metadata + ドライバ動的 require | Nitro（Rollup/esbuild）でバンドルすると壊れやすい |
| テスト分担 | UT=ロジック（DB モック）/ E2E=実 Postgres | 速い UT と、実 DB の振る舞い確認を両立 |
