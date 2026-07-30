# CircleCI Practice

CircleCI を学習・検証するための練習用プロジェクト

## Rules

明示的な指示がなくても、`.claude/rules/` 内のルールを常に守ってください。

| ファイル | スコープ | 内容 |
|---------|---------|------|
| shortcuts.md | 全体 | 指示ショートカット（PR出して、PR承認しました 等） |
| workflow.md | 全体 | 開発フロー（ブランチ運用・テスト必須） |
| quality-gate.md | 全体 | 品質ゲート（セルフレビュー・設計/実装レビュー） |
| documentation.md | 全体 | ドキュメント更新ルール |
| git.md | 全体 | GitHub Flow・ブランチ命名・push 禁止物 |
| testing.md | 全体 | テスト分類・原則・テストツール（Vitest / Playwright） |
| coding-standards.md | 全体 | 言語・PM・型チェック・環境変数の基本規約 |
| typescript.md | `apps/web/**`, `packages/shared/**` | type/interface・型と定数の配置・any 禁止・Zod 統一 |
| jsdoc.md | `apps/web/**`, `packages/shared/**` | 公開シンボル・型メンバーへのコメント必須 |
| api.md | `apps/web/server/**` | Nitro Server API の設計・検証・レスポンス整形 |
| duplication.md | 全体 | 重複と共通化の判断基準 |
| dead-code.md | 全体 | デッドコード禁止 |
| error-handling.md | 全体 | エラーハンドリング方針 |
| circleci.md | `.circleci/**` | CI の設定・発火ルール・キャッシュ・成果物 |

## AI エージェント向けルール

開発ルールの正本は `.claude/rules/` です。Claude Code はこの `CLAUDE.md` から、Codex はリポジトリ階層の `AGENTS.md` から同じルールを参照します。ルール本文は複製せず、変更対象に最も近い `AGENTS.md` が指定する追加指示も適用してください。
