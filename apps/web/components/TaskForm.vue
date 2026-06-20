<script setup lang="ts">
import { ref } from 'vue'
import { createTaskSchema } from '@app/shared'

const emit = defineEmits<{ submit: [title: string] }>()

const title = ref('')
const error = ref<string | null>(null)

function onSubmit() {
  const parsed = createTaskSchema.safeParse({ title: title.value })
  if (!parsed.success) {
    error.value = parsed.error.issues[0]?.message ?? '入力が不正です'
    return
  }
  emit('submit', parsed.data.title)
  title.value = ''
  error.value = null
}
</script>

<template>
  <form class="flex flex-col gap-2" @submit.prevent="onSubmit">
    <div class="flex gap-2">
      <input
        v-model="title"
        data-testid="task-input"
        type="text"
        placeholder="やることを入力…"
        class="flex-1 rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
      />
      <button
        data-testid="task-submit"
        type="submit"
        class="rounded-md bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700"
      >
        追加
      </button>
    </div>
    <p v-if="error" data-testid="task-error" class="text-sm text-red-600">
      {{ error }}
    </p>
  </form>
</template>
