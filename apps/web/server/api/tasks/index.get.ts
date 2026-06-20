import { useDb } from '../../db/client'
import { tasks } from '../../db/schema'
import { serializeTask } from '../../utils/serialize'

// GET /api/tasks — 一覧（作成日時の昇順）
export default defineEventHandler(async () => {
  const rows = await useDb().select().from(tasks).orderBy(tasks.createdAt)
  return rows.map(serializeTask)
})
