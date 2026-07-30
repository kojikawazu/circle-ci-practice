<!--
  タスク管理のトップ画面（`/`）。

  page は薄く保ち、状態と通信は composable、描画は component に委ねる。
  この画面の責務は「composable を呼び、子へ配線する」ことだけ。
-->
<script setup lang="ts">
import { computed, onMounted } from 'vue'

// useTasks は composables/ の auto-import 対象なので import 文が要らない。
// 「どこから来た関数か」が読めない代わりに、戻り値の意味は型側のコメントで補う。
const { tasks, error, load, add, toggle, remove } = useTasks()

/**
 * 未完了の件数。`tasks` から**導出**するだけで、独立した状態は持たない。
 * 別 ref に持つと、追加・削除・トグルのたびに更新漏れが起きる。
 */
const remaining = computed(() => tasks.value.filter((t) => !t.completed).length)

// 取得をサーバ側で走らせない（`onMounted` はブラウザでのみ実行される）。
// SSR で取りたい場合は `useAsyncData` に置き換える必要がある — ここでは
// 「CI で E2E を回す」ことが主眼なので、単純な CSR 取得に留めている。
onMounted(load)
</script>

<template>
  <main class="mx-auto flex max-w-xl flex-col gap-4 px-4 py-10">
    <header class="flex items-baseline justify-between">
      <h1 class="text-2xl font-bold">タスク管理</h1>
      <span data-testid="task-remaining" class="text-sm text-slate-500">
        残り {{ remaining }} 件
      </span>
    </header>

    <TaskForm @submit="add" />

    <p v-if="error" data-testid="task-load-error" class="text-sm text-red-600">
      {{ error }}
    </p>

    <TaskList :tasks="tasks" @toggle="toggle" @remove="remove" />
  </main>
</template>
