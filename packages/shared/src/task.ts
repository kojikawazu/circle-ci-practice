import { z } from 'zod'

/** タスクのタイトル: トリム後 1〜200 文字、空白のみ不可 */
export const TITLE_MAX = 200

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

/** PATCH /api/tasks/:id のリクエストボディ（部分更新） */
export const updateTaskSchema = z
  .object({
    title: titleSchema.optional(),
    completed: z.boolean().optional(),
  })
  .refine((v) => v.title !== undefined || v.completed !== undefined, {
    message: 'title または completed のいずれかを指定してください',
  })

/** パスパラメータ :id（UUID） */
export const taskIdSchema = z.string().uuid('不正なタスク ID です')

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

/** API が返す Task 表現（createdAt は ISO 文字列） */
export interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: string
}
