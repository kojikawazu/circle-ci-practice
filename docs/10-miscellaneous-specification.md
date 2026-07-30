# その他仕様書

用語集・コーディング規約・参照資料をまとめる。標準仕様書（01〜09）に収まらない補足を置く。

## 目次

- [用語集](#用語集)
- [コーディング規約・命名](#コーディング規約命名)
- [参照資料・ライブラリ](#参照資料ライブラリ)
- [その他注記](#その他注記)

## 用語集

学習用リポジトリのため、用語は「一般的な意味」と「このリポジトリのどこで使っているか」を対にして記す。
用語に出会ったら、まずここで意味を確認し、リンク先の実装に戻って確かめる。

### CircleCI

このリポジトリの主題。設定は [`.circleci/config.yml`](../.circleci/config.yml) の 1 ファイルに集約している。

| 用語 | 意味 | このプロジェクトでの例 |
|---|---|---|
| Pipeline | 1 回の push（VCS のイベント）で起動する実行の単位。1 pipeline が 1 つ以上の workflow を含む。 | GitHub への push で `test` workflow が起動する。 |
| Workflow | job の実行順序・依存関係を定義するもの。並列/直列・条件分岐をここで表現する。 | `workflows.test` が `unit` → `e2e` を定義する。 |
| Job | 1 つの実行環境で走る step の集まり。job ごとにコンテナは使い捨てで、状態は引き継がれない。 | `unit`（lint + Vitest）と `e2e`（migrate + build + Playwright）。 |
| Step | job 内の 1 コマンド。`run` のほか `checkout` / `restore_cache` などの組み込み step がある。 | `Run migrations` は `pnpm db:migrate` を実行する。 |
| Executor | job を動かす実行環境の種類（docker / machine / macos など）。 | 本プロジェクトは全て `docker` executor。 |
| Primary container | `docker:` リストの**先頭**イメージ。step は必ずここで実行される。 | `unit` は `cimg/node:22.14`、`e2e` は `mcr.microsoft.com/playwright:v1.61.0-jammy`。 |
| Service container | `docker:` の 2 番目以降のイメージ。primary と**同じネットワーク名前空間**を共有するため `localhost` で到達できる。 | `e2e` の `cimg/postgres:16.4` に `postgres://...@localhost:5432/tasks` で接続する。 |
| `requires` | workflow で job の依存を宣言するキー。前段が成功した場合のみ後段が走る。 | `e2e` は `requires: [unit]`。速く落ちる UT を先に通し、重い E2E の無駄実行を防ぐ。 |
| Reusable command | `commands:` で定義し、複数 job から呼べる step の集まり。設定の重複を減らす。 | `setup_pnpm`（corepack 有効化 → キャッシュ復元 → `pnpm install` → キャッシュ保存）を `unit` / `e2e` の両方で使う。 |
| Cache（`save_cache` / `restore_cache`） | job をまたいで再利用する読み取り中心のデータ。**キー単位で不変**で、既存キーへの上書きはできない。 | キー `pnpm-v1-{{ checksum "pnpm-lock.yaml" }}` で `.pnpm-store` を保存。lock 変更時のみ新キーになる。 |
| キャッシュのフォールバックキー | `keys:` に複数指定すると上から順に部分一致で探す。完全一致が無くても直近のキャッシュを再利用できる。 | `pnpm-v1-{{ checksum ... }}` の次に接頭辞 `pnpm-v1-` を置いている。 |
| Workspace（`persist_to_workspace`） | **同一 workflow 内**で job 間にビルド成果物を受け渡す仕組み。cache とは目的が異なる。 | 本プロジェクトは未使用（`e2e` が自分で `pnpm build` する）。job 分割を増やす場合の検討候補。 |
| Artifacts（`store_artifacts`） | 実行後に Web UI からダウンロードできる成果物。失敗調査用。 | Playwright の HTML レポート（`apps/web/playwright-report`）。 |
| Test results（`store_test_results`） | CircleCI が解析する JUnit XML などのテスト結果。UI 上で失敗テストを一覧できる。 | `apps/web/test-results`。 |
| Orb | 再利用可能な設定パッケージ。`version: 2.1` で利用できる。 | 本プロジェクトは無料枠の学習目的で orb を使わず、素の step で書いている。 |
| `checkout` | リポジトリを実行環境へ clone する組み込み step。コンテナは毎回まっさらなので必須。 | 各 job の先頭。 |

### アプリケーション（Nuxt 3 / Nitro）

| 用語 | 意味 | このプロジェクトでの例 |
|---|---|---|
| Nuxt | Vue 3 のアプリケーションフレームワーク。ルーティング・ビルド・サーバを統合する。 | [`apps/web/`](../apps/web/)。設定は [`nuxt.config.ts`](../apps/web/nuxt.config.ts)。 |
| Nitro / `server/api` | Nuxt に同梱されるサーバエンジン。`server/api/` のファイル名が API ルートになる。 | [`index.get.ts`](../apps/web/server/api/tasks/index.get.ts) は `GET /api/tasks`、[`[id].patch.ts`](../apps/web/server/api/tasks/%5Bid%5D.patch.ts) は `PATCH /api/tasks/:id`。 |
| `runtimeConfig` | 実行時に注入する設定。トップレベルは**サーバ専用**、`public` はクライアントにも露出する。 | `DATABASE_URL` はトップレベルに置く（[`nuxt.config.ts`](../apps/web/nuxt.config.ts)）。 |
| Composable | `useXxx` 形式で状態・通信・副作用をまとめる関数。`composables/` は auto-import される。 | [`useTasks.ts`](../apps/web/composables/useTasks.ts)。 |
| 依存注入（fetcher 注入） | I/O を引数で差し替え可能にする設計。Nuxt ランタイム無しで UT できるようにする。 | `createTasksApi(fetcher)` と、それを `$fetch` で包む `useTasks()`（[`useTasks.ts`](../apps/web/composables/useTasks.ts)）。 |
| `.output/server/index.mjs` | `nuxt build` が生成する本番サーバのエントリ。 | E2E は dev サーバでなくこれを起動する（[`playwright.config.ts`](../apps/web/playwright.config.ts) の `webServer`）。 |
| pnpm workspace | 複数パッケージを 1 リポジトリで管理する仕組み。`workspace:*` でローカル参照する。 | `apps/web` が `@app/shared` を参照（[`pnpm-workspace.yaml`](../pnpm-workspace.yaml)）。 |
| Zod schema | 実行時に入力を検証し、型も導出できるスキーマ。front / server で同じ定義を共有する。 | [`packages/shared/src/task.ts`](../packages/shared/src/task.ts) の `createTaskSchema` など。信頼できない入力の最終ゲートは server 側の検証。 |
| Drizzle ORM / drizzle-kit | 型安全な SQL ビルダと、そのマイグレーション CLI。 | スキーマは [`server/db/schema.ts`](../apps/web/server/db/schema.ts)、SQL は [`drizzle/`](../apps/web/drizzle/)、適用は `pnpm db:migrate`。 |
| Migration | DB スキーマ変更を SQL ファイルとして版管理し、順に適用する仕組み。 | CI の `e2e` job は build 前に `pnpm db:migrate` を実行する。 |
| シリアライズ境界 | DB の行（`Date` 等）と API レスポンス（ISO 文字列）の表現を分けること。 | [`serialize.ts`](../apps/web/server/utils/serialize.ts) が `TaskRow` → `Task` を変換する。 |

### テスト

| 用語 | 意味 | このプロジェクトでの例 |
|---|---|---|
| UT (Unit Test) | DB やネットワークを使わず、単一の機能単位を検証するテスト。 | [`apps/web/tests/unit/`](../apps/web/tests/unit/)。`pnpm test:unit`。 |
| E2E (End-to-End Test) | ブラウザから画面を操作し、複数層を通した利用者シナリオを検証するテスト。 | [`apps/web/e2e/tasks.spec.ts`](../apps/web/e2e/tasks.spec.ts)。`pnpm test:e2e`。 |
| Vitest | Vite ベースのテストランナー。 | 設定は [`vitest.config.ts`](../apps/web/vitest.config.ts)。 |
| happy-dom | Node 上で DOM を再現する軽量実装。ブラウザ無しでコンポーネントを UT できる。 | `vitest.config.ts` の `environment: 'happy-dom'`。 |
| Playwright | ブラウザ自動操作の E2E フレームワーク。 | 設定は [`playwright.config.ts`](../apps/web/playwright.config.ts)。 |
| `webServer` | Playwright がテスト前にアプリを起動し、URL が応答するまで待つ設定。 | ビルド済み `.output` を起動。CI では `reuseExistingServer: false` 相当になる。 |
| Locator / 自動待機 | Playwright で要素を表すオブジェクト。操作・アサーション時点で解決し、再試行する。明示的な `sleep` を避けられる。 | [`tasks.spec.ts`](../apps/web/e2e/tasks.spec.ts)。 |
| `forbidOnly` | `test.only` が残ったままの commit を CI で失敗させる設定。テストの取りこぼしを防ぐ。 | `forbidOnly: !!process.env.CI`。 |
| Flaky / `retries` | 同じコードで成功と失敗が揺れるテスト。CI では 1 回だけ再試行し、`trace: 'on-first-retry'` で調査用の trace を残す。 | `playwright.config.ts`。 |
| モックの範囲 | ビジネスロジックはモックせず、外部 I/O（HTTP・DB・FS）のみモックする方針。 | UT は `fetcher` だけ差し替える（[`useTasks.spec.ts`](../apps/web/tests/unit/useTasks.spec.ts)）。詳細は [`.claude/rules/testing.md`](../.claude/rules/testing.md)。 |
| テストピラミッド | 速い UT を多く、遅い E2E を少なくする配分。CI の job 順序もこれに合わせる。 | `unit` → `e2e`（[`docs/08-test-specification.md`](08-test-specification.md)）。 |

## コーディング規約・命名

<!-- 記入: 言語・命名規則・ディレクトリ配置のルール -->

## 参照資料・ライブラリ

用語集で触れた各要素の一次情報。

| ライブラリ / 資料 | 用途 | 参照先 |
|---|---|---|
| CircleCI Configuration Reference | `config.yml` のキー（jobs / workflows / commands / cache）の正本 | https://circleci.com/docs/configuration-reference/ |
| CircleCI Convenience Images | `cimg/node`・`cimg/postgres` のタグと同梱ツール | https://circleci.com/developer/images |
| Nuxt 3 | アプリ本体・Nitro の `server/api`・`runtimeConfig` | https://nuxt.com/docs |
| Drizzle ORM / drizzle-kit | スキーマ定義とマイグレーション | https://orm.drizzle.team/docs/overview |
| Zod | 入力検証スキーマ（`packages/shared`） | https://zod.dev/ |
| Vitest | UT ランナー | https://vitest.dev/ |
| Playwright | E2E・`webServer`・trace | https://playwright.dev/docs/intro |

## その他注記

<!-- 記入: 上記に分類されない補足・付録 -->
