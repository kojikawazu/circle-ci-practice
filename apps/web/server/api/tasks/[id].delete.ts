import { eq } from 'drizzle-orm'
import { taskIdSchema } from '@app/shared'
import { useDb } from '../../db/client'
import { tasks } from '../../db/schema'

// DELETE /api/tasks/:id — 削除
export default defineEventHandler(async (event) => {
  const id = taskIdSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  const [row] = await useDb()
    .delete(tasks)
    .where(eq(tasks.id, id.data))
    .returning()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  setResponseStatus(event, 204)
  return null
})
