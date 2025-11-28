import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

describe('Example Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should mount a simple Vue component', () => {
    const TestComponent = defineComponent({
      template: '<div>Hello World</div>'
    })
    
    const wrapper = mount(TestComponent)
    expect(wrapper.text()).toBe('Hello World')
  })
})
