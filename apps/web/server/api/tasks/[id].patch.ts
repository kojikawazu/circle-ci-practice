import { eq } from 'drizzle-orm'
import { taskIdSchema, updateTaskSchema } from '@app/shared'
import { useDb } from '../../db/client'
import { tasks } from '../../db/schema'
import { serializeTask } from '../../utils/serialize'

// PATCH /api/tasks/:id — 更新（完了トグル・タイトル変更）
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

  const [row] = await useDb()
    .update(tasks)
    .set(parsed.data)
    .where(eq(tasks.id, id.data))
    .returning()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  return serializeTask(row)
})
