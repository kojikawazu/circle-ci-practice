<!--
  タスク入力フォーム。

  このコンポーネントは**通信しない**。検証を通した値を `submit` で親へ渡すだけで、
  API 呼び出しと一覧の更新は親（`pages/index.vue`）の責務にしている。
  こうすると「見た目」と「副作用」がファイル単位で分かれ、UT でも DOM 操作だけを検証できる。
-->
<script setup lang="ts">
import { ref } from 'vue'
import { createTaskSchema } from '@app/shared'

/** 検証を通過したタイトルを親へ渡す。親が API 呼び出しと一覧更新を担う */
const emit = defineEmits<{ submit: [title: string] }>()

/** 入力中のタイトル（`v-model` 経由）。送信成功時のみ空へ戻す */
const title = ref('')
/** 表示中の入力エラー文言。`null` は「エラーなし」（＝未検証ではない） */
const error = ref<string | null>(null)

/**
 * 送信前にクライアント側で検証する。
 *
 * ここでの検証は**UX のため**（サーバ往復を待たずに即座に指摘する）であり、
 * セキュリティの担保ではない。同じ `createTaskSchema` をサーバ側でも必ず通す
 * （信頼境界が違うため、この重複は意図的 — `.claude/rules/duplication.md`）。
 *
 * 親へ渡すのは `title.value` ではなく `parsed.data.title`。
 * スキーマの `transform` でトリム済みの値を使わないと、前後の空白がそのまま保存される。
 */
function onSubmit() {
  const parsed = createTaskSchema.safeParse({ title: title.value })
  if (!parsed.success) {
    // 最初の 1 件だけ表示する（項目が 1 つしかないため全件出す意味がない）
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
