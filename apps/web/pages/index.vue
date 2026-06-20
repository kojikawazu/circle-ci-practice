<script setup lang="ts">
import { computed, onMounted } from 'vue'

const { tasks, error, load, add, toggle, remove } = useTasks()

const remaining = computed(() => tasks.value.filter((t) => !t.completed).length)

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
