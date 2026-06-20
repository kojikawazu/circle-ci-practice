import { describe, it, expect, vi } from 'vitest'
import { createTasksApi } from '../../composables/useTasks'
import type { Task } from '@app/shared'

const sample: Task = {
  id: '11111111-1111-4111-8111-111111111111',
  title: '牛乳を買う',
  completed: false,
  createdAt: '2026-06-20T00:00:00.000Z',
}

describe('createTasksApi', () => {
  // 正常系
  it('list は GET /api/tasks を呼ぶ', async () => {
    const fetcher = vi.fn().mockResolvedValue([sample])
    const api = createTasksApi(fetcher)
    const result = await api.list()
    expect(fetcher).toHaveBeenCalledWith('/api/tasks')
    expect(result).toEqual([sample])
  })

  it('create は POST /api/tasks に title を渡す', async () => {
    const fetcher = vi.fn().mockResolvedValue(sample)
    const api = createTasksApi(fetcher)
    await api.create('牛乳を買う')
    expect(fetcher).toHaveBeenCalledWith('/api/tasks', {
      method: 'POST',
      body: { title: '牛乳を買う' },
    })
  })

  it('toggle は PATCH /api/tasks/:id に completed を渡す', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ...sample, completed: true })
    const api = createTasksApi(fetcher)
    await api.toggle(sample.id, true)
    expect(fetcher).toHaveBeenCalledWith(`/api/tasks/${sample.id}`, {
      method: 'PATCH',
      body: { completed: true },
    })
  })

  it('remove は DELETE /api/tasks/:id を呼ぶ', async () => {
    const fetcher = vi.fn().mockResolvedValue(undefined)
    const api = createTasksApi(fetcher)
    await api.remove(sample.id)
    expect(fetcher).toHaveBeenCalledWith(`/api/tasks/${sample.id}`, {
      method: 'DELETE',
    })
  })

  // 異常系
  it('fetcher が失敗したら create は reject する', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network'))
    const api = createTasksApi(fetcher)
    await expect(api.create('x')).rejects.toThrow('network')
  })

  it('fetcher が失敗したら list は reject する', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('boom'))
    const api = createTasksApi(fetcher)
    await expect(api.list()).rejects.toThrow('boom')
  })
})
