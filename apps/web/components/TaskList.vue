<script setup lang="ts">
import type { Task } from '@app/shared'
import TaskItem from './TaskItem.vue'

defineProps<{ tasks: Task[] }>()
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
