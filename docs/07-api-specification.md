# API 仕様書

エンドポイント・リクエスト/レスポンス形式・認証・エラーハンドリングを定義する。データモデルは [`05-data-specification.md`](./05-data-specification.md)、認証/認可方針は [`06-security-specification.md`](./06-security-specification.md) を参照。

## 目次

- [前提](#前提)
- [エンドポイント一覧](#エンドポイント一覧)
- [リクエスト/レスポンス形式](#リクエストレスポンス形式)
- [認証・エラーハンドリング](#認証エラーハンドリング)

## 前提

- 方式: **REST / JSON**。Nuxt の Nitro `server/api` で実装（別バックエンドなし）。
- ベース URL: 同一オリジン `/api`。
- 共通ヘッダー: `Content-Type: application/json`。認証ヘッダーはなし（[`06`](./06-security-specification.md)）。
- 日時は ISO 8601 文字列で返す。

## エンドポイント一覧

| メソッド | パス | 用途 | 認証 |
|---------|------|------|------|
| GET | `/api/tasks` | タスク一覧取得（F-2） | 不要 |
| POST | `/api/tasks` | タスク作成（F-1） | 不要 |
| PATCH | `/api/tasks/:id` | タスク更新（完了トグル等 F-3） | 不要 |
| DELETE | `/api/tasks/:id` | タスク削除（F-4） | 不要 |

server/api のファイル対応: `index.get.ts` / `index.post.ts` / `[id].patch.ts` / `[id].delete.ts`。

## リクエスト/レスポンス形式

### Task オブジェクト

```json
{
  "id": "f2b1...-uuid",
  "title": "牛乳を買う",
  "completed": false,
  "createdAt": "2026-06-20T12:34:56.000Z"
}
```

### GET `/api/tasks`

- レスポンス `200`: `Task[]`（`createdAt` 順）。

### POST `/api/tasks`

- リクエスト: `{ "title": "牛乳を買う" }`
- レスポンス `201`: 作成された `Task`。
- 検証失敗 `400`。

### PATCH `/api/tasks/:id`

- リクエスト（部分更新）: `{ "completed": true }`（または `{ "title": "..." }`）
- レスポンス `200`: 更新後の `Task`。
- 見つからない `404` / 検証失敗 `400`。

### DELETE `/api/tasks/:id`

- レスポンス `204`: ボディなし。
- 見つからない `404`。

## 認証・エラーハンドリング

- 認証なし（[`06`](./06-security-specification.md)）。
- エラーは Nitro の `createError` で JSON を返す。ステータスコード契約:

| コード | 状況 |
|--------|------|
| 200 | 取得・更新成功 |
| 201 | 作成成功 |
| 204 | 削除成功（ボディなし） |
| 400 | 入力バリデーション失敗（zod） |
| 404 | 指定 ID のタスクが存在しない |
| 500 | DB 接続不可・予期せぬ例外 |
