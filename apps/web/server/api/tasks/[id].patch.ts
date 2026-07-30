import { eq } from 'drizzle-orm'
import { taskIdSchema, updateTaskSchema } from '@app/shared'
import { useDb } from '../../db/client'
import { tasks } from '../../db/schema'
import { serializeTask } from '../../utils/serialize'

/**
 * PATCH /api/tasks/:id — 更新（完了トグル・タイトル変更）。
 *
 * 検証対象は**ボディだけではない**。URL のパスパラメータも外部入力であり、
 * UUID 以外を DB へ渡すと PostgreSQL の型エラー（500）になるため先に弾く。
 */
export default defineEventHandler(async (event) => {
  const id = taskIdSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  const body = await readBody(event)
  const parsed = updateTaskSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: parsed.error.flatten(),
    })
  }

  // `.set(parsed.data)` に渡るのはスキーマを通過したキーだけ。生のボディを渡すと
  // 想定外のカラム（id や createdAt）まで更新できてしまう（マスアサインメント）。
  // `where` の指定漏れは**全行更新**になるため、id 検証と対で必ず書く。
  const [row] = await useDb()
    .update(tasks)
    .set(parsed.data)
    .where(eq(tasks.id, id.data))
    .returning()

  // 更新対象が無ければ `.returning()` は空配列。存在しない ID は 400 ではなく 404。
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  return serializeTask(row)
})
