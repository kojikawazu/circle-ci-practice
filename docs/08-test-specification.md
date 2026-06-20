# テスト仕様書

テスト戦略・テストケース・ツールを定義する。詳細なテスト設計は `/test-design` の成果物（[`test-design/`](./test-design/)）を参照。

## 目次

- [テスト戦略](#テスト戦略)
- [テストケース](#テストケース)
- [カバレッジ目標](#カバレッジ目標)
- [テストツール・実行方法](#テストツール実行方法)
- [原則](#原則)

## テスト戦略

| レイヤー | ツール | 対象 | DB |
|----------|--------|------|----|
| ユニット（UT） | Vitest（+ happy-dom / Vue Test Utils） | `useTasks` composable、`TaskForm`/`TaskItem` コンポーネント、`@app/shared` の zod 検証 | モック（実 DB を使わない） |
| E2E | Playwright（Chromium） | ブラウザ操作での CRUD + リロード永続化 | **実 PostgreSQL**（ローカル/CI のコンテナ） |

- UT は速さ重視で DB を持たず、I/O（`$fetch`）のみモックする。
- E2E は実 DB を使い、F-5（永続化）まで含めて end-to-end を検証する。
- CI 上の役割分担は [`09-architecture-specification.md`](./09-architecture-specification.md) の CI フローを参照。

## テストケース

| # | ケース | 分類 | レイヤー |
|---|--------|------|----------|
| 1 | 正常なタイトルでタスク作成できる | 正常系 | UT(zod) / E2E |
| 2 | 一覧取得で作成済みタスクが返る | 正常系 | UT(useTasks) / E2E |
| 3 | 完了トグルで completed が反転する | 正常系 | UT / E2E |
| 4 | タスク削除で一覧から消える | 正常系 | UT / E2E |
| 5 | 空文字 / 空白のみは拒否される（400 相当） | 準正常系 | UT(zod) |
| 6 | 201 文字以上のタイトルは拒否される | 準正常系 | UT(zod) |
| 7 | 存在しない ID の更新/削除は 404 | 準正常系 | UT(server ロジック) |
| 8 | `$fetch` 失敗時に useTasks がエラーを伝播/保持する | 異常系 | UT(useTasks, fetch モック) |
| 9 | 追加→リロード後もタスクが残る（永続化） | 正常系 | E2E（実 Postgres） |

> `.claude/rules/testing.md` の比率（正常系 1 : 準正常系+異常系 2 以上）を満たすよう、UT 側で準正常/異常系を厚くする。

## カバレッジ目標

- 数値の厳密目標は設けない（学習用）。ただし以下を**必ず**カバーする:
  - `@app/shared` の zod 検証（正常 / 境界 / 異常）
  - `useTasks` の各操作（成功・失敗）
  - server/api のエラー分岐（400 / 404）
- E2E は主要ハッピーパス + 永続化を最低 1 シナリオ。

## テストツール・実行方法

| 目的 | コマンド |
|------|----------|
| UT | `pnpm test:unit`（Vitest） |
| E2E | `pnpm test:e2e`（要 `pnpm build` と起動中の Postgres） |
| ローカル E2E 準備 | `docker compose up -d` → `pnpm db:migrate` |

CI（CircleCI）では `unit` ジョブで UT、`e2e` ジョブで Postgres サービス + Playwright を実行する。

## 原則

- テストは仕様の証明。失敗したら**実装を直す**（テストを実装に合わせない）。
- ビジネスロジックはモックしない。モックは外部 I/O（`$fetch` / DB 接続）のみ。
- `toBeTruthy()` 等の曖昧なアサーションを避け、具体的な値・件数で検証する。
- E2E は `data-testid`（[`03`](./03-functional-specification.md)）で安定したセレクタを使う。
