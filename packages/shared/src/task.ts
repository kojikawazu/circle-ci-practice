/**
 * タスクの入力スキーマと API 契約の型。
 *
 * このパッケージは `apps/web` のクライアント（`TaskForm.vue`）と
 * サーバ（`server/api/`）の**両方**から参照される。信頼境界が違うため
 * 検証自体は両方で必要だが、ルールの定義は 1 箇所に置く（`.claude/rules/duplication.md`）。
 * ブラウザ側の検証は UX のためのものであり、**最終ゲートは常にサーバ側**。
 */
import { z } from 'zod'

/** タイトルの最大文字数。DB は `text` 型で無制限のため、上限はこの定数が唯一の根拠になる */
export const TITLE_MAX = 200

/**
 * タスクのタイトル: トリム後 1〜200 文字、空白のみ不可。
 *
 * `transform` でトリムしてから `pipe` で長さを検証する順序が重要。
 * 先に長さを見ると `"   "`（空白のみ）が「1 文字以上」として通ってしまう。
 */
export const titleSchema = z
  .string({ required_error: 'title は必須です', invalid_type_error: 'title は文字列です' })
  .transform((v) => v.trim())
  .pipe(
    z
      .string()
      .min(1, 'title を入力してください')
      .max(TITLE_MAX, `title は ${TITLE_MAX} 文字以内です`),
  )

/** POST /api/tasks のリクエストボディ */
export const createTaskSchema = z.object({
  title: titleSchema,
})

/**
 * PATCH /api/tasks/:id のリクエストボディ（部分更新）。
 *
 * 両フィールドとも省略可だが、`refine` で「少なくとも片方は必須」を課している。
 * これが無いと `{}` が検証を通り、更新対象ゼロの UPDATE が発行されてしまう。
 */
export const updateTaskSchema = z
  .object({
    title: titleSchema.optional(),
    completed: z.boolean().optional(),
  })
  .refine((v) => v.title !== undefined || v.completed !== undefined, {
    message: 'title または completed のいずれかを指定してください',
  })

/**
 * パスパラメータ :id（UUID）。
 *
 * URL から来る値は常に文字列であり、型では守れない。UUID 以外を DB へ渡すと
 * PostgreSQL 側で型エラー（500）になるため、ここで弾いて 400 を返す。
 */
export const taskIdSchema = z.string().uuid('不正なタスク ID です')

/** POST の入力型。**スキーマから導出**し、同じ形を手書きで二重定義しない */
export type CreateTaskInput = z.infer<typeof createTaskSchema>
/** PATCH の入力型。同上（スキーマが単一の真実） */
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

/**
 * API が返す Task 表現（DB の行そのものではなく、公開してよい形）。
 *
 * DB 行（`TaskRow`）と分けているのは、永続化の都合が API 契約に漏れないようにするため。
 * 変換は `server/utils/serialize.ts` が担う。
 */
export interface Task {
  id: string
  /** 表示用タイトル。前後の空白は除去済み・最大 `TITLE_MAX` 文字 */
  title: string
  completed: boolean
  /** 作成日時（ISO 8601 文字列）。DB の `timestamptz` を JSON で運べる形へ変換したもの */
  createdAt: string
}
