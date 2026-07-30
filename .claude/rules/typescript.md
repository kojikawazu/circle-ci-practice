---
description: TypeScript コーディング規約 — type/interface の使い分け・型と定数の配置・any 禁止等
globs: "apps/web/**,packages/shared/**"
---

# TypeScript コーディング規約

共通の `coding-standards.md` に加え、TypeScript 固有の指針を定める。命名規則はツール既定に委ね、本書では扱わない。

## type vs interface

**原則 `type` を使う。** 以下のいずれかに当たる場合のみ `interface` を使う。

- **class 契約** — その型を class が `implements` / `extends` する
- **宣言マージが必要** — ライブラリ型・グローバル型の拡張（`declare module` / `declare global`）

宣言マージは「意図せず型が拡張され得る」副作用でもある。アプリ内部の型に `interface` を選ぶ理由にはしない。

```ts
// それ以外 → type（props・API レスポンス・union・関数型）
type TaskFilter = 'all' | 'active' | 'done'
type OnToggle = (task: Task) => void
```

## スキーマバリデーションは Zod に統一する

- 検証ライブラリを混在させない（`yup` / `joi` / 自前の検証関数を持ち込まない）。
- **型はスキーマから導出する**。`z.infer<typeof schema>` を使い、同じ形を手書きで二重定義しない（`duplication.md`）。**スキーマが単一の真実**である。
- 外部入力（リクエストボディ・`JSON.parse`・環境変数）は `unknown` で受け、**Zod で `parse` してから**内部へ渡す。
- 共有スキーマは `packages/shared` に置き、クライアントと `server/api` の双方から参照する。**信頼境界が違うため検証自体は両方で必要だが、定義は 1 つでよい**（`duplication.md`）。

## 型・定数の配置

置き場所は**参照範囲**で決める。判断軸は「その型・定数を参照するファイルが 1 つに閉じるか」。

| 参照範囲 | 置き場所 |
|---|---|
| **1 ファイルに閉じる** | その定義ファイル内に置く（`export` しない） |
| **アプリ内の 2 ファイル以上** | 当該アプリ内で共有する（`apps/web/types/`・`apps/web/constants/` 等、ドメイン単位でファイルを分ける） |
| **アプリとパッケージをまたぐ / API 契約** | `packages/shared` に置き、1 箇所定義にする |

- **最初から共有層に置かない。** まず使う場所に書き、**2 箇所目の参照が発生した時点で昇格**させる。昇格時は元ファイルに残さない（re-export も含む）。
- **単一ファイルにまとめない**（`types.ts` / `constants.ts` に全部を詰め込まない）。ドメイン単位でファイルを分ける。
- **`utils/` に型・定数を混ぜない**。`utils/` は「通信を持たない純粋関数の置き場」。
- **barrel（`index.ts` からの一括 re-export）を増やさない**。循環参照・tree-shaking 阻害の原因になる。実ファイルを直接 import する（`packages/shared` の公開入口は例外）。
- **マジックナンバー・マジック文字列を直接書かない。** 名前付き定数にし、`as const` を付ける（付けないとリテラル型が広がる）。命名は `UPPER_SNAKE_CASE`。
- **型の元になる定数は、導出される型と同じファイルに置く**（値と型の往復参照を作らない）。
- **環境変数は定数ではない。** 環境ごとに変わる値を定数ファイルに置かない（`runtimeConfig` を使う）。

```ts
// packages/shared — 制約値は型・スキーマと同居させる
export const TITLE_MAX = 200
export const titleSchema = z.string().max(TITLE_MAX)
```

## any 禁止・unknown 優先

- **暗黙・明示を問わず `any` を禁止**する。
- 外部入力は **`unknown` で受け**、型ガードまたは Zod でナローイングしてから使う。
- どうしても必要な箇所は根拠コメントを残す（下記「as / ! 抑制」）。

## enum 回避・union リテラル + as const

`enum` はランタイムにオブジェクトを生成しバンドルに残る。**union リテラル型**（必要なら `as const`）を使う。

```ts
const TASK_FILTERS = ['all', 'active', 'done'] as const
type TaskFilter = (typeof TASK_FILTERS)[number]
```

## import type

型だけを import する場合は **`import type`** を使う（値と型を混ぜない）。バンドラが型を確実に消せ、副作用のない循環参照を避けられる。

```ts
import type { Task } from '@app/shared'
```

## as / ! 抑制

- 型アサーション `as` と non-null assertion `!` を**最小化**する。まず型ガード・早期 return・オプショナルチェーンで解決する。
- 使う場合は**根拠コメント必須**（なぜ安全か／なぜ必要か）。`as unknown as` / `@ts-ignore` / `@ts-expect-error` も同様（`jsdoc.md` の「混乱テスト」）。
- `as const`（リテラル固定）はここでの「アサーション」に含まない。
