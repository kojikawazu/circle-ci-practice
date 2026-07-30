# Web application instructions

親ディレクトリの `AGENTS.md` に加え、`apps/web/**` を変更する前にこの指示を守ってください。

- Nuxt 3 / TypeScript の既存構成と、`apps/web/package.json` のスクリプトに従います。
- API、データモデル、環境変数、画面の振る舞いを変更する場合は、`.claude/rules/documentation.md` の影響マップに従って README と該当する `docs/` を同じ変更セットで更新します。
- 実装を変更する場合は、変更内容に応じた Vitest または Playwright のテストを追加・更新し、`pnpm lint` と関連テストを実行します。
