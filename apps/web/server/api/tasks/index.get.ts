import { useDb } from '../../db/client'
import { tasks } from '../../db/schema'
import { serializeTask } from '../../utils/serialize'

/**
 * GET /api/tasks — 一覧（作成日時の昇順）。
 *
 * ファイル名がそのままルートになる（Nitro のファイルベースルーティング）。
 * `index.get.ts` = `GET /api/tasks`、`[id].patch.ts` = `PATCH /api/tasks/:id`。
 *
 * **並び順を必ず指定する**。省略すると PostgreSQL は順序を保証せず、
 * 実行計画次第で並びが変わる（E2E が環境ごとに落ちる典型的な原因）。
 */
export default defineEventHandler(async () => {
  const rows = await useDb().select().from(tasks).orderBy(tasks.createdAt)
  // 行をそのまま返さず、公開してよい形へ変換して返す（`.claude/rules/api.md`）
  return rows.map(serializeTask)
})
