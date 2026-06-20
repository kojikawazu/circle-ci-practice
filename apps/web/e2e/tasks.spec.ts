import { test, expect } from '@playwright/test'

test('タスクの作成 → 完了 → リロード永続化 → 削除', async ({ page }) => {
  // 各実行で衝突しないユニークなタイトル
  const title = `E2E-${Date.now()}`

  await page.goto('/')

  // 作成（F-1）
  await page.getByTestId('task-input').fill(title)
  await page.getByTestId('task-submit').click()

  const item = page.getByTestId('task-item').filter({ hasText: title })
  await expect(item).toBeVisible()

  // 完了トグル（F-3）
  await item.getByTestId('task-toggle').check()
  await expect(item.getByTestId('task-toggle')).toBeChecked()

  // リロード後も保持（F-5: 永続化）
  await page.reload()
  const persisted = page.getByTestId('task-item').filter({ hasText: title })
  await expect(persisted).toBeVisible()
  await expect(persisted.getByTestId('task-toggle')).toBeChecked()

  // 削除（F-4）
  await persisted.getByTestId('task-delete').click()
  await expect(page.getByTestId('task-item').filter({ hasText: title })).toHaveCount(0)
})

test('空タイトルは追加できずエラーを表示する', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('task-submit').click()
  await expect(page.getByTestId('task-error')).toBeVisible()
})
