import type { Task } from '@app/shared'
import type { TaskRow } from '../db/schema'

/**
 * DB の行（createdAt: Date）を API レスポンス（createdAt: ISO 文字列）へ変換する。
 *
 * **`{ ...row }` で組み立てない**のが要点。スプレッドにすると、後からカラムを
 * 追加した瞬間に自動的に外部へ公開される。フィールドを 1 つずつ書くことで、
 * 「公開する」判断が必ずレビューを通る（`.claude/rules/api.md`）。
 *
 * `Date` を JSON.stringify に任せず明示的に ISO 文字列へ変換しているのは、
 * API 契約（`Task.createdAt: string`）を型と実体の両方で一致させるため。
 */
export function serializeTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    createdAt: row.createdAt.toISOString(),
  }
}
