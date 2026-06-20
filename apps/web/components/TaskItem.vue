<script setup lang="ts">
import type { Task } from '@app/shared'

defineProps<{ task: Task }>()
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
