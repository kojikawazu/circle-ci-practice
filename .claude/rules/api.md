---
description: Nuxt 3 Server API（Nitro）の設計・レスポンス整形・バリデーション
globs: "apps/web/server/**"
---

# API ルール（Nuxt 3 Server API / Nitro）

## 設計方針

- API は Nitro の `server/api/` にファイルベースで定義する（`index.get.ts` = `GET /api/tasks`、`[id].patch.ts` = `PATCH /api/tasks/:id`）。
- **すべての DB 読み書きは Server API + ORM 経由**で行う（クライアントから直接 DB にアクセスしない）。
- **ハンドラーは薄く保つ**。分岐・条件・整形が増えたら `server/utils/`（純粋な変換）へ切り出す。**ビジネスロジックが育ったら `server/services/` を新設し、ハンドラーは入出力の境界に徹する**（規模が小さいうちは先回りして作らない — `duplication.md`）。
- **シークレットはサーバ側に閉じる**。`runtimeConfig`（サーバ専用）に機密を置き、`runtimeConfig.public` には公開可の値のみ置く。`DATABASE_URL` をクライアントへ露出しない。
- **`server/` から `components/` `composables/` を参照しない**。サーバー層がクライアント層に依存してはならない。逆にクライアントから `server/` の実装を import しない（**シークレットを含むコードがクライアントバンドルに混入する**）。共有してよいのは契約の型・スキーマ（`packages/shared`）のみ。

## バリデーション

- 入力検証は Server API 内で **Zod** により行う（不正入力は 400、対象なしは 404）。
- スキーマは `packages/shared` に置き、**クライアントと共有**する。クライアント検証は UX のためのものであり、**信頼できない入力の最終ゲートは常に Server API 側**である（この重複は必要 — `duplication.md`）。
- パスパラメータも検証する（例: `:id` は UUID）。
- **SQL インジェクション防止**: ORM のパラメータバインディングを使い、文字列結合でクエリを構築しない。

## レスポンス整形（DB の行を素通ししない）

- **ORM の行オブジェクトをそのまま返さない**。公開してよいフィールドだけを厳選した型へ変換して返す（`server/utils/serialize.ts`）。
- 変換は**明示的に行う**。スプレッド（`{ ...row }`）で組み立てない — **カラムが増えた瞬間、自動的に公開される**。
- ORM 側でも取得列を絞れるなら絞る（**取らない・返さないの二重で絞る**）。
- **変換は Server API に閉じる。クライアント側で再変換しない**（変換層を二重に置かない）。
- 表現の差（DB の `Date` ↔ API の ISO 文字列）はこの層で吸収する。

## エラー応答

- `createError` で HTTP ステータスと安全なメッセージを返す（400 / 404 / 500）。
- **スタックトレース・SQL・内部メッセージをそのまま返さない**（`error-handling.md`）。
- 失敗しても黙って握りつぶさない。サーバ側にはログを残し、クライアントには利用者向けの文言を返す。

## 共通方針

- RESTful 設計（リソース指向エンドポイント）、レスポンス形式は JSON。
- 契約（パス・リクエスト・レスポンス）を変更したら `docs/07-api-specification.md` を同一 PR で更新する（`documentation.md`）。
