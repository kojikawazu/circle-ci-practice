# Shared package instructions

親ディレクトリの `AGENTS.md` に加え、`packages/shared/**` を変更する前にこの指示を守ってください。

- 共有型・スキーマの変更は `apps/web` の利用箇所と API 契約への影響を確認します。
- 外部に公開されるデータ構造を変更する場合は、`.claude/rules/documentation.md` の影響マップに従い、該当する `docs/` を同じ変更セットで更新します。
- 実装を変更する場合は、利用側を含むテストまたは型検査で互換性を検証します。
