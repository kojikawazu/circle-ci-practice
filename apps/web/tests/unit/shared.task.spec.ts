import { describe, it, expect } from 'vitest'
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  TITLE_MAX,
} from '@app/shared'

const UUID = '11111111-1111-4111-8111-111111111111'

describe('createTaskSchema', () => {
  // 正常系
  it('有効なタイトルを受理する', () => {
    const r = createTaskSchema.safeParse({ title: '牛乳を買う' })
    expect(r.success).toBe(true)
    expect(r.success && r.data.title).toBe('牛乳を買う')
  })

  it(`ちょうど ${TITLE_MAX} 文字は受理する（境界）`, () => {
    const r = createTaskSchema.safeParse({ title: 'a'.repeat(TITLE_MAX) })
    expect(r.success).toBe(true)
  })

  // 準正常系
  it('前後の空白はトリムされる', () => {
    const r = createTaskSchema.safeParse({ title: '  片付け  ' })
    expect(r.success && r.data.title).toBe('片付け')
  })

  // 異常系
  it('空文字は拒否する', () => {
    expect(createTaskSchema.safeParse({ title: '' }).success).toBe(false)
  })

  it('空白のみは拒否する', () => {
    expect(createTaskSchema.safeParse({ title: '   ' }).success).toBe(false)
  })

  it(`${TITLE_MAX + 1} 文字は拒否する`, () => {
    expect(
      createTaskSchema.safeParse({ title: 'a'.repeat(TITLE_MAX + 1) }).success,
    ).toBe(false)
  })

  it('title 欠落は拒否する', () => {
    expect(createTaskSchema.safeParse({}).success).toBe(false)
  })
})

describe('updateTaskSchema', () => {
  // 正常系
  it('completed のみの更新を受理する', () => {
    const r = updateTaskSchema.safeParse({ completed: true })
    expect(r.success && r.data.completed).toBe(true)
  })

  it('title のみの更新を受理する', () => {
    const r = updateTaskSchema.safeParse({ title: '修正後' })
    expect(r.success && r.data.title).toBe('修正後')
  })

  // 異常系
  it('空オブジェクト（更新項目なし）は拒否する', () => {
    expect(updateTaskSchema.safeParse({}).success).toBe(false)
  })

  it('completed の型違い（文字列）は拒否する', () => {
    expect(updateTaskSchema.safeParse({ completed: 'yes' }).success).toBe(false)
  })
})

describe('taskIdSchema', () => {
  it('UUID を受理する', () => {
    expect(taskIdSchema.safeParse(UUID).success).toBe(true)
  })

  it('UUID でない文字列は拒否する', () => {
    expect(taskIdSchema.safeParse('abc').success).toBe(false)
  })

  it('undefined は拒否する', () => {
    expect(taskIdSchema.safeParse(undefined).success).toBe(false)
  })
})
