import type { Task } from '@app/shared'
import type { TaskRow } from '../db/schema'

/** DB の行（createdAt: Date）を API レスポンス（createdAt: ISO 文字列）へ変換する */
export function serializeTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    createdAt: row.createdAt.toISOString(),
  }
}
