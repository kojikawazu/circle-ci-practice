import { ref } from 'vue'
import type { Ref } from 'vue'
import type { Task } from '@app/shared'

/**
 * server/api を叩く最小の fetcher 型（テストでモックしやすいよう注入可能にする）。
 *
 * Nuxt の `$fetch` 全体ではなく「このアプリが実際に使う呼び出し方」だけを型にしている。
 * 依存が小さいほどテストダブルも小さくて済む。
 */
export interface TasksFetcher {
  <T>(url: string, opts?: { method?: string; body?: unknown }): Promise<T>
}

/**
 * 純粋な API クライアント。fetcher を注入できるため、DB なし・Nuxt ランタイムなしで UT 可能。
 *
 * 「ビジネスロジックはモックせず、I/O である fetcher だけをモックする」という
 * テスト方針（`.claude/rules/testing.md`）を、**設計側から成立させる**ための引数注入。
 * ここに `$fetch` を直接書くと、UT が Nuxt ランタイム込みになり実行が重くなる。
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

/**
 * `useTasks()` の戻り値。
 *
 * Nuxt の composable は auto-import されるため、**この定義ファイルを開かずに使われる**。
 * 各メンバーの意味はコメントでしか伝わらない（`.claude/rules/jsdoc.md`）。
 */
export type UseTasksResult = {
  /** 表示中のタスク。初期値の空配列は「0 件」ではなく「**未取得**」を意味する（`load` 前） */
  tasks: Ref<Task[]>
  /** 直近の操作で発生した利用者向けエラー文言。成功のたびに `null` へ戻る */
  error: Ref<string | null>
  /** 一覧を取得して `tasks` を置き換える。`onMounted` から呼ぶ想定（SSR では実行されない） */
  load: () => Promise<void>
  /** タスクを追加する。**サーバが採番した行**を末尾に足す（楽観更新はしない） */
  add: (title: string) => Promise<void>
  /** 完了状態を反転する。現在値の否定をサーバへ送り、返ってきた行で置き換える */
  toggle: (task: Task) => Promise<void>
  /** タスクを削除する。成功後にクライアント側の配列からも取り除く */
  remove: (task: Task) => Promise<void>
}

/**
 * コンポーネントから使うリアクティブなラッパー（Nuxt の `$fetch` を利用）。
 *
 * 各操作は例外を投げず `error` に文言を積む。UI 側で try/catch を書かせないための設計。
 * 状態更新は**必ずサーバのレスポンスを正**とする（楽観更新をしないぶん、
 * 失敗時に画面と DB が食い違わない）。
 */
export function useTasks(): UseTasksResult {
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
