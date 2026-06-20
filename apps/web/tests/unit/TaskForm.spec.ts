import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskForm from '../../components/TaskForm.vue'

describe('TaskForm', () => {
  // 正常系
  it('有効な入力で submit イベントをトリム済みタイトルで emit する', async () => {
    const wrapper = mount(TaskForm)
    await wrapper.get('[data-testid="task-input"]').setValue('  買い物  ')
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toEqual([['買い物']])
  })

  it('送信後に入力欄がクリアされる', async () => {
    const wrapper = mount(TaskForm)
    const input = wrapper.get<HTMLInputElement>('[data-testid="task-input"]')
    await input.setValue('掃除')
    await wrapper.get('form').trigger('submit.prevent')
    expect(input.element.value).toBe('')
  })

  // 異常系
  it('空入力では emit せずエラーを表示する', async () => {
    const wrapper = mount(TaskForm)
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('[data-testid="task-error"]').exists()).toBe(true)
  })

  it('空白のみでは emit しない', async () => {
    const wrapper = mount(TaskForm)
    await wrapper.get('[data-testid="task-input"]').setValue('    ')
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeUndefined()
  })
})
