/**
 * DB スキーマ定義。**マイグレーション SQL の生成元**であり、ここが唯一の真実。
 *
 * このファイルを編集したら `pnpm db:generate` で `drizzle/` に SQL を生成し、
 * 生成物もコミットする（CI は `pnpm db:migrate` でその SQL を適用する）。
 * 手で SQL を書き換えるとスキーマ定義と履歴が食い違う。
 */
import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const tasks = pgTable('tasks', {
  // 採番は DB 側（gen_random_uuid()）。連番と違い、ID から件数や作成順を推測されない
  id: uuid('id').primaryKey().defaultRandom(),
  // 長さ制限は Zod（TITLE_MAX）が持つ。DB の text は上限を課さない
  title: text('title').notNull(),
  // `notNull` + `default` により、NULL と false を区別する必要がなくなる
  completed: boolean('completed').notNull().default(false),
  // タイムゾーン付きで保存する。付けないと保存時刻の基準が環境依存になる
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

/**
 * SELECT で得られる行の型。**スキーマ定義から導出**するため、カラムを増減すれば型も追従する。
 * これは永続化の表現であり、API レスポンス（`Task`）とは別物（変換は `utils/serialize.ts`）。
 */
export type TaskRow = typeof tasks.$inferSelect
