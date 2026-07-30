import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

type Database = ReturnType<typeof drizzle<typeof schema>>

let _db: Database | null = null

/**
 * Drizzle クライアントの遅延シングルトン。
 *
 * **遅延（呼ばれた時に生成）**にしているのは、モジュール読み込み時点で接続を張ると
 * `DATABASE_URL` を必要としないビルドやテストまで DB 必須になってしまうため。
 *
 * **シングルトン**にしているのは、リクエストごとに `postgres()` を呼ぶと
 * 接続プールが毎回作られ、接続数が上限に達するため。
 *
 * `DATABASE_URL` 未設定なら明示的に失敗させる（黙って動かさない）。設定漏れは
 * 「起動直後に落ちる」のが最も安全で、実行時まで隠れると原因究明が難しくなる。
 */
export function useDb(): Database {
  if (_db) return _db
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  _db = drizzle(postgres(url), { schema })
  return _db
}
