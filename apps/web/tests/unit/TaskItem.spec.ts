import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskItem from '../../components/TaskItem.vue'
import type { Task } from '@app/shared'

const task: Task = {
  id: '11111111-1111-4111-8111-111111111111',
  title: '牛乳を買う',
  completed: false,
  createdAt: '2026-06-20T00:00:00.000Z',
}

describe('TaskItem', () => {
  it('タイトルを表示する', () => {
    const wrapper = mount(TaskItem, { props: { task } })
    expect(wrapper.get('[data-testid="task-item"]').text()).toContain('牛乳を買う')
  })

  it('完了タスクには取り消し線クラスが付く', () => {
    const wrapper = mount(TaskItem, { props: { task: { ...task, completed: true } } })
    expect(wrapper.find('.line-through').exists()).toBe(true)
  })

  it('チェック操作で toggle を emit する', async () => {
    const wrapper = mount(TaskItem, { props: { task } })
    await wrapper.get('[data-testid="task-toggle"]').trigger('change')
    expect(wrapper.emitted('toggle')).toEqual([[task]])
  })

  it('削除ボタンで remove を emit する', async () => {
    const wrapper = mount(TaskItem, { props: { task } })
    await wrapper.get('[data-testid="task-delete"]').trigger('click')
    expect(wrapper.emitted('remove')).toEqual([[task]])
  })
})
