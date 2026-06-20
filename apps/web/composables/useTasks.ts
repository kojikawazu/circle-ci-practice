import { ref } from 'vue'
import type { Task } from '@app/shared'

/** server/api を叩く最小の fetcher 型（テストでモックしやすいよう注入可能にする） */
export interface TasksFetcher {
  <T>(url: string, opts?: { method?: string; body?: unknown }): Promise<T>
}

/**
 * 純粋な API クライアント。fetcher を注入できるため、DB なし・Nuxt ランタイムなしで UT 可能。
 * （ビジネスロジックはモックせず、I/O である fetcher だけをモックする）
 */
export function createTasksApi(fetcher: TasksFetcher) {
  return {
    list: () => fetcher<Task[]>('/api/tasks'),
    create: (title: string) =>
      fetcher<Task>('/api/tasks', { method: 'POST', body: { title } }),
    toggle: (id: string, completed: boolean) =>
      fetcher<Task>(`/api/tasks/${id}`, { method: 'PATCH', body: { completed } }),
    remove: (id: string) =>
      fetcher<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
  }
}

/** コンポーネントから使うリアクティブなラッパー（Nuxt の $fetch を利用） */
export function useTasks() {
  const api = createTasksApi($fetch as unknown as TasksFetcher)
  const tasks = ref<Task[]>([])
  const error = ref<string | null>(null)

  const load = async () => {
    error.value = null
    try {
      tasks.value = await api.list()
    } catch {
      error.value = 'タスクの取得に失敗しました'
    }
  }

  const add = async (title: string) => {
    error.value = null
    try {
      const created = await api.create(title)
      tasks.value = [...tasks.value, created]
    } catch {
      error.value = 'タスクの追加に失敗しました'
    }
  }

  const toggle = async (task: Task) => {
    error.value = null
    try {
      const updated = await api.toggle(task.id, !task.completed)
      tasks.value = tasks.value.map((t) => (t.id === updated.id ? updated : t))
    } catch {
      error.value = 'タスクの更新に失敗しました'
    }
  }

  const remove = async (task: Task) => {
    error.value = null
    try {
      await api.remove(task.id)
      tasks.value = tasks.value.filter((t) => t.id !== task.id)
    } catch {
      error.value = 'タスクの削除に失敗しました'
    }
  }

  return { tasks, error, load, add, toggle, remove }
}
