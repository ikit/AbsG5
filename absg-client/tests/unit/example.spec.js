import { shallowMount } from '@vue/test-utils';
import ImageInput from '@/components/ImageInput.vue';

describe('ImageInput.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(ImageInput, {
      propsData: { msg }
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
