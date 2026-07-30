<!--
  タスク 1 件の表示。純粋な presentational component。

  チェックボックスは `v-model` ではなく `:checked` + `@change` にしている。
  `v-model` だと props を直接書き換えることになり、**サーバの応答を待たずに
  画面だけ先に変わる**（更新が失敗しても戻らない）。表示は常に親が持つ
  `tasks` を正とし、更新はイベントで親へ委ねる。
-->
<script setup lang="ts">
import type { Task } from '@app/shared'

/** 表示対象のタスク。完了済みは打ち消し線で表現する */
defineProps<{ task: Task }>()

/** 完了トグル / 削除を親へ通知する。自身では状態を変えない */
const emit = defineEmits<{ toggle: [task: Task]; remove: [task: Task] }>()
</script>

<template>
  <li
    data-testid="task-item"
    class="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
  >
    <input
      data-testid="task-toggle"
      type="checkbox"
      :checked="task.completed"
      class="h-4 w-4"
      @change="emit('toggle', task)"
    />
    <span
      class="flex-1"
      :class="task.completed ? 'text-slate-400 line-through' : ''"
    >
      {{ task.title }}
    </span>
    <button
      data-testid="task-delete"
      type="button"
      class="text-sm text-red-600 hover:underline"
      @click="emit('remove', task)"
    >
      削除
    </button>
  </li>
</template>
