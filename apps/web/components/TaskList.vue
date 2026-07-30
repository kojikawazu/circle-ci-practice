<!--
  タスク一覧。空状態の出し分けと繰り返し描画だけを行う。

  子（TaskItem）のイベントをそのまま親へ中継する「導管」であり、
  ここで API を呼んだり配列を書き換えたりしない（props は下へ、イベントは上へ）。
-->
<script setup lang="ts">
import type { Task } from '@app/shared'
import TaskItem from './TaskItem.vue'

/** 表示するタスク。空配列＝「0 件」表示。props は子で書き換えない */
defineProps<{ tasks: Task[] }>()

/** 子から受けた操作を親へ中継する（完了トグル / 削除） */
const emit = defineEmits<{ toggle: [task: Task]; remove: [task: Task] }>()
</script>

<template>
  <p v-if="tasks.length === 0" data-testid="task-empty" class="text-center text-slate-400">
    タスクがありません
  </p>
  <ul v-else class="flex flex-col gap-2">
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      @toggle="emit('toggle', $event)"
      @remove="emit('remove', $event)"
    />
  </ul>
</template>
