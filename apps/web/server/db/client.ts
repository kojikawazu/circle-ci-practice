import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

type Database = ReturnType<typeof drizzle<typeof schema>>

let _db: Database | null = null

/**
 * Drizzle クライアントの遅延シングルトン。
 * DATABASE_URL 未設定なら明示的に失敗させる（黙って動かさない）。
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
