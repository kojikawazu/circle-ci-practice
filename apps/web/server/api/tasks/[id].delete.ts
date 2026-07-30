import { eq } from 'drizzle-orm'
import { taskIdSchema } from '@app/shared'
import { useDb } from '../../db/client'
import { tasks } from '../../db/schema'

/**
 * DELETE /api/tasks/:id — 削除。
 *
 * 削除は**冪等**にせず、存在しない ID には 404 を返している（学習用に
 * 「対象が無かった」ことを明示するため）。冪等性を優先するなら常に 204 を返す設計もある。
 */
export default defineEventHandler(async (event) => {
  const id = taskIdSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  // `.returning()` で削除された行を受け取り、対象の有無を判定する
  // （`where` を書き忘れると全行削除になる点は UPDATE と同じ）
  const [row] = await useDb()
    .delete(tasks)
    .where(eq(tasks.id, id.data))
    .returning()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  // 204 No Content は本文を持てない。`return null` でボディを空にする
  setResponseStatus(event, 204)
  return null
})
