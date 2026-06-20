import { createTaskSchema } from '@app/shared'
import { useDb } from '../../db/client'
import { tasks } from '../../db/schema'
import { serializeTask } from '../../utils/serialize'

// POST /api/tasks — 作成
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = createTaskSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: parsed.error.flatten(),
    })
  }

  const [row] = await useDb()
    .insert(tasks)
    .values({ title: parsed.data.title })
    .returning()

  setResponseStatus(event, 201)
  return serializeTask(row)
})
