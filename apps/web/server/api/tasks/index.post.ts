import { createTaskSchema } from '@app/shared'
import { useDb } from '../../db/client'
import { tasks } from '../../db/schema'
import { serializeTask } from '../../utils/serialize'

/**
 * POST /api/tasks — 作成。
 *
 * `readBody` の戻り値は**信頼できない外部入力**なので、必ず Zod を通してから使う。
 * ブラウザ側（`TaskForm.vue`）でも同じスキーマで検証しているが、API は直接叩けるため
 * **ここが最終ゲート**になる（`.claude/rules/api.md`）。
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = createTaskSchema.safeParse(body)
  if (!parsed.success) {
    // `throw` で処理を止める。Nitro が createError の statusCode を応答へ反映する。
    // 返すのは検証結果（どの項目が不正か）だけで、スタックトレースや SQL は含めない。
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: parsed.error.flatten(),
    })
  }

  // `.returning()` で INSERT した行を受け取る。id と createdAt は DB が採番するため、
  // これが無いと採番結果を知るための SELECT がもう 1 往復必要になる。
  // 保存するのは `parsed.data.title`（トリム済み）であって生の入力値ではない。
  const [row] = await useDb()
    .insert(tasks)
    .values({ title: parsed.data.title })
    .returning()

  // 201 Created を明示する（既定の 200 のままにしない）
  setResponseStatus(event, 201)
  return serializeTask(row)
})
